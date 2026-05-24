-- Atomic shop purchase and equip operations.

create or replace function public.purchase_shop_item(p_item_id text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_item public.shop_items%rowtype;
  v_coins int;
begin
  if v_user_id is null then
    raise exception 'You must be signed in to purchase items.';
  end if;

  select * into v_item from public.shop_items where id = p_item_id;
  if not found then
    raise exception 'That shop item is no longer available.';
  end if;

  if exists (
    select 1 from public.user_items
    where user_id = v_user_id and item_id = p_item_id
  ) then
    raise exception 'You already own this item.';
  end if;

  select coins into v_coins
  from public.avatar_state
  where user_id = v_user_id
  for update;

  if not found then
    insert into public.avatar_state (user_id, coins) values (v_user_id, 0);
    v_coins := 0;
  end if;

  if v_coins < v_item.price then
    raise exception 'Not enough points for this purchase.';
  end if;

  update public.avatar_state
  set coins = v_coins - v_item.price, updated_at = now()
  where user_id = v_user_id;

  insert into public.user_items (user_id, item_id)
  values (v_user_id, p_item_id);

  return jsonb_build_object(
    'item_id', v_item.id,
    'name', v_item.name,
    'type', v_item.type,
    'price', v_item.price,
    'image_path', v_item.image_path,
    'coins', v_coins - v_item.price
  );
end;
$$;

create or replace function public.equip_shop_item(p_item_id text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_item public.shop_items%rowtype;
  v_equipped text[];
  v_layer text;
begin
  if v_user_id is null then
    raise exception 'You must be signed in to equip items.';
  end if;

  if not exists (
    select 1 from public.user_items
    where user_id = v_user_id and item_id = p_item_id
  ) then
    raise exception 'Purchase this item before equipping it.';
  end if;

  select * into v_item from public.shop_items where id = p_item_id;
  if not found then
    raise exception 'Could not find that shop item.';
  end if;

  if v_item.type = 'room' then
    update public.avatar_state
    set room_background = p_item_id, updated_at = now()
    where user_id = v_user_id;

    return jsonb_build_object('equipped_room', p_item_id);
  end if;

  select equipped_items into v_equipped
  from public.avatar_state
  where user_id = v_user_id
  for update;

  v_equipped := coalesce(v_equipped, '{}');

  v_equipped := array(
    select e from unnest(v_equipped) as e
    where e = p_item_id
       or not (e like v_item.type || '-%')
  );

  v_equipped := array_append(v_equipped, p_item_id);
  v_layer := v_item.type;

  update public.avatar_state
  set
    equipped_items = v_equipped,
    equipped_item = p_item_id,
    head_style = case when v_layer = 'head' then p_item_id else head_style end,
    torso_style = case when v_layer = 'torso' then p_item_id else torso_style end,
    pants_style = case when v_layer = 'pants' then p_item_id else pants_style end,
    shoe_style = case when v_layer = 'shoes' then p_item_id else shoe_style end,
    eye_type = case when v_layer = 'eyes' then p_item_id else eye_type end,
    updated_at = now()
  where user_id = v_user_id;

  return jsonb_build_object('equipped_items', to_jsonb(v_equipped));
end;
$$;

create or replace function public.unequip_shop_item(p_item_id text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_item public.shop_items%rowtype;
  v_equipped text[];
  v_layer text;
begin
  if v_user_id is null then
    raise exception 'You must be signed in to unequip items.';
  end if;

  select * into v_item from public.shop_items where id = p_item_id;
  if not found then
    raise exception 'Could not find that shop item.';
  end if;

  if v_item.type = 'room' then
    raise exception 'Room backgrounds cannot be unequipped.';
  end if;

  select equipped_items into v_equipped
  from public.avatar_state
  where user_id = v_user_id
  for update;

  v_equipped := coalesce(v_equipped, '{}');
  v_equipped := array(select e from unnest(v_equipped) as e where e <> p_item_id);
  v_layer := v_item.type;

  update public.avatar_state
  set
    equipped_items = v_equipped,
    equipped_item = coalesce(v_equipped[1], 'none'),
    head_style = case when v_layer = 'head' then 'none' else head_style end,
    torso_style = case when v_layer = 'torso' then 'none' else torso_style end,
    pants_style = case when v_layer = 'pants' then 'none' else pants_style end,
    shoe_style = case when v_layer = 'shoes' then 'none' else shoe_style end,
    eye_type = case when v_layer = 'eyes' then 'none' else eye_type end,
    updated_at = now()
  where user_id = v_user_id;

  return jsonb_build_object('equipped_items', to_jsonb(v_equipped));
end;
$$;

revoke all on function public.purchase_shop_item(text) from public;
revoke all on function public.equip_shop_item(text) from public;
revoke all on function public.unequip_shop_item(text) from public;

grant execute on function public.purchase_shop_item(text) to authenticated;
grant execute on function public.equip_shop_item(text) to authenticated;
grant execute on function public.unequip_shop_item(text) to authenticated;
