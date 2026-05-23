# Habit Pet

Bootstrap repo for the Calgary hackathon Habit Pet project.

## Stack

- Next.js
- Supabase
- Vercel
- GitHub

## Scope of this bootstrap

This repo currently stops at:

- Next.js app scaffold
- Supabase auth wiring from the starter
- environment variable template
- deployment-ready project structure

This repo does not yet include MVP feature pages, avatar logic, habits, streaks, or shop logic.

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

4. Start the app:

   ```bash
   npm run dev
   ```

5. Create a production build when needed:

   ```bash
   npm run build
   ```

## Supabase

Create a Supabase project, then copy the project URL and anon key from **Project Settings > API** into `.env.local` and Vercel project environment variables.

The starter also supports Supabase's publishable key name, but this repo documents the anon key convention from the project plan.

### Database workflow

- Schema migrations live under `supabase/migrations/`.
- Baseline catalog data lives in `supabase/seed.sql` and is safe to rerun during deploys because it uses idempotent upserts.
- Local CLI config lives in `supabase/config.toml` for `supabase start`, `supabase db reset`, and related commands.
- Production database sync runs from GitHub Actions on `main` using `supabase db push --linked --include-seed` before the app deploy relies on those changes.

## Deploy

This repo includes `.github/workflows/deploy.yml`, which runs on pushes to `main`.

The workflow:

- checks out the repo
- runs `npm ci`, `npm run lint`, and `npm run build`
- links the Supabase CLI to the production project
- applies pending database migrations and reruns `supabase/seed.sql` via `supabase db push --linked --include-seed`
- deploys the app to Vercel production only after the database sync succeeds

### Required GitHub secrets

- `SUPABASE_ACCESS_TOKEN`
- `SUPABASE_PROJECT_REF`
- `SUPABASE_DB_PASSWORD`
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

### Required Vercel environment variables

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Frontend and backend are both served from this Next.js app. Supabase provides auth and database services.
