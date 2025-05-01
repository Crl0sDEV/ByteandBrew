import { Card as UICard, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Gift } from "lucide-react";
import { Reward } from "../types";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface RewardsSectionProps {
  rewards: Reward[];
  points: number;
  cardId?: string;
  onRedeemSuccess: () => void;
}

const ITEMS_PER_PAGE = 5;

export function RewardsSection({ rewards, points, cardId, onRedeemSuccess }: RewardsSectionProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [redeemingId, setRedeemingId] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);

  // Calculate pagination
  const totalPages = Math.ceil(rewards.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedRewards = rewards.slice(startIndex, endIndex);

  const goToPage = (page: number) => setCurrentPage(page);
  const goToNextPage = () => currentPage < totalPages && setCurrentPage(currentPage + 1);
  const goToPrevPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);

  const handleRedeemClick = (reward: Reward) => {
    setSelectedReward(reward);
    setShowConfirmation(true);
  };

  const handleConfirmRedeem = async () => {
    if (!selectedReward || !cardId) {
      toast.error("No reward or card selected");
      return;
    }

    try {
      setRedeemingId(selectedReward.id);
      setShowConfirmation(false);
      
      // 1. Get the latest reward data from database
      const { data: rewardCheck, error: checkError } = await supabase
        .from("rewards")
        .select("quantity, points_required")
        .eq("id", selectedReward.id)
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
          reward_id: selectedReward.id,
          card_id: cardId,
          points_used: pointsRequired,
          status: "completed",
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
          .eq("id", selectedReward.id);

        if (rewardError) throw rewardError;
      }

      toast.success(`Redeemed ${selectedReward.name} successfully!`);
      onRedeemSuccess();
    } catch (error) {
      console.error("Redemption error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to redeem reward");
    } finally {
      setRedeemingId(null);
      setSelectedReward(null);
    }
  };

  return (
    <>
      <UICard>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Available Rewards</CardTitle>
              <CardDescription className="flex items-center gap-2">
                <span>You have <span className="font-semibold">{points} points</span></span>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Gift className="h-3 w-3" />
                  {points} pts
                </Badge>
              </CardDescription>
            </div>
            {rewards.length > ITEMS_PER_PAGE && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToPrevPage}
                  disabled={currentPage === 1}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="grid gap-4">
          {paginatedRewards.length > 0 ? (
            paginatedRewards.map((reward) => {
              const pointsRequired = reward.points_required
              const canRedeem = points >= pointsRequired && (reward.quantity === null || reward.quantity > 0 || reward.quantity === 0);
              const isRedeeming = redeemingId === reward.id;
              
              return (
                <div
                  key={reward.id}
                  className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors gap-3"
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
                    <div className="text-sm text-muted-foreground mt-1">
                      {reward.description}
                    </div>
                    {reward.quantity > 0 && (
                      <div className="mt-2">
                        <Badge variant="outline" className="text-xs">
                          {reward.quantity} remaining
                        </Badge>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3">
                    <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                      <Gift className="h-3 w-3" />
                      {pointsRequired} pts
                    </Badge>
                    <Button 
                      variant={canRedeem ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleRedeemClick(reward)}
                      disabled={!canRedeem || isRedeeming || !cardId}
                      className="w-full sm:w-auto min-w-[100px]"
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

          {/* Mobile pagination footer */}
          {rewards.length > ITEMS_PER_PAGE && (
            <div className="md:hidden flex items-center justify-center gap-4 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={goToPrevPage}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <div className="text-sm text-muted-foreground">
                {currentPage}/{totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </CardContent>
      </UICard>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Redemption</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to redeem <span className="font-semibold">{selectedReward?.name}</span> for <span className="font-semibold">{selectedReward?.points_required} points</span>?
              <div className="mt-2">
                You'll have {points - (selectedReward?.points_required || 0)} points remaining.
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmRedeem}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}