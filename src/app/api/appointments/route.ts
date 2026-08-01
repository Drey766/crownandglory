// ============================================================
// POST /api/appointments — validate + book + WhatsApp + M-Pesa
// Sandbox mode — uses sandbox.safaricom.co.ke endpoints
// ============================================================
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase";
import { formatDate, formatTime } from "@/lib/utils";

const SALON_NAME = process.env.NEXT_PUBLIC_SALON_NAME || "Crown & Glory Hair Salon";

// ── Phone normaliser ─────────────────────────────────────────
// Daraja requires exactly 12 digits starting with 254 (no + prefix)
function formatPhoneForMpesa(phone: string): string {
  const digits = phone.replace(/\D/g, ""); // strip all non-digits
  if (digits.startsWith("254") && digits.length === 12) return digits; // already correct
  if (digits.startsWith("0") && digits.length === 10) return `254${digits.slice(1)}`; // 07XX → 254XX
  if (digits.length === 9) return `254${digits}`; // 7XX → 254XX
  return digits; // fallback — Daraja will reject if malformed
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
  accountRef: string,   // max 12 chars — enforced at call site
  description: string   // max 13 chars — enforced at call site
): Promise<STKResult> {
  const consumerKey = process.env.MPESA_CONSUMER_KEY;
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
  const shortCode = process.env.MPESA_BUSINESS_SHORT_CODE;
  const passkey = process.env.MPESA_PASSKEY;
  const callbackUrl = process.env.MPESA_CALLBACK_URL;

  // Guard: skip gracefully if any env var is missing
  if (!consumerKey || !consumerSecret || !shortCode || !passkey || !callbackUrl) {
    console.warn("M-Pesa: missing environment variables, skipping STK push");
    return { checkoutRequestId: null, error: "Missing M-Pesa configuration" };
  }

  try {
    // Step 1: Get OAuth access token from Safaricom sandbox
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

    // Step 2: Build timestamp (YYYYMMDDHHmmss — exactly 14 digits)
    // Use toISOString() which always returns UTC in format 2025-01-15T10:30:45.123Z
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    const timestamp =
      now.getUTCFullYear().toString() +
      pad(now.getUTCMonth() + 1) +
      pad(now.getUTCDate()) +
      pad(now.getUTCHours()) +
      pad(now.getUTCMinutes()) +
      pad(now.getUTCSeconds());
    // timestamp is exactly 14 chars: YYYYMMDDHHmmss

    // Step 3: Build Lipa Na M-Pesa password
    // password = base64(BusinessShortCode + Passkey + Timestamp)
    const password = Buffer.from(`${shortCode}${passkey}${timestamp}`).toString("base64");

    // Step 4: Normalise phone to 254XXXXXXXXX format
    const formattedPhone = formatPhoneForMpesa(phone);

    // Step 5: Amount must be a whole integer — no decimals
    const intAmount = Math.ceil(amount);

    console.log(`M-Pesa STK: phone=${formattedPhone} amount=${intAmount} ref=${accountRef}`);

    // Step 6: Send STK Push request to sandbox
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
          TransactionType: "CustomerPayBillOnline", // use CustomerBuyGoodsOnline for till numbers
          Amount: intAmount,
          PartyA: formattedPhone,  // customer phone
          PartyB: shortCode,       // your paybill/till number
          PhoneNumber: formattedPhone,
          CallBackURL: callbackUrl,
          AccountReference: accountRef,  // max 12 chars
          TransactionDesc: description,  // max 13 chars
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

    // ResponseCode "0" = success
    if (stkData.ResponseCode !== "0") {
      return {
        checkoutRequestId: null,
        error: stkData.ResponseDescription || "STK push rejected",
      };
    }

    return {
      checkoutRequestId: stkData.CheckoutRequestID || null,
      error: null,
    };
  } catch (err) {
    console.error("M-Pesa STK exception:", err);
    return { checkoutRequestId: null, error: String(err) };
  }
}

