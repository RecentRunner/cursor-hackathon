-- New users start with 100 free shop points.
alter table public.avatar_state
  alter column coins set default 100;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;

  insert into public.avatar_state (user_id, coins)
  values (new.id, 100)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

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
    insert into public.avatar_state (user_id, coins) values (v_user_id, 100);
    v_coins := 100;
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
