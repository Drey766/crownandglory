"use client";
// ============================================================
// Wishlist Page — /wishlist — saved items, move all to cart
// ============================================================
import Link from "next/link";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import ProductCard from "@/components/shop/ProductCard";

export default function WishlistPage() {
  const { items, removeItem } = useWishlist();
  const { addItem } = useCart();

  function moveAllToCart() {
    items.forEach((product) => {
      addItem(product, 1);
      removeItem(product.id);
    });
  }

  if (items.length === 0) {
    return (
      <div className="pt-20 min-h-screen flex flex-col items-center justify-center gap-4">
        <svg className="w-16 h-16 text-brand-mid" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
        <h2 className="font-heading text-2xl text-brand-white">Your wishlist is empty</h2>
        <p className="text-brand-muted">Save items you love to come back to them later</p>
        <Link href="/shop" className="btn-primary mt-2">Browse Products</Link>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen">
      <div className="container-site py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-heading text-3xl text-brand-white">Wishlist</h1>
            <p className="text-brand-muted text-sm mt-1">{items.length} saved item{items.length !== 1 ? "s" : ""}</p>
          </div>
          <button onClick={moveAllToCart} className="btn-primary text-sm">
            Move All to Cart
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 lg:gap-4">
          {items.map((product, idx) => (
            <ProductCard key={`wishlist-${product.id}-${idx}`} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}
