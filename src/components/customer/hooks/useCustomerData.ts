import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { CustomerData } from "../types";

export function useCustomerData(user: any) {
  const [loading, setLoading] = useState(true);
  const [customerData, setCustomerData] = useState<CustomerData & { cardId?: string, redemptionHistory?: any[] }>({
    name: "",
    hasCard: false,
    cardNumber: "",
    cardId: "",
    balance: 0,
    points: 0,
    pointsToNextReward: 1500,
    recentTransactions: [],
    availableRewards: [],
    redemptionHistory: []  // <-- NEW
  });

  const fetchData = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // 1. Fetch profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();

      // Initialize default data
      const defaultData: CustomerData & { cardId?: string, redemptionHistory?: any[] } = {
        name: profileData?.full_name || "anonymous",
        hasCard: false,
        cardNumber: "",
        cardId: "",
        balance: 0,
        points: 0,
        pointsToNextReward: 1500,
        recentTransactions: [],
        availableRewards: [],
        redemptionHistory: []
      };

      // 2. Try to fetch card
      const { data: cards } = await supabase
        .from("cards")
        .select("id, uid, balance, points")
        .eq("user_id", user.id)
        .limit(1);

      const card = cards?.[0];
      if (!card) {
        setCustomerData(defaultData);
        return;
      }

      // 3. Fetch transactions
      const { data: transactions } = await supabase
        .from("transactions")
        .select("id, amount, item_count, status, type, created_at, points_earned")
        .eq("card_id", card.id)
        .order("created_at", { ascending: false })
        .limit(3);

      // 4. Fetch rewards
      const { data: rewards } = await supabase
        .from("rewards")
        .select("id, name, description, points_required, quantity")
        .lte("points_required", card.points)
        .eq("is_active", true);

      // 5. Fetch redemptions (NEW)
      const { data: redemptions } = await supabase
        .from("redemptions")
        .select("id, reward_id, redeemed_at, status, points_used")
        .eq("card_id", card.id)
        .order("redeemed_at", { ascending: false })
        .limit(5); // or remove limit if you want all

      setCustomerData({
        ...defaultData,
        hasCard: true,
        cardNumber: card.uid,
        cardId: card.id,
        balance: card.balance,
        points: card.points,
        pointsToNextReward: Math.max(0, 1500 - card.points),
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
          points_required: r.points_required,
          quantity: r.quantity
        })) || [],
        redemptionHistory: redemptions?.map(r => ({
          id: r.id,
          rewardId: r.reward_id,
          redeemedAt: r.redeemed_at ? new Date(r.redeemed_at).toLocaleString() : null,
          status: r.status,
          pointsUsed: r.points_used
        })) || []        
      });

    } catch (error) {
      console.error("Error loading customer data:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Add refetch function
  const refetch = useCallback(() => {
    return fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();

    const subscriptions = [
      supabase.channel('card-balance-changes')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'cards',
            filter: `user_id=eq.${user?.id}`
          },
          (payload) => {
            setCustomerData(prev => ({
              ...prev,
              balance: payload.new.balance,
              points: payload.new.points,
              pointsToNextReward: Math.max(0, 1500 - payload.new.points)
            }));
          }
        ).subscribe(),

      supabase.channel('new-transactions')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'transactions',
            filter: `card_id=eq.${customerData.cardId}`
          },
          async () => {
            if (customerData.cardId) {
              const { data } = await supabase
                .from("transactions")
                .select("id, amount, item_count, status, type, created_at, points_earned")
                .eq("card_id", customerData.cardId)
                .order("created_at", { ascending: false })
                .limit(3);

              if (data) {
                setCustomerData(prev => ({
                  ...prev,
                  recentTransactions: data.map(t => ({
                    id: t.id,
                    date: new Date(t.created_at).toLocaleDateString(),
                    amount: parseFloat(t.amount).toFixed(2),
                    items: t.item_count || 0,
                    type: t.type,
                    status: t.status,
                    pointsEarned: t.points_earned
                  }))
                }));
              }
            }
          }
        ).subscribe(),

      supabase.channel('reward-updates')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'rewards'
          },
          async () => {
            if (customerData.cardId) {
              const { data } = await supabase
                .from("rewards")
                .select("id, name, description, points_required, quantity")
                .lte("points_required", customerData.points)
                .eq("is_active", true);

              if (data) {
                setCustomerData(prev => ({
                  ...prev,
                  availableRewards: data.map(r => ({
                    id: r.id,
                    name: r.name,
                    description: r.description,
                    points_required: r.points_required,
                    quantity: r.quantity
                  }))
                }));
              }
            }
          }
        ).subscribe()
    ];

    return () => {
      subscriptions.forEach(sub => supabase.removeChannel(sub));
    };
  }, [fetchData, user, customerData.cardId]);

  return { 
    customerData, 
    loading, 
    refetch 
  };
}
