"use client";
// ============================================================
// Footer — newsletter signup, links, social, salon info
// Must be "use client" because of newsletter onSubmit handler
// ============================================================
import { useState } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase";

const SHOP_LINKS = [
  { label: "Wigs", href: "/shop?category=wigs" },
  { label: "Hair Extensions", href: "/shop?category=extensions" },
  { label: "Lace Closures", href: "/shop?category=lace-closures" },
  { label: "Eye Lashes", href: "/shop?category=lashes" },
];

const SERVICE_LINKS = [
  { label: "Wig Installation", href: "/services" },
  { label: "Hair Braiding", href: "/services" },
  { label: "Hair Coloring", href: "/services" },
  { label: "Book Appointment", href: "/book" },
];

const INFO_LINKS = [
  { label: "Blog", href: "/blog" },
  { label: "Contact Us", href: "/contact" },
  { label: "My Account", href: "/account" },
  { label: "Cart", href: "/cart" },
];

export default function Footer() {
  const supabase = createSupabaseBrowserClient();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  // Newsletter subscription
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    const { error } = await supabase
      .from("newsletter_subscribers")
      .insert({ email })
      .select()
      .single();
    if (error) {
      setStatus(error.code === "23505" ? "success" : "error"); // 23505 = duplicate = already subscribed
    } else {
      setStatus("success");
      setEmail("");
    }
  }

  return (
    <footer className="bg-brand-dark border-t border-brand-mid">
      {/* Newsletter strip */}
      <div className="bg-brand-dark2 border-b border-brand-mid">
        <div className="container-site py-10 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div>
            <p className="font-heading text-xl text-brand-white">Join the Crown Club</p>
            <p className="text-sm text-brand-muted mt-1">
              New arrivals, exclusive deals & hair care tips — straight to your inbox.
            </p>
          </div>
          <form onSubmit={handleSubmit} className="flex gap-2 w-full lg:w-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="input flex-1 lg:w-72"
              disabled={status === "loading" || status === "success"}
            />
            <button type="submit" disabled={status === "loading" || status === "success"} className="btn-gold px-5">
              {status === "success" ? "✓ Joined!" : status === "loading" ? "..." : "Subscribe"}
            </button>
          </form>
        </div>
      </div>

      {/* Main footer columns */}
      <div className="container-site py-12 grid grid-cols-2 md:grid-cols-4 gap-8">

        {/* Brand column */}
        <div className="col-span-2 md:col-span-1">
          <Link href="/" className="flex flex-col leading-none mb-4">
            <span className="font-display text-xl text-brand-white">Crown & Glory</span>
            <span className="text-[10px] tracking-[0.3em] uppercase text-brand-gold">Hair Salon</span>
          </Link>
          <p className="text-sm text-brand-muted leading-relaxed mb-4">
            Nairobi&apos;s premier destination for luxury hair. Premium wigs, extensions, and professional salon services.
          </p>
          {/* Social icons */}
          <div className="flex gap-3">
            {[
              { label: "Instagram", icon: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" },
              { label: "TikTok", icon: "M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V9.01a8.16 8.16 0 004.77 1.52V7.08a4.85 4.85 0 01-1-.39z" },
            ].map(({ label, icon }) => (
              <a
                key={`social-${label}`}
                href="#"
                aria-label={label}
                className="w-8 h-8 rounded bg-brand-mid flex items-center justify-center text-brand-muted hover:bg-brand-burgundy hover:text-white transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d={icon} />
                </svg>
              </a>
            ))}
          </div>
        </div>

        {/* Shop links */}
        <div>
          <p className="label text-brand-gold mb-3">Shop</p>
          <ul className="space-y-2">
            {SHOP_LINKS.map(({ label, href }) => (
              <li key={`footer-shop-${label}`}>
                <Link href={href} className="text-sm text-brand-muted hover:text-brand-light transition-colors">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Services links */}
        <div>
          <p className="label text-brand-gold mb-3">Services</p>
          <ul className="space-y-2">
            {SERVICE_LINKS.map(({ label, href }) => (
              <li key={`footer-svc-${label}`}>
                <Link href={href} className="text-sm text-brand-muted hover:text-brand-light transition-colors">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Info links + salon info */}
        <div>
          <p className="label text-brand-gold mb-3">Info</p>
          <ul className="space-y-2 mb-6">
            {INFO_LINKS.map(({ label, href }) => (
              <li key={`footer-info-${label}`}>
                <Link href={href} className="text-sm text-brand-muted hover:text-brand-light transition-colors">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
          {/* Contact info */}
          <div className="space-y-1.5 text-xs text-brand-muted">
            <p>📍 Westlands, Nairobi, Kenya</p>
            <p>⏰ Mon–Sat: 8AM – 8PM</p>
            <a
              href={`https://wa.me/${process.env.NEXT_PUBLIC_SALON_WHATSAPP}`}
              className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              <span>💬</span> WhatsApp Us
            </a>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-brand-mid">
        <div className="container-site py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-brand-muted">
          <p>© {new Date().getFullYear()} Crown & Glory Hair Salon. All rights reserved.</p>
          <div className="flex items-center gap-1">
            <span>Payments via</span>
            <span className="font-bold text-emerald-400 ml-1">M-Pesa</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
