"use client";
// ============================================================
// Shop Page — Suspense wrapper for useSearchParams() safety
// ShopContent has sidebar filters + debounced search
// ============================================================
import { Suspense, useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { Product, ShopFilters } from "@/types";
import { useDebounce } from "@/hooks/useDebounce";
import ProductCard from "@/components/shop/ProductCard";
import { CATEGORY_LABELS, HAIR_TYPE_LABELS } from "@/lib/utils";

// ── Skeleton loader ────────────────────────────────────────
function ShopSkeleton() {
  return (
    <div className="container-site py-24">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={`skel-${i}`} className="card animate-pulse">
            <div className="aspect-[3/4] bg-brand-dark2" />
            <div className="p-3 space-y-2">
              <div className="h-3 bg-brand-mid rounded w-1/3" />
              <div className="h-4 bg-brand-mid rounded w-3/4" />
              <div className="h-4 bg-brand-mid rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Inner shop content (uses useSearchParams) ──────────────
function ShopContent() {
  const supabase = createSupabaseBrowserClient();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Raw search input — debounced before firing Supabase query
  const [searchInput, setSearchInput] = useState(searchParams.get("q") || "");
  const debouncedSearch = useDebounce(searchInput, 400);

  const [filters, setFilters] = useState<ShopFilters>({
    category: searchParams.get("category") || "",
    hair_type: searchParams.get("hair_type") || "",
    min_price: 0,
    max_price: 200000,
    in_stock_only: false,
    sort: "newest",
    search: "",
  });

  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Fetch products — only fires when debouncedSearch or filters change
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    let query = supabase.from("products").select("*", { count: "exact" });

    if (filters.category) query = query.eq("category", filters.category);
    if (filters.hair_type) query = query.eq("hair_type", filters.hair_type);
    if (filters.in_stock_only) query = query.eq("in_stock", true);
    if (filters.min_price > 0) query = query.gte("price", filters.min_price);
    if (filters.max_price < 200000) query = query.lte("price", filters.max_price);
    if (debouncedSearch) query = query.ilike("name", `%${debouncedSearch}%`);

    // Sorting
    switch (filters.sort) {
      case "price_asc": query = query.order("price", { ascending: true }); break;
      case "price_desc": query = query.order("price", { ascending: false }); break;
      case "popular": query = query.order("review_count", { ascending: false }); break;
      default: query = query.order("created_at", { ascending: false });
    }

    const { data, count } = await query;
    setProducts(data || []);
    setTotal(count || 0);
    setLoading(false);
  }, [debouncedSearch, filters]); // eslint-disable-line react-hooks/exhaustive-deps

  // Re-fetch when debouncedSearch or filters change
  useEffect(() => { fetchProducts(); }, [debouncedSearch, filters]); // eslint-disable-line react-hooks/exhaustive-deps

  function updateFilter(key: keyof ShopFilters, value: string | boolean | number) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  const FilterSidebar = () => (
    <aside className="space-y-6">
      {/* Category */}
      <div>
        <p className="label text-brand-gold mb-2">Category</p>
        <div className="space-y-1.5">
          {[{ value: "", label: "All Products" }, ...Object.entries(CATEGORY_LABELS).map(([value, label]) => ({ value, label }))].map(({ value, label }, idx) => (
            <button
              key={`cat-filter-${value}-${idx}`}
              onClick={() => updateFilter("category", value)}
              className={`w-full text-left text-sm px-3 py-2 rounded transition-colors ${
                filters.category === value
                  ? "bg-brand-burgundy text-white"
                  : "text-brand-muted hover:text-brand-white hover:bg-brand-dark2"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Hair type */}
      <div>
        <p className="label text-brand-gold mb-2">Hair Type</p>
        <div className="space-y-1.5">
          {[{ value: "", label: "All Types" }, ...Object.entries(HAIR_TYPE_LABELS).map(([value, label]) => ({ value, label }))].map(({ value, label }, idx) => (
            <button
              key={`ht-filter-${value}-${idx}`}
              onClick={() => updateFilter("hair_type", value)}
              className={`w-full text-left text-sm px-3 py-2 rounded transition-colors ${
                filters.hair_type === value
                  ? "bg-brand-burgundy text-white"
                  : "text-brand-muted hover:text-brand-white hover:bg-brand-dark2"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* In stock only */}
      <label className="flex items-center gap-2.5 cursor-pointer group">
        <div
          onClick={() => updateFilter("in_stock_only", !filters.in_stock_only)}
          className={`w-10 h-5 rounded-full transition-colors relative ${filters.in_stock_only ? "bg-brand-burgundy" : "bg-brand-mid"}`}
        >
          <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${filters.in_stock_only ? "translate-x-5" : "translate-x-0.5"}`} />
        </div>
        <span className="text-sm text-brand-muted group-hover:text-brand-white transition-colors">In Stock Only</span>
      </label>

      {/* Reset */}
      <button
        onClick={() => setFilters({ category: "", hair_type: "", min_price: 0, max_price: 200000, in_stock_only: false, sort: "newest", search: "" })}
        className="btn-ghost text-xs w-full"
      >
        Reset Filters
      </button>
    </aside>
  );

  return (
    <div className="pt-20 min-h-screen">
      {/* Page header */}
      <div className="bg-brand-dark border-b border-brand-mid">
        <div className="container-site py-8">
          <h1 className="font-heading text-3xl text-brand-white">Shop Hair</h1>
          <p className="text-brand-muted text-sm mt-1">{total} products</p>
        </div>
      </div>

      <div className="container-site py-8">
        <div className="flex gap-8">
          {/* Sidebar — desktop */}
          <div className="hidden lg:block w-52 flex-shrink-0">
            <FilterSidebar />
          </div>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              {/* Search — raw input state, debounced before API call */}
              <div className="relative flex-1">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  className="input pl-10"
                  placeholder="Search products…"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
              </div>

              {/* Sort */}
              <select
                className="select w-full sm:w-44"
                value={filters.sort}
                onChange={(e) => updateFilter("sort", e.target.value)}
              >
                <option value="newest">Newest First</option>
                <option value="price_asc">Price: Low → High</option>
                <option value="price_desc">Price: High → Low</option>
                <option value="popular">Most Popular</option>
              </select>

              {/* Mobile filter toggle */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="btn-outline lg:hidden flex items-center gap-2 text-sm py-2.5"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
                </svg>
                Filters
              </button>
            </div>

            {/* Mobile sidebar */}
            {sidebarOpen && (
              <div className="lg:hidden card p-4 mb-6">
                <FilterSidebar />
              </div>
            )}

            {/* Grid */}
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 lg:gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={`shop-skel-${i}`} className="card animate-pulse">
                    <div className="aspect-[3/4] bg-brand-dark2" />
                    <div className="p-3 space-y-2">
                      <div className="h-3 bg-brand-mid rounded w-1/3" />
                      <div className="h-4 bg-brand-mid rounded w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-brand-muted text-lg">No products found.</p>
                <button onClick={() => { setSearchInput(""); setFilters({ category: "", hair_type: "", min_price: 0, max_price: 200000, in_stock_only: false, sort: "newest", search: "" }); }} className="btn-outline mt-4 text-sm">
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 lg:gap-4">
                {products.map((product, idx) => (
                  <ProductCard key={`shop-${product.id}-${idx}`} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Page export — ShopContent wrapped in Suspense ──────────
export default function ShopPage() {
  return (
    <Suspense fallback={<ShopSkeleton />}>
      <ShopContent />
    </Suspense>
  );
}
