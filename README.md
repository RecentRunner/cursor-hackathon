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

This repo does not yet include MVP feature pages, SQL schema, avatar logic, habits, streaks, or shop logic.

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

## Deploy

1. Push the repo to GitHub.
2. Import the repo into Vercel.
3. Add the same Supabase environment variables in Vercel.
4. Deploy.

Frontend and backend are both served from this Next.js app. Supabase provides auth and database services.
