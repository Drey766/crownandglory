// ============================================================
// POST /api/mpesa/callback — handle M-Pesa payment callbacks
// Updates order or appointment status on successful payment
// ============================================================
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  const supabase = createSupabaseAdmin();

  try {
    const body = await request.json();
    const callback = body?.Body?.stkCallback;

    if (!callback) {
      return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
    }

    const { ResultCode, CheckoutRequestID, CallbackMetadata } = callback;

    if (ResultCode === 0 && CallbackMetadata) {
      // Extract M-Pesa transaction details from callback metadata
      const meta = CallbackMetadata.Item as Array<{ Name: string; Value: string | number }>;
      const mpesaCode = meta.find((i) => i.Name === "MpesaReceiptNumber")?.Value as string;
      const amount = meta.find((i) => i.Name === "Amount")?.Value as number;
      const phone = meta.find((i) => i.Name === "PhoneNumber")?.Value as string;

      // Try to match to an order
      const { data: order } = await supabase
        .from("orders")
        .select("id")
        .eq("status", "pending")
        .ilike("customer_phone", `%${String(phone).slice(-9)}%`)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (order) {
        await supabase
          .from("orders")
          .update({ status: "paid", mpesa_code: mpesaCode })
          .eq("id", order.id);
      }

      // Try to match to an appointment deposit
      const { data: appt } = await supabase
        .from("appointments")
        .select("id")
        .eq("deposit_paid", false)
        .gt("deposit_amount", 0)
        .ilike("client_phone", `%${String(phone).slice(-9)}%`)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (appt) {
        await supabase
          .from("appointments")
          .update({ deposit_paid: true, mpesa_code: mpesaCode, status: "confirmed" })
          .eq("id", appt.id);
      }

      console.log(`M-Pesa payment confirmed: ${mpesaCode} — KSh ${amount}`);
    }

    // Always return 200 to acknowledge receipt
    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
  } catch (err) {
    console.error("M-Pesa callback error:", err);
    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
  }
}
