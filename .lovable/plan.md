

# Implementation Plan: Comprehensive UI/UX, Quiz & Conversion Updates

## 1. Header Logo Swap
- Copy uploaded `Samurai-SEO-site-icon.png` to `src/assets/`
- Replace emoji+text in `Header.tsx` with an `<img>` import of the logo (~32px height), keeping "by Plutonic Media" subtitle

## 2. Layout: Full-Width Quiz, Remove Static Sidebar
- **`Index.tsx`:** Remove `TrustSidebar` import and the two-column flex layout. Make `QuizFlow` centered at `max-w-3xl`
- **`TrustSidebar.tsx`:** Repurpose into two smaller inline trust banner components used inside `QuizFlow`:
  - `TrustBannerPlaza` — Plaza stats + image (shown below Q5)
  - `TrustBannerAwards` — Awards images (shown below Q6)

## 3. Quiz Question Updates (`QuizFlow.tsx`)
- **Q2 (Product count):** Add a synced `<Input type="number">` beside the slider so users can type exact values. Two-way binding between slider and input.
- **Q3 (Expected volume):** Change question text to "How many products do you expect to create on average per month in 2026?" (both EN/DA). Replace text `<Input>` with a `<Slider>` (0–1000, step 10) + synced number input, same pattern as Q2.
- **Q6 (SEO Control):** Add an info-box below the toggle explaining what "Perfect e-commerce Shopify SEO and AI LLM Search Visibility in 2026" means — covering technical SEO, structured data, AI crawlability, etc. Make it subtly persuasive that this is complex and expert help is needed.

## 4. Results & Conversion Flow (`ResultsSection.tsx`)
Complete restructure of the results view:
- **Phase 1 (initial):** Show ONLY the time-saving card + "Share my result" button (Web Share API with clipboard fallback)
- **Phase 2 (CTA selection):** Two buttons below results: "Fill out the form" and "Book a meeting with a specialist"
  - Clicking "Fill out the form" → reveals contact form (existing)
  - Clicking "Book a meeting" → reveals a placeholder `<div>` for HubSpot calendar embed (fetches URL from `site_settings`)
- **Phase 3 (fallback):** A "No thanks, I'm not ready" link appears below the CTAs. Clicking it reveals the secondary "See the Quality First" SEO URL form
- Use state machine: `idle` → `form` | `meeting` | `declined`

## 5. Admin Sign-Up Toggle (`AdminLogin.tsx`)
- Add `isSignUp` state toggle
- When in sign-up mode, call `supabase.auth.signUp({ email, password })`
- Show a toggle link: "Don't have an account? Sign Up" / "Already have an account? Sign In"
- After sign-up, show message about email verification

## 6. Translation Updates (`translations.ts`)
Add new keys for both EN and DA:
- `q3TitleNew` — new Q3 question text
- `q3Label` — "products per month"
- `q6InfoTitle`, `q6InfoText` — SEO info-box content
- `shareResult`, `fillFormCta`, `bookMeetingCta`, `notReadyCta`, `hubspotPlaceholder`
- `signUp`, `signIn`, `noAccount`, `hasAccount`, `signUpSuccess`

## 7. Files Changed
| File | Action |
|------|--------|
| `src/assets/Samurai-SEO-site-icon.png` | New (copy from upload) |
| `src/components/Header.tsx` | Edit — logo image |
| `src/pages/Index.tsx` | Edit — remove sidebar, full-width |
| `src/components/TrustSidebar.tsx` | Delete or keep unused |
| `src/components/TrustBanners.tsx` | New — inline trust banners for Q5/Q6 |
| `src/components/QuizFlow.tsx` | Edit — Q2 input, Q3 slider, Q6 info-box, trust banners |
| `src/components/ResultsSection.tsx` | Edit — phased CTA flow, share button |
| `src/pages/AdminLogin.tsx` | Edit — add sign-up toggle |
| `src/i18n/translations.ts` | Edit — new keys for both languages |

