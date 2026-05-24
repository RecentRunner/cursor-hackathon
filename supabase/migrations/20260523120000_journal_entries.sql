create table if not exists public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  entry_date date not null,
  content text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, entry_date)
);

create index if not exists journal_entries_user_id_entry_date_idx
  on public.journal_entries (user_id, entry_date desc);

alter table public.journal_entries enable row level security;

create policy "Users can read own journal entries"
  on public.journal_entries
  for select
  using (auth.uid() = user_id);

create policy "Users can insert own journal entries"
  on public.journal_entries
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update own journal entries"
  on public.journal_entries
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own journal entries"
  on public.journal_entries
  for delete
  using (auth.uid() = user_id);
