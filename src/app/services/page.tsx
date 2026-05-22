"use client";
// ============================================================
// Services Page — /services
// Full list of salon services grouped by category with FAQ
// ============================================================
import { useState, useEffect } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { Service } from "@/types";
import ServiceCard from "@/components/services/ServiceCard";
import { SERVICE_CATEGORY_LABELS } from "@/lib/utils";

const FAQ = [
  { q: "How do I book an appointment?", a: "You can book online via our booking page in minutes. Select your service, choose a date and time, fill in your details and optionally pay a small deposit via M-Pesa to secure your slot." },
  { q: "Do I need to pay a deposit?", a: "Some services require a small deposit to secure your booking. The deposit amount is shown on each service. Walk-in services have no deposit requirement." },
  { q: "Can I reschedule my appointment?", a: "Yes — contact us via WhatsApp at least 24 hours before your appointment to reschedule at no charge." },
  { q: "Do you do house calls?", a: "We currently offer services at our Westlands salon only. We are working on mobile services — follow us on Instagram for updates." },
  { q: "What hair do I need to bring?", a: "For wig services, braiding, and crochet, please bring your own hair unless you purchase from our shop. For wash & style and treatments, no hair is needed." },
  { q: "How long will my service take?", a: "Each service has an estimated duration shown on the booking page. Complex braiding or coloring services may take longer — our stylists will advise on the day." },
];

export default function ServicesPage() {
  const supabase = createSupabaseBrowserClient();
  const [services, setServices] = useState<Service[]>([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("services")
        .select("*")
        .eq("active", true)
        .order("category");
      setServices(data || []);
      setLoading(false);
    }
    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const categories = ["all", ...Object.keys(SERVICE_CATEGORY_LABELS)];

  const filtered = activeCategory === "all"
    ? services
    : services.filter((s) => s.category === activeCategory);

  // Group filtered services by category for display
  const grouped = filtered.reduce<Record<string, Service[]>>((acc, svc) => {
    if (!acc[svc.category]) acc[svc.category] = [];
    acc[svc.category].push(svc);
    return acc;
  }, {});

  return (
    <div className="pt-20 min-h-screen">
      {/* Hero banner */}
      <div className="bg-brand-dark border-b border-brand-mid">
        <div className="container-site py-12 text-center">
          <span className="section-tag mx-auto">What We Do</span>
          <h1 className="font-heading text-4xl lg:text-5xl text-brand-white mt-4">
            Salon Services
          </h1>
          <p className="text-brand-muted mt-3 max-w-xl mx-auto">
            Professional hair care by certified stylists. From wig installation to braiding,
            coloring to lash services — we do it all.
          </p>
          <div className="flex items-center justify-center gap-4 mt-6">
            <Link href="/book" className="btn-gold">Book an Appointment</Link>
            <a
              href={`https://wa.me/${process.env.NEXT_PUBLIC_SALON_WHATSAPP}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline text-sm"
            >
              💬 Ask via WhatsApp
            </a>
          </div>
        </div>
      </div>

      <div className="container-site py-10">
        {/* Category tabs */}
        <div className="flex flex-wrap gap-2 mb-10">
          {categories.map((cat, idx) => (
            <button
              key={`cat-tab-${cat}-${idx}`}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCategory === cat
                  ? "bg-brand-burgundy text-white"
                  : "bg-brand-dark border border-brand-mid text-brand-muted hover:text-brand-white hover:border-brand-burgundy/50"
              }`}
            >
              {cat === "all" ? "All Services" : SERVICE_CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>

        {/* Loading state */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={`svc-skel-${i}`} className="glass-card p-6 animate-pulse space-y-3">
                <div className="w-12 h-12 rounded-xl bg-brand-mid" />
                <div className="h-5 bg-brand-mid rounded w-3/4" />
                <div className="h-4 bg-brand-mid rounded w-full" />
                <div className="h-4 bg-brand-mid rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          // Grouped service sections
          Object.entries(grouped).map(([category, svcs]) => (
            <div key={`svc-group-${category}`} className="mb-12">
              <h2 className="font-heading text-2xl text-brand-white mb-6 flex items-center gap-3">
                <span className="w-6 h-px bg-brand-burgundy" />
                {SERVICE_CATEGORY_LABELS[category]}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {svcs.map((svc, idx) => (
                  <ServiceCard key={`svc-card-${svc.id}-${idx}`} service={svc} />
                ))}
              </div>
            </div>
          ))
        )}

        {/* FAQ */}
        <div className="mt-16 pt-12 border-t border-brand-mid max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <span className="section-tag mx-auto">Got Questions?</span>
            <h2 className="font-heading text-3xl text-brand-white mt-4">FAQ</h2>
          </div>

          <div className="space-y-3">
            {FAQ.map(({ q, a }, idx) => (
              <div key={`faq-${idx}`} className="card overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left"
                >
                  <span className="font-medium text-brand-white text-sm pr-4">{q}</span>
                  <svg
                    className={`w-4 h-4 text-brand-muted flex-shrink-0 transition-transform ${openFaq === idx ? "rotate-180" : ""}`}
                    fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-4 text-sm text-brand-muted border-t border-brand-mid pt-3 leading-relaxed">
                    {a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
