alter table profiles enable row level security;
alter table habits enable row level security;
alter table habit_logs enable row level security;
alter table daily_entries enable row level security;
alter table avatar_state enable row level security;
alter table shop_items enable row level security;
alter table user_items enable row level security;

alter table habits
  add constraint habits_id_user_id_unique unique (id, user_id);

alter table habit_logs
  add constraint habit_logs_habit_id_user_id_fkey
    foreign key (habit_id, user_id)
    references habits (id, user_id)
    on delete cascade;

create policy "profiles_select_own"
  on profiles
  for select
  to authenticated
  using (id = auth.uid());

create policy "profiles_insert_own"
  on profiles
  for insert
  to authenticated
  with check (id = auth.uid());

create policy "profiles_update_own"
  on profiles
  for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "habits_manage_own"
  on habits
  for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "habit_logs_manage_own"
  on habit_logs
  for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "daily_entries_manage_own"
  on daily_entries
  for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "avatar_state_manage_own"
  on avatar_state
  for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "shop_items_read_all"
  on shop_items
  for select
  to anon, authenticated
  using (true);

create policy "user_items_manage_own"
  on user_items
  for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
