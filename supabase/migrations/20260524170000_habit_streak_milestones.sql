alter table public.habits
  add column if not exists claimed_streak_milestones int[] not null default '{}';
