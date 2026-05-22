"use client";
// ============================================================
// Checkout Page — /checkout — delivery address + M-Pesa payment
// ============================================================
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { formatPrice, getShippingFee, KENYA_COUNTIES } from "@/lib/utils";

interface FormData {
  name: string;
  phone: string;
  email: string;
  county: string;
  town: string;
  street: string;
  building: string;
  notes: string;
}

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const router = useRouter();
  const [form, setForm] = useState<FormData>({ name: "", phone: "", email: "", county: "Nairobi", town: "", street: "", building: "", notes: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [orderId, setOrderId] = useState("");

  const shipping = getShippingFee(form.county);
  const grandTotal = total + shipping;

  function update(key: keyof FormData, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (items.length === 0) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          customer_name: form.name,
          customer_phone: form.phone,
          customer_email: form.email,
          delivery_address: { county: form.county, town: form.town, street: form.street, building: form.building },
          subtotal: total,
          shipping_fee: shipping,
          total: grandTotal,
          notes: form.notes,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Order failed");
      setOrderId(data.order_id);
      clearCart();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
    setLoading(false);
  }

  // Success screen
  if (orderId) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md space-y-4 p-6">
          <div className="w-16 h-16 rounded-full bg-emerald-950/50 border-2 border-emerald-500/40 flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="font-heading text-3xl text-brand-white">Order Placed!</h2>
          <p className="text-brand-muted">Check your phone for the M-Pesa payment prompt.</p>
          <p className="text-xs text-brand-muted font-mono">Order #{orderId.slice(0, 8).toUpperCase()}</p>
          <div className="flex gap-3 mt-4">
            <button onClick={() => router.push("/")} className="btn-outline flex-1 text-sm">Go Home</button>
            <button onClick={() => router.push("/account")} className="btn-primary flex-1 text-sm">View Orders</button>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-brand-muted mb-4">Your cart is empty</p>
          <button onClick={() => router.push("/shop")} className="btn-primary">Shop Now</button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen">
      <div className="container-site py-8 max-w-5xl mx-auto">
        <h1 className="font-heading text-3xl text-brand-white mb-8">Checkout</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Left — form */}
            <div className="lg:col-span-3 space-y-6">
              {/* Contact */}
              <div className="card p-5 space-y-4">
                <h2 className="font-heading text-lg text-brand-white">Contact Details</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Full Name *</label>
                    <input type="text" className="input" value={form.name} onChange={(e) => update("name", e.target.value)} required placeholder="Jane Wanjiku" />
                  </div>
                  <div>
                    <label className="label">Phone (M-Pesa) *</label>
                    <input type="tel" className="input" value={form.phone} onChange={(e) => update("phone", e.target.value)} required placeholder="0712345678" />
                  </div>
                </div>
                <div>
                  <label className="label">Email (optional)</label>
                  <input type="email" className="input" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="jane@example.com" />
                </div>
              </div>

              {/* Delivery */}
              <div className="card p-5 space-y-4">
                <h2 className="font-heading text-lg text-brand-white">Delivery Address</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label">County *</label>
                    <select className="select" value={form.county} onChange={(e) => update("county", e.target.value)}>
                      {KENYA_COUNTIES.map((c, idx) => <option key={`co-${c}-${idx}`} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Town / Area *</label>
                    <input type="text" className="input" value={form.town} onChange={(e) => update("town", e.target.value)} required placeholder="Westlands" />
                  </div>
                </div>
                <div>
                  <label className="label">Street / Road *</label>
                  <input type="text" className="input" value={form.street} onChange={(e) => update("street", e.target.value)} required placeholder="Waiyaki Way" />
                </div>
                <div>
                  <label className="label">Building / Apartment (optional)</label>
                  <input type="text" className="input" value={form.building} onChange={(e) => update("building", e.target.value)} placeholder="Crown Plaza, 3rd Floor" />
                </div>
                <div>
                  <label className="label">Order Notes (optional)</label>
                  <textarea className="input resize-none" rows={2} value={form.notes} onChange={(e) => update("notes", e.target.value)} placeholder="Any special instructions?" />
                </div>
              </div>

              {error && <p className="text-red-400 text-sm card p-3">{error}</p>}
            </div>

            {/* Right — summary */}
            <div className="lg:col-span-2">
              <div className="card p-5 space-y-4 sticky top-24">
                <h2 className="font-heading text-lg text-brand-white">Order Summary</h2>

                {/* Items */}
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {items.map(({ product, quantity }, idx) => (
                    <div key={`co-item-${product.id}-${idx}`} className="flex items-center gap-2.5">
                      <div className="relative w-10 h-12 rounded flex-shrink-0 overflow-hidden bg-brand-dark2">
                        <Image src={product.images?.[0] || `https://placehold.co/40x48`} alt={product.name} fill className="object-cover" unoptimized />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-brand-white line-clamp-1">{product.name}</p>
                        <p className="text-xs text-brand-muted">× {quantity}</p>
                      </div>
                      <p className="text-xs text-brand-gold">{formatPrice(product.price * quantity)}</p>
                    </div>
                  ))}
                </div>

                <div className="border-t border-brand-mid pt-3 space-y-1.5 text-sm">
                  <div className="flex justify-between text-brand-muted">
                    <span>Subtotal</span><span className="text-brand-white">{formatPrice(total)}</span>
                  </div>
                  <div className="flex justify-between text-brand-muted">
                    <span>Shipping</span><span className="text-brand-white">{formatPrice(shipping)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-base border-t border-brand-mid pt-2 mt-2">
                    <span className="text-brand-white">Total</span>
                    <span className="text-brand-gold">{formatPrice(grandTotal)}</span>
                  </div>
                </div>

                {/* Payment method */}
                <div className="card p-3 flex items-center gap-3">
                  <span className="text-xl">📱</span>
                  <div>
                    <p className="text-xs font-semibold text-brand-white">M-Pesa STK Push</p>
                    <p className="text-xs text-brand-muted">You&apos;ll receive a payment prompt on your phone</p>
                  </div>
                </div>

                <button type="submit" disabled={loading} className="btn-gold w-full text-sm py-3">
                  {loading ? "Processing…" : `Pay ${formatPrice(grandTotal)} via M-Pesa`}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
