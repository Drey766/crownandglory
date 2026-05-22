"use client";
// ============================================================
// ServiceSelector — Step 1: pick a service from the grid
// ============================================================
import { Service } from "@/types";
import { formatPrice, SERVICE_CATEGORY_LABELS } from "@/lib/utils";

interface ServiceSelectorProps {
  services: Service[];
  selectedId: string;
  onSelect: (service: Service) => void;
}

export default function ServiceSelector({ services, selectedId, onSelect }: ServiceSelectorProps) {
  // Group by category for display
  const grouped = services.reduce<Record<string, Service[]>>((acc, svc) => {
    if (!acc[svc.category]) acc[svc.category] = [];
    acc[svc.category].push(svc);
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-heading text-2xl text-brand-white">Choose Your Service</h2>
        <p className="text-brand-muted text-sm mt-1">Select the service you&apos;d like to book</p>
      </div>

      {Object.entries(grouped).map(([category, svcs]) => (
        <div key={`sel-group-${category}`}>
          <h3 className="text-xs font-bold tracking-widest uppercase text-brand-gold mb-3 flex items-center gap-2">
            <span className="w-4 h-px bg-brand-gold" />
            {SERVICE_CATEGORY_LABELS[category]}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {svcs.map((svc, idx) => {
              const isSelected = svc.id === selectedId;
              return (
                <button
                  key={`svc-sel-${svc.id}-${idx}`}
                  onClick={() => onSelect(svc)}
                  className={`text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                    isSelected
                      ? "border-brand-burgundy bg-brand-burgundy/10"
                      : "border-brand-mid bg-brand-dark hover:border-brand-burgundy/50 hover:bg-brand-dark2"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="font-medium text-brand-white text-sm">{svc.name}</p>
                      {svc.description && (
                        <p className="text-xs text-brand-muted mt-0.5 line-clamp-2">{svc.description}</p>
                      )}
                      <div className="flex items-center gap-3 mt-2 text-xs text-brand-muted">
                        <span>⏱ {svc.duration_min} min</span>
                        {svc.deposit > 0 && (
                          <span className="text-brand-gold">Deposit: {formatPrice(svc.deposit)}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <p className="font-heading text-brand-gold font-semibold">{formatPrice(svc.price)}</p>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-brand-burgundy flex items-center justify-center mt-1 ml-auto">
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
