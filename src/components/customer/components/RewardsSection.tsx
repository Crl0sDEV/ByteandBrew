import { Card as UICard, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Gift } from "lucide-react";
import { Reward } from "../types";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";

interface RewardsSectionProps {
  rewards: Reward[];
  points: number;
  cardId?: string;
  onRedeemSuccess: () => void;
}

export function RewardsSection({ rewards, points, cardId, onRedeemSuccess }: RewardsSectionProps) {
  const [redeemingId, setRedeemingId] = useState<string | null>(null);

  const handleRedeem = async (reward: Reward) => {
    if (!cardId) {
      toast.error("No loyalty card found");
      return;
    }

    try {
      setRedeemingId(reward.id);
      
      // 1. Get the latest reward data from database
      const { data: rewardCheck, error: checkError } = await supabase
        .from("rewards")
        .select("quantity, points_required")
        .eq("id", reward.id)
        .single();

      if (checkError || !rewardCheck) throw new Error("Reward not found");
      
      const pointsRequired = rewardCheck.points_required
      const currentQuantity = rewardCheck.quantity;

      // 2. Validate redemption
      if (currentQuantity <= 0 && currentQuantity !== 0) {
        throw new Error("Reward out of stock");
      }
      if (points < pointsRequired) {
        throw new Error(`You need ${pointsRequired} points (you have ${points})`);
      }

      // 3. Create redemption record
      const { error: redemptionError } = await supabase
        .from("redemptions")
        .insert({
          reward_id: reward.id,
          card_id: cardId,
          points_used: pointsRequired,
          status: "pending",
        });

      if (redemptionError) throw redemptionError;

      // 4. Update card points
      const { error: cardError } = await supabase
        .from("cards")
        .update({ points: points - pointsRequired })
        .eq("id", cardId);

      if (cardError) throw cardError;

      // 5. Update reward quantity if not unlimited
      if (currentQuantity > 0) {
        const { error: rewardError } = await supabase
          .from("rewards")
          .update({ quantity: currentQuantity - 1 })
          .eq("id", reward.id);

        if (rewardError) throw rewardError;
      }

      toast.success(`Redeemed ${reward.name} successfully!`);
      onRedeemSuccess();
    } catch (error) {
      console.error("Redemption error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to redeem reward");
    } finally {
      setRedeemingId(null);
    }
  };

  return (
    <UICard>
      <CardHeader>
        <CardTitle>Available Rewards</CardTitle>
        <CardDescription className="flex items-center gap-2">
          <span>You have <span className="font-semibold">{points} points</span></span>
          <Badge variant="outline" className="flex items-center gap-1">
            <Gift className="h-3 w-3" />
            {points} pts
          </Badge>
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {rewards.length > 0 ? (
          rewards.map((reward) => {
            const pointsRequired = reward.points_required
            const canRedeem = points >= pointsRequired && (reward.quantity === null || reward.quantity > 0 || reward.quantity === 0);

            const isRedeeming = redeemingId === reward.id;
            
            return (
              <div
                key={reward.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="font-medium flex items-center gap-2">
                    {reward.name}
                    {reward.quantity === 0 && (
                      <Badge variant="secondary" className="text-xs">
                        Unlimited
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {reward.description}
                  </div>
                  {reward.quantity > 0 && (
                    <div className="mt-1">
                      <Badge variant="outline" className="text-xs">
                        {reward.quantity} remaining
                      </Badge>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Gift className="h-3 w-3" />
                    {pointsRequired} pts
                  </Badge>
                  <Button 
                    variant={canRedeem ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleRedeem(reward)}
                    disabled={!canRedeem || isRedeeming || !cardId}
                    className="min-w-[80px]"
                  >
                    {isRedeeming ? (
                      <span className="flex items-center gap-1">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing
                      </span>
                    ) : "Redeem"}
                  </Button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-6">
            <div className="text-muted-foreground mb-2">
              {points > 0 ? "No rewards available" : "Earn points to unlock rewards"}
            </div>
            <Button variant="outline" size="sm">
              Learn how to earn points
            </Button>
          </div>
        )}
      </CardContent>
    </UICard>
  );
}