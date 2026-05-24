# HaBit

Hackathon app for building habits while growing a customizable digital self (your **bit**).

## Stack

- Next.js 16 (App Router)
- Supabase (auth + Postgres)
- Tailwind CSS + shadcn/ui
- Vercel deployment via GitHub Actions

## Features

- **Auth** — email/password sign up and login
- **Onboarding** — focus-topic quiz, then required avatar customization (DB-gated)
- **Avatar** — layered sprite bit with per-layer styles and hex colors, naming, equipped shop items
- **Habits** — catalog + custom habits, streaks, coin rewards
- **Daily quiz** — wellness sliders and journal that affect bit mood
- **Shop** — buy and equip items from `shop_items` / `user_items` (hats, glasses, backgrounds)
- **Profile** — focus topic, vibe, and reminder preferences

## User flow

1. Sign up / sign in
2. **Step 1:** onboarding quiz (focus topic only)
3. **Step 2:** avatar customization (required confirm + bit name)
4. Main app via bottom nav: Bit, Habits, Quiz, Shop, Profile

Onboarding progress is stored in the database (`profiles.onboarding_quiz_complete`, `profiles.onboarding_complete`, `avatar_state.avatar_customized`) and mirrored in auth metadata for fast client checks.

On the **Bit** tab, users view their digital self and open **Style** to customize name, look, and room.

## Local setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create local environment file:

   ```bash
   cp .env.example .env.local
   ```

3. Add Supabase values to `.env.local`:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=
   ```

4. Apply migrations locally (Supabase CLI):

   ```bash
   supabase db reset
   ```

5. Start the app:

   ```bash
   npm run dev
   ```

## Avatar customization data

Stored in `avatar_state`:

| Column | Purpose |
|--------|---------|
| `avatar_name` | Bit display name |
| `skin_color` | Skin layer hex color |
| `pants_style` / `pants_color` | Pants variant id + hex |
| `shoe_style` / `shoe_color` | Shoes variant id + hex |
| `torso_style` / `torso_color` | Torso variant id + hex |
| `eye_type` / `eye_color` | Eyes variant id + hex |
| `head_style` / `head_color` | Head variant id + hex |
| `avatar_customized` | True after onboarding confirm |
| `equipped_items` | Shop item ids currently equipped |
