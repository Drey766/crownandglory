// ============================================================
// Root layout — fonts loaded via CSS @import in globals.css
// (next/font/google requires network at build time; CSS @import
//  loads fonts client-side, works in all environments)
// ============================================================
import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: {
    default: "Crown & Glory Hair Salon — Wigs, Extensions & Salon Services",
    template: "%s | Crown & Glory Hair Salon",
  },
  description:
    "Nairobi's premier hair salon. Shop premium wigs, extensions, lace closures and lashes. Book professional hair services. M-Pesa accepted.",
  keywords: [
    "hair salon nairobi",
    "wigs kenya",
    "hair extensions nairobi",
    "lace closure kenya",
    "mpesa hair shop",
  ],
  openGraph: {
    siteName: "Crown & Glory Hair Salon",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-brand-black text-brand-light font-body antialiased">
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              {/* Sticky navigation bar */}
              <Navbar />
              {/* Main page content */}
              <main className="min-h-screen">{children}</main>
              {/* Site footer with newsletter */}
              <Footer />
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
