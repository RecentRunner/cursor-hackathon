# HaBit

**Calgary Hackathon — Habit**

> Build something that solves a real pain point in your personal life.

HaBit is a Tamagotchi-style habit tracker where the pet is you. Users take care of a pixel-art avatar of themselves by completing custom habits, tracking wellness, and writing short daily reflections. As users build streaks and take better care of themselves, their avatar becomes healthier and happier. If they neglect their habits, the avatar becomes tired or stressed. The goal is to make self-care feel less like a boring checklist and more like a personal game.

---

## The problem

Many people know they should take better care of themselves, but daily habits are easy to ignore when the effects are not immediately visible. Skipping meals, not drinking enough water, sleeping poorly, or neglecting mental wellness can become normal because there is no simple visual reminder of how those choices affect you.

Traditional habit trackers can feel boring or easy to abandon because they usually rely on checklists, streaks, or notifications without creating much emotional connection. The real pain point is that maintaining healthy habits can feel abstract, repetitive, and unrewarding in the short term.

## Our solution

HaBit turns self-care into a daily game. Users build healthier routines by checking off habits, completing a once-per-day wellness quiz, and journaling while a customizable pixel avatar reflects their mood, energy, and health. AI recommends personalized daily tasks based on your focus, wellness, and journal entries. Earn coins, unlock cosmetics, and keep streaks alive so healthy choices feel immediate and rewarding, not abstract.

**Differentiator:** Instead of only showing a checklist or streak number, HaBit gives users a visual and emotional reason to maintain healthy habits. Their real actions directly affect the avatar's mood, health, and appearance.

## Target user

Someone who wants to build healthier routines but struggles with consistency: students, people working long hours at a computer, people with poor sleep schedules, or anyone who forgets basic self-care during busy days. Especially useful for users who enjoy games, customization, pixel art, and visual progress systems.

---

## Features

### Core loop

- **Auth** — email/password sign up and login
- **Onboarding** — focus-topic quiz, then required avatar customization (DB-gated)
- **Daily habits** — custom checkmarks, AI-suggested tasks, streaks, and coin rewards
- **Daily quiz** — once-per-day wellness sliders, sleep inputs, and journal that affect avatar mood
- **Avatar ("bit")** — layered pixel sprite with health/energy gauges, mood reactions, and room backgrounds
- **Shop** — spend coins on clothing, accessories, and room backgrounds; purchase and equip items
- **Profile** — focus topic, avatar vibe, custom habit management, and reminder preferences
- **Journal calendar** — view past daily reflections on the main Bit page

### AI daily task recommendations

Each day, HaBit generates personalized habit suggestions using OpenRouter. Tasks are informed by:

- Onboarding focus topic (Sleep, Movement, Hydration, Mindfulness)
- Today's wellness quiz answers
- Daily journal text

The AI pipeline includes prompt-injection guards, output validation, caching, and deterministic fallbacks if the API is unavailable.

### Avatar system

Each user has a pixel-art avatar built from layered parts:

- Body, hair, eyes, clothing, accessories
- Per-layer color customization
- Mood and health effects driven by wellness input and habit completion

Examples:

- Healthy avatar: cheerful and energetic
- Low energy: tired expression
- Poor sleep: sleepy, worn-down state

### Rewards and streaks

Completing habits builds streaks, improves avatar condition, and earns coins. Coins unlock cosmetic items, outfits, colors, backgrounds, and accessories in the shop.

---

## App pages

| Page | Route | Description |
|------|-------|-------------|
| Landing | `/` | Logged-out overview, sign in / register, avatar preview |
| Bit (main dashboard) | `/avatar` | Avatar habitat, daily tasks, wellness quiz, journal calendar |
| Habits | `/habits` | Scrolls to daily tasks on the Bit page |
| Daily quiz | `/daily/quiz` | Scrolls to wellness check-in on the Bit page |
| Style | `/customize` | Full avatar and room customization |
| Shop | `/shop` | Buy and equip cosmetics with earned coins |
| Profile | `/profile` | Preferences, custom habits, reminders, account |

After login, the bottom nav provides: **Bit**, **Style**, **Habits**, **Quiz**, **Shop**, **Profile**.

### User input categories

**Habit tracker** — Custom daily checkmarks with streaks. Example habits: went for a walk, drank enough water, ate a proper meal, took a screen break.

**Wellness** — Sliders from 1 to 5 plus sleep length and sleep quality.

**Daily journal** — Short reflection text that feeds avatar mood and AI task generation.

---

## User flow

1. Sign up / sign in
2. **Step 1:** onboarding quiz (choose a focus topic)
3. **Step 2:** avatar customization (required confirm + bit name)
4. Main app via bottom nav
5. Complete daily quiz, check off habits, earn coins, customize your bit

Onboarding progress is stored in the database (`profiles.onboarding_quiz_complete`, `profiles.onboarding_complete`, `avatar_state.avatar_customized`) and mirrored in auth metadata for fast client checks.

---

## MVP (24-hour hackathon)

- Logged-out landing page
- Register / login
- Initial registration quiz
- Main avatar page
- Custom habit checkmarks
- Habit streaks
- Once-per-day daily quiz
- Wellness sliders and journal
- Avatar state changes based on user input
- Basic shop page
- Profile / preferences page
- AI-generated daily task recommendations
- Avatar customization and unlockable shop items
- Notifications and reminders
- Journal calendar
- Deployed frontend, backend, and database

---

## Team

| Role | Member | Responsibilities |
|------|--------|------------------|
| UI | Owen | Layout, visual design, avatar display, dashboard screens, UX |
| Backend / Cloud | Harkamal | Database, backend logic, habit tracking, streaks, deployment |
| Backend / Frontend | Mason | Planning, scope, task organization, final presentation |

---

## Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16 (App Router), React 19, Tailwind CSS, shadcn/ui |
| Backend | Next.js API routes, Supabase (auth + Postgres + RLS) |
| AI | OpenRouter (personalized daily habit tasks), Suno for music |
| Deployment | Vercel (frontend), GitHub Actions CI/CD, Supabase migrations |
| Assets | Local pixel-art sprites in `/public` |

### What the backend handles

- User accounts and onboarding quiz results
- Custom habit creation, checkmarks, and streak tracking
- Wellness input and journal entries
- Avatar state updates and shop purchases
- Profile and preference updates
- AI daily task generation and sync

### Database

Stores users, quiz answers, habits, habit completion logs, streaks, wellness entries, journal entries, avatar state, customization options, purchased shop items, and user preferences.

---

## Local setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create local environment file:

   ```bash
   cp .env.example .env.local
   ```

3. Add values to `.env.local`:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=
   OPENROUTER_API_KEY=
   ```

4. Apply migrations locally (Supabase CLI):

   ```bash
   supabase db reset
   ```

5. Start the app:

   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000).

---

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
| `room_background` | Equipped room background id |

---

## Scripts

```bash
npm run dev      # Start development server
npm run build    # Production build
npm run lint     # ESLint
npm start        # Start production server
```
