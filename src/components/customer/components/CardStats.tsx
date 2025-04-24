import { Card as UICard, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Gift } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface CardStatsProps {
  hasCard: boolean;
  cardNumber: string;
  points: number;
  pointsToNextReward: number;
}

export function CardStats({
  hasCard,
  cardNumber,
  points,
  pointsToNextReward,
}: CardStatsProps) {
  if (!hasCard) return null;

  return (
    <div className="grid grid-cols-1 gap-4">
      {/* Points Card - Only showing loyalty points */}
      <UICard>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Loyalty Points</CardTitle>
          <Gift className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{points} pts</div>
          <p className="text-xs text-muted-foreground mt-1">
            Card: {cardNumber}
          </p>
          <div className="mt-2">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Next reward in {pointsToNextReward} pts</span>
              <span>{Math.min(100, ((points / 1500) * 100)).toFixed(0)}%</span>
            </div>
            <Progress value={(points / 1500) * 100} className="h-2" />
          </div>
        </CardContent>
      </UICard>
    </div>
  );
}