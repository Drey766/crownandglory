"use client";
// ============================================================
// ClientDetailsForm — Step 3: name, phone, email, notes
// ============================================================

export interface ClientDetails {
  name: string;
  phone: string;
  email: string;
  notes: string;
}

interface ClientDetailsFormProps {
  details: ClientDetails;
  onChange: (details: ClientDetails) => void;
}

export default function ClientDetailsForm({ details, onChange }: ClientDetailsFormProps) {
  function update(key: keyof ClientDetails, value: string) {
    onChange({ ...details, [key]: value });
  }

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h2 className="font-heading text-2xl text-brand-white">Your Details</h2>
        <p className="text-brand-muted text-sm mt-1">We&apos;ll send your confirmation to these contacts</p>
      </div>

      <div className="space-y-4">
        {/* Full name */}
        <div>
          <label className="label">Full Name *</label>
          <input
            type="text"
            className="input"
            placeholder="Jane Wanjiku"
            value={details.name}
            onChange={(e) => update("name", e.target.value)}
            required
          />
        </div>

        {/* Phone */}
        <div>
          <label className="label">Phone Number (WhatsApp) *</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted text-sm">+254</span>
            <input
              type="tel"
              className="input pl-14"
              placeholder="712 345 678"
              value={details.phone.replace(/^254/, "")}
              onChange={(e) => {
                const raw = e.target.value.replace(/\D/g, "");
                update("phone", raw ? `254${raw}` : "");
              }}
              required
            />
          </div>
          <p className="text-xs text-brand-muted mt-1">Your appointment confirmation will be sent here via WhatsApp</p>
        </div>

        {/* Email */}
        <div>
          <label className="label">Email Address (optional)</label>
          <input
            type="email"
            className="input"
            placeholder="jane@example.com"
            value={details.email}
            onChange={(e) => update("email", e.target.value)}
          />
        </div>

        {/* Notes */}
        <div>
          <label className="label">Notes for the Stylist (optional)</label>
          <textarea
            className="input resize-none"
            rows={3}
            placeholder="E.g. I prefer low heat, I have sensitive scalp, please use my own hair…"
            value={details.notes}
            onChange={(e) => update("notes", e.target.value)}
          />
        </div>
      </div>

      <div className="card p-4 flex items-start gap-3">
        <svg className="w-4 h-4 text-brand-gold flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
        </svg>
        <p className="text-xs text-brand-muted leading-relaxed">
          Your phone number will be used to send a WhatsApp confirmation message.
          Please ensure it&apos;s a valid WhatsApp number.
        </p>
      </div>
    </div>
  );
}
