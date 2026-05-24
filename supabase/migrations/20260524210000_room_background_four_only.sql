alter table public.avatar_state
  drop constraint if exists avatar_state_room_background_check;

alter table public.avatar_state
  add constraint avatar_state_room_background_check
  check (
    room_background in (
      'room-day',
      'room-dusk',
      'room-night',
      'room-forest'
    )
  );

update public.avatar_state
set room_background = 'room-day'
where room_background in ('room-space', 'room-neon');

delete from public.user_items
where item_id in ('room-space', 'room-neon');

delete from public.shop_items
where id in ('room-space', 'room-neon');
