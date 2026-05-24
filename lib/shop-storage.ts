import { notifyHabitPetDataUpdated } from "@/lib/app-events";
import { getCoins } from "@/lib/avatar-progression-storage";
import { type ShopItemRecord } from "@/lib/shop-catalog";
import { createClient } from "@/lib/supabase/client";

async function getAuthenticatedUserId() {
  const supabase = createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user.id;
}

export async function getShopItems(): Promise<ShopItemRecord[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("shop_items")
    .select("id, name, type, price, image_path")
    .order("price", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as ShopItemRecord[];
}

export async function getOwnedItemIds(): Promise<string[]> {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return [];
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from("user_items")
    .select("item_id")
    .eq("user_id", userId);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => row.item_id as string);
}

export async function getEquippedItems(): Promise<string[]> {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return [];
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from("avatar_state")
    .select("equipped_items")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data?.equipped_items as string[] | null) ?? [];
}

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

export async function getEquippedRoomBackground(): Promise<string> {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return "room-day";
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from("avatar_state")
    .select("room_background")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    if (/room_background/i.test(error.message)) {
      return "room-day";
    }

    throw new Error(error.message);
  }

  return (data?.room_background as string | null) ?? "room-day";
}

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

export async function getShopInventory() {
  const [items, ownedItemIds, equippedItems, equippedRoomBackground, coins] =
    await Promise.all([
      getShopItems(),
      getOwnedItemIds(),
      getEquippedItems(),
      getEquippedRoomBackground(),
      getCoins(),
    ]);

  return { items, ownedItemIds, equippedItems, equippedRoomBackground, coins };
}
