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

export async function getCoins(): Promise<number> {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return 0;
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from("avatar_state")
    .select("coins")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    const { error: insertError } = await supabase
      .from("avatar_state")
      .insert({ user_id: userId, coins: 0 });

    if (insertError) {
      throw new Error(insertError.message);
    }

    return 0;
  }

  return data.coins ?? 0;
}

export async function adjustCoins(delta: number): Promise<number> {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    throw new Error("You must be signed in to earn points.");
  }

  const currentCoins = await getCoins();
  const nextCoins = Math.max(0, currentCoins + delta);

  const supabase = createClient();
  const { error } = await supabase
    .from("avatar_state")
    .update({
      coins: nextCoins,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);

  if (error) {
    throw new Error(error.message);
  }

  return nextCoins;
}
