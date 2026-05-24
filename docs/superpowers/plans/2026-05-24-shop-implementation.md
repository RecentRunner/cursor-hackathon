# Shop Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the existing shop end-to-end so `/shop` shows catalog items, users can buy with coins earned from habits, equip purchases, and see changes on the pet/room.

**Architecture:** Primary fix is an idempotent migration that upserts `shop_items` (empty shop today). Harden buy/equip with Postgres RPCs that atomically deduct coins and update ownership/equip state. Client [`lib/shop-storage.ts`](../../lib/shop-storage.ts) calls RPCs; UI auto-equips after purchase.

**Tech Stack:** Next.js App Router, Supabase Postgres + RLS, existing shop UI in [`components/shop/shop-content.tsx`](../../components/shop/shop-content.tsx)

**Brainstorming decisions:**
- Scope: fix existing shop (not rebuild)
- Blocker: empty shop (`shop_items` not populated in prod)
- Catalog fix: migration upsert (not client fallback)

---

## File map

| File | Responsibility |
|------|----------------|
| `supabase/migrations/20260525100000_shop_catalog_upsert.sql` | Idempotent catalog rows + legacy cleanup |
| `supabase/migrations/20260525110000_shop_purchase_and_equip.sql` | Atomic purchase/equip RPCs |
| `supabase/seed.sql` | Stay in sync with catalog migration |
| `lib/shop-storage.ts` | Call RPCs for buy/equip; keep reads client-side |
| `components/shop/shop-content.tsx` | Auto-equip after buy, surface RPC errors |

---

### Task 1: Shop catalog migration (fixes empty shop)

**Files:**
- Create: `supabase/migrations/20260525100000_shop_catalog_upsert.sql`
- Modify: `supabase/seed.sql`

- [ ] **Step 1: Create catalog migration**

```sql
-- Idempotent shop catalog. Fixes empty shop when seed did not run.

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
  ('pants-3', 'Pants 3', 'pants', 30, '/character/pants/pants-3.png'),
  ('shoes-3', 'Shoes 3', 'shoes', 30, '/character/shoes/shoes-3.png'),
  ('torso-3', 'Torso 3', 'torso', 35, '/character/torso/torso-3.png'),
  ('torso-4', 'Torso 4', 'torso', 40, '/character/torso/torso-4.png'),
  ('head-3', 'Head 3', 'head', 40, '/character/head/head-3.png'),
  ('head-4', 'Head 4', 'head', 45, '/character/head/head-4.png'),
  ('head-5', 'Head 5', 'head', 50, '/character/head/head-5.png'),
  ('head-6', 'Head 6', 'head', 55, '/character/head/head-6.png'),
  ('head-7', 'Head 7', 'head', 60, '/character/head/head-7.png'),
  ('room-night', 'Starlit Night', 'room', 40, ''),
  ('room-forest', 'Mystic Forest', 'room', 50, '')
on conflict (id) do update
set
  name = excluded.name,
  type = excluded.type,
  price = excluded.price,
  image_path = excluded.image_path;
```

- [ ] **Step 2: Align `supabase/seed.sql`**

Replace the delete/insert block in `supabase/seed.sql` with the same catalog SQL as Step 1 (keep file identical to migration body so local `db reset` and prod deploy stay aligned).

- [ ] **Step 3: Verify migration applies locally**

Run: `npx supabase db reset` (if local Supabase running) OR push to linked project: `npx supabase db push --linked`

Run: `npx supabase db execute --linked --sql "select count(*) from shop_items;"`

Expected: `11` rows

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/20260525100000_shop_catalog_upsert.sql supabase/seed.sql
git commit -m "fix: upsert shop catalog via migration so shop is never empty"
```

---

### Task 2: Postgres RPCs for atomic purchase and equip

**Files:**
- Create: `supabase/migrations/20260525110000_shop_purchase_and_equip.sql`

- [ ] **Step 1: Create RPC migration**

```sql
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

  -- Remove any equipped item on the same layer
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
```

- [ ] **Step 2: Apply migration**

Run: `npx supabase db push --linked` (or `db reset` locally)

Expected: functions created without error

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/20260525110000_shop_purchase_and_equip.sql
git commit -m "feat: add atomic shop purchase and equip RPCs"
```

---

### Task 3: Wire client storage to RPCs

**Files:**
- Modify: `lib/shop-storage.ts`

- [ ] **Step 1: Replace `purchaseShopItem`**

Remove `adjustCoins` import usage from purchase path. Replace function body:

