alter table public.avatar_state
  add column if not exists room_background text not null default 'room-day';

alter table public.avatar_state
  drop constraint if exists avatar_state_room_background_check;

alter table public.avatar_state
  add constraint avatar_state_room_background_check
  check (
    room_background in (
      'room-day',
      'room-dusk',
      'room-night',
      'room-forest',
      'room-space',
      'room-neon'
    )
  );
