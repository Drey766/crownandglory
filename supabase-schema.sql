-- ============================================================
-- supabase-schema.sql — Run this FIRST in Supabase SQL Editor
-- Creates all tables, RLS policies, triggers, storage bucket
-- ============================================================

-- ── Extensions ───────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Profiles ─────────────────────────────────────────────────
CREATE TABLE public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  full_name   TEXT DEFAULT '',
  phone       TEXT DEFAULT '',
  avatar_url  TEXT DEFAULT '',
  role        TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile row when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── Products ─────────────────────────────────────────────────
CREATE TABLE public.products (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  slug          TEXT NOT NULL UNIQUE,
  description   TEXT DEFAULT '',
  price         INTEGER NOT NULL,                    -- KES
  original_price INTEGER,                            -- KES comparison price (optional)
  images        JSONB DEFAULT '[]',                  -- Array of image URLs
  category      TEXT NOT NULL CHECK (category IN ('wigs', 'extensions', 'lace-closures', 'lashes')),
  hair_type     TEXT,                                -- body-wave, straight, curly etc.
  is_raw        BOOLEAN DEFAULT FALSE,               -- Raw human hair flag
  in_stock      BOOLEAN DEFAULT TRUE,
  stock_count   INTEGER DEFAULT 10,
  is_featured   BOOLEAN DEFAULT FALSE,
  is_new        BOOLEAN DEFAULT FALSE,
  rating        NUMERIC(3,1) DEFAULT 4.5,
  review_count  INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_products_category ON public.products(category);
CREATE INDEX idx_products_slug ON public.products(slug);
CREATE INDEX idx_products_featured ON public.products(is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_products_in_stock ON public.products(in_stock);

-- ── Services ─────────────────────────────────────────────────
CREATE TABLE public.services (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  description   TEXT DEFAULT '',
  category      TEXT NOT NULL CHECK (category IN ('wig-services', 'washing-styling', 'braiding', 'coloring', 'lashes')),
  duration_min  INTEGER NOT NULL,                    -- Duration in minutes
  price         INTEGER NOT NULL,                    -- KES
  deposit       INTEGER DEFAULT 0,                   -- KES deposit required (0 = none)
  image         TEXT DEFAULT '',
  active        BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_services_category ON public.services(category);
CREATE INDEX idx_services_active ON public.services(active) WHERE active = TRUE;

-- ── Appointments ─────────────────────────────────────────────
CREATE TABLE public.appointments (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  service_id        UUID REFERENCES public.services(id) ON DELETE SET NULL,
  service_name      TEXT NOT NULL,                   -- Snapshot in case service is deleted
  service_price     INTEGER NOT NULL,
  client_name       TEXT NOT NULL,
  client_phone      TEXT NOT NULL,
  client_email      TEXT DEFAULT '',
  appointment_date  DATE NOT NULL,
  appointment_time  TIME NOT NULL,
  notes             TEXT DEFAULT '',
  status            TEXT DEFAULT 'pending'
    CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'no_show')),
  deposit_paid      BOOLEAN DEFAULT FALSE,
  deposit_amount    INTEGER DEFAULT 0,
  mpesa_code        TEXT DEFAULT '',
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_appointments_date ON public.appointments(appointment_date);
CREATE INDEX idx_appointments_user ON public.appointments(user_id);
CREATE INDEX idx_appointments_status ON public.appointments(status);
-- Unique constraint: only one booking per date+time slot
CREATE UNIQUE INDEX idx_appointments_slot
  ON public.appointments(appointment_date, appointment_time)
  WHERE status NOT IN ('cancelled');

-- ── Orders ───────────────────────────────────────────────────
CREATE TABLE public.orders (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  items            JSONB NOT NULL DEFAULT '[]',       -- Snapshot of cart items at purchase time
  subtotal         INTEGER NOT NULL,
  shipping_fee     INTEGER NOT NULL DEFAULT 150,
  total            INTEGER NOT NULL,
  status           TEXT DEFAULT 'pending'
    CHECK (status IN ('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled')),
  mpesa_code       TEXT DEFAULT '',
  delivery_address JSONB NOT NULL DEFAULT '{}',       -- {county, town, street, building}
  customer_name    TEXT NOT NULL,
  customer_phone   TEXT NOT NULL,
  customer_email   TEXT DEFAULT '',
  notes            TEXT DEFAULT '',
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_orders_user ON public.orders(user_id);
CREATE INDEX idx_orders_status ON public.orders(status);

-- ── Blog Posts ───────────────────────────────────────────────
CREATE TABLE public.blog_posts (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title        TEXT NOT NULL,
  slug         TEXT NOT NULL UNIQUE,
  excerpt      TEXT DEFAULT '',
  content      TEXT DEFAULT '',                       -- Full HTML content
  cover_image  TEXT DEFAULT '',
  author       TEXT DEFAULT 'The Salon Team',
  read_time    INTEGER DEFAULT 5,                     -- Minutes
  published    BOOLEAN DEFAULT FALSE,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_blog_published ON public.blog_posts(published) WHERE published = TRUE;

-- ── Reviews ──────────────────────────────────────────────────
CREATE TABLE public.reviews (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id   UUID REFERENCES public.products(id) ON DELETE CASCADE,
  user_id      UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  rating       INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment      TEXT DEFAULT '',
  author_name  TEXT NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reviews_product ON public.reviews(product_id);

-- ── Newsletter Subscribers ───────────────────────────────────
CREATE TABLE public.newsletter_subscribers (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email      TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ════════════════════════════════════════════════════════════
-- Row Level Security (RLS) Policies
-- ════════════════════════════════════════════════════════════

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- ── Helper: is current user an admin ─────────────────────────
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ── Profiles policies ────────────────────────────────────────
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "profiles_insert_trigger" ON public.profiles
  FOR INSERT WITH CHECK (true);  -- Trigger handles this

-- ── Products policies ────────────────────────────────────────
CREATE POLICY "products_select_all" ON public.products
  FOR SELECT USING (true);       -- Public read

CREATE POLICY "products_admin_all" ON public.products
  FOR ALL USING (public.is_admin());

-- ── Services policies ────────────────────────────────────────
CREATE POLICY "services_select_active" ON public.services
  FOR SELECT USING (active = true OR public.is_admin());

CREATE POLICY "services_admin_all" ON public.services
  FOR ALL USING (public.is_admin());

-- ── Appointments policies ────────────────────────────────────
CREATE POLICY "appointments_select_own" ON public.appointments
  FOR SELECT USING (
    auth.uid() = user_id         -- Own appointments
    OR public.is_admin()         -- Or admin sees all
    OR auth.uid() IS NULL        -- Or public (for slot-check queries)
  );

CREATE POLICY "appointments_insert_public" ON public.appointments
  FOR INSERT WITH CHECK (true);  -- Anyone can book (no login required)

CREATE POLICY "appointments_update_admin" ON public.appointments
  FOR UPDATE USING (public.is_admin() OR auth.uid() = user_id);

-- ── Orders policies ──────────────────────────────────────────
CREATE POLICY "orders_select_own" ON public.orders
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "orders_insert_auth" ON public.orders
  FOR INSERT WITH CHECK (true);  -- Handled via API route with service role

CREATE POLICY "orders_update_admin" ON public.orders
  FOR UPDATE USING (public.is_admin());

-- ── Blog policies ────────────────────────────────────────────
CREATE POLICY "blog_select_published" ON public.blog_posts
  FOR SELECT USING (published = true OR public.is_admin());

CREATE POLICY "blog_admin_all" ON public.blog_posts
  FOR ALL USING (public.is_admin());

-- ── Reviews policies ─────────────────────────────────────────
CREATE POLICY "reviews_select_all" ON public.reviews
  FOR SELECT USING (true);

CREATE POLICY "reviews_insert_auth" ON public.reviews
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ── Newsletter policies ──────────────────────────────────────
CREATE POLICY "newsletter_insert_all" ON public.newsletter_subscribers
  FOR INSERT WITH CHECK (true);

CREATE POLICY "newsletter_admin_select" ON public.newsletter_subscribers
  FOR SELECT USING (public.is_admin());

-- ════════════════════════════════════════════════════════════
-- Storage Bucket for Product Images
-- ════════════════════════════════════════════════════════════

INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

-- Public read for product images
CREATE POLICY "products_storage_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'products');

-- Authenticated users can upload
CREATE POLICY "products_storage_upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'products' AND auth.uid() IS NOT NULL);

-- Admins can delete
CREATE POLICY "products_storage_delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'products' AND public.is_admin());

-- ════════════════════════════════════════════════════════════
-- IMPORTANT: Set up first admin user
-- After registering via the site, run this with your email:
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'your@email.com';
-- ════════════════════════════════════════════════════════════

SELECT 'Schema created successfully!' AS status;
