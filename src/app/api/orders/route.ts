// ============================================================
// POST /api/orders — create order + M-Pesa STK push + WhatsApp
// Sandbox mode — uses sandbox.safaricom.co.ke endpoints
// ============================================================
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase";
import { CartItem } from "@/types";
import { formatPrice } from "@/lib/utils";

const SALON_NAME = process.env.NEXT_PUBLIC_SALON_NAME || "Crown & Glory Hair Salon";

// ── Phone normaliser ─────────────────────────────────────────
function formatPhoneForMpesa(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("254") && digits.length === 12) return digits;
  if (digits.startsWith("0") && digits.length === 10) return `254${digits.slice(1)}`;
  if (digits.length === 9) return `254${digits}`;
  return digits;
}

// ── WhatsApp sender ──────────────────────────────────────────
async function sendWhatsApp(to: string, message: string) {
  const token = process.env.WHATSAPP_API_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!token || !phoneNumberId) {
    console.warn("WhatsApp: missing credentials, skipping");
    return;
  }
  try {
    const res = await fetch(
      `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to,
          type: "text",
          text: { body: message },
        }),
      }
    );
    if (!res.ok) {
      const err = await res.json();
      console.error("WhatsApp error:", JSON.stringify(err));
    }
  } catch (err) {
    console.error("WhatsApp fetch failed:", err);
  }
}

// ── M-Pesa STK Push (sandbox) ────────────────────────────────
interface STKResult {
  checkoutRequestId: string | null;
  error: string | null;
}

async function initiateMpesaSTK(
  phone: string,
  amount: number,
  accountRef: string,  // max 12 chars
  description: string  // max 13 chars
): Promise<STKResult> {
  const consumerKey = process.env.MPESA_CONSUMER_KEY;
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
  const shortCode = process.env.MPESA_BUSINESS_SHORT_CODE;
  const passkey = process.env.MPESA_PASSKEY;
  const callbackUrl = process.env.MPESA_CALLBACK_URL;

  if (!consumerKey || !consumerSecret || !shortCode || !passkey || !callbackUrl) {
    console.warn("M-Pesa: missing environment variables, skipping STK push");
    return { checkoutRequestId: null, error: "Missing M-Pesa configuration" };
  }

  try {
    // Step 1: OAuth token from Safaricom sandbox
    const credentials = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");
    const authRes = await fetch(
      "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
      {
        method: "GET",
        headers: { Authorization: `Basic ${credentials}` },
      }
    );

    if (!authRes.ok) {
      const text = await authRes.text();
      console.error("M-Pesa OAuth failed:", authRes.status, text);
      return { checkoutRequestId: null, error: `OAuth failed: ${authRes.status}` };
    }

    const authData = await authRes.json();
    const accessToken: string = authData.access_token;

    if (!accessToken) {
      console.error("M-Pesa OAuth: no access_token in response", authData);
      return { checkoutRequestId: null, error: "No access token returned" };
    }

    // Step 2: Build timestamp — exactly 14 digits: YYYYMMDDHHmmss
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    const timestamp =
      now.getUTCFullYear().toString() +
      pad(now.getUTCMonth() + 1) +
      pad(now.getUTCDate()) +
      pad(now.getUTCHours()) +
      pad(now.getUTCMinutes()) +
      pad(now.getUTCSeconds());

    // Step 3: Password = base64(ShortCode + Passkey + Timestamp)
    const password = Buffer.from(`${shortCode}${passkey}${timestamp}`).toString("base64");

    // Step 4: Normalise phone + round amount to whole integer
    const formattedPhone = formatPhoneForMpesa(phone);
    const intAmount = Math.ceil(amount);

    console.log(`M-Pesa STK: phone=${formattedPhone} amount=${intAmount} ref=${accountRef}`);

    // Step 5: STK Push to sandbox
    const stkRes = await fetch(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          BusinessShortCode: shortCode,
          Password: password,
          Timestamp: timestamp,
          TransactionType: "CustomerPayBillOnline",
          Amount: intAmount,
          PartyA: formattedPhone,
          PartyB: shortCode,
          PhoneNumber: formattedPhone,
          CallBackURL: callbackUrl,
          AccountReference: accountRef,  // max 12 chars — enforced at call site
          TransactionDesc: description,  // max 13 chars — enforced at call site
        }),
      }
    );

    const stkData = await stkRes.json();
    console.log("M-Pesa STK response:", JSON.stringify(stkData));

    if (!stkRes.ok || stkData.errorCode) {
      console.error("M-Pesa STK error:", stkData);
      return {
        checkoutRequestId: null,
        error: stkData.errorMessage || stkData.ResponseDescription || "STK push failed",
      };
    }

    if (stkData.ResponseCode !== "0") {
      return {
        checkoutRequestId: null,
        error: stkData.ResponseDescription || "STK push rejected",
      };
    }

    return { checkoutRequestId: stkData.CheckoutRequestID || null, error: null };
  } catch (err) {
    console.error("M-Pesa STK exception:", err);
    return { checkoutRequestId: null, error: String(err) };
  }
}

// ── POST /api/orders ─────────────────────────────────────────
export async function POST(request: NextRequest) {
  const supabase = createSupabaseAdmin();

  try {
    const body = await request.json();
    const {
      items,
      customer_name,
      customer_phone,
      customer_email,
      delivery_address,
      subtotal,
      shipping_fee,
      total,
      notes,
    } = body;

    if (!items?.length || !customer_name || !customer_phone || !delivery_address) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Save order first so we have an ID for the reference
    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        items,
        customer_name,
        customer_phone,
        customer_email: customer_email || "",
        delivery_address,
        subtotal,
        shipping_fee,
        total,
        status: "pending",
        notes: notes || "",
      })
      .select()
      .single();

    if (error || !order) {
      console.error("Order insert error:", error);
      return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
    }

    // AccountReference: max 12 chars → "ORD-" + first 8 UUID chars = 12 ✓
    // TransactionDesc:  max 13 chars → "Order payment" = 13 ✓
    const shortId = order.id.replace(/-/g, "").slice(0, 8).toUpperCase();
    const { checkoutRequestId, error: mpesaError } = await initiateMpesaSTK(
      customer_phone,
      total,
      `ORD-${shortId}`,    // 4 + 1 + 8 = 12 chars ✓
      "Order payment"       // 13 chars ✓
    );

    if (mpesaError) {
      console.error("STK push failed for order:", mpesaError);
    }

    // Store CheckoutRequestID so callback can match it reliably
    if (checkoutRequestId) {
      await supabase
        .from("orders")
        .update({ mpesa_code: checkoutRequestId })
        .eq("id", order.id);
    }

    // Build item list for WhatsApp message
    const itemList = (items as CartItem[])
      .map((i) => `• ${i.product.name} ×${i.quantity} — ${formatPrice(i.product.price * i.quantity)}`)
      .join("\n");

    // WhatsApp to salon owner
    const ownerPhone = process.env.OWNER_WHATSAPP_NUMBER || "";
    if (ownerPhone) {
      await sendWhatsApp(
        ownerPhone,
        `🛍️ NEW ORDER #${order.id.slice(0, 8).toUpperCase()}\n\nCustomer: ${customer_name} — ${customer_phone}\nDelivery: ${delivery_address.town}, ${delivery_address.county}\n\nItems:\n${itemList}\n\nSubtotal: ${formatPrice(subtotal)}\nShipping: ${formatPrice(shipping_fee)}\nTotal: ${formatPrice(total)}\n\n${mpesaError ? "⚠️ STK push failed — follow up with customer" : `M-Pesa STK sent to ${customer_phone}`}`
      );
    }

    // WhatsApp to customer
    await sendWhatsApp(
      customer_phone,
      `Hi ${customer_name}! 🛍️\n\nThank you for your order at ${SALON_NAME}!\n\nOrder #${order.id.slice(0, 8).toUpperCase()}\nTotal: ${formatPrice(total)}\n\n${mpesaError ? "Please send payment via M-Pesa Paybill 174379 — Account: ORD-" + shortId : "Complete the M-Pesa payment via the STK prompt sent to your phone."}\n\nWe'll process your order once payment is confirmed.\n\n— ${SALON_NAME}`
    );

    return NextResponse.json({
      order_id: order.id,
      status: "pending",
      ...(mpesaError ? { mpesa_warning: "STK push could not be sent. Use Paybill to pay manually." } : {}),
    });
  } catch (err) {
    console.error("Order error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
