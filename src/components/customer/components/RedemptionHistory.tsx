import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, Store } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";

interface Redemption {
  id: string;
  rewardId: string;       
  redeemedAt: string | null;  
  pointsUsed: number | null;  
  status: string;
  rewardName?: string;
  rewardDescription?: string;
}

interface RedemptionHistoryProps {
  redemptions: Redemption[];
}

export function RedemptionHistorySection({ redemptions: initialRedemptions }: RedemptionHistoryProps) {
  const [expandedRedemption, setExpandedRedemption] = useState<string | null>(null);
  const [redemptions, setRedemptions] = useState<Redemption[]>(initialRedemptions);

  // Load all reward names when component mounts
  useEffect(() => {
    const loadAllRewardNames = async () => {
      try {
        // First get all unique reward IDs we need to fetch
        const rewardIds = initialRedemptions
          .map(r => r.rewardId)
          .filter((id, index, self) => id && self.indexOf(id) === index);

        if (rewardIds.length === 0) return;

        // Fetch all rewards in one query
        const { data: rewards, error } = await supabase
          .from("rewards")
          .select("id, name, description")
          .in("id", rewardIds);

        if (error) throw error;

        // Map rewards by ID for easy lookup
        const rewardsMap = rewards.reduce((acc, reward) => {
          acc[reward.id] = reward;
          return acc;
        }, {} as Record<string, { name: string; description: string }>);

        // Update redemptions with reward names
        setRedemptions(prev => 
          prev.map(r => ({
            ...r,
            rewardName: r.rewardId ? rewardsMap[r.rewardId]?.name || "Unknown reward" : "No reward",
            rewardDescription: r.rewardId ? rewardsMap[r.rewardId]?.description : undefined
          }))
        );
      } catch (error) {
        console.error("Error loading reward names:", error);
        toast.error("Failed to load reward information");
      }
    };

    loadAllRewardNames();
  }, [initialRedemptions]);

  const toggleRedemptionDetails = (redemptionId: string) => {
    setExpandedRedemption(prev => prev === redemptionId ? null : redemptionId);
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-4">Redemption History</h2>
      {redemptions.length === 0 ? (
        <p className="text-muted-foreground">No redemptions yet.</p>
      ) : (
        <ul className="space-y-3">
          {redemptions.map((redemption) => (
            <li
              key={redemption.id}
              className="border rounded-md overflow-hidden bg-gray-50"
            >
              <div 
                className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => toggleRedemptionDetails(redemption.id)}
              >
                <div className="space-y-1">
                  <h3 className="font-medium">
                    {redemption.rewardName || "Unknown reward"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {redemption.redeemedAt ? new Date(redemption.redeemedAt).toLocaleString() : "No date available"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold">
                    -{redemption.pointsUsed !== null ? redemption.pointsUsed : "?"} pts
                  </span>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    redemption.status === "completed"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}>
                    {redemption.status}
                  </span>
                  {expandedRedemption === redemption.id ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </div>

              {expandedRedemption === redemption.id && (
                <div className="p-4 pt-0 border-t bg-white">
                  <div className="mb-3">
                    <h4 className="font-medium mb-1">Reward Details:</h4>
                    <p className="text-sm text-muted-foreground">
                      {redemption.rewardDescription || "No description available"}
                    </p>
                  </div>
                  
                  <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-md">
                    <Store className="h-4 w-4 mt-0.5 text-blue-600 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-sm mb-1">How to claim:</h4>
                      <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                        <li>Visit our store locations</li>
                        <li>Show this redemption to the cashier</li>
                        <li>Present your loyalty card if required</li>
                        <li>Enjoy your reward!</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}