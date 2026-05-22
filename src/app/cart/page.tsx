"use client";
// ============================================================
// Cart Page — /cart — line items, quantities, order summary
// ============================================================
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { formatPrice, getShippingFee } from "@/lib/utils";
import { useState } from "react";
import { KENYA_COUNTIES } from "@/lib/utils";

export default function CartPage() {
  const { items, removeItem, updateQty, clearCart, total } = useCart();
  const [county, setCounty] = useState("Nairobi");
  const shipping = getShippingFee(county);

  if (items.length === 0) {
    return (
      <div className="pt-20 min-h-screen flex flex-col items-center justify-center gap-4">
        <svg className="w-16 h-16 text-brand-mid" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
        <h2 className="font-heading text-2xl text-brand-white">Your cart is empty</h2>
        <p className="text-brand-muted">Discover our premium hair collection</p>
        <Link href="/shop" className="btn-primary mt-2">Shop Now</Link>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen">
      <div className="container-site py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-heading text-3xl text-brand-white">Your Cart</h1>
          <button onClick={clearCart} className="btn-ghost text-xs text-brand-rose">Clear All</button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Line items */}
          <div className="lg:col-span-2 space-y-3">
            {items.map(({ product, quantity }, idx) => (
              <div key={`cart-pg-${product.id}-${idx}`} className="card p-4 flex gap-4">
                <div className="relative w-20 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-brand-dark2">
                  <Image
                    src={product.images?.[0] || `https://placehold.co/80x96/221318/9C7280`}
                    alt={product.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <Link href={`/shop/${product.slug}`} className="font-heading text-sm text-brand-white hover:text-brand-gold transition-colors line-clamp-2">{product.name}</Link>
                  <p className="text-brand-gold font-semibold mt-1">{formatPrice(product.price)}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center border border-brand-mid rounded">
                      <button onClick={() => updateQty(product.id, quantity - 1)} className="px-2.5 py-1 text-brand-muted hover:text-brand-white text-sm">−</button>
                      <span className="px-3 py-1 text-brand-white text-sm">{quantity}</span>
                      <button onClick={() => updateQty(product.id, quantity + 1)} className="px-2.5 py-1 text-brand-muted hover:text-brand-white text-sm">+</button>
                    </div>
                    <span className="text-xs text-brand-muted">{formatPrice(product.price * quantity)}</span>
                  </div>
                </div>
                <button onClick={() => removeItem(product.id)} className="text-brand-muted hover:text-brand-rose transition-colors self-start flex-shrink-0">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>

          {/* Order summary */}
          <div className="lg:col-span-1">
            <div className="card p-5 space-y-4 sticky top-24">
              <h2 className="font-heading text-lg text-brand-white">Order Summary</h2>

              {/* County for shipping estimate */}
              <div>
                <label className="label">Delivery County</label>
                <select className="select" value={county} onChange={(e) => setCounty(e.target.value)}>
                  {KENYA_COUNTIES.map((c, idx) => (
                    <option key={`county-${c}-${idx}`} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-brand-muted">
                  <span>Subtotal</span>
                  <span className="text-brand-white">{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between text-brand-muted">
                  <span>Shipping ({county})</span>
                  <span className="text-brand-white">{formatPrice(shipping)}</span>
                </div>
                <div className="flex justify-between border-t border-brand-mid pt-2 font-semibold text-base">
                  <span className="text-brand-white">Total</span>
                  <span className="text-brand-gold">{formatPrice(total + shipping)}</span>
                </div>
              </div>

              <Link href="/checkout" className="btn-primary w-full text-center block">
                Proceed to Checkout
              </Link>
              <Link href="/shop" className="btn-ghost w-full text-center block text-sm">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
