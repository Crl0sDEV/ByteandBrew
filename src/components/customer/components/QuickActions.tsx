import { Button } from "@/components/ui/button";
import { ShoppingBag, Gift, Coffee } from "lucide-react";

interface QuickActionsProps {
  hasCard: boolean;
}

export function QuickActions({ hasCard }: QuickActionsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Button variant="outline" className="flex items-center gap-2 h-16" disabled={!hasCard}>
        <ShoppingBag className="w-5 h-5" />
        <div className="text-left">
          <div className="font-medium">View Full History</div>
          <div className="text-sm text-muted-foreground">All your transactions</div>
        </div>
      </Button>
      <Button variant="outline" className="flex items-center gap-2 h-16" disabled={!hasCard}>
        <Gift className="w-5 h-5" />
        <div className="text-left">
          <div className="font-medium">All Rewards</div>
          <div className="text-sm text-muted-foreground">Browse available rewards</div>
        </div>
      </Button>
      <Button variant="outline" className="flex items-center gap-2 h-16">
        <Coffee className="w-5 h-5" />
        <div className="text-left">
          <div className="font-medium">Menu</div>
          <div className="text-sm text-muted-foreground">View our products</div>
        </div>
      </Button>
    </div>
  );
}