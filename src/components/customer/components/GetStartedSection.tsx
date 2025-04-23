import { Card as UICard } from "@/components/ui/card";
import { CreditCard, ShoppingBag, Gift } from "lucide-react";

interface GetStartedSectionProps {
  hasCard: boolean;
}

export function GetStartedSection({ hasCard }: GetStartedSectionProps) {
  if (hasCard) return null;

  return (
    <div className="bg-gray-50 p-6 rounded-lg border">
      <h2 className="text-xl font-semibold mb-2">Get Started with Loyalty Rewards</h2>
      <p className="text-gray-600 mb-4">
        You don't have a loyalty card yet. Visit our store to register and get your card to start earning points today!
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <UICard className="p-4">
          <CreditCard className="h-6 w-6 mb-2 text-primary" />
          <h3 className="font-medium">Get Your Card</h3>
          <p className="text-sm text-muted-foreground">Register in-store to receive your loyalty card</p>
        </UICard>
        <UICard className="p-4">
          <ShoppingBag className="h-6 w-6 mb-2 text-primary" />
          <h3 className="font-medium">Start Earning</h3>
          <p className="text-sm text-muted-foreground">Make purchases to accumulate points</p>
        </UICard>
        <UICard className="p-4">
          <Gift className="h-6 w-6 mb-2 text-primary" />
          <h3 className="font-medium">Redeem Rewards</h3>
          <p className="text-sm text-muted-foreground">Exchange points for exclusive benefits</p>
        </UICard>
      </div>
    </div>
  );
}