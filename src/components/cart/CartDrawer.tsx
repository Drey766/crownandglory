"use client";
// ============================================================
// CartDrawer — slide-over panel showing cart line items
// ============================================================
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";

interface CartDrawerProps {
  onClose: () => void;
}

export default function CartDrawer({ onClose }: CartDrawerProps) {
  const { items, removeItem, updateQty, total, itemCount } = useCart();

  return (
    /* Backdrop */
    <div className="fixed inset-0 z-50 flex justify-end" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-brand-dark w-full max-w-md h-full flex flex-col shadow-2xl border-l border-brand-mid animate-[fadeUp_0.2s_ease_forwards]">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-brand-mid">
          <h2 className="font-heading text-lg text-brand-white">
            Cart <span className="text-brand-muted text-sm">({itemCount})</span>
          </h2>
          <button onClick={onClose} className="text-brand-muted hover:text-brand-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="text-center py-16">
              <svg className="w-12 h-12 mx-auto text-brand-mid mb-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <p className="text-brand-muted">Your cart is empty</p>
              <Link href="/shop" onClick={onClose} className="btn-primary mt-4 text-sm">
                Shop Now
              </Link>
            </div>
          ) : (
            items.map(({ product, quantity }, idx) => (
              <div key={`cart-item-${product.id}-${idx}`} className="flex gap-3 bg-brand-dark2 rounded-lg p-3">
                {/* Image */}
                <div className="relative w-16 h-20 rounded overflow-hidden flex-shrink-0 bg-brand-mid">
                  <Image
                    src={product.images?.[0] || `https://placehold.co/64x80/221318/9C7280?text=...`}
                    alt={product.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-brand-white font-medium line-clamp-2 leading-snug">{product.name}</p>
                  <p className="text-xs text-brand-gold font-semibold mt-1">{formatPrice(product.price)}</p>

                  {/* Qty controls */}
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => updateQty(product.id, quantity - 1)}
                      className="w-6 h-6 rounded bg-brand-mid flex items-center justify-center text-brand-light hover:bg-brand-burgundy transition-colors text-xs font-bold"
                    >
                      −
                    </button>
                    <span className="text-sm text-brand-white w-4 text-center">{quantity}</span>
                    <button
                      onClick={() => updateQty(product.id, quantity + 1)}
                      className="w-6 h-6 rounded bg-brand-mid flex items-center justify-center text-brand-light hover:bg-brand-burgundy transition-colors text-xs font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Remove */}
                <button
                  onClick={() => removeItem(product.id)}
                  className="text-brand-muted hover:text-brand-rose transition-colors flex-shrink-0 self-start mt-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer — total + checkout */}
        {items.length > 0 && (
          <div className="border-t border-brand-mid p-5 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-brand-muted">Subtotal</span>
              <span className="text-brand-white font-semibold">{formatPrice(total)}</span>
            </div>
            <p className="text-xs text-brand-muted">Shipping calculated at checkout</p>
            <Link href="/checkout" onClick={onClose} className="btn-primary w-full text-center">
              Proceed to Checkout
            </Link>
            <Link href="/cart" onClick={onClose} className="btn-ghost w-full text-center text-sm">
              View Full Cart
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
