// ============================================================
// POST /api/appointments — validate + book + WhatsApp + M-Pesa
// ============================================================
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase";
import { formatDate, formatTime } from "@/lib/utils";

const SALON_NAME = process.env.NEXT_PUBLIC_SALON_NAME || "Crown & Glory Hair Salon";

async function sendWhatsApp(to: string, message: string) {
  const token = process.env.WHATSAPP_API_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!token || !phoneNumberId) return;

  await fetch(`https://graph.facebook.com/v18.0/${phoneNumberId}/messages`, {
    method: "POST",
    headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body: message },
    }),
  });
}

async function initiateMpesaSTK(phone: string, amount: number, accountRef: string): Promise<string | null> {
  try {
    const consumerKey = process.env.MPESA_CONSUMER_KEY!;
    const consumerSecret = process.env.MPESA_CONSUMER_SECRET!;
    const shortCode = process.env.MPESA_BUSINESS_SHORT_CODE!;
    const passkey = process.env.MPESA_PASSKEY!;
    const callbackUrl = process.env.MPESA_CALLBACK_URL!;

    // Get access token
    const authRes = await fetch(
      "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
      { headers: { Authorization: `Basic ${Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64")}` } }
    );
    const { access_token } = await authRes.json();

    // Build password
    const timestamp = new Date().toISOString().replace(/[-T:.Z]/g, "").slice(0, 14);
    const password = Buffer.from(`${shortCode}${passkey}${timestamp}`).toString("base64");

    // Format phone: 254XXXXXXXXX
    const formattedPhone = phone.startsWith("0") ? `254${phone.slice(1)}` : phone;

    const stkRes = await fetch(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      {
        method: "POST",
        headers: { Authorization: `Bearer ${access_token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          BusinessShortCode: shortCode,
          Password: password,
          Timestamp: timestamp,
          TransactionType: "CustomerPayBillOnline",
          Amount: amount,
          PartyA: formattedPhone,
          PartyB: shortCode,
          PhoneNumber: formattedPhone,
          CallBackURL: callbackUrl,
          AccountReference: accountRef,
          TransactionDesc: `Deposit for ${accountRef}`,
        }),
      }
    );
    const stkData = await stkRes.json();
    return stkData.CheckoutRequestID || null;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  const supabase = createSupabaseAdmin();

  try {
    const body = await request.json();
    const {
      service_id, service_name, service_price,
      appointment_date, appointment_time,
      client_name, client_phone, client_email,
      notes, deposit_amount,
    } = body;

    // ── Validate required fields ──────────────────────────
    if (!service_id || !appointment_date || !appointment_time || !client_name || !client_phone) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // ── Check slot is still available ─────────────────────
    const { data: conflict } = await supabase
      .from("appointments")
      .select("id")
      .eq("appointment_date", appointment_date)
      .eq("appointment_time", appointment_time)
      .not("status", "eq", "cancelled")
      .single();

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
      return NextResponse.json({ error: "Failed to save appointment" }, { status: 500 });
    }

    // ── Initiate M-Pesa deposit (if required) ─────────────
    if (deposit_amount > 0) {
      await initiateMpesaSTK(client_phone, deposit_amount, `APPT-${appt.id.slice(0, 8).toUpperCase()}`);
    }

    // ── WhatsApp to salon owner ───────────────────────────
    const ownerPhone = process.env.OWNER_WHATSAPP_NUMBER || "";
    const ownerMsg =
`💇‍♀️ NEW APPOINTMENT

Service: ${service_name}
Client: ${client_name} — ${client_phone}
Date: ${formatDate(appointment_date)}
Time: ${formatTime(appointment_time)}
Notes: ${notes || "None"}
Price: KSh ${service_price.toLocaleString()}
Deposit: ${deposit_amount > 0 ? `KSh ${deposit_amount.toLocaleString()} required` : "Not required"}

Booking ID: ${appt.id.slice(0, 8).toUpperCase()}
Confirm or manage via your dashboard.`;

    await sendWhatsApp(ownerPhone, ownerMsg);

    // ── WhatsApp confirmation to client ───────────────────
    const clientMsg =
`Hi ${client_name}! 🌟

Your appointment at ${SALON_NAME} is confirmed!

📅 ${formatDate(appointment_date)}
⏰ ${formatTime(appointment_time)}
✂️ ${service_name}
💰 KSh ${service_price.toLocaleString()}
${deposit_amount > 0 ? `\n💳 Please complete the M-Pesa payment of KSh ${deposit_amount.toLocaleString()} to secure your slot.\n` : ""}
We'll see you then! Reply to this message if you need to reschedule.

— ${SALON_NAME}`;

    await sendWhatsApp(client_phone, clientMsg);

    return NextResponse.json({ appointment_id: appt.id, status: "pending" });
  } catch (err) {
    console.error("Appointment booking error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
