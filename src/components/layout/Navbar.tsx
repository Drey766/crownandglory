"use client";
// ============================================================
// Navbar — sticky dark bar with cart/wishlist badges + Book Now CTA
// ============================================================
import { useState, useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";
import AuthModal from "@/components/ui/AuthModal";

// Navigation links
const NAV_LINKS = [
  { label: "Shop", href: "/shop" },
  { label: "Services", href: "/services" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

export default function Navbar() {
  const { itemCount } = useCart();
  const { count: wishlistCount } = useWishlist();
  const { user, profile, signOut } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  // Add shadow/blur when user scrolls down
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-brand-black/95 backdrop-blur-md border-b border-brand-mid shadow-lg"
            : "bg-transparent"
        }`}
      >
        <div className="container-site flex items-center justify-between h-16 lg:h-18">

          {/* Logo */}
          <Link href="/" className="flex flex-col leading-none">
            <span className="font-display text-xl lg:text-2xl text-brand-white tracking-wide">
              Crown & Glory
            </span>
            <span className="text-[10px] tracking-[0.3em] uppercase text-brand-gold font-body">
              Hair Salon
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden lg:flex items-center gap-8">
            {NAV_LINKS.map(({ label, href }) => (
              <Link
                key={`nav-${label}`}
                href={href}
                className="text-sm tracking-wide text-brand-muted hover:text-brand-white transition-colors"
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Right side — icons + CTA */}
          <div className="flex items-center gap-2 lg:gap-3">

            {/* Wishlist icon with badge */}
            <Link
              href="/wishlist"
              className="relative p-2 text-brand-muted hover:text-brand-rose transition-colors"
              aria-label="Wishlist"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-brand-rose text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart icon with badge */}
            <Link
              href="/cart"
              className="relative p-2 text-brand-muted hover:text-brand-white transition-colors"
              aria-label="Cart"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-brand-burgundy text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* Auth — account icon or sign in */}
            {user ? (
              <div className="hidden lg:flex items-center gap-2">
                <Link
                  href={profile?.role === "admin" ? "/admin" : "/account"}
                  className="p-2 text-brand-muted hover:text-brand-white transition-colors"
                  aria-label="Account"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </Link>
                <button
                  onClick={signOut}
                  className="text-xs text-brand-muted hover:text-brand-rose transition-colors tracking-wide"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <button
                onClick={() => setAuthOpen(true)}
                className="hidden lg:block text-sm text-brand-muted hover:text-brand-white transition-colors tracking-wide"
              >
                Sign in
              </button>
            )}

            {/* Book Now CTA — always visible */}
            <Link
              href="/book"
              className="btn-primary text-xs py-2 px-4 hidden sm:inline-flex"
            >
              Book Now
            </Link>

            {/* Hamburger — mobile only */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden p-2 text-brand-muted hover:text-brand-white"
              aria-label="Toggle menu"
            >
              <div className="w-5 flex flex-col gap-1.5">
                <span className={`h-0.5 bg-current transition-all ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
                <span className={`h-0.5 bg-current transition-all ${menuOpen ? "opacity-0" : ""}`} />
                <span className={`h-0.5 bg-current transition-all ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile menu drawer */}
        {menuOpen && (
          <div className="lg:hidden bg-brand-dark border-t border-brand-mid">
            <div className="container-site py-4 flex flex-col gap-3">
              {NAV_LINKS.map(({ label, href }) => (
                <Link
                  key={`mob-nav-${label}`}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className="py-2 text-brand-muted hover:text-brand-white transition-colors text-sm tracking-wide"
                >
                  {label}
                </Link>
              ))}
              <div className="pt-2 border-t border-brand-mid flex flex-col gap-2">
                <Link href="/book" onClick={() => setMenuOpen(false)} className="btn-primary text-center">
                  Book Appointment
                </Link>
                {user ? (
                  <button onClick={signOut} className="btn-ghost text-sm">Sign out</button>
                ) : (
                  <button onClick={() => { setAuthOpen(true); setMenuOpen(false); }} className="btn-ghost text-sm">
                    Sign in
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Auth modal */}
      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
    </>
  );
}
