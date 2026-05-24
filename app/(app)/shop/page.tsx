import { AppShell } from "@/components/layout/app-shell";
import { ShopContent } from "@/components/shop/shop-content";

export default function ShopPage() {
  return (
    <AppShell
      title="Shop"
      description="Spend points earned from habits and daily check-ins."
    >
      <ShopContent />
    </AppShell>
  );
}