```typescript
export async function purchaseShopItem(itemId: string) {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    throw new Error("You must be signed in to purchase items.");
  }

  const supabase = createClient();
  const { data, error } = await supabase.rpc("purchase_shop_item", {
    p_item_id: itemId,
  });

  if (error) {
    throw new Error(error.message);
  }

  notifyHabitPetDataUpdated();

  return {
    id: data.item_id as string,
    name: data.name as string,
    type: data.type as ShopItemRecord["type"],
    price: data.price as number,
    image_path: data.image_path as string,
  };
}
```

- [ ] **Step 2: Replace `equipShopItem`**

```typescript
export async function equipShopItem(itemId: string) {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    throw new Error("You must be signed in to equip items.");
  }

  const supabase = createClient();
  const { error } = await supabase.rpc("equip_shop_item", {
    p_item_id: itemId,
  });

  if (error) {
    throw new Error(error.message);
  }

  notifyHabitPetDataUpdated();
  return getEquippedItems();
}
```

- [ ] **Step 3: Replace `unequipShopItem`**

```typescript
export async function unequipShopItem(itemId: string) {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    throw new Error("You must be signed in to unequip items.");
  }

  const supabase = createClient();
  const { error } = await supabase.rpc("unequip_shop_item", {
    p_item_id: itemId,
  });

  if (error) {
    throw new Error(error.message);
  }

  notifyHabitPetDataUpdated();
  return getEquippedItems();
}
```

- [ ] **Step 4: Remove unused import**

Remove `adjustCoins` from the import at top of `lib/shop-storage.ts` if no longer used. Keep `getCoins` for `getShopInventory`.

- [ ] **Step 5: Run lint**

Run: `npm run lint`

Expected: no errors

- [ ] **Step 6: Commit**

```bash
git add lib/shop-storage.ts
git commit -m "refactor: use Supabase RPCs for shop purchase and equip"
```

---

### Task 4: Shop UX — auto-equip after purchase

**Files:**
- Modify: `components/shop/shop-content.tsx`

- [ ] **Step 1: Auto-equip in `handlePurchase`**

After successful purchase, call equip:

```typescript
const handlePurchase = async (itemId: string) => {
  setPendingItemId(itemId);

  try {
    const item = await purchaseShopItem(itemId);
    await equipShopItem(itemId);
    toast(`Purchased and equipped ${item.name}.`, "success");
    await refreshShop();
  } catch (purchaseError) {
    toast(
      purchaseError instanceof Error
        ? purchaseError.message
        : "Purchase failed.",
      "error",
    );
  } finally {
    setPendingItemId(null);
  }
};
```

- [ ] **Step 2: Run lint and build**

Run: `npm run lint && npm run build`

Expected: pass

- [ ] **Step 3: Commit**

```bash
git add components/shop/shop-content.tsx
git commit -m "feat: auto-equip shop items after purchase"
```

---

### Task 5: End-to-end verification

- [ ] **Step 1: Local smoke test**

1. Start app: `npm run dev`
2. Sign in, complete onboarding if needed
3. Visit `/shop` — expect ~11 items in grouped sections (not empty message)
4. Complete one habit on `/avatar` or `/habits` — shop balance should show 50 points
5. Buy `shoes-3` (30 pts) — balance 20, item shows Equipped
6. Visit `/avatar` — pet shows shoes-3 sprite
7. Visit `/customize` — shoes-3 selectable (owned)
8. Try buying same item again — error toast "already own"
9. Buy with 20 pts an item costing 40 — error "Not enough points", balance unchanged

- [ ] **Step 2: Push and verify deploy**

```bash
git push origin main
```

Watch GitHub Actions Deploy workflow. Expected: success, `supabase db push --include-seed` applies new migrations.

- [ ] **Step 3: Production smoke test**

Visit https://cursor-hackathon-flame.vercel.app/shop — catalog visible, buy/equip flow works.

---

## Success criteria

| Check | Expected |
|-------|----------|
| `/shop` loads items | 11 catalog rows, grouped by layer + rooms |
| Earn coins | +50 per habit complete |
| Buy | Deducts coins, adds `user_items` row |
| Equip | Updates pet sprite / room on `/avatar` |
| Customize | Owned variants unlocked |
| Errors | Clear messages for insufficient points / already owned |

## Out of scope

- Coin rewards from daily quiz
- Next.js API route layer (RPCs sufficient)
- New shop item types beyond existing layer styles + rooms
