# Crown & Glory Hair Salon — Full Stack Website

A complete hair salon website with:
- **Online shop** — 107 real products (wigs, extensions, lace closures, lashes)
- **Appointment booking** — 4-step booking with M-Pesa deposit and WhatsApp confirmation
- **M-Pesa payments** — STK Push for orders and appointment deposits via Daraja API
- **WhatsApp notifications** — instant alerts to owner + confirmation to clients
- **Admin dashboard** — products, appointments, orders, services, blog, customers
- **Blog** — 8 pre-seeded hair care articles

---
### Colours
Edit `tailwind.config.ts` → `theme.extend.colors.brand`:
- `brand.burgundy` — Primary CTA colour
- `brand.gold` — Prices, badges, accents
- `brand.black` — Page background

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx            # Home (useEffect data fetch)
│   ├── shop/               # Shop + product detail
│   ├── services/           # Services listing
│   ├── book/               # Multi-step booking
│   ├── blog/               # Blog list + post
│   ├── cart/               # Cart page
│   ├── wishlist/           # Wishlist
│   ├── checkout/           # M-Pesa checkout
│   ├── contact/            # Contact + WhatsApp form
│   ├── account/            # Orders + appointments history
│   ├── admin/              # Admin dashboard
│   └── api/                # API routes
├── components/
│   ├── layout/             # Navbar, Footer
│   ├── home/               # Hero, homepage sections
│   ├── booking/            # 4-step booking components
│   ├── services/           # ServiceCard
│   ├── shop/               # ProductCard
│   ├── cart/               # CartDrawer
│   └── ui/                 # AuthModal
├── context/                # Cart, Wishlist, Auth contexts
├── hooks/                  # useDebounce
├── lib/                    # Supabase client, utilities
└── types/                  # TypeScript interfaces
```

---

For setup assistance, message us via WhatsApp or open an issue in this repository.
