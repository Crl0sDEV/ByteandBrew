import { Card as UICard, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ShoppingCart, Users, Gift, CreditCard } from "lucide-react";
import { AdminStats } from "../types";

interface StatCardsProps {
  stats: AdminStats;
}

export function StatCards({ stats }: StatCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <UICard>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Today's Sales</CardTitle>
          <ShoppingCart className="w-4 h-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">₱{stats.todaySales.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground mt-1">View details</p>
        </CardContent>
      </UICard>
      <UICard>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Members</CardTitle>
          <Users className="w-4 h-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.activeMembers}</div>
          <p className="text-xs text-muted-foreground mt-1">Manage members</p>
        </CardContent>
      </UICard>
      <UICard>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Points Redeemed</CardTitle>
          <Gift className="w-4 h-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.pointsRedeemed}</div>
          <p className="text-xs text-muted-foreground mt-1">See rewards</p>
        </CardContent>
      </UICard>
      <UICard>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Cards Issued</CardTitle>
          <CreditCard className="w-4 h-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.cardsIssued}</div>
          <p className="text-xs text-muted-foreground mt-1">View all cards</p>
        </CardContent>
      </UICard>
    </div>
  );
}