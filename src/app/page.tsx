"use client";
// ============================================================
// Home Page — "use client" + useEffect for data fetching
// (Cannot be async server component per project rules)
// ============================================================
import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { Product, Service } from "@/types";
import HeroSection from "@/components/home/HeroSection";
import {
  MarqueeSection,
  ServicesSection,
  FeaturedProductsSection,
  WhyUsSection,
  BeforeAfterSection,
  TestimonialsSection,
  InstagramSection,
  BookingCTASection,
} from "@/components/home/HomeSections";

export default function HomePage() {
  const supabase = createSupabaseBrowserClient();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      // Fetch 8 featured products across all categories
      const { data: products } = await supabase
        .from("products")
        .select("*")
        .eq("is_featured", true)
        .eq("in_stock", true)
        .order("created_at", { ascending: false })
        .limit(8);

      // Fetch active services for the preview grid
      const { data: svcs } = await supabase
        .from("services")
        .select("*")
        .eq("active", true)
        .order("category")
        .limit(8);

      setFeaturedProducts(products || []);
      setServices(svcs || []);
      setLoading(false);
    }

    loadData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      {/* Full-viewport hero */}
      <HeroSection />

      {/* Scrolling marquee strip */}
      <MarqueeSection />

      {/* Salon services preview grid */}
      {!loading && services.length > 0 && (
        <ServicesSection services={services} />
      )}

      {/* Featured products grid */}
      {!loading && featuredProducts.length > 0 && (
        <FeaturedProductsSection products={featuredProducts} />
      )}

      {/* Trust badges section */}
      <WhyUsSection />

      {/* Before/After gallery */}
      <BeforeAfterSection />

      {/* Client testimonials */}
      <TestimonialsSection />

      {/* Instagram teaser */}
      <InstagramSection />

      {/* Appointment CTA banner */}
      <BookingCTASection />
    </>
  );
}
