"use client";
import { useState } from "react";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [sent, setSent] = useState(false);
  const whatsapp = process.env.NEXT_PUBLIC_SALON_WHATSAPP || "254700000000";

  function update(key: string, value: string) {
    setForm((p) => ({ ...p, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const msg = encodeURIComponent(`Hi! My name is ${form.name}.\n\n${form.message}\n\nContact: ${form.email || form.phone}`);
    window.open(`https://wa.me/${whatsapp}?text=${msg}`, "_blank");
    setSent(true);
    setForm({ name: "", email: "", phone: "", message: "" });
  }

  return (
    <div className="pt-20 min-h-screen">
      <div className="bg-brand-dark border-b border-brand-mid">
        <div className="container-site py-10 text-center">
          <span className="section-tag mx-auto">Get In Touch</span>
          <h1 className="font-heading text-4xl text-brand-white mt-4">Contact Us</h1>
          <p className="text-brand-muted mt-2">We&apos;d love to hear from you. Message us directly on WhatsApp for the fastest response.</p>
        </div>
      </div>

      <div className="container-site py-10 grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-5xl mx-auto">
        {/* Info column */}
        <div className="space-y-6">
          <div>
            <h2 className="font-heading text-2xl text-brand-white mb-4">Salon Info</h2>
            <div className="space-y-4 text-sm">
              {[
                { icon: "📍", label: "Location", value: "Crown Plaza, Westlands\nNairobi, Kenya" },
                { icon: "⏰", label: "Hours", value: "Monday – Saturday: 8:00 AM – 8:00 PM\nSunday: Closed" },
                { icon: "📞", label: "Phone / WhatsApp", value: `+${whatsapp}` },
                { icon: "📧", label: "Email", value: "hello@crownandglory.co.ke" },
              ].map(({ icon, label, value }, idx) => (
                <div key={`info-${idx}`} className="flex items-start gap-3 card p-3">
                  <span className="text-xl flex-shrink-0">{icon}</span>
                  <div>
                    <p className="text-xs text-brand-muted uppercase tracking-wide font-semibold mb-0.5">{label}</p>
                    <p className="text-brand-light whitespace-pre-line">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* WhatsApp CTA */}
          <a
            href={`https://wa.me/${whatsapp}?text=Hi! I'd like to get in touch.`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Chat on WhatsApp
          </a>

          {/* Map placeholder */}
          <div className="card h-48 flex items-center justify-center bg-brand-dark2">
            <div className="text-center">
              <span className="text-3xl">🗺️</span>
              <p className="text-brand-muted text-xs mt-2">Crown Plaza, Westlands</p>
              <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer" className="text-xs text-brand-burgundy hover:text-brand-burgundy-light mt-1 block">
                Open in Google Maps →
              </a>
            </div>
          </div>
        </div>

        {/* Contact form */}
        <div>
          <h2 className="font-heading text-2xl text-brand-white mb-4">Send a Message</h2>
          <p className="text-xs text-brand-muted mb-5">Your message will be sent directly to our WhatsApp for the fastest reply.</p>

          {sent && (
            <div className="card p-4 mb-4 border-emerald-800/40 bg-emerald-950/20 text-emerald-400 text-sm">
              ✓ Message sent! We&apos;ll reply on WhatsApp shortly.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Name *</label>
              <input type="text" className="input" value={form.name} onChange={(e) => update("name", e.target.value)} required placeholder="Jane Wanjiku" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Email</label>
                <input type="email" className="input" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="jane@example.com" />
              </div>
              <div>
                <label className="label">Phone</label>
                <input type="tel" className="input" value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="0712 345 678" />
              </div>
            </div>
            <div>
              <label className="label">Message *</label>
              <textarea className="input resize-none" rows={5} value={form.message} onChange={(e) => update("message", e.target.value)} required placeholder="How can we help you?" />
            </div>
            <button type="submit" className="btn-primary w-full">Send via WhatsApp</button>
          </form>
        </div>
      </div>
    </div>
  );
}
