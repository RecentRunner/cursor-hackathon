-- Remove duplicate active habits with the same name for a user.
delete from public.habits duplicate
using public.habits keeper
where duplicate.user_id = keeper.user_id
  and duplicate.name = keeper.name
  and duplicate.active = true
  and keeper.active = true
  and duplicate.id <> keeper.id
  and duplicate.created_at > keeper.created_at;

create unique index if not exists habits_user_id_name_active_unique
  on public.habits (user_id, name)
  where active = true;
