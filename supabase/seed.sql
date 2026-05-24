-- Shop-only catalog items (variant ids 3+ and paid rooms).

insert into public.shop_items (id, name, type, price, image_path)
values
  ('head-3', 'Mohawk', 'head', 40, '/character/head/head-3.png'),
  ('head-4', 'Long', 'head', 45, '/character/head/head-4.png'),
  ('head-5', 'Pixie', 'head', 50, '/character/head/head-5.png'),
  ('head-6', 'Middle-part', 'head', 55, '/character/head/head-6.png'),
  ('head-7', 'Bun', 'head', 60, '/character/head/head-7.png'),
  ('torso-3', 'Vest', 'torso', 35, '/character/torso/torso-3.png'),
  ('torso-4', 'Robe', 'torso', 40, '/character/torso/torso-4.png'),
  ('pants-3', 'Skirt', 'pants', 30, '/character/pants/pants-3.png'),
  ('shoes-3', 'Loafers', 'shoes', 30, '/character/shoes/shoes-3.png'),
  ('room-3', 'Forest', 'room', 40, '/room/room-3.png'),
  ('room-4', 'Night', 'room', 50, '/room/room-4.png')
on conflict (id) do update
set
  name = excluded.name,
  type = excluded.type,
  price = excluded.price,
  image_path = excluded.image_path;
