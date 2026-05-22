"use client";
// ============================================================
// BookingSteps — progress indicator for the 4-step booking form
// ============================================================

const STEPS = [
  { number: 1, label: "Service" },
  { number: 2, label: "Date & Time" },
  { number: 3, label: "Your Details" },
  { number: 4, label: "Confirm" },
];

interface BookingStepsProps {
  currentStep: number;
}

export default function BookingSteps({ currentStep }: BookingStepsProps) {
  return (
    <div className="flex items-center justify-center gap-0">
      {STEPS.map(({ number, label }, idx) => {
        const isCompleted = number < currentStep;
        const isActive = number === currentStep;

        return (
          <div key={`step-${number}`} className="flex items-center">
            {/* Step circle */}
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300 ${
                  isCompleted
                    ? "bg-brand-burgundy border-brand-burgundy text-white"
                    : isActive
                    ? "bg-brand-dark border-brand-burgundy text-brand-white ring-4 ring-brand-burgundy/20"
                    : "bg-brand-dark border-brand-mid text-brand-muted"
                }`}
              >
                {isCompleted ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : number}
              </div>
              <span className={`text-[10px] font-semibold tracking-wide uppercase whitespace-nowrap transition-colors ${
                isActive ? "text-brand-white" : isCompleted ? "text-brand-burgundy" : "text-brand-muted"
              }`}>
                {label}
              </span>
            </div>

            {/* Connector line between steps */}
            {idx < STEPS.length - 1 && (
              <div className={`w-12 sm:w-20 h-0.5 mx-1 mb-5 transition-colors duration-300 ${
                number < currentStep ? "bg-brand-burgundy" : "bg-brand-mid"
              }`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
