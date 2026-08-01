// ============================================================
// POST /api/mpesa/callback — Safaricom STK Push callback
// Matches by CheckoutRequestID (stored in mpesa_code at booking)
// then overwrites with the real MpesaReceiptNumber on success
// ============================================================
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  const supabase = createSupabaseAdmin();

  try {
    const body = await request.json();
    console.log("M-Pesa callback received:", JSON.stringify(body));

    const callback = body?.Body?.stkCallback;
    if (!callback) {
      // Malformed callback — still return 200 so Safaricom stops retrying
      console.warn("M-Pesa callback: unexpected payload shape", body);
      return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
    }

    const { ResultCode, CheckoutRequestID, CallbackMetadata } = callback;

    console.log(`M-Pesa callback: ResultCode=${ResultCode} CheckoutRequestID=${CheckoutRequestID}`);

    if (ResultCode === 0 && CallbackMetadata) {
      // ── Successful payment ───────────────────────────────
      const meta = CallbackMetadata.Item as Array<{ Name: string; Value: string | number }>;

      const mpesaReceiptNumber = String(
        meta.find((i) => i.Name === "MpesaReceiptNumber")?.Value ?? ""
      );
      const amount = meta.find((i) => i.Name === "Amount")?.Value as number;
      const phone = String(meta.find((i) => i.Name === "PhoneNumber")?.Value ?? "");

      console.log(`M-Pesa payment confirmed: receipt=${mpesaReceiptNumber} amount=${amount} phone=${phone}`);

      // ── Match order by CheckoutRequestID (stored in mpesa_code at booking) ──
      const { data: order } = await supabase
        .from("orders")
        .select("id")
        .eq("mpesa_code", CheckoutRequestID)
        .maybeSingle();

      if (order) {
        await supabase
          .from("orders")
          .update({
            status: "paid",
            mpesa_code: mpesaReceiptNumber, // overwrite temp CheckoutRequestID with real receipt
          })
          .eq("id", order.id);
        console.log(`Order ${order.id} marked as paid`);
      } else {
        // ── Fallback: match by phone (in case CheckoutRequestID wasn't stored) ──
        const last9 = phone.slice(-9);
        const { data: orderByPhone } = await supabase
          .from("orders")
          .select("id")
          .eq("status", "pending")
          .ilike("customer_phone", `%${last9}`)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (orderByPhone) {
          await supabase
            .from("orders")
            .update({ status: "paid", mpesa_code: mpesaReceiptNumber })
            .eq("id", orderByPhone.id);
          console.log(`Order ${orderByPhone.id} matched by phone and marked as paid`);
        }
      }

      // ── Match appointment deposit by CheckoutRequestID ───
      const { data: appt } = await supabase
        .from("appointments")
        .select("id")
        .eq("mpesa_code", CheckoutRequestID)
        .maybeSingle();

      if (appt) {
        await supabase
          .from("appointments")
          .update({
            deposit_paid: true,
            mpesa_code: mpesaReceiptNumber,
            status: "confirmed",
          })
          .eq("id", appt.id);
        console.log(`Appointment ${appt.id} deposit confirmed`);
      } else {
        // Fallback: phone match for appointment
        const last9 = phone.slice(-9);
        const { data: apptByPhone } = await supabase
          .from("appointments")
          .select("id")
          .eq("deposit_paid", false)
          .gt("deposit_amount", 0)
          .ilike("client_phone", `%${last9}`)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (apptByPhone) {
          await supabase
            .from("appointments")
            .update({
              deposit_paid: true,
              mpesa_code: mpesaReceiptNumber,
              status: "confirmed",
            })
            .eq("id", apptByPhone.id);
          console.log(`Appointment ${apptByPhone.id} matched by phone and deposit confirmed`);
        }
      }
    } else {
      // ── Failed / cancelled payment ───────────────────────
      // ResultCode 1032 = user cancelled, 1037 = timeout, 1 = insufficient funds
      console.log(`M-Pesa payment not completed: ResultCode=${ResultCode} CheckoutRequestID=${CheckoutRequestID}`);
      // Don't delete the booking — user can retry payment manually
    }

    // Always return 200 — Safaricom will keep retrying on non-200
    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
  } catch (err) {
    console.error("M-Pesa callback exception:", err);
    // Still return 200 to prevent Safaricom retry storm
    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
  }
}
