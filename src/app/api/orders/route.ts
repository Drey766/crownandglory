// ============================================================
// POST /api/orders — create order + M-Pesa STK push + WhatsApp
// ============================================================
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase";
import { CartItem } from "@/types";
import { formatPrice } from "@/lib/utils";

const SALON_NAME = process.env.NEXT_PUBLIC_SALON_NAME || "Crown & Glory Hair Salon";

async function sendWhatsApp(to: string, message: string) {
  const token = process.env.WHATSAPP_API_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!token || !phoneNumberId) return;

  await fetch(`https://graph.facebook.com/v18.0/${phoneNumberId}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body: message },
    }),
  });
}

async function initiateMpesaSTK(phone: string, amount: number, accountRef: string) {
  try {
    const consumerKey = process.env.MPESA_CONSUMER_KEY!;
    const consumerSecret = process.env.MPESA_CONSUMER_SECRET!;
    const shortCode = process.env.MPESA_BUSINESS_SHORT_CODE!;
    const passkey = process.env.MPESA_PASSKEY!;
    const callbackUrl = process.env.MPESA_CALLBACK_URL!;

    const authRes = await fetch(
      "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
      { headers: { Authorization: `Basic ${Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64")}` } }
    );
    const { access_token } = await authRes.json();

    const timestamp = new Date().toISOString().replace(/[-T:.Z]/g, "").slice(0, 14);
    const password = Buffer.from(`${shortCode}${passkey}${timestamp}`).toString("base64");
    const formattedPhone = phone.startsWith("0") ? `254${phone.slice(1)}` : phone;

    const res = await fetch("https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest", {
      method: "POST",
      headers: { Authorization: `Bearer ${access_token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        BusinessShortCode: shortCode, Password: password, Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline", Amount: amount,
        PartyA: formattedPhone, PartyB: shortCode, PhoneNumber: formattedPhone,
        CallBackURL: callbackUrl, AccountReference: accountRef,
        TransactionDesc: `Payment for ${accountRef}`,
      }),
    });
    return await res.json();
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  const supabase = createSupabaseAdmin();

  try {
    const body = await request.json();
    const { items, customer_name, customer_phone, customer_email, delivery_address, subtotal, shipping_fee, total } = body;

    if (!items?.length || !customer_name || !customer_phone || !delivery_address) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Save order to database
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
      })
      .select()
      .single();

    if (error || !order) {
      return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
    }

    // Initiate M-Pesa STK push for full order amount
    await initiateMpesaSTK(customer_phone, total, `ORDER-${order.id.slice(0, 8).toUpperCase()}`);

    // Build item list for WhatsApp
    const itemList = (items as CartItem[])
      .map((i) => `  • ${i.product.name} × ${i.quantity} — ${formatPrice(i.product.price * i.quantity)}`)
      .join("\n");

    // WhatsApp to salon owner
    await sendWhatsApp(
      process.env.OWNER_WHATSAPP_NUMBER || "",
      `🛍️ NEW ORDER — #${order.id.slice(0, 8).toUpperCase()}\n\nCustomer: ${customer_name} — ${customer_phone}\nDelivery: ${delivery_address.town}, ${delivery_address.county}\n\nItems:\n${itemList}\n\nSubtotal: ${formatPrice(subtotal)}\nShipping: ${formatPrice(shipping_fee)}\nTotal: ${formatPrice(total)}\n\nM-Pesa STK push sent to ${customer_phone}`
    );

    // WhatsApp confirmation to customer
    await sendWhatsApp(
      customer_phone,
      `Hi ${customer_name}! 🛍️\n\nThank you for your order at ${SALON_NAME}!\n\nOrder #${order.id.slice(0, 8).toUpperCase()}\nTotal: ${formatPrice(total)}\n\nPlease complete the M-Pesa payment via the STK push sent to your phone.\n\nWe'll process your order as soon as payment is confirmed.\n\n— ${SALON_NAME}`
    );

    return NextResponse.json({ order_id: order.id, status: "pending" });
  } catch (err) {
    console.error("Order error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
