import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { CustomerData } from "../types";

export function useCustomerData(user: any) {
  const [loading, setLoading] = useState(true);
  const [customerData, setCustomerData] = useState<CustomerData>({
    name: "",
    hasCard: false,
    cardNumber: "",
    balance: 0,
    points: 0,
    pointsToNextReward: 1500,
    recentTransactions: [],
    availableRewards: []
  });

  useEffect(() => {
    const fetchCustomerData = async () => {
      setLoading(true);
      try {
        if (!user) return;

        // 1. Fetch profile
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .single();

        if (profileError) throw profileError;
        if (!profileData) throw new Error("Profile not found");

        // Initialize default data
        const defaultData: CustomerData = {
          name: profileData.full_name || "anonymous",
          hasCard: false,
          cardNumber: "",
          balance: 0,
          points: 0,
          pointsToNextReward: 1500,
          recentTransactions: [],
          availableRewards: []
        };

        // 2. Try to fetch card
        const { data: cards, error: cardsError } = await supabase
          .from("cards")
          .select("id, uid, balance, points")
          .eq("user_id", user.id)
          .limit(1);

        if (cardsError) throw cardsError;
        
        const card = cards?.[0];
        if (!card) {
          setCustomerData(defaultData);
          return;
        }

        // 3. Fetch transactions
        const { data: transactions, error: transactionError } = await supabase
          .from("transactions")
          .select("id, amount, item_count, status, type, created_at, points_earned")
          .eq("card_id", card.id)
          .order("created_at", { ascending: false })
          .limit(3);

        if (transactionError) throw transactionError;

        // 4. Fetch rewards
        const { data: rewards, error: rewardError } = await supabase
          .from("rewards")
          .select("id, name, description, points_required")
          .lte("points_required", card.points)
          .eq("is_active", true);

        if (rewardError) throw rewardError;

        // Calculate points needed for next reward
        const pointsToNextReward = Math.max(0, 1500 - card.points);

        setCustomerData({
          ...defaultData,
          hasCard: true,
          cardNumber: card.uid,
          balance: card.balance,
          points: card.points,
          pointsToNextReward,
          recentTransactions: transactions?.map(t => ({
            id: t.id,
            date: new Date(t.created_at).toLocaleDateString(),
            amount: parseFloat(t.amount).toFixed(2),
            items: t.item_count || 0,
            type: t.type,
            status: t.status,
            pointsEarned: t.points_earned
          })) || [],
          availableRewards: rewards?.map(r => ({
            id: r.id,
            name: r.name,
            description: r.description,
            points: r.points_required
          })) || []
        });

      } catch (error) {
        console.error("Error loading customer data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerData();
  }, [user]);

  return { customerData, loading };
}