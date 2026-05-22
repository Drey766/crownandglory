"use client";
// ============================================================
// Product Detail Page — /shop/[slug]
// Image gallery, add to cart, wishlist, related products
// ============================================================
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { Product } from "@/types";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { formatPrice, discountPercent, CATEGORY_LABELS, HAIR_TYPE_LABELS } from "@/lib/utils";
import ProductCard from "@/components/shop/ProductCard";

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const supabase = createSupabaseBrowserClient();
  const { addItem } = useCart();
  const { isWishlisted, toggleItem } = useWishlist();

  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: prod } = await supabase
        .from("products")
        .select("*")
        .eq("slug", slug)
        .single();

      if (prod) {
        setProduct(prod);
        // Fetch related products in same category
        const { data: rel } = await supabase
          .from("products")
          .select("*")
          .eq("category", prod.category)
          .neq("id", prod.id)
          .eq("in_stock", true)
          .limit(4);
        setRelated(rel || []);
      }
      setLoading(false);
    }
    load();
  }, [slug]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleAddToCart() {
    if (!product) return;
    addItem(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  if (loading) {
    return (
      <div className="pt-20 container-site py-12">
        <div className="animate-pulse grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="aspect-[4/5] bg-brand-dark2 rounded-xl" />
          <div className="space-y-4">
            <div className="h-8 bg-brand-dark2 rounded w-3/4" />
            <div className="h-6 bg-brand-dark2 rounded w-1/3" />
            <div className="h-4 bg-brand-dark2 rounded w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pt-20 container-site py-20 text-center">
        <p className="text-brand-muted text-lg">Product not found.</p>
        <Link href="/shop" className="btn-primary mt-4">Back to Shop</Link>
      </div>
    );
  }

  const images = product.images?.length
    ? product.images
    : [`https://placehold.co/600x800/180D10/9C7280?text=${encodeURIComponent(product.name)}`];

  const discount = product.original_price ? discountPercent(product.price, product.original_price) : 0;
  const wishlisted = isWishlisted(product.id);
  const salonWhatsApp = process.env.NEXT_PUBLIC_SALON_WHATSAPP || "254700000000";

  return (
    <div className="pt-20 min-h-screen">
      <div className="container-site py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-brand-muted mb-6">
          <Link href="/" className="hover:text-brand-white transition-colors">Home</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-brand-white transition-colors">Shop</Link>
          <span>/</span>
          <Link href={`/shop?category=${product.category}`} className="hover:text-brand-white transition-colors">
            {CATEGORY_LABELS[product.category]}
          </Link>
          <span>/</span>
          <span className="text-brand-white truncate max-w-[200px]">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Image gallery */}
          <div className="space-y-3">
            {/* Main image */}
            <div className="relative aspect-[4/5] rounded-xl overflow-hidden bg-brand-dark2">
              <Image
                src={images[activeImage]}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                unoptimized
                priority
              />
              {product.is_raw && (
                <div className="absolute top-3 left-3"><span className="badge-raw">Raw Hair</span></div>
              )}
            </div>

            {/* Thumbnail strip */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.slice(0, 5).map((img, idx) => (
                  <button
                    key={`thumb-${idx}`}
                    onClick={() => setActiveImage(idx)}
                    className={`relative w-16 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-colors ${
                      activeImage === idx ? "border-brand-burgundy" : "border-brand-mid hover:border-brand-muted"
                    }`}
                  >
                    <Image src={img} alt={`View ${idx + 1}`} fill className="object-cover" unoptimized />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product info */}
          <div className="space-y-5">
            {/* Category & badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs tracking-widest uppercase text-brand-muted font-semibold">
                {CATEGORY_LABELS[product.category]}
              </span>
              {product.hair_type && (
                <span className="badge-new">{HAIR_TYPE_LABELS[product.hair_type] || product.hair_type}</span>
              )}
              {product.is_new && <span className="badge-new">New</span>}
              {discount > 0 && <span className="badge-sale">-{discount}% off</span>}
            </div>

            {/* Name */}
            <h1 className="font-heading text-3xl lg:text-4xl text-brand-white leading-tight">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="stars flex">
                {[1,2,3,4,5].map((s, idx) => (
                  <svg key={`pdp-star-${idx}`} className="w-4 h-4" fill={s <= Math.round(product.rating) ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                ))}
              </div>
              <span className="text-sm text-brand-muted">{product.rating} ({product.review_count} reviews)</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="font-heading text-3xl text-brand-gold">{formatPrice(product.price)}</span>
              {product.original_price && product.original_price > product.price && (
                <span className="text-lg text-brand-muted line-through">{formatPrice(product.original_price)}</span>
              )}
            </div>

            {/* Stock status */}
            <div>
              {product.in_stock ? (
                product.stock_count && product.stock_count <= 5 ? (
                  <span className="text-sm text-amber-400">⚠ Only {product.stock_count} left in stock</span>
                ) : (
                  <span className="badge-instock">✓ In Stock</span>
                )
              ) : (
                <span className="badge-outofstock">✗ Out of Stock</span>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-brand-muted text-sm leading-relaxed border-t border-brand-mid pt-4">
                {product.description}
              </p>
            )}

            {/* Quantity + Add to cart */}
            {product.in_stock && (
              <div className="flex items-center gap-3 pt-2">
                {/* Quantity selector */}
                <div className="flex items-center border border-brand-mid rounded">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 py-2 text-brand-muted hover:text-brand-white transition-colors">−</button>
                  <span className="px-4 py-2 text-brand-white text-sm font-medium min-w-[2.5rem] text-center">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="px-3 py-2 text-brand-muted hover:text-brand-white transition-colors">+</button>
                </div>

                {/* Add to cart */}
                <button onClick={handleAddToCart} className={`btn-primary flex-1 ${added ? "bg-emerald-700" : ""}`}>
                  {added ? "✓ Added!" : "Add to Cart"}
                </button>

                {/* Wishlist */}
                <button
                  onClick={() => toggleItem(product)}
                  className={`p-3 border rounded transition-all duration-200 ${
                    wishlisted
                      ? "border-brand-rose bg-brand-rose/10 text-brand-rose"
                      : "border-brand-mid text-brand-muted hover:border-brand-rose hover:text-brand-rose"
                  }`}
                  aria-label="Toggle wishlist"
                >
                  <svg className="w-5 h-5" fill={wishlisted ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
              </div>
            )}

            {/* WhatsApp enquiry */}
            <a
              href={`https://wa.me/${salonWhatsApp}?text=Hi! I'd like to enquire about: ${encodeURIComponent(product.name)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline w-full flex items-center justify-center gap-2 text-sm"
            >
              <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Ask About This Product
            </a>

            {/* Care instructions accordion */}
            <details className="border border-brand-mid rounded-lg group">
              <summary className="flex items-center justify-between px-4 py-3 cursor-pointer text-sm font-medium text-brand-white">
                Care Instructions
                <svg className="w-4 h-4 text-brand-muted transition-transform group-open:rotate-180" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="px-4 pb-4 text-sm text-brand-muted space-y-1.5">
                <p>• Wash with sulfate-free shampoo and cool water</p>
                <p>• Deep condition weekly to maintain moisture</p>
                <p>• Detangle gently with a wide-tooth comb when wet</p>
                <p>• Avoid excessive heat — use heat protectant if styling</p>
                <p>• Store on a wig stand or mannequin head</p>
                <p>• Professional coloring recommended for color treatments</p>
              </div>
            </details>
          </div>
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <div className="mt-16 pt-10 border-t border-brand-mid">
            <h2 className="font-heading text-2xl text-brand-white mb-6">Complete the Look</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 lg:gap-4">
              {related.map((rel, idx) => (
                <ProductCard key={`related-${rel.id}-${idx}`} product={rel} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
