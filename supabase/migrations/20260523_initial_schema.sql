create extension if not exists pgcrypto;

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  focus_topics text[] default '{}',
  onboarding_complete boolean default false,
  created_at timestamptz default now()
);

create table habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  active boolean default true,
  created_at timestamptz default now()
);

create table habit_logs (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid references habits(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  completed_on date not null default current_date,
  created_at timestamptz default now(),
  unique (habit_id, completed_on)
);

create table daily_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  entry_date date not null default current_date,
  mood int check (mood between 1 and 5),
  stress int check (stress between 1 and 5),
  energy int check (energy between 1 and 5),
  sleep_hours numeric,
  sleep_quality int check (sleep_quality between 1 and 5),
  journal text,
  created_at timestamptz default now(),
  unique (user_id, entry_date)
);

create table avatar_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  avatar_name text default 'Pixel Me',
  mood_state text default 'neutral',
  health int default 50,
  energy int default 50,
  coins int default 0,
  streak int default 0,
  equipped_item text default 'none',
  updated_at timestamptz default now()
);

create table shop_items (
  id text primary key,
  name text not null,
  type text not null,
  price int not null,
  image_path text not null
);

create table user_items (
  user_id uuid references auth.users(id) on delete cascade,
  item_id text references shop_items(id) on delete cascade,
  purchased_at timestamptz default now(),
  primary key (user_id, item_id)
);
