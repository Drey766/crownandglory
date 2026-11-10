"use client";
// ============================================================
// HomeSections — Marquee, ServicesPreview, FeaturedProducts,
// WhyUs, BeforeAfter, Testimonials, BookingCTA, Instagram
// ============================================================
import Link from "next/link";
import Image from "next/image";
import { Product, Service } from "@/types";
import ProductCard from "@/components/shop/ProductCard";
import ServiceCard from "@/components/services/ServiceCard";
import { formatPrice } from "@/lib/utils";

// ── Scrolling Marquee ──────────────────────────────────────
export function MarqueeSection() {
  const items = ["Wigs", "Extensions", "Lace Closures", "Lashes", "Wig Installation", "Hair Coloring", "Braiding", "Styling", "Wig Washing"];
  const doubled = [...items, ...items]; // Doubled for seamless loop

  return (
    <div className="bg-brand-burgundy py-3 overflow-hidden">
      <div className="marquee-track">
        {doubled.map((item, idx) => (
          <span key={`marquee-${item}-${idx}`} className="inline-flex items-center gap-6 px-6 text-sm font-bold tracking-widest uppercase text-brand-white/90 whitespace-nowrap">
            {item}
            <span className="w-1 h-1 rounded-full bg-brand-white/40 flex-shrink-0" />
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Services Preview (8 cards) ─────────────────────────────
interface ServicesSectionProps { services: Service[] }

export function ServicesSection({ services }: ServicesSectionProps) {
  return (
    <section className="section-padding bg-brand-dark">
      <div className="container-site">
        <div className="text-center mb-12">
          <span className="section-tag mx-auto">What We Offer</span>
          <h2 className="font-heading text-3xl lg:text-4xl text-brand-white mt-4">
            Professional Salon Services
          </h2>
          <p className="text-brand-muted mt-3 max-w-xl mx-auto">
            From wig installation to braiding and lash services — our certified stylists have you covered.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {services.slice(0, 8).map((service, idx) => (
            <ServiceCard key={`svc-prev-${service.id}-${idx}`} service={service} compact />
          ))}
        </div>

        <div className="text-center mt-8">
          <Link href="/services" className="btn-outline">
            View All Services
          </Link>
        </div>
      </div>
    </section>
  );
}

// ── Featured Products ──────────────────────────────────────
interface FeaturedProductsProps { products: Product[] }

export function FeaturedProductsSection({ products }: FeaturedProductsProps) {
  return (
    <section className="section-padding">
      <div className="container-site">
        <div className="flex items-end justify-between mb-10">
          <div>
            <span className="section-tag">Shop Featured</span>
            <h2 className="font-heading text-3xl lg:text-4xl text-brand-white mt-3">
              Bestselling Hair
            </h2>
          </div>
          <Link href="/shop" className="btn-ghost hidden sm:flex">
            View All →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-4">
          {products.slice(0, 8).map((product, idx) => (
            <ProductCard key={`feat-${product.id}-${idx}`} product={product} />
          ))}
        </div>

        <div className="text-center mt-8 sm:hidden">
          <Link href="/shop" className="btn-outline">View All Products</Link>
        </div>
      </div>
    </section>
  );
}

// ── Why Choose Us ─────────────────────────────────────────
const TRUST_BADGES = [
  {
    icon: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z",
    title: "Certified Stylists",
    desc: "Our team of professionals are trained & certified in the latest hair techniques.",
  },
  {
    icon: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z",
    title: "Premium Human Hair",
    desc: "We source only 100% human hair — raw, virgin, and ethically obtained.",
  },
  {
    icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
    title: "Same-Day Booking",
    desc: "Book your appointment online in minutes. Same-day slots available.",
  },
  {
    icon: "M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z",
    title: "M-Pesa Accepted",
    desc: "Pay easily with M-Pesa for all services and online product orders.",
  },
];

export function WhyUsSection() {
  return (
    <section className="section-padding bg-linen">
      <div className="container-site">
        <div className="text-center mb-12">
          <span className="section-tag mx-auto">Why Crown & Glory</span>
          <h2 className="font-heading text-3xl lg:text-4xl text-brand-white mt-4">
            The Crown Experience
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {TRUST_BADGES.map(({ icon, title, desc }, idx) => (
            <div key={`trust-${idx}`} className="text-center group">
              <div className="w-14 h-14 rounded-full bg-brand-burgundy/20 border border-brand-burgundy/30 flex items-center justify-center mx-auto mb-4 group-hover:bg-brand-burgundy/30 transition-colors duration-300">
                <svg className="w-6 h-6 text-brand-burgundy" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
                </svg>
              </div>
              <h3 className="font-heading text-base text-brand-white mb-2">{title}</h3>
              <p className="text-sm text-brand-muted leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Before / After Gallery ────────────────────────────────
const BEFORE_AFTER = [
  { label: "Wig Installation", before: "/transformations/wig-before.jpg", after: "/transformations/wig-after.jpg" },
  { label: "Hair Coloring", before: "/transformations/coloring-before.jpg", after: "/transformations/coloring-after.jpg" },
  { label: "Box Braids", before: "/transformations/braids-before.jpg", after: "/transformations/braids-after.jpg" },
  { label: "Short Cut", before: "/transformations/cut-before.jpg", after: "/transformations/cut-after.jpg" },
];

export function BeforeAfterSection() {
  return (
    <section className="section-padding bg-brand-dark">
      <div className="container-site">
        <div className="text-center mb-12">
          <span className="section-tag mx-auto">Transformations</span>
          <h2 className="font-heading text-3xl lg:text-4xl text-brand-white mt-4">
            Before & After
          </h2>
          <p className="text-brand-muted mt-3">Hover to reveal the transformation</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {BEFORE_AFTER.map(({ label, before, after }, idx) => (
            <div key={`ba-${idx}`} className="before-after-card aspect-[3/4] cursor-pointer shadow-brand-glow group">
              {/* Before image — base layer */}
              <Image src={before} alt={`Before ${label}`} fill className="object-cover" sizes="25vw" />
              {/* After image — revealed on hover via clip-path */}
              <div className="after-img">
                <Image src={after} alt={`After ${label}`} fill className="object-cover" sizes="25vw" />
              </div>
              {/* Label overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-brand-black/80 to-transparent">
                <div className="flex justify-between text-xs text-brand-white/70">
                  <span>Before</span>
                  <span>{label}</span>
                  <span>After →</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Testimonials ──────────────────────────────────────────
const TESTIMONIALS = [
  { name: "Amara W.", rating: 5, text: "Got my wig installed here and I've been getting compliments all week! The stylist was so patient and professional. Will definitely be back.", avatar: "AW" },
  { name: "Njeri K.", rating: 5, text: "The lace closure I bought looks completely natural. The quality is unmatched and delivery was so fast. Crown & Glory is my go-to now.", avatar: "NK" },
  { name: "Fatuma A.", rating: 5, text: "Booked knotless braids and they lasted 3 months with proper care. The booking system was so easy and they confirmed via WhatsApp immediately.", avatar: "FA" },
  { name: "Zuri M.", rating: 5, text: "I was nervous about buying hair online but the photos are accurate and the extensions blended perfectly. M-Pesa payment was seamless!", avatar: "ZM" },
];

export function TestimonialsSection() {
  return (
    <section className="section-padding">
      <div className="container-site">
        <div className="text-center mb-12">
          <span className="section-tag mx-auto">Client Love</span>
          <h2 className="font-heading text-3xl lg:text-4xl text-brand-white mt-4">
            What Our Queens Say
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {TESTIMONIALS.map(({ name, rating, text, avatar }, idx) => (
            <div key={`testimonial-${idx}`} className="card p-5 flex flex-col gap-3">
              {/* Stars */}
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map((s, si) => (
                  <svg key={`ts-${idx}-${si}`} className="w-4 h-4 text-brand-gold" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                ))}
              </div>
              {/* Quote */}
              <p className="text-sm text-brand-muted leading-relaxed flex-1 italic">&ldquo;{text}&rdquo;</p>
              {/* Author */}
              <div className="flex items-center gap-2.5 pt-2 border-t border-brand-mid">
                <div className="w-8 h-8 rounded-full bg-brand-burgundy/30 border border-brand-burgundy/40 flex items-center justify-center text-xs font-bold text-brand-burgundy">
                  {avatar}
                </div>
                <span className="text-sm font-medium text-brand-white">{name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Instagram Teaser ──────────────────────────────────────
const IG_IMAGES = [
  "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1488716820095-cbe80883c496?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1502764613149-7f1d229e230f?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&h=400&fit=crop",
];

export function InstagramSection() {
  return (
    <section className="section-padding bg-brand-dark">
      <div className="container-site">
        <div className="text-center mb-8">
          <span className="section-tag mx-auto">Follow Along</span>
          <h2 className="font-heading text-2xl text-brand-white mt-3">@crownandglory.ke</h2>
        </div>

        <div className="grid grid-cols-3 lg:grid-cols-6 gap-2">
          {IG_IMAGES.map((src, idx) => (
            <a
              key={`ig-${idx}`}
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="relative aspect-square overflow-hidden rounded-lg group"
            >
              <Image src={src} alt={`Instagram post ${idx + 1}`} fill className="object-cover transition-transform duration-500 group-hover:scale-110" sizes="17vw" />
              <div className="absolute inset-0 bg-brand-black/0 group-hover:bg-brand-black/40 transition-colors duration-300 flex items-center justify-center">
                <svg className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069z" />
                </svg>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Booking CTA Banner ─────────────────────────────────────
export function BookingCTASection() {
  const salonWhatsApp = process.env.NEXT_PUBLIC_SALON_WHATSAPP || "254700000000";

  return (
    <section className="bg-brand-dark2 border-y border-brand-mid py-16 lg:py-20">
      <div className="container-site text-center max-w-3xl mx-auto">
        <span className="section-tag mx-auto">Ready?</span>
        <h2 className="font-display text-4xl lg:text-5xl text-brand-white mt-4 italic">
          Your Crown Awaits
        </h2>
        <p className="text-brand-muted mt-4 text-lg leading-relaxed">
          Book your appointment online and pay a small deposit via M-Pesa to secure your slot.
          Walk in transformed.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
          <Link href="/book" className="btn-gold text-sm px-8 py-3">
            ✦ Book Your Appointment
          </Link>
          <a
            href={`https://wa.me/${salonWhatsApp}?text=Hi! I'd like to book an appointment`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline text-sm px-8 py-3"
          >
            💬 WhatsApp Us
          </a>
        </div>
      </div>
    </section>
  );
}
