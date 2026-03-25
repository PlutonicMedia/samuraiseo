

## Plan: Header logo swap, form updates, and "Start over" button

### 1. Replace logo across the app
- Copy `user-uploads://Logo-plutonic-stor_1.png` to `src/assets/plutonic-logo.png`
- In **Header.tsx**, **Admin.tsx**, and **AdminLogin.tsx**: replace `samurai-logo.png` import with the new logo
- Wrap the logo `<img>` in an `<a href="https://samurai.plutonic.dk/">` link (opens in same tab or new tab as appropriate)

### 2. Add "Role" field to contact form
- Add `contactRole` translation key: EN = "Role", DA = "Rolle"
- Add `role` to the `contact` state object and `contactSchema` in **ResultsSection.tsx**
- Add a new `<Input>` for role between email and website fields
- Include `role` in the Supabase insert for `quiz_submissions` (requires adding a `role` column to the table via migration)

### 3. Fix website field — remove URL type
- Change `type="url"` to `type="text"` on the website input (line 502 in ResultsSection.tsx)
- The Zod schema already validates as plain text (`z.string().trim().min(1).max(200)`)

### 4. Add "Start over" button in header
- Add `startOver` translation key: EN = "Start over", DA = "Start forfra"
- In **Header.tsx**, add a button next to the language switcher that reloads the page (`window.location.href = "/"`) to reset quiz state
- Style it consistently with the language toggle (rounded-full, transparent, white text)

### Database migration
- Add `role` column (nullable text) to `quiz_submissions` table

### Files changed
- `src/assets/plutonic-logo.png` (new)
- `src/components/Header.tsx`
- `src/pages/Admin.tsx`
- `src/pages/AdminLogin.tsx`
- `src/components/ResultsSection.tsx`
- `src/i18n/translations.ts`
- New migration for `role` column

