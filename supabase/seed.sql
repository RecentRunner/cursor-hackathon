-- Character layer styles sold in the shop (id = variant id, type = layer id).

delete from public.user_items
where item_id in ('hat_blue', 'glasses_round', 'room_sunset');

delete from public.shop_items
where id in ('hat_blue', 'glasses_round', 'room_sunset');

insert into public.shop_items (id, name, type, price, image_path)
values
  ('pants-1', 'Pants 1', 'pants', 20, '/character/pants/pants-1.png'),
  ('pants-2', 'Pants 2', 'pants', 25, '/character/pants/pants-2.png'),
  ('pants-3', 'Pants 3', 'pants', 30, '/character/pants/pants-3.png'),
  ('shoes-1', 'Shoes 1', 'shoes', 20, '/character/shoes/shoes-1.png'),
  ('shoes-2', 'Shoes 2', 'shoes', 25, '/character/shoes/shoes-2.png'),
  ('shoes-3', 'Shoes 3', 'shoes', 30, '/character/shoes/shoes-3.png'),
  ('torso-1', 'Torso 1', 'torso', 25, '/character/torso/torso-1.png'),
  ('torso-2', 'Torso 2', 'torso', 30, '/character/torso/torso-2.png'),
  ('torso-3', 'Torso 3', 'torso', 35, '/character/torso/torso-3.png'),
  ('torso-4', 'Torso 4', 'torso', 40, '/character/torso/torso-4.png'),
  ('eyes-1', 'Eyes 1', 'eyes', 15, '/character/eyes/eyes-1.png'),
  ('eyes-2', 'Eyes 2', 'eyes', 20, '/character/eyes/eyes-2.png'),
  ('head-1', 'Head 1', 'head', 30, '/character/head/head-1.png'),
  ('head-2', 'Head 2', 'head', 35, '/character/head/head-2.png'),
  ('head-3', 'Head 3', 'head', 40, '/character/head/head-3.png'),
  ('head-4', 'Head 4', 'head', 45, '/character/head/head-4.png'),
  ('head-5', 'Head 5', 'head', 50, '/character/head/head-5.png'),
  ('head-6', 'Head 6', 'head', 55, '/character/head/head-6.png'),
  ('head-7', 'Head 7', 'head', 60, '/character/head/head-7.png')
on conflict (id) do update
set
  name = excluded.name,
  type = excluded.type,
  price = excluded.price,
  image_path = excluded.image_path;
