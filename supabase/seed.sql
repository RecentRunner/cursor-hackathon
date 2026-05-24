-- Character layer styles sold in the shop (id = variant id, type = layer id).

delete from public.user_items
where item_id in ('hat_blue', 'glasses_round', 'room_sunset', 'room-space', 'room-neon');

delete from public.shop_items
where id in (
  'hat_blue',
  'glasses_round',
  'room_sunset',
  'room-space',
  'room-neon',
  'pants-1',
  'pants-2',
  'shoes-1',
  'shoes-2',
  'torso-1',
  'torso-2',
  'eyes-1',
  'eyes-2',
  'head-1',
  'head-2'
);

insert into public.shop_items (id, name, type, price, image_path)
values
  ('pants-3', 'Utility Cargo Pants', 'pants', 30, '/character/pants/pants-3.png'),
  ('shoes-3', 'Neon Glow Runners', 'shoes', 30, '/character/shoes/shoes-3.png'),
  ('torso-3', 'Cropped Tank Top', 'torso', 35, '/character/torso/torso-3.png'),
  ('torso-4', 'Crimson Plate Armor', 'torso', 40, '/character/torso/torso-4.png'),
  ('head-3', 'Retro Snapback Cap', 'head', 40, '/character/head/head-3.png'),
  ('head-4', 'Fiery Side Mohawk', 'head', 45, '/character/head/head-4.png'),
  ('head-5', 'Crested Warrior Helm', 'head', 50, '/character/head/head-5.png'),
  ('head-6', 'Flowing Side Locks', 'head', 55, '/character/head/head-6.png'),
  ('head-7', 'Messy Shag Cut', 'head', 60, '/character/head/head-7.png'),
  ('room-night', 'Starlit Night', 'room', 40, '/shop/room-night.svg'),
  ('room-forest', 'Mystic Forest', 'room', 50, '/shop/room-forest.svg')
on conflict (id) do update
set
  name = excluded.name,
  type = excluded.type,
  price = excluded.price,
  image_path = excluded.image_path;
