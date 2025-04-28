import { Card as UICard, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Gift } from "lucide-react";
import { Reward } from "../types";

interface RewardsSectionProps {
  rewards: Reward[];
  points: number;
}

export function RewardsSection({ rewards, points }: RewardsSectionProps) {
  return (
    <UICard>
      <CardHeader>
        <CardTitle>Available Rewards</CardTitle>
        <CardDescription>Redeem your points</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {rewards.length > 0 ? (
          rewards.map((reward) => (
            <div
              key={reward.id}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div>
                <div className="font-medium">{reward.name}</div>
                <div className="text-sm text-muted-foreground">
                  {reward.description}
                </div>
                <div className="font-medium">{reward.quantity}</div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Gift className="h-3 w-3" />
                  {reward.points} pts
                </Badge>
                <Button variant="outline" size="sm">
                  Redeem
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-sm text-muted-foreground">
            {points > 0 
              ? "Earn more points to unlock rewards" 
              : "No rewards available yet"}
          </div>
        )}
      </CardContent>
    </UICard>
  );
}