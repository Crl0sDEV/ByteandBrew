import { Card as UICard, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CreditCard, Gift, History } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface CardStatsProps {
  hasCard: boolean;
  cardNumber: string;
  balance: number;
  points: number;
  pointsToNextReward: number;
  transactionCount: number;
}

export function CardStats({
  hasCard,
  cardNumber,
  balance,
  points,
  pointsToNextReward,
  transactionCount
}: CardStatsProps) {
  if (!hasCard) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <UICard>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Card Balance</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">₱{balance.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Card: {cardNumber}
          </p>
        </CardContent>
      </UICard>

      <UICard>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Reward Points</CardTitle>
          <Gift className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{points} pts</div>
          <div className="mt-2">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Next reward in {pointsToNextReward} pts</span>
              <span>{Math.min(100, ((points / 1500) * 100)).toFixed(0)}%</span>
            </div>
            <Progress value={(points / 1500) * 100} className="h-2" />
          </div>
        </CardContent>
      </UICard>

      <UICard>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Recent Visits</CardTitle>
          <History className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{transactionCount}</div>
          <p className="text-xs text-muted-foreground mt-1">Last 3 transactions</p>
        </CardContent>
      </UICard>
    </div>
  );
}