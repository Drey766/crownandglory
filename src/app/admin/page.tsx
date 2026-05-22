"use client";
// ============================================================
// Admin Dashboard — /admin
// Overview, Products (CRUD), Appointments, Orders, Services, Blog, Customers
// All search inputs use useDebounce(400) — no keystroke-level queries
// ============================================================
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { Product, Service, Appointment, Order, BlogPost, UserProfile } from "@/types";
import { useDebounce } from "@/hooks/useDebounce";
import { formatPrice, formatDateShort, formatTime, CATEGORY_LABELS, SERVICE_CATEGORY_LABELS } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

type AdminTab = "overview" | "products" | "appointments" | "orders" | "services" | "blog" | "customers";

export default function AdminPage() {
  const supabase = createSupabaseBrowserClient();
  const { profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<AdminTab>("overview");

  // Redirect non-admins
  useEffect(() => {
    if (!authLoading && profile && profile.role !== "admin") router.push("/");
  }, [profile, authLoading, router]);

  if (authLoading) return <div className="pt-24 text-center text-brand-muted">Loading…</div>;
  if (!profile || profile.role !== "admin") return null;

  const TABS: { key: AdminTab; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "products", label: "Products" },
    { key: "appointments", label: "Appointments" },
    { key: "orders", label: "Orders" },
    { key: "services", label: "Services" },
    { key: "blog", label: "Blog" },
    { key: "customers", label: "Customers" },
  ];

  return (
    <div className="pt-16 min-h-screen">
      <div className="bg-brand-dark border-b border-brand-mid">
        <div className="container-site py-4 flex items-center justify-between">
          <h1 className="font-heading text-xl text-brand-white">Admin Dashboard</h1>
          <span className="text-xs text-brand-muted">Crown & Glory</span>
        </div>
        {/* Tab navigation */}
        <div className="container-site flex overflow-x-auto gap-0 pb-0">
          {TABS.map(({ key, label }) => (
            <button
              key={`admin-tab-${key}`}
              onClick={() => setTab(key)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                tab === key ? "text-brand-white border-brand-burgundy" : "text-brand-muted border-transparent hover:text-brand-white"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="container-site py-6">
        {tab === "overview" && <OverviewTab />}
        {tab === "products" && <ProductsTab />}
        {tab === "appointments" && <AppointmentsTab />}
        {tab === "orders" && <OrdersTab />}
        {tab === "services" && <ServicesTab />}
        {tab === "blog" && <BlogTab />}
        {tab === "customers" && <CustomersTab />}
      </div>
    </div>
  );
}

// ── Overview Tab ─────────────────────────────────────────────
function OverviewTab() {
  const supabase = createSupabaseBrowserClient();
  const [stats, setStats] = useState({ products: 0, orders: 0, appointments: 0, revenue: 0 });

  useEffect(() => {
    async function load() {
      const today = new Date().toISOString().split("T")[0];
      const [{ count: products }, { count: orders }, { count: appts }, { data: rev }] = await Promise.all([
        supabase.from("products").select("*", { count: "exact", head: true }),
        supabase.from("orders").select("*", { count: "exact", head: true }),
        supabase.from("appointments").select("*", { count: "exact", head: true }).eq("appointment_date", today),
        supabase.from("orders").select("total").eq("status", "paid"),
      ]);
      const revenue = (rev || []).reduce((sum: number, o: { total: number }) => sum + (o.total || 0), 0);
      setStats({ products: products || 0, orders: orders || 0, appointments: appts || 0, revenue });
    }
    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const cards = [
    { label: "Total Products", value: stats.products.toString(), icon: "🛍️", color: "text-brand-gold" },
    { label: "Total Orders", value: stats.orders.toString(), icon: "📦", color: "text-blue-400" },
    { label: "Appointments Today", value: stats.appointments.toString(), icon: "📅", color: "text-brand-rose" },
    { label: "Total Revenue", value: formatPrice(stats.revenue), icon: "💰", color: "text-emerald-400" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(({ label, value, icon, color }, idx) => (
        <div key={`stat-card-${idx}`} className="card p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-brand-muted uppercase tracking-wide mb-1">{label}</p>
              <p className={`font-heading text-2xl font-bold ${color}`}>{value}</p>
            </div>
            <span className="text-2xl">{icon}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Products Tab ─────────────────────────────────────────────
function ProductsTab() {
  const supabase = createSupabaseBrowserClient();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  // Search input + debounced version (query only fires after 400ms pause)
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 400);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    let q = supabase.from("products").select("*").order("created_at", { ascending: false });
    if (debouncedSearch) q = q.ilike("name", `%${debouncedSearch}%`);
    const { data } = await q;
    setProducts(data || []);
    setLoading(false);
  }, [debouncedSearch]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fetchProducts(); }, [debouncedSearch]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSave() {
    if (!editingProduct?.name || !editingProduct.price) return;
    setSaving(true);
    if (editingProduct.id) {
      await supabase.from("products").update(editingProduct).eq("id", editingProduct.id);
    } else {
      const slug = editingProduct.name.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").slice(0, 80);
      await supabase.from("products").insert({ ...editingProduct, slug, is_featured: false, is_new: false, rating: 4.5, review_count: 0, is_raw: false, in_stock: true });
    }
    setSaving(false);
    setShowForm(false);
    setEditingProduct(null);
    fetchProducts();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this product?")) return;
    await supabase.from("products").delete().eq("id", id);
    fetchProducts();
  }

  return (
    <div>
      {/* Toolbar — Add Product button always visible */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <input
            type="text"
            className="input pl-9 text-sm"
            placeholder="Search products…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        {/* Add Product — always visible, never inside the table */}
        <button
          onClick={() => { setEditingProduct({ images: [], category: "wigs", in_stock: true }); setShowForm(true); }}
          className="btn-primary text-sm whitespace-nowrap"
        >
          + Add Product
        </button>
      </div>

      {/* Product form modal */}
      {showForm && editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-black/80 backdrop-blur-sm">
          <div className="card w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-lg text-brand-white">{editingProduct.id ? "Edit Product" : "Add Product"}</h3>
              <button onClick={() => { setShowForm(false); setEditingProduct(null); }} className="text-brand-muted hover:text-brand-white">✕</button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="label">Name *</label>
                <input type="text" className="input text-sm" value={editingProduct.name || ""} onChange={(e) => setEditingProduct((p) => ({ ...p, name: e.target.value }))} placeholder="Product name" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Price (KES) *</label>
                  <input type="number" className="input text-sm" value={editingProduct.price || ""} onChange={(e) => setEditingProduct((p) => ({ ...p, price: parseInt(e.target.value) || 0 }))} />
                </div>
                <div>
                  <label className="label">Category</label>
                  <select className="select text-sm" value={editingProduct.category || "wigs"} onChange={(e) => setEditingProduct((p) => ({ ...p, category: e.target.value as Product["category"] }))}>
                    {Object.entries(CATEGORY_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Description</label>
                <textarea className="input text-sm resize-none" rows={3} value={editingProduct.description || ""} onChange={(e) => setEditingProduct((p) => ({ ...p, description: e.target.value }))} />
              </div>
              <div>
                <label className="label">Image URLs (one per line, first = main)</label>
                <textarea
                  className="input text-sm resize-none font-mono text-xs"
                  rows={4}
                  value={(editingProduct.images || []).join("\n")}
                  onChange={(e) => setEditingProduct((p) => ({ ...p, images: e.target.value.split("\n").map((u) => u.trim()).filter(Boolean) }))}
                  placeholder="https://static.wixstatic.com/..."
                />
                <p className="text-[10px] text-brand-muted mt-1">Paste image URLs or Wix CDN links. First URL = main image with MAIN badge.</p>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="accent-brand-burgundy" checked={editingProduct.in_stock ?? true} onChange={(e) => setEditingProduct((p) => ({ ...p, in_stock: e.target.checked }))} />
                  <span className="text-sm text-brand-muted">In Stock</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="accent-brand-burgundy" checked={editingProduct.is_featured ?? false} onChange={(e) => setEditingProduct((p) => ({ ...p, is_featured: e.target.checked }))} />
                  <span className="text-sm text-brand-muted">Featured</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="accent-brand-gold" checked={editingProduct.is_raw ?? false} onChange={(e) => setEditingProduct((p) => ({ ...p, is_raw: e.target.checked }))} />
                  <span className="text-sm text-brand-muted">Raw Hair</span>
                </label>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => { setShowForm(false); setEditingProduct(null); }} className="btn-ghost flex-1 text-sm">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 text-sm">{saving ? "Saving…" : "Save Product"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Products table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-brand-dark2 border-b border-brand-mid">
              <tr>
                <th className="text-left px-4 py-3 text-xs text-brand-muted uppercase tracking-wide">Product</th>
                <th className="text-left px-4 py-3 text-xs text-brand-muted uppercase tracking-wide hidden sm:table-cell">Category</th>
                <th className="text-left px-4 py-3 text-xs text-brand-muted uppercase tracking-wide">Price</th>
                <th className="text-left px-4 py-3 text-xs text-brand-muted uppercase tracking-wide hidden md:table-cell">Stock</th>
                <th className="text-right px-4 py-3 text-xs text-brand-muted uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-mid">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={`prod-skel-${i}`}>
                    <td className="px-4 py-3"><div className="h-4 bg-brand-dark2 rounded animate-pulse w-40" /></td>
                    <td className="px-4 py-3 hidden sm:table-cell"><div className="h-4 bg-brand-dark2 rounded animate-pulse w-20" /></td>
                    <td className="px-4 py-3"><div className="h-4 bg-brand-dark2 rounded animate-pulse w-20" /></td>
                    <td className="px-4 py-3 hidden md:table-cell"><div className="h-4 bg-brand-dark2 rounded animate-pulse w-12" /></td>
                    <td className="px-4 py-3" />
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-brand-muted">No products found</td></tr>
              ) : (
                products.map((p, idx) => (
                  <tr key={`admin-prod-${p.id}-${idx}`} className="hover:bg-brand-dark2 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {p.images?.[0] && (
                          <div className="relative w-8 h-10 rounded overflow-hidden flex-shrink-0 bg-brand-dark2">
                            <Image src={p.images[0]} alt={p.name} fill className="object-cover" unoptimized />
                          </div>
                        )}
                        <span className="text-brand-white text-xs line-clamp-1 max-w-[160px]">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell text-brand-muted text-xs">{CATEGORY_LABELS[p.category]}</td>
                    <td className="px-4 py-3 text-brand-gold text-xs font-semibold">{formatPrice(p.price)}</td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${p.in_stock ? "text-emerald-400 bg-emerald-950/30 border-emerald-800/30" : "text-red-400 bg-red-950/30 border-red-800/30"}`}>
                        {p.in_stock ? "In Stock" : "Out"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => { setEditingProduct(p); setShowForm(true); }} className="text-xs text-brand-muted hover:text-brand-white transition-colors">Edit</button>
                        <button onClick={() => handleDelete(p.id)} className="text-xs text-brand-muted hover:text-brand-rose transition-colors">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Appointments Tab ─────────────────────────────────────────
function AppointmentsTab() {
  const supabase = createSupabaseBrowserClient();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 400);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterDate, setFilterDate] = useState("");

  const fetchAppts = useCallback(async () => {
    setLoading(true);
    let q = supabase.from("appointments").select("*").order("appointment_date", { ascending: false });
    if (debouncedSearch) q = q.ilike("client_name", `%${debouncedSearch}%`);
    if (filterStatus) q = q.eq("status", filterStatus);
    if (filterDate) q = q.eq("appointment_date", filterDate);
    const { data } = await q;
    setAppointments(data || []);
    setLoading(false);
  }, [debouncedSearch, filterStatus, filterDate]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fetchAppts(); }, [debouncedSearch, filterStatus, filterDate]); // eslint-disable-line react-hooks/exhaustive-deps

  async function updateStatus(id: string, status: string, notes?: string) {
    await supabase.from("appointments").update({ status, ...(notes !== undefined ? { notes } : {}), updated_at: new Date().toISOString() }).eq("id", id);
    fetchAppts();
  }

  const STATUS_OPTS = ["pending", "confirmed", "completed", "cancelled", "no_show"];
  const STATUS_COLORS: Record<string, string> = {
    pending: "text-amber-400", confirmed: "text-blue-400",
    completed: "text-emerald-400", cancelled: "text-red-400", no_show: "text-red-400",
  };

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-48">
          <input type="text" className="input pl-9 text-sm" placeholder="Search by client name…" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input type="date" className="input text-sm w-40" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} />
        <select className="select text-sm w-36" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="">All Status</option>
          {STATUS_OPTS.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
        </select>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-brand-dark2 border-b border-brand-mid">
              <tr>
                {["Client", "Service", "Date & Time", "Status", "Deposit", "Actions"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs text-brand-muted uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-mid">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={`appt-skel-${i}`}>{Array.from({ length: 6 }).map((_, j) => <td key={j} className="px-4 py-3"><div className="h-4 bg-brand-dark2 rounded animate-pulse" /></td>)}</tr>
                ))
              ) : appointments.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-brand-muted">No appointments found</td></tr>
              ) : (
                appointments.map((a, idx) => (
                  <tr key={`admin-appt-${a.id}-${idx}`} className="hover:bg-brand-dark2 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-brand-white text-xs font-medium">{a.client_name}</p>
                      <p className="text-brand-muted text-[10px]">{a.client_phone}</p>
                    </td>
                    <td className="px-4 py-3 text-brand-muted text-xs">{a.service_name}</td>
                    <td className="px-4 py-3 text-brand-muted text-xs whitespace-nowrap">
                      {formatDateShort(a.appointment_date)}<br/>{formatTime(a.appointment_time)}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        className={`bg-transparent border-0 text-xs font-semibold cursor-pointer ${STATUS_COLORS[a.status] || "text-brand-muted"}`}
                        value={a.status}
                        onChange={(e) => updateStatus(a.id, e.target.value)}
                      >
                        {STATUS_OPTS.map((s) => <option key={s} value={s} className="bg-brand-dark text-brand-white capitalize">{s}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      {a.deposit_amount > 0 && (
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${a.deposit_paid ? "text-emerald-400 bg-emerald-950/30 border-emerald-800/30" : "text-amber-400 bg-amber-950/30 border-amber-800/30"}`}>
                          {a.deposit_paid ? "Paid" : "Pending"}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <a href={`https://wa.me/${a.client_phone}`} target="_blank" rel="noopener noreferrer" className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors">
                        WhatsApp
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Orders Tab ───────────────────────────────────────────────
function OrdersTab() {
  const supabase = createSupabaseBrowserClient();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 400);

  useEffect(() => {
    async function fetch() {
      setLoading(true);
      let q = supabase.from("orders").select("*").order("created_at", { ascending: false });
      if (debouncedSearch) q = q.ilike("customer_name", `%${debouncedSearch}%`);
      const { data } = await q;
      setOrders(data || []);
      setLoading(false);
    }
    fetch();
  }, [debouncedSearch]); // eslint-disable-line react-hooks/exhaustive-deps

  const STATUS_OPTS = ["pending", "paid", "processing", "shipped", "delivered", "cancelled"];
  const STATUS_COLORS: Record<string, string> = {
    pending: "text-amber-400", paid: "text-blue-400", processing: "text-blue-300",
    shipped: "text-purple-400", delivered: "text-emerald-400", cancelled: "text-red-400",
  };

  async function updateStatus(id: string, status: string) {
    await supabase.from("orders").update({ status, updated_at: new Date().toISOString() }).eq("id", id);
    setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status: status as Order["status"] } : o));
  }

  return (
    <div>
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <input type="text" className="input pl-9 text-sm" placeholder="Search by customer name…" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-brand-dark2 border-b border-brand-mid">
              <tr>
                {["Order", "Customer", "Items", "Total", "Status", "Actions"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs text-brand-muted uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-mid">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => <tr key={i}>{Array.from({ length: 6 }).map((_, j) => <td key={j} className="px-4 py-3"><div className="h-4 bg-brand-dark2 rounded animate-pulse" /></td>)}</tr>)
              ) : orders.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-brand-muted">No orders found</td></tr>
              ) : (
                orders.map((o, idx) => (
                  <tr key={`admin-ord-${o.id}-${idx}`} className="hover:bg-brand-dark2 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-brand-muted">#{o.id.slice(0, 8).toUpperCase()}</td>
                    <td className="px-4 py-3">
                      <p className="text-brand-white text-xs">{o.customer_name}</p>
                      <p className="text-brand-muted text-[10px]">{o.customer_phone}</p>
                    </td>
                    <td className="px-4 py-3 text-brand-muted text-xs">{Array.isArray(o.items) ? o.items.length : 0} item(s)</td>
                    <td className="px-4 py-3 text-brand-gold text-xs font-semibold">{formatPrice(o.total)}</td>
                    <td className="px-4 py-3">
                      <select
                        className={`bg-transparent border-0 text-xs font-semibold cursor-pointer capitalize ${STATUS_COLORS[o.status] || "text-brand-muted"}`}
                        value={o.status}
                        onChange={(e) => updateStatus(o.id, e.target.value)}
                      >
                        {STATUS_OPTS.map((s) => <option key={s} value={s} className="bg-brand-dark text-brand-white capitalize">{s}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <a href={`https://wa.me/${o.customer_phone}`} target="_blank" rel="noopener noreferrer" className="text-xs text-emerald-400 hover:text-emerald-300">WhatsApp</a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Services Tab ─────────────────────────────────────────────
function ServicesTab() {
  const supabase = createSupabaseBrowserClient();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Partial<Service> | null>(null);
  const [saving, setSaving] = useState(false);

  async function loadServices() {
    setLoading(true);
    const { data } = await supabase.from("services").select("*").order("category");
    setServices(data || []);
    setLoading(false);
  }

  useEffect(() => { loadServices(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSave() {
    if (!editing?.name || !editing.price) return;
    setSaving(true);
    if (editing.id) {
      await supabase.from("services").update(editing).eq("id", editing.id);
    } else {
      await supabase.from("services").insert({ ...editing, active: true });
    }
    setSaving(false);
    setShowForm(false);
    setEditing(null);
    loadServices();
  }

  async function toggleActive(id: string, active: boolean) {
    await supabase.from("services").update({ active: !active }).eq("id", id);
    loadServices();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this service?")) return;
    await supabase.from("services").delete().eq("id", id);
    loadServices();
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-heading text-lg text-brand-white">{services.length} Services</h2>
        <button onClick={() => { setEditing({ category: "wig-services", duration_min: 60, price: 0, deposit: 0 }); setShowForm(true); }} className="btn-primary text-sm">
          + Add Service
        </button>
      </div>

      {showForm && editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-black/80 backdrop-blur-sm">
          <div className="card w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-lg text-brand-white">{editing.id ? "Edit Service" : "Add Service"}</h3>
              <button onClick={() => { setShowForm(false); setEditing(null); }} className="text-brand-muted hover:text-brand-white">✕</button>
            </div>
            <div className="space-y-3">
              <div><label className="label">Name *</label><input type="text" className="input text-sm" value={editing.name || ""} onChange={(e) => setEditing((p) => ({ ...p, name: e.target.value }))} /></div>
              <div><label className="label">Description</label><textarea className="input text-sm resize-none" rows={2} value={editing.description || ""} onChange={(e) => setEditing((p) => ({ ...p, description: e.target.value }))} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Category</label>
                  <select className="select text-sm" value={editing.category || "wig-services"} onChange={(e) => setEditing((p) => ({ ...p, category: e.target.value as Service["category"] }))}>
                    {Object.entries(SERVICE_CATEGORY_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
                <div><label className="label">Duration (mins)</label><input type="number" className="input text-sm" value={editing.duration_min || ""} onChange={(e) => setEditing((p) => ({ ...p, duration_min: parseInt(e.target.value) || 0 }))} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">Price (KES) *</label><input type="number" className="input text-sm" value={editing.price || ""} onChange={(e) => setEditing((p) => ({ ...p, price: parseInt(e.target.value) || 0 }))} /></div>
                <div><label className="label">Deposit (KES)</label><input type="number" className="input text-sm" value={editing.deposit || ""} onChange={(e) => setEditing((p) => ({ ...p, deposit: parseInt(e.target.value) || 0 }))} /></div>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => { setShowForm(false); setEditing(null); }} className="btn-ghost flex-1 text-sm">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 text-sm">{saving ? "Saving…" : "Save"}</button>
            </div>
          </div>
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-brand-dark2 border-b border-brand-mid">
              <tr>{["Service", "Category", "Duration", "Price", "Deposit", "Active", "Actions"].map((h) => <th key={h} className="text-left px-4 py-3 text-xs text-brand-muted uppercase tracking-wide">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-brand-mid">
              {loading ? Array.from({ length: 5 }).map((_, i) => <tr key={i}>{Array.from({ length: 7 }).map((_, j) => <td key={j} className="px-4 py-3"><div className="h-4 bg-brand-dark2 rounded animate-pulse" /></td>)}</tr>) :
                services.map((s, idx) => (
                  <tr key={`svc-row-${s.id}-${idx}`} className="hover:bg-brand-dark2 transition-colors">
                    <td className="px-4 py-3 text-brand-white text-xs">{s.name}</td>
                    <td className="px-4 py-3 text-brand-muted text-xs">{SERVICE_CATEGORY_LABELS[s.category]}</td>
                    <td className="px-4 py-3 text-brand-muted text-xs">{s.duration_min}m</td>
                    <td className="px-4 py-3 text-brand-gold text-xs">{formatPrice(s.price)}</td>
                    <td className="px-4 py-3 text-brand-muted text-xs">{s.deposit > 0 ? formatPrice(s.deposit) : "—"}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleActive(s.id, s.active)} className={`text-xs font-semibold ${s.active ? "text-emerald-400" : "text-red-400"}`}>
                        {s.active ? "On" : "Off"}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => { setEditing(s); setShowForm(true); }} className="text-xs text-brand-muted hover:text-brand-white">Edit</button>
                        <button onClick={() => handleDelete(s.id)} className="text-xs text-brand-muted hover:text-brand-rose">Del</button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Blog Tab ─────────────────────────────────────────────────
function BlogTab() {
  const supabase = createSupabaseBrowserClient();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 400);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Partial<BlogPost> | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetch() {
      setLoading(true);
      let q = supabase.from("blog_posts").select("*").order("created_at", { ascending: false });
      if (debouncedSearch) q = q.ilike("title", `%${debouncedSearch}%`);
      const { data } = await q;
      setPosts(data || []);
      setLoading(false);
    }
    fetch();
  }, [debouncedSearch]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSave() {
    if (!editing?.title) return;
    setSaving(true);
    const slug = editing.title.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").slice(0, 80);
    if (editing.id) {
      await supabase.from("blog_posts").update(editing).eq("id", editing.id);
    } else {
      await supabase.from("blog_posts").insert({ ...editing, slug, published: true, author: editing.author || "The Salon Team", read_time: editing.read_time || 5 });
    }
    setSaving(false);
    setShowForm(false);
    setEditing(null);
    setSearchInput("x"); setSearchInput(""); // Trigger re-fetch
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this post?")) return;
    await supabase.from("blog_posts").delete().eq("id", id);
    setSearchInput("x"); setSearchInput("");
  }

  return (
    <div>
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <input type="text" className="input pl-9 text-sm" placeholder="Search blog posts…" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <button onClick={() => { setEditing({ author: "The Salon Team", read_time: 5, published: true }); setShowForm(true); }} className="btn-primary text-sm">+ Add Post</button>
      </div>

      {showForm && editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-black/80 backdrop-blur-sm">
          <div className="card w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-lg text-brand-white">{editing.id ? "Edit Post" : "New Post"}</h3>
              <button onClick={() => { setShowForm(false); setEditing(null); }} className="text-brand-muted hover:text-brand-white">✕</button>
            </div>
            <div className="space-y-3">
              <div><label className="label">Title *</label><input type="text" className="input text-sm" value={editing.title || ""} onChange={(e) => setEditing((p) => ({ ...p, title: e.target.value }))} /></div>
              <div><label className="label">Excerpt</label><textarea className="input text-sm resize-none" rows={2} value={editing.excerpt || ""} onChange={(e) => setEditing((p) => ({ ...p, excerpt: e.target.value }))} /></div>
              <div><label className="label">Content (HTML)</label><textarea className="input text-sm resize-none font-mono text-xs" rows={10} value={editing.content || ""} onChange={(e) => setEditing((p) => ({ ...p, content: e.target.value }))} /></div>
              <div><label className="label">Cover Image URL</label><input type="url" className="input text-sm" value={editing.cover_image || ""} onChange={(e) => setEditing((p) => ({ ...p, cover_image: e.target.value }))} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">Author</label><input type="text" className="input text-sm" value={editing.author || ""} onChange={(e) => setEditing((p) => ({ ...p, author: e.target.value }))} /></div>
                <div><label className="label">Read Time (mins)</label><input type="number" className="input text-sm" value={editing.read_time || ""} onChange={(e) => setEditing((p) => ({ ...p, read_time: parseInt(e.target.value) || 5 }))} /></div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="accent-brand-burgundy" checked={editing.published ?? true} onChange={(e) => setEditing((p) => ({ ...p, published: e.target.checked }))} />
                <span className="text-sm text-brand-muted">Published</span>
              </label>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => { setShowForm(false); setEditing(null); }} className="btn-ghost flex-1 text-sm">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 text-sm">{saving ? "Saving…" : "Save"}</button>
            </div>
          </div>
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-brand-dark2 border-b border-brand-mid">
              <tr>{["Title", "Author", "Date", "Status", "Actions"].map((h) => <th key={h} className="text-left px-4 py-3 text-xs text-brand-muted uppercase tracking-wide">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-brand-mid">
              {loading ? Array.from({ length: 4 }).map((_, i) => <tr key={i}>{Array.from({ length: 5 }).map((_, j) => <td key={j} className="px-4 py-3"><div className="h-4 bg-brand-dark2 rounded animate-pulse" /></td>)}</tr>) :
                posts.length === 0 ? <tr><td colSpan={5} className="px-4 py-8 text-center text-brand-muted">No posts found</td></tr> :
                posts.map((post, idx) => (
                  <tr key={`blog-row-${post.id}-${idx}`} className="hover:bg-brand-dark2 transition-colors">
                    <td className="px-4 py-3 text-brand-white text-xs max-w-xs"><p className="line-clamp-1">{post.title}</p></td>
                    <td className="px-4 py-3 text-brand-muted text-xs">{post.author}</td>
                    <td className="px-4 py-3 text-brand-muted text-xs">{formatDateShort(post.created_at)}</td>
                    <td className="px-4 py-3"><span className={`text-[10px] font-semibold ${post.published ? "text-emerald-400" : "text-amber-400"}`}>{post.published ? "Published" : "Draft"}</span></td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => { setEditing(post); setShowForm(true); }} className="text-xs text-brand-muted hover:text-brand-white">Edit</button>
                        <button onClick={() => handleDelete(post.id)} className="text-xs text-brand-muted hover:text-brand-rose">Del</button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Customers Tab ────────────────────────────────────────────
function CustomersTab() {
  const supabase = createSupabaseBrowserClient();
  const [customers, setCustomers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      setCustomers(data || []);
      setLoading(false);
    }
    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-brand-dark2 border-b border-brand-mid">
            <tr>{["Name", "Email", "Phone", "Role", "Joined"].map((h) => <th key={h} className="text-left px-4 py-3 text-xs text-brand-muted uppercase tracking-wide">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-brand-mid">
            {loading ? Array.from({ length: 5 }).map((_, i) => <tr key={i}>{Array.from({ length: 5 }).map((_, j) => <td key={j} className="px-4 py-3"><div className="h-4 bg-brand-dark2 rounded animate-pulse" /></td>)}</tr>) :
              customers.length === 0 ? <tr><td colSpan={5} className="px-4 py-8 text-center text-brand-muted">No customers yet</td></tr> :
              customers.map((c, idx) => (
                <tr key={`cust-${c.id}-${idx}`} className="hover:bg-brand-dark2 transition-colors">
                  <td className="px-4 py-3 text-brand-white text-xs">{c.full_name || "—"}</td>
                  <td className="px-4 py-3 text-brand-muted text-xs">{c.email}</td>
                  <td className="px-4 py-3 text-brand-muted text-xs">{c.phone || "—"}</td>
                  <td className="px-4 py-3"><span className={`text-[10px] font-semibold capitalize ${c.role === "admin" ? "text-brand-gold" : "text-brand-muted"}`}>{c.role}</span></td>
                  <td className="px-4 py-3 text-brand-muted text-xs">{formatDateShort(c.created_at)}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
