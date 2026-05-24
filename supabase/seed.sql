insert into shop_items (id, name, type, price, image_path)
values
  ('hat_blue', 'Blue Hat', 'accessory', 20, '/items/hat-blue.png'),
  ('glasses_round', 'Round Glasses', 'accessory', 30, '/items/glasses-round.png'),
  ('room_sunset', 'Sunset Room', 'background', 40, '/backgrounds/room-sunset.png')
on conflict (id) do update
set
  name = excluded.name,
  type = excluded.type,
  price = excluded.price,
  image_path = excluded.image_path;
