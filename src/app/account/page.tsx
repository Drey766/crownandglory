"use client";
// ============================================================
// Account Page — /account — order history + appointment history
// ============================================================
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { Order, Appointment } from "@/types";
import { formatPrice, formatDateShort, formatTime } from "@/lib/utils";
import Link from "next/link";

type Tab = "orders" | "appointments" | "profile";

export default function AccountPage() {
  const { user, profile, signOut } = useAuth();
  const supabase = createSupabaseBrowserClient();
  const [tab, setTab] = useState<Tab>("orders");
  const [orders, setOrders] = useState<Order[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    async function load() {
      const [{ data: ords }, { data: appts }] = await Promise.all([
        supabase.from("orders").select("*").eq("user_id", user!.id).order("created_at", { ascending: false }),
        supabase.from("appointments").select("*").eq("user_id", user!.id).order("appointment_date", { ascending: false }),
      ]);
      setOrders(ords || []);
      setAppointments(appts || []);
      setLoading(false);
    }
    load();
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!user) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-brand-muted mb-4">Please sign in to view your account</p>
          <Link href="/" className="btn-primary">Go to Home</Link>
        </div>
      </div>
    );
  }

  const STATUS_COLORS: Record<string, string> = {
    pending: "text-amber-400 bg-amber-950/30 border-amber-800/30",
    confirmed: "text-blue-400 bg-blue-950/30 border-blue-800/30",
    paid: "text-blue-400 bg-blue-950/30 border-blue-800/30",
    completed: "text-emerald-400 bg-emerald-950/30 border-emerald-800/30",
    delivered: "text-emerald-400 bg-emerald-950/30 border-emerald-800/30",
    cancelled: "text-red-400 bg-red-950/30 border-red-800/30",
    no_show: "text-red-400 bg-red-950/30 border-red-800/30",
  };

  return (
    <div className="pt-20 min-h-screen">
      <div className="bg-brand-dark border-b border-brand-mid">
        <div className="container-site py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-heading text-3xl text-brand-white">My Account</h1>
              <p className="text-brand-muted text-sm mt-1">{profile?.full_name || user.email}</p>
            </div>
            <button onClick={signOut} className="btn-ghost text-sm text-brand-rose">Sign Out</button>
          </div>
        </div>
      </div>

      <div className="container-site py-8">
        {/* Tabs */}
        <div className="flex gap-1 mb-8 border-b border-brand-mid">
          {(["orders", "appointments", "profile"] as Tab[]).map((t) => (
            <button
              key={`tab-${t}`}
              onClick={() => setTab(t)}
              className={`px-4 py-3 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
                tab === t ? "text-brand-white border-brand-burgundy" : "text-brand-muted border-transparent hover:text-brand-white"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => <div key={i} className="card h-20 animate-pulse" />)}
          </div>
        ) : (
          <>
            {/* Orders tab */}
            {tab === "orders" && (
              <div className="space-y-3">
                {orders.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-brand-muted mb-3">No orders yet</p>
                    <Link href="/shop" className="btn-primary text-sm">Start Shopping</Link>
                  </div>
                ) : (
                  orders.map((order, idx) => (
                    <div key={`ord-${order.id}-${idx}`} className="card p-4 flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-brand-white">Order #{order.id.slice(0, 8).toUpperCase()}</p>
                        <p className="text-xs text-brand-muted mt-0.5">{formatDateShort(order.created_at)} · {Array.isArray(order.items) ? order.items.length : 0} item(s)</p>
                      </div>
                      <div className="text-right">
                        <p className="text-brand-gold font-semibold text-sm">{formatPrice(order.total)}</p>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border capitalize mt-1 inline-block ${STATUS_COLORS[order.status] || ""}`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Appointments tab */}
            {tab === "appointments" && (
              <div className="space-y-3">
                {appointments.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-brand-muted mb-3">No appointments yet</p>
                    <Link href="/book" className="btn-primary text-sm">Book Now</Link>
                  </div>
                ) : (
                  appointments.map((appt, idx) => (
                    <div key={`appt-${appt.id}-${idx}`} className="card p-4 flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-brand-white">{appt.service_name}</p>
                        <p className="text-xs text-brand-muted mt-0.5">
                          {formatDateShort(appt.appointment_date)} at {formatTime(appt.appointment_time)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-brand-gold font-semibold text-sm">{formatPrice(appt.service_price)}</p>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border capitalize mt-1 inline-block ${STATUS_COLORS[appt.status] || ""}`}>
                          {appt.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Profile tab */}
            {tab === "profile" && (
              <div className="max-w-md space-y-4">
                <div className="card p-5 space-y-3">
                  <h3 className="font-heading text-lg text-brand-white">Profile Info</h3>
                  <div>
                    <p className="label">Email</p>
                    <p className="text-brand-light text-sm">{user.email}</p>
                  </div>
                  {profile?.full_name && (
                    <div>
                      <p className="label">Name</p>
                      <p className="text-brand-light text-sm">{profile.full_name}</p>
                    </div>
                  )}
                  {profile?.phone && (
                    <div>
                      <p className="label">Phone</p>
                      <p className="text-brand-light text-sm">+{profile.phone}</p>
                    </div>
                  )}
                  <div>
                    <p className="label">Member Since</p>
                    <p className="text-brand-light text-sm">{formatDateShort(user.created_at)}</p>
                  </div>
                </div>
                <button onClick={signOut} className="btn-outline w-full text-brand-rose border-brand-rose/40 hover:bg-brand-rose hover:border-brand-rose text-sm">
                  Sign Out
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
