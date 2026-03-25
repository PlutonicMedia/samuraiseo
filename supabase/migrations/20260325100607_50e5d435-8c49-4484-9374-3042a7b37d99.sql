-- Add specialist toggle columns to site_settings
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS specialist_kasper_enabled boolean NOT NULL DEFAULT true;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS specialist_peter_enabled boolean NOT NULL DEFAULT true;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS specialist_oliver_enabled boolean NOT NULL DEFAULT true;

-- Allow admins to delete quiz submissions
CREATE POLICY "Admin can delete submissions"
ON public.quiz_submissions
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to delete seo requests
CREATE POLICY "Admin can delete seo requests"
ON public.seo_text_requests
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));