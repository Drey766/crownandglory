"use client";
// ============================================================
// ServiceCard — displays a salon service with icon, duration,
// price and a "Book Now" button linking to /book
// ============================================================
import Link from "next/link";
import { Service } from "@/types";
import { formatPrice, SERVICE_CATEGORY_LABELS } from "@/lib/utils";

// Icon SVG paths keyed by service category
const CATEGORY_ICONS: Record<string, string> = {
  "wig-services": "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z",
  "washing-styling": "M12 3L2 12h3v8h6v-5h2v5h6v-8h3L12 3zm0 12.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z",
  braiding: "M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z",
  coloring: "M20.71 5.63l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-3.12 3.12-1.41-1.42-1.42 1.42 1.41 1.41-6.6 6.6A2 2 0 005 16v3h3a2 2 0 001.42-.59l6.6-6.6 1.41 1.42 1.42-1.42-1.42-1.41 3.12-3.12c.4-.4.4-1.03.01-1.42z",
  lashes: "M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z",
};

interface ServiceCardProps {
  service: Service;
  compact?: boolean; // Smaller version for homepage preview
}

export default function ServiceCard({ service, compact = false }: ServiceCardProps) {
  const iconPath = CATEGORY_ICONS[service.category] || CATEGORY_ICONS["wig-services"];

  if (compact) {
    return (
      <div className="service-card">
        {/* Category icon */}
        <div className="w-10 h-10 rounded-lg bg-brand-burgundy/20 flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-brand-burgundy" fill="currentColor" viewBox="0 0 24 24">
            <path d={iconPath} />
          </svg>
        </div>

        <div className="flex-1">
          <p className="font-heading text-sm text-brand-white leading-snug">{service.name}</p>
          <p className="text-[11px] text-brand-muted mt-0.5">{service.duration_min} min</p>
        </div>

        <div className="flex items-center justify-between mt-auto pt-2 border-t border-brand-mid/60">
          <span className="text-brand-gold font-semibold text-sm">{formatPrice(service.price)}</span>
          <Link
            href={`/book?service=${service.id}`}
            className="btn-primary text-[11px] py-1.5 px-3"
          >
            Book
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="service-card">
      {/* Header row */}
      <div className="flex items-start gap-4">
        {/* Category icon */}
        <div className="w-12 h-12 rounded-xl bg-brand-burgundy/20 flex items-center justify-center flex-shrink-0">
          <svg className="w-6 h-6 text-brand-burgundy" fill="currentColor" viewBox="0 0 24 24">
            <path d={iconPath} />
          </svg>
        </div>

        <div className="flex-1">
          {/* Category tag */}
          <span className="text-[10px] tracking-widest uppercase text-brand-muted font-semibold">
            {SERVICE_CATEGORY_LABELS[service.category]}
          </span>
          <h3 className="font-heading text-lg text-brand-white mt-0.5">{service.name}</h3>
        </div>
      </div>

      {/* Description */}
      {service.description && (
        <p className="text-sm text-brand-muted leading-relaxed line-clamp-2">
          {service.description}
        </p>
      )}

      {/* Meta row */}
      <div className="flex items-center gap-4 text-xs text-brand-muted">
        {/* Duration */}
        <span className="flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" />
            <path strokeLinecap="round" d="M12 6v6l4 2" />
          </svg>
          {service.duration_min} min
        </span>

        {/* Deposit info */}
        {service.deposit > 0 && (
          <span className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Deposit: {formatPrice(service.deposit)}
          </span>
        )}
      </div>

      {/* Price + CTA */}
      <div className="flex items-center justify-between pt-2 border-t border-brand-mid/60">
        <span className="font-heading text-xl text-brand-gold">{formatPrice(service.price)}</span>
        <Link href={`/book?service=${service.id}`} className="btn-primary text-xs py-2 px-5">
          Book Now
        </Link>
      </div>
    </div>
  );
}