// ── POST /api/appointments ───────────────────────────────────
export async function POST(request: NextRequest) {
  const supabase = createSupabaseAdmin();

  try {
    const body = await request.json();
    const {
      service_id,
      service_name,
      service_price,
      appointment_date,
      appointment_time,
      client_name,
      client_phone,
      client_email,
      notes,
      deposit_amount,
    } = body;

    // ── Validate required fields ──────────────────────────
    if (!service_id || !appointment_date || !appointment_time || !client_name || !client_phone) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // ── Check slot availability ───────────────────────────
    const { data: conflict } = await supabase
      .from("appointments")
      .select("id")
      .eq("appointment_date", appointment_date)
      .eq("appointment_time", appointment_time)
      .not("status", "eq", "cancelled")
      .maybeSingle(); // maybeSingle: returns null (not error) when no row found

    if (conflict) {
      return NextResponse.json(
        { error: "That time slot is no longer available. Please choose another." },
        { status: 409 }
      );
    }

    // ── Save appointment ──────────────────────────────────
    const { data: appt, error: insertErr } = await supabase
      .from("appointments")
      .insert({
        service_id,
        service_name,
        service_price,
        appointment_date,
        appointment_time,
        client_name,
        client_phone,
        client_email: client_email || "",
        notes: notes || "",
        status: "pending",
        deposit_amount: deposit_amount || 0,
        deposit_paid: false,
      })
      .select()
      .single();

    if (insertErr || !appt) {
      console.error("Appointment insert error:", insertErr);
      return NextResponse.json({ error: "Failed to save appointment" }, { status: 500 });
    }

    // ── M-Pesa STK Push for deposit ───────────────────────
    let mpesaError: string | null = null;
    if (deposit_amount > 0) {
      // AccountReference: max 12 chars  → "APT-" + first 8 UUID chars = 12 ✓
      // TransactionDesc:  max 13 chars  → "Appt deposit" = 12 ✓
      const shortId = appt.id.replace(/-/g, "").slice(0, 8).toUpperCase();
      const { checkoutRequestId, error: stkErr } = await initiateMpesaSTK(
        client_phone,
        deposit_amount,
        `APT-${shortId}`,   // 4 + 1 + 8 = 12 chars ✓
        "Appt deposit"       // 12 chars ✓
      );

      if (stkErr) {
        mpesaError = stkErr;
        console.error("STK push failed for appointment:", stkErr);
      }

      // Store CheckoutRequestID in mpesa_code so callback can match it
      if (checkoutRequestId) {
        await supabase
          .from("appointments")
          .update({ mpesa_code: checkoutRequestId })
          .eq("id", appt.id);
      }
    }

    // ── WhatsApp to salon owner ───────────────────────────
    const ownerPhone = process.env.OWNER_WHATSAPP_NUMBER || "";
    if (ownerPhone) {
      await sendWhatsApp(
        ownerPhone,
        `💇‍♀️ NEW APPOINTMENT\n\nService: ${service_name}\nClient: ${client_name} — ${client_phone}\nDate: ${formatDate(appointment_date)}\nTime: ${formatTime(appointment_time)}\nNotes: ${notes || "None"}\nPrice: KSh ${Number(service_price).toLocaleString()}\nDeposit: ${deposit_amount > 0 ? `KSh ${Number(deposit_amount).toLocaleString()} required` : "Not required"}\n\nID: ${appt.id.slice(0, 8).toUpperCase()}`
      );
    }

    // ── WhatsApp confirmation to client ───────────────────
    await sendWhatsApp(
      client_phone,
      `Hi ${client_name}! 🌟\n\nYour appointment at ${SALON_NAME} is confirmed!\n\n📅 ${formatDate(appointment_date)}\n⏰ ${formatTime(appointment_time)}\n✂️ ${service_name}\n💰 KSh ${Number(service_price).toLocaleString()}${deposit_amount > 0 ? `\n\n💳 An M-Pesa prompt has been sent to your phone for the KSh ${Number(deposit_amount).toLocaleString()} deposit.` : ""}\n\nReply here to reschedule.\n\n— ${SALON_NAME}`
    );

    return NextResponse.json({
      appointment_id: appt.id,
      status: "pending",
      ...(mpesaError ? { mpesa_warning: "STK push could not be sent. Pay deposit at the salon." } : {}),
    });
  } catch (err) {
    console.error("Appointment booking error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
