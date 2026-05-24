import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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

export default function ShopPage() {
  return (
    <AppShell
      title="Shop"
      description="Spend points earned from habits and daily check-ins."
    >
      <div className="mb-4 flex items-center justify-between rounded-lg border bg-muted/40 px-4 py-3">
        <span className="text-sm text-muted-foreground">Your balance</span>
        <Badge variant="secondary">120 points</Badge>
      </div>

      <div className="grid gap-4">
        {shopItems.map((item) => (
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
              <Button className="w-full" variant="outline">
                Buy
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
