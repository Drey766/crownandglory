"use client";
// ============================================================
// HeroSection — full-viewport hero with bold headline + two CTAs
// ============================================================
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background gradient layers — rich burgundy depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-black via-brand-dark to-brand-black" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_60%_40%,rgba(139,26,58,0.25)_0%,transparent_70%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_80%,rgba(201,168,76,0.08)_0%,transparent_60%)]" />

      {/* Decorative background pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `repeating-linear-gradient(45deg, #C9A84C 0, #C9A84C 1px, transparent 0, transparent 50%)`,
          backgroundSize: "30px 30px",
        }}
      />

      {/* Decorative text watermark */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 -translate-x-4 opacity-[0.04] pointer-events-none select-none hidden lg:block">
        <span className="font-display text-[200px] text-brand-white leading-none font-bold rotate-90 whitespace-nowrap block" style={{ writingMode: "vertical-rl" }}>
          CROWN
        </span>
      </div>

      {/* Content */}
      <div className="relative container-site text-center lg:text-left max-w-5xl">
        {/* Eyebrow tag */}
        <div className="flex items-center justify-center lg:justify-start gap-3 mb-6">
          <div className="w-12 h-px bg-brand-gold" />
          <span className="text-xs font-bold tracking-[0.4em] uppercase text-brand-gold">
            Nairobi&apos;s Premier Hair Destination
          </span>
        </div>

        {/* Main headline */}
        <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl xl:text-8xl leading-none text-brand-white mb-2">
          Transform
        </h1>
        <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl xl:text-8xl leading-none gradient-text mb-2 italic">
          Your Look.
        </h1>
        <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl xl:text-8xl leading-none text-brand-white">
          Own Your Crown.
        </h1>

        {/* Subtitle */}
        <p className="text-brand-muted text-lg lg:text-xl mt-6 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
          Premium wigs, hair extensions & lashes — and professional salon services.
          Book online, pay with M-Pesa.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
          <Link href="/book" className="btn-gold text-sm px-8 py-4 text-base">
            ✦ Book an Appointment
          </Link>
          <Link href="/shop" className="btn-outline text-sm px-8 py-4 text-base">
            Shop Hair
          </Link>
        </div>

        {/* Social proof micro-stats */}
        <div className="flex items-center justify-center lg:justify-start gap-8 mt-10 pt-8 border-t border-brand-mid/40">
          {[
            { value: "500+", label: "Happy Clients" },
            { value: "107", label: "Products" },
            { value: "24", label: "Services" },
          ].map(({ value, label }, idx) => (
            <div key={`stat-${idx}`} className="text-center lg:text-left">
              <p className="font-display text-2xl text-brand-gold font-bold">{value}</p>
              <p className="text-xs text-brand-muted tracking-wide uppercase">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-brand-muted animate-bounce">
        <span className="text-[10px] tracking-widest uppercase">Scroll</span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </section>
  );
}
