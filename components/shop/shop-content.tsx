"use client";

import { useCallback, useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { HABIT_PET_DATA_UPDATED_EVENT } from "@/lib/app-events";
import { getCoins } from "@/lib/avatar-progression-storage";

const shopItems = [
  {
    id: "hat",
    name: "Pixel cap",
    price: 50,
    description: "A cozy cap for your habit pet.",
  },
  {
    id: "bed",
    name: "Cloud bed",
    price: 120,
    description: "Boost recovery after tough days.",
  },
  {
    id: "snack",
    name: "Berry snack",
    price: 25,
    description: "A small treat for good streaks.",
  },
];

export function ShopContent() {
  const [coins, setCoins] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refreshCoins = useCallback(async () => {
    try {
      setError(null);
      setCoins(await getCoins());
    } catch (refreshError) {
      setError(
        refreshError instanceof Error
          ? refreshError.message
          : "Could not load your balance.",
      );
      setCoins(0);
    }
  }, []);

  useEffect(() => {
    void refreshCoins();

    window.addEventListener(HABIT_PET_DATA_UPDATED_EVENT, refreshCoins);
    return () => {
      window.removeEventListener(HABIT_PET_DATA_UPDATED_EVENT, refreshCoins);
    };
  }, [refreshCoins]);

  return (
    <>
      <div className="mb-4 flex items-center justify-between rounded-lg border bg-muted/40 px-4 py-3">
        <span className="text-sm text-muted-foreground">Your balance</span>
        <Badge variant="secondary">
          {coins === null ? "..." : `${coins} points`}
        </Badge>
      </div>

      {error ? <p className="mb-4 text-sm text-red-500">{error}</p> : null}

      <div className="grid gap-4">
        {shopItems.map((item) => {
          const canAfford = coins !== null && coins >= item.price;

          return (
            <Card key={item.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-base">{item.name}</CardTitle>
                    <CardDescription>{item.description}</CardDescription>
                  </div>
                  <Badge>{item.price} pts</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full"
                  variant="outline"
                  disabled={coins === null || !canAfford}
                >
                  {canAfford ? "Buy" : "Not enough points"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </>
  );
}
