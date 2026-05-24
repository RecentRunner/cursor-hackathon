import { notifyHabitPetDataUpdated } from "@/lib/app-events";
import { adjustCoins, getCoins } from "@/lib/avatar-progression-storage";
import {
  parseVariantId,
  type ShopItemRecord,
} from "@/lib/shop-catalog";
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
  const { data: item, error: itemError } = await supabase
    .from("shop_items")
    .select("id, name, type, price, image_path")
    .eq("id", itemId)
    .maybeSingle();

  if (itemError) {
    throw new Error(itemError.message);
  }

  if (!item) {
    throw new Error("That shop item is no longer available.");
  }

  const owned = await getOwnedItemIds();

  if (owned.includes(itemId)) {
    throw new Error("You already own this item.");
  }

  const coins = await getCoins();

  if (coins < item.price) {
    throw new Error("Not enough points for this purchase.");
  }

  await adjustCoins(-item.price);

  const { error: purchaseError } = await supabase.from("user_items").insert({
    user_id: userId,
    item_id: itemId,
  });

  if (purchaseError) {
    await adjustCoins(item.price);
    throw new Error(purchaseError.message);
  }

  notifyHabitPetDataUpdated();
  return {
    ...(item as ShopItemRecord),
    type: item.type as ShopItemRecord["type"],
  };
}

export async function equipShopItem(itemId: string) {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    throw new Error("You must be signed in to equip items.");
  }

  const owned = await getOwnedItemIds();

  if (!owned.includes(itemId)) {
    throw new Error("Purchase this item before equipping it.");
  }

  const supabase = createClient();
  const { data: item, error: itemError } = await supabase
    .from("shop_items")
    .select("id, type")
    .eq("id", itemId)
    .maybeSingle();

  if (itemError || !item) {
    throw new Error("Could not find that shop item.");
  }

  const current = await getEquippedItems();
  const nextStyle = parseVariantId(itemId);

  const withoutSameLayer = current.filter((equippedId) => {
    if (equippedId === itemId) {
      return false;
    }

    const equippedStyle = parseVariantId(equippedId);

    if (!nextStyle || !equippedStyle) {
      return true;
    }

    return equippedStyle.layerId !== nextStyle.layerId;
  });
  const next = [...withoutSameLayer, itemId];

  const { error } = await supabase
    .from("avatar_state")
    .update({
      equipped_items: next,
      equipped_item: itemId,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);

  if (error) {
    throw new Error(error.message);
  }

  notifyHabitPetDataUpdated();
  return next;
}

export async function unequipShopItem(itemId: string) {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    throw new Error("You must be signed in to unequip items.");
  }

  const current = await getEquippedItems();
  const next = current.filter((id) => id !== itemId);

  const supabase = createClient();
  const { error } = await supabase
    .from("avatar_state")
    .update({
      equipped_items: next,
      equipped_item: next[0] ?? "none",
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);

  if (error) {
    throw new Error(error.message);
  }

  notifyHabitPetDataUpdated();
  return next;
}

export async function getShopInventory() {
  const [items, ownedItemIds, equippedItems, coins] = await Promise.all([
    getShopItems(),
    getOwnedItemIds(),
    getEquippedItems(),
    getCoins(),
  ]);

  return { items, ownedItemIds, equippedItems, coins };
}
