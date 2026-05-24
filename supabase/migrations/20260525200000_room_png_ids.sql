-- Room backgrounds: PNG assets in /public/room with ids room-1 .. room-4.
-- Drop legacy check before rewriting values (old ids: room-day, room-dusk, etc.).
alter table
  public.avatar_state drop constraint if exists avatar_state_room_background_check;

update
  public.avatar_state
set
  room_background = case
    room_background
    when 'room-day' then 'room-1'
    when 'room-dusk' then 'room-2'
    when 'room-night' then 'room-3'
    when 'room-forest' then 'room-4'
    when 'room-space' then 'room-1'
    when 'room-neon' then 'room-1'
    else room_background
  end
where
  room_background in (
    'room-day',
    'room-dusk',
    'room-night',
    'room-forest',
    'room-space',
    'room-neon'
  );

-- Rows already on new ids or unknown values: coerce to a valid default.
update
  public.avatar_state
set
  room_background = 'room-1'
where
  room_background is null
  or room_background not in ('room-1', 'room-2', 'room-3', 'room-4');

alter table
  public.avatar_state
alter column
  room_background
set
  default 'room-1';

alter table
  public.avatar_state
add
  constraint avatar_state_room_background_check check (
    room_background in (
      'room-1',
      'room-2',
      'room-3',
      'room-4'
    )
  );

update
  public.user_items
set
  item_id = case
    item_id
    when 'room-night' then 'room-3'
    when 'room-forest' then 'room-4'
    else item_id
  end
where
  item_id in ('room-night', 'room-forest');

delete from
  public.shop_items
where
  id in ('room-night', 'room-forest');

insert into
  public.shop_items (id, name, type, price, image_path)
values
  (
    'room-3',
    'Starlit Night',
    'room',
    40,
    '/room/room-3.png'
  ),
  (
    'room-4',
    'Mystic Forest',
    'room',
    50,
    '/room/room-4.png'
  ) on conflict (id) do
update
set
  name = excluded.name,
  type = excluded.type,
  price = excluded.price,
  image_path = excluded.image_path;