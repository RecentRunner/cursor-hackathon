-- Placeholder shop preview images for paid room backgrounds.

update public.shop_items
set image_path = '/shop/room-night.svg'
where id = 'room-night';

update public.shop_items
set image_path = '/shop/room-forest.svg'
where id = 'room-forest';
