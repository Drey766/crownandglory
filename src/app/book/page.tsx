"use client";
// ============================================================
// Book Page — /book — multi-step appointment booking form
// Step 1: Service → Step 2: Date/Time → Step 3: Details → Step 4: Confirm
// ============================================================
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { Service } from "@/types";
import BookingSteps from "@/components/booking/BookingSteps";
import ServiceSelector from "@/components/booking/ServiceSelector";
import DateTimePicker from "@/components/booking/DateTimePicker";
import ClientDetailsForm, { ClientDetails } from "@/components/booking/ClientDetailsForm";
import BookingConfirmation from "@/components/booking/BookingConfirmation";
import { Suspense } from "react";

function BookPageContent() {
  const supabase = createSupabaseBrowserClient();
  const searchParams = useSearchParams();

  const [step, setStep] = useState(1);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [details, setDetails] = useState<ClientDetails>({ name: "", phone: "", email: "", notes: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("services")
        .select("*")
        .eq("active", true)
        .order("category");
      setServices(data || []);

      // Pre-select service from URL param if provided (?service=uuid)
      const serviceId = searchParams.get("service");
      if (serviceId && data) {
        const svc = data.find((s: Service) => s.id === serviceId);
        if (svc) { setSelectedService(svc); setStep(2); }
      }
      setLoading(false);
    }
    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Step validation — can we proceed?
  function canNext(): boolean {
    if (step === 1) return !!selectedService;
    if (step === 2) return !!selectedDate && !!selectedTime;
    if (step === 3) return !!details.name && !!details.phone && details.phone.length >= 12;
    return true;
  }

  // Final booking submission
  async function handleConfirm(): Promise<{ appointmentId: string } | null> {
    if (!selectedService) return null;
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service_id: selectedService.id,
          service_name: selectedService.name,
          service_price: selectedService.price,
          appointment_date: selectedDate,
          appointment_time: selectedTime,
          client_name: details.name,
          client_phone: details.phone,
          client_email: details.email,
          notes: details.notes,
          deposit_amount: selectedService.deposit,
        }),
      });
      const data = await res.json();
      if (!res.ok) return null;
      return { appointmentId: data.appointment_id };
    } catch {
      return null;
    }
  }

  if (loading) {
    return (
      <div className="pt-20 container-site py-12">
        <div className="animate-pulse space-y-4 max-w-2xl mx-auto">
          <div className="h-8 bg-brand-dark2 rounded w-1/2" />
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => <div key={`b-skel-${i}`} className="h-24 bg-brand-dark2 rounded-xl" />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen">
      {/* Header */}
      <div className="bg-brand-dark border-b border-brand-mid">
        <div className="container-site py-8 text-center">
          <h1 className="font-heading text-3xl text-brand-white">Book an Appointment</h1>
          <p className="text-brand-muted text-sm mt-1">Secure your slot in minutes — M-Pesa accepted</p>
        </div>
      </div>

      <div className="container-site py-8 max-w-3xl mx-auto">
        {/* Progress steps */}
        <div className="mb-10">
          <BookingSteps currentStep={step} />
        </div>

        {/* Step panels */}
        <div className="card p-6 lg:p-8">
          {step === 1 && (
            <ServiceSelector
              services={services}
              selectedId={selectedService?.id || ""}
              onSelect={(svc) => setSelectedService(svc)}
            />
          )}
          {step === 2 && selectedService && (
            <DateTimePicker
              serviceId={selectedService.id}
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              onSelect={(date, time) => { setSelectedDate(date); setSelectedTime(time); }}
            />
          )}
          {step === 3 && (
            <ClientDetailsForm details={details} onChange={setDetails} />
          )}
          {step === 4 && selectedService && (
            <BookingConfirmation
              service={selectedService}
              date={selectedDate}
              time={selectedTime}
              details={details}
              onConfirm={handleConfirm}
            />
          )}
        </div>

        {/* Navigation buttons — not shown on step 4 (handled inside) */}
        {step < 4 && (
          <div className="flex items-center justify-between mt-6">
            <button
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              className={`btn-ghost text-sm ${step === 1 ? "invisible" : ""}`}
            >
              ← Back
            </button>
            <button
              onClick={() => setStep((s) => s + 1)}
              disabled={!canNext()}
              className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed text-sm px-8"
            >
              {step === 3 ? "Review Booking →" : "Continue →"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function BookPage() {
  return (
    <Suspense fallback={
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="text-brand-muted animate-pulse">Loading…</div>
      </div>
    }>
      <BookPageContent />
    </Suspense>
  );
}
