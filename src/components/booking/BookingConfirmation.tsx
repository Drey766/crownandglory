"use client";
// ============================================================
// BookingConfirmation — Step 4: summary + pay deposit + done screen
// ============================================================
import { useState } from "react";
import Link from "next/link";
import { Service } from "@/types";
import { ClientDetails } from "./ClientDetailsForm";
import { formatPrice, formatDate, formatTime } from "@/lib/utils";

interface BookingConfirmationProps {
  service: Service;
  date: string;
  time: string;
  details: ClientDetails;
  onConfirm: () => Promise<{ appointmentId: string } | null>;
}

export default function BookingConfirmation({
  service,
  date,
  time,
  details,
  onConfirm,
}: BookingConfirmationProps) {
  const [loading, setLoading] = useState(false);
  const [appointmentId, setAppointmentId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function handleConfirm() {
    setLoading(true);
    setError("");
    const result = await onConfirm();
    if (result) {
      setAppointmentId(result.appointmentId);
    } else {
      setError("Something went wrong. Please try again or contact us via WhatsApp.");
    }
    setLoading(false);
  }

  // ── Success screen ───────────────────────────────────────
  if (appointmentId) {
    return (
      <div className="text-center max-w-lg mx-auto space-y-6">
        {/* Success icon */}
        <div className="w-20 h-20 rounded-full bg-emerald-950/50 border-2 border-emerald-500/40 flex items-center justify-center mx-auto">
          <svg className="w-10 h-10 text-emerald-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <div>
          <h2 className="font-heading text-3xl text-brand-white">Booking Confirmed!</h2>
          <p className="text-brand-muted mt-2">
            A WhatsApp confirmation has been sent to {details.phone}
          </p>
        </div>

        {/* Booking summary card */}
        <div className="card p-5 text-left space-y-3">
          <p className="text-xs font-bold tracking-widest uppercase text-brand-gold">Appointment Summary</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-brand-muted">Service</span>
              <span className="text-brand-white font-medium">{service.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-brand-muted">Date</span>
              <span className="text-brand-white">{formatDate(date)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-brand-muted">Time</span>
              <span className="text-brand-white">{formatTime(time)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-brand-muted">Client</span>
              <span className="text-brand-white">{details.name}</span>
            </div>
            <div className="flex justify-between border-t border-brand-mid pt-2 mt-2">
              <span className="text-brand-muted">Booking ID</span>
              <span className="text-brand-muted font-mono text-xs">{appointmentId.slice(0, 8).toUpperCase()}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/" className="btn-outline flex-1 text-center text-sm">Back to Home</Link>
          <Link href="/account" className="btn-primary flex-1 text-center text-sm">View My Appointments</Link>
        </div>
      </div>
    );
  }

  // ── Confirmation form ────────────────────────────────────
  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h2 className="font-heading text-2xl text-brand-white">Confirm Booking</h2>
        <p className="text-brand-muted text-sm mt-1">Review your appointment details below</p>
      </div>

      {/* Summary */}
      <div className="card p-5 space-y-3">
        <p className="text-xs font-bold tracking-widest uppercase text-brand-gold">Appointment Details</p>
        <div className="space-y-2.5 text-sm">
          <Row label="Service" value={service.name} />
          <Row label="Date" value={formatDate(date)} />
          <Row label="Time" value={formatTime(time)} />
          <Row label="Duration" value={`${service.duration_min} minutes`} />
          <div className="border-t border-brand-mid pt-2.5">
            <Row label="Your Name" value={details.name} />
            <div className="mt-2.5"><Row label="Phone" value={`+${details.phone}`} /></div>
            {details.email && <div className="mt-2.5"><Row label="Email" value={details.email} /></div>}
            {details.notes && <div className="mt-2.5"><Row label="Notes" value={details.notes} /></div>}
          </div>
          <div className="border-t border-brand-mid pt-2.5">
            <Row label="Service Price" value={formatPrice(service.price)} highlight />
            {service.deposit > 0 && (
              <div className="mt-2.5">
                <Row label="Deposit Required" value={formatPrice(service.deposit)} highlight />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Deposit notice */}
      {service.deposit > 0 && (
        <div className="card p-4 border-brand-gold/20 bg-brand-gold/5 flex items-start gap-3">
          <svg className="w-4 h-4 text-brand-gold flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
          </svg>
          <div className="text-xs text-brand-muted leading-relaxed">
            <span className="text-brand-gold font-semibold">Deposit: {formatPrice(service.deposit)} </span>
            — A deposit is required to secure this booking. You&apos;ll receive an M-Pesa STK push
            to pay once you confirm. The balance is paid at the salon.
          </div>
        </div>
      )}

      {error && (
        <div className="card p-3 border-red-800/40 bg-red-950/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      <button
        onClick={handleConfirm}
        disabled={loading}
        className="btn-gold w-full text-sm py-3"
      >
        {loading
          ? "Confirming…"
          : service.deposit > 0
          ? `Confirm & Pay Deposit (${formatPrice(service.deposit)})`
          : "Confirm Appointment"}
      </button>
    </div>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between items-start gap-4">
      <span className="text-brand-muted flex-shrink-0">{label}</span>
      <span className={`text-right ${highlight ? "text-brand-gold font-semibold" : "text-brand-white"}`}>
        {value}
      </span>
    </div>
  );
}
