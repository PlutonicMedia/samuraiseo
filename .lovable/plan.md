

# Samurai Quiz Landing Page — Implementation Plan

## Overview
A gamified, multilingual quiz landing page for Samurai (AI SEO tool for Shopify) by Plutonic Media. Hosted at samurai.plutonic.dk. Features a time-saving calculator, trust sidebar, admin panel, and conversion tracking.

## Design System
- **Background:** #EBFBF7 | **Primary/CTA:** #093128 | **Accent:** #34D399 | **Borders:** #A3B1AD | **Cards:** #FFFFFF
- **Fonts:** Sora (headlines), Inter (body/UI) via Google Fonts
- **Cards:** 24px radius, smooth fade/slide transitions between quiz steps
- **Progress bar** animated with accent green

## Pages & Flow

### 1. Landing / Quiz Page (`/`)
- **Header:** Samurai logo, language switcher (DA/EN toggle), minimal nav
- **Hero Section:** Bold headline — "Could you imagine optimizing your entire Shopify store at once?" with CTA to start quiz
- **Quiz Flow (card-based, single column, centered):**
  1. "Are you currently using Shopify?" → Yes/No. If No → polite exit message + link to plutonic.dk
  2. Product count slider (range: 1–10,000+)
  3. Expected new products/blogs/collections in 2026 (number input)
  4. Time per product/page optimization (slider, minutes)
  5. Approximate monthly revenue (select brackets)
  6. "Do you have full control over SEO & AI search visibility?" (toggle Yes/No)
- **Animated progress bar** across all steps

### 2. Results Page (inline after quiz)
- **Dynamic calculation:** Manual hours = (Q2 answer × Q3 answer) / 60. Samurai hours = Q2 answer × 1min / 60. Savings = difference.
- **Result card:** "You could save **X hours/year** by automating your Shopify SEO with Samurai & Plutonic"
- **Primary CTA:** Contact form (Name, Phone, Email, Company) — submits to Supabase, redirects to `/thank-you`
- **Secondary CTA:** "Get free AI-generated SEO texts" — requires Website URL field, also stores in Supabase, redirects to `/thank-you`

### 3. Thank You Page (`/thank-you`)
- Confirmation message, conversion tracking pixel fires here

### 4. Trust Sidebar (right column on desktop, collapsible on mobile)
- Plutonic Media branding & description as AI-first agency
- Reaktion Case Competition Winner badge (Plaza case) with stats: POAS +78%, Net Profit +185%, CAC 29% lower, Sales from Ads +137%
- European Search Awards 2025 Finalist badge
- Both uploaded images embedded as trust visuals, styled to match the design system

## Multilingual (DA/EN)
- All quiz questions, UI labels, results text, and form labels fully translated
- Language state stored in React context, toggled via header switcher
- JSON-based translation files for easy maintenance

## Admin Panel (`/admin`)
- **Auth:** Email/password login via Supabase Auth (single admin user)
- **Dashboard tabs:**
  - **Form Entries:** Table of all quiz submissions (name, phone, email, company, quiz answers, calculated savings, timestamp). Export-friendly.
  - **SEO Text Requests:** Table of URL submissions
  - **Settings:** Editable HubSpot calendar embed URL, Facebook Pixel ID
- No user profiles table needed — just admin auth

## Backend (Lovable Cloud / Supabase)
- **Tables:** `quiz_submissions`, `seo_text_requests`, `site_settings` (for HubSpot link, Pixel ID)
- **Admin auth** via Supabase Auth with a `user_roles` table
- **RLS:** Public insert on submissions tables, admin-only read/update

## Tracking & Analytics
- Facebook Pixel script injected via `site_settings.pixel_id` (configurable from admin)
- Custom events fired on: quiz start, quiz complete, form submit, secondary CTA submit
- `/thank-you` page fires PageView + Lead conversion event

## Assets
- Upload provided images (Reaktion winner card, European Search Awards badge) to `src/assets/` for trust sidebar
- Plaza & Plutonic reference text recreated as styled component

