alter table public.habits
  add column if not exists streak int not null default 0,
  add column if not exists last_completed_on date;

alter table public.habits
  drop constraint if exists habits_streak_check;

alter table public.habits
  add constraint habits_streak_check
    check (streak >= 0);

update public.habits h
set last_completed_on = latest.completed_on
from (
  select habit_id, max(completed_on) as completed_on
  from public.habit_logs
  group by habit_id
) as latest
where h.id = latest.habit_id
  and h.last_completed_on is null;
