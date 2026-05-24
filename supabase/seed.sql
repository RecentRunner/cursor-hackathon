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
  ('pants-3', 'Pleated Skirt', 'pants', 30, '/character/pants/pants-3.png'),
  ('shoes-3', 'Neon Glow Runners', 'shoes', 30, '/character/shoes/shoes-3.png'),
  ('torso-3', 'Button-Up Shirt', 'torso', 35, '/character/torso/torso-3.png'),
  ('torso-4', 'Crimson Blouse', 'torso', 40, '/character/torso/torso-4.png'),
  ('head-3', 'Retro Snapback Cap', 'head', 40, '/character/head/head-3.png'),
  ('head-4', 'Long Hair', 'head', 45, '/character/head/head-4.png'),
  ('head-5', 'Shoulder-Length Hair', 'head', 50, '/character/head/head-5.png'),
  ('head-6', 'Flowing Side Locks', 'head', 55, '/character/head/head-6.png'),
  ('head-7', 'Messy Shag Cut', 'head', 60, '/character/head/head-7.png'),
  ('room-3', 'Starlit Night', 'room', 40, '/room/room-3.png'),
  ('room-4', 'Mystic Forest', 'room', 50, '/room/room-4.png')
on conflict (id) do update
set
  name = excluded.name,
  type = excluded.type,
  price = excluded.price,
  image_path = excluded.image_path;
