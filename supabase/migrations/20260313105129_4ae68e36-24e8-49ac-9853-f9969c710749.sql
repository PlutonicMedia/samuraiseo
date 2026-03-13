
-- Create user roles enum and table
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

-- Quiz submissions table
CREATE TABLE public.quiz_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    company TEXT NOT NULL,
    product_count INTEGER,
    expected_volume INTEGER,
    time_per_item INTEGER,
    revenue_range TEXT,
    has_seo_control BOOLEAN DEFAULT false,
    saved_hours INTEGER,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.quiz_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit quiz" ON public.quiz_submissions
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Admin can read submissions" ON public.quiz_submissions
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- SEO text requests table
CREATE TABLE public.seo_text_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    website_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.seo_text_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit seo request" ON public.seo_text_requests
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Admin can read seo requests" ON public.seo_text_requests
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Site settings table (single row, id=1)
CREATE TABLE public.site_settings (
    id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    hubspot_calendar_url TEXT DEFAULT '',
    facebook_pixel_id TEXT DEFAULT '',
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read settings" ON public.site_settings
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Admin can update settings" ON public.site_settings
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can insert settings" ON public.site_settings
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.site_settings (id) VALUES (1);

-- User roles policies
CREATE POLICY "Admin can read roles" ON public.user_roles
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
