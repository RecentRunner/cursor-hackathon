# Habit Pet

Calgary hackathon app for building habits while caring for a customizable pixel pet.

## Stack

- Next.js 16 (App Router)
- Supabase (auth + Postgres)
- Tailwind CSS + shadcn/ui
- Vercel deployment via GitHub Actions

## Features

- **Auth** — email/password sign up and login
- **Onboarding** — focus-topic quiz, then required avatar customization (DB-gated)
- **Avatar** — layered sprite pet with per-layer styles and hex colors, naming, equipped shop items
- **Habits** — catalog + custom habits, streaks, coin rewards
- **Daily quiz** — wellness sliders and journal that affect pet mood
- **Shop** — buy and equip items from `shop_items` / `user_items` (hats, glasses, backgrounds)
- **Profile** — focus topic, vibe, and reminder preferences

## User flow

1. Sign up / sign in
2. **Step 1:** onboarding quiz (focus topic only)
3. **Step 2:** avatar customization (required confirm + pet name)
4. Main app via bottom nav: Pet, Habits, Quiz, Shop, Profile

Onboarding progress is stored in the database (`profiles.onboarding_quiz_complete`, `profiles.onboarding_complete`, `avatar_state.avatar_customized`) and mirrored in auth metadata for fast client checks.

On the **Pet** tab, users rename their pet and switch between **Overview** and **Customize** sub-tabs.

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
| `avatar_name` | Pet display name |
| `skin_color` | Skin layer hex color |
| `pants_style` / `pants_color` | Pants variant id + hex |
| `shoe_style` / `shoe_color` | Shoes variant id + hex |
| `torso_style` / `torso_color` | Torso variant id + hex |
| `eye_type` / `eye_color` | Eyes variant id + hex |
| `head_style` / `head_color` | Head variant id + hex |
| `avatar_customized` | True after onboarding confirm |
| `equipped_items` | Shop item ids currently equipped |

Style columns are validated against allowed variant ids (`none`, `pants-1`, …). Shop accessories overlay equipped variants at render time without overwriting saved customization.

Sprite assets are added manually under `public/character/{layer}/` (e.g. `public/character/head/head-1.png`). Paths must match the variant ids in `lib/character/presets.ts` and `supabase/seed.sql`.

## Shop

- Sells character layer styles from `public/character/` (`head-1`, `pants-2`, etc.)
- Shop item `id` = variant id, `type` = layer id (`head`, `pants`, `shoes`, `torso`, `eyes`)
- Purchases unlock styles in `user_items`; owned styles appear in Customize and can be equipped from the shop
- Catalog seeded in `supabase/seed.sql`

## Supabase

- Migrations: `supabase/migrations/`
- Seed: `supabase/seed.sql`
- Config: `supabase/config.toml`

Production deploys on push to `main` via `.github/workflows/deploy.yml` (lint, build, `supabase db push --include-seed`, Vercel).

## Routes

| Route | Access |
|-------|--------|
| `/` | Public |
| `/auth/*` | Public |
| `/onboarding/quiz` | Authenticated, quiz incomplete |
| `/onboarding/customize` | Authenticated, quiz complete, avatar not confirmed |
| `/avatar` | Authenticated, onboarding complete |
| `/habits`, `/daily/quiz`, `/shop`, `/profile` | Authenticated app |
| `/character-creator` | Redirects to `/avatar?tab=customize` |
