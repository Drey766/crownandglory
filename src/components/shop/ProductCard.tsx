"use client";
// ============================================================
// ProductCard — shop grid card with badges, wishlist, add to cart
// ============================================================
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types";
import { formatPrice, discountPercent, CATEGORY_LABELS } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const { isWishlisted, toggleItem } = useWishlist();

  const mainImage =
    product.images?.[0] || `https://placehold.co/600x600/180D10/9C7280?text=${encodeURIComponent(product.name)}`;

  const discount = product.original_price
    ? discountPercent(product.price, product.original_price)
    : 0;

  const wishlisted = isWishlisted(product.id);

  return (
    <div className="card-hover group relative flex flex-col">
      {/* Image area */}
      <Link href={`/shop/${product.slug}`} className="relative block aspect-[3/4] overflow-hidden bg-brand-dark2">
        <Image
          src={mainImage}
          alt={product.name}
          fill
          sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          unoptimized // Wix CDN handles its own optimization
        />

        {/* Overlay badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.is_new && <span className="badge-new">New</span>}
          {product.is_raw && <span className="badge-raw">Raw</span>}
          {discount > 0 && <span className="badge-sale">-{discount}%</span>}
        </div>

        {/* Wishlist heart */}
        <button
          onClick={(e) => { e.preventDefault(); toggleItem(product); }}
          className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center
            transition-all duration-200 backdrop-blur-sm
            ${wishlisted
              ? "bg-brand-rose text-white"
              : "bg-brand-dark/60 text-brand-muted hover:bg-brand-rose hover:text-white"
            }`}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <svg className="w-4 h-4" fill={wishlisted ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>

        {/* Add to cart overlay — appears on hover */}
        {product.in_stock && (
          <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <button
              onClick={(e) => { e.preventDefault(); addItem(product); }}
              className="btn-primary w-full text-xs py-2"
            >
              Add to Cart
            </button>
          </div>
        )}
      </Link>

      {/* Product info */}
      <div className="p-3 flex flex-col gap-1.5 flex-1">
        {/* Category label */}
        <span className="text-[10px] tracking-widest uppercase text-brand-muted font-semibold">
          {CATEGORY_LABELS[product.category]}
        </span>

        {/* Product name */}
        <Link href={`/shop/${product.slug}`}>
          <h3 className="font-heading text-sm text-brand-white leading-snug hover:text-brand-gold transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1.5">
          <div className="stars flex">
            {[1,2,3,4,5].map((star, idx) => (
              <svg
                key={`star-${product.id}-${idx}`}
                className="w-3 h-3"
                fill={star <= Math.round(product.rating) ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth={1.5}
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            ))}
          </div>
          <span className="text-[10px] text-brand-muted">({product.review_count})</span>
        </div>

        {/* Price row */}
        <div className="flex items-baseline gap-2 mt-auto pt-1">
          <span className="font-heading text-brand-gold font-semibold">
            {formatPrice(product.price)}
          </span>
          {product.original_price && product.original_price > product.price && (
            <span className="text-xs text-brand-muted line-through">
              {formatPrice(product.original_price)}
            </span>
          )}
        </div>

        {/* Out of stock note */}
        {!product.in_stock && (
          <span className="badge-outofstock text-[10px] mt-1">Out of Stock</span>
        )}
      </div>
    </div>
  );
}
