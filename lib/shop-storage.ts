import { notifyHabitPetDataUpdated } from "@/lib/app-events";
import { getCoins, spendCoins, adjustCoins } from "@/lib/avatar-progression-storage";
import { createClient } from "@/lib/supabase/client";

export type ShopItem = {
  id: string;
  name: string;
  type: string;
  price: number;
};

type ShopItemRow = {
  id: string;
  name: string;
  type: string;
};

function getPriceForType(type: string) {
  switch (type.toLowerCase()) {
    case "accessory":
      return 30;
    case "background":
      return 40;
    case "outfit":
      return 50;
    case "consumable":
    case "snack":
      return 25;
    default:
      return 50;
  }
}

function mapShopItemRow(row: ShopItemRow): ShopItem {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    price: getPriceForType(row.type),
  };
}

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

export async function getShopItems(): Promise<ShopItem[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("shop_items")
    .select("id, name, type")
    .order("type", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as ShopItemRow[]).map(mapShopItemRow);
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

export async function purchaseShopItem(itemId: string): Promise<number> {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    throw new Error("You must be signed in to purchase items.");
  }

  const supabase = createClient();
  const { data: itemRow, error: itemError } = await supabase
    .from("shop_items")
    .select("id, name, type")
    .eq("id", itemId)
    .maybeSingle();

  if (itemError) {
    throw new Error(itemError.message);
  }

  if (!itemRow) {
    throw new Error("Item not found.");
  }

  const item = mapShopItemRow(itemRow as ShopItemRow);

  const { data: existingPurchase, error: existingError } = await supabase
    .from("user_items")
    .select("item_id")
    .eq("user_id", userId)
    .eq("item_id", itemId)
    .maybeSingle();

  if (existingError) {
    throw new Error(existingError.message);
  }

  if (existingPurchase) {
    throw new Error("You already own this item.");
  }

  const remainingCoins = await spendCoins(item.price);

  const { error: purchaseError } = await supabase.from("user_items").insert({
    user_id: userId,
    item_id: itemId,
  });

  if (purchaseError) {
    await adjustCoins(item.price);
    throw new Error(purchaseError.message);
  }

  notifyHabitPetDataUpdated();
  return remainingCoins;
}

export async function getShopState(): Promise<{
  coins: number;
  items: ShopItem[];
  ownedItemIds: string[];
}> {
  const [coins, items, ownedItemIds] = await Promise.all([
    getCoins(),
    getShopItems(),
    getOwnedItemIds(),
  ]);

  return { coins, items, ownedItemIds };
}
