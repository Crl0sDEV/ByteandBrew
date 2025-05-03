import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { CustomerData } from "../types";
import { checkExpiredPoints, getExpiringPoints } from "@/lib/pointsExpiration";

interface FullCustomerData extends CustomerData {
  cardId?: string;
  redemptionHistory?: {
    id: string;
    rewardId: string;
    redeemedAt: string | null;
    status: string;
    pointsUsed: number;
  }[];
  deactivationReason?: string | null;
  deactivatedAt?: string | null;
  activatedAt?: string | null;
}

export function useCustomerData(user: any) {
  const [loading, setLoading] = useState(true);
  const [customerData, setCustomerData] = useState<FullCustomerData>({
    name: "",
    hasCard: false,
    cardNumber: "",
    cardId: "",
    balance: 0,
    points: 0,
    expiringPoints: 0,
    pointsExpirationDate: null,
    pointsToNextReward: 1500,
    cardStatus: "inactive",
    createdAt: "",
    recentTransactions: [],
    availableRewards: [],
    redemptionHistory: [],
    deactivationReason: null,
    deactivatedAt: null,
    activatedAt: null
  });

  const fetchData = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // 1. Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("full_name, created_at")
        .eq("id", user.id)
        .single();

      if (profileError) throw profileError;

      // Initialize default data
      const defaultData: FullCustomerData = {
        name: profileData?.full_name || "anonymous",
        hasCard: false,
        cardNumber: "",
        cardId: "",
        balance: 0,
        points: 0,
        expiringPoints: 0,
        pointsExpirationDate: null,
        pointsToNextReward: 1500,
        cardStatus: "inactive",
        createdAt: profileData?.created_at ? new Date(profileData.created_at).toLocaleDateString() : "",
        recentTransactions: [],
        availableRewards: [],
        redemptionHistory: [],
        deactivationReason: null,
        deactivatedAt: null,
        activatedAt: null
      };

      // 2. Try to fetch card
      const { data: cards, error: cardsError } = await supabase
        .from("cards")
        .select("id, uid, balance, points, status, created_at")
        .eq("user_id", user.id)
        .limit(1);

      if (cardsError) throw cardsError;

      const card = cards?.[0];
      if (!card) {
        setCustomerData(defaultData);
        return;
      }

      // Fetch deactivation info if card is inactive
      let deactivationInfo = null;
      if (card.status?.toLowerCase().trim() !== 'active') {
        const { data: deactivationData, error: deactivationError } = await supabase
          .from("card_deactivations")
          .select("reason, deactivated_at")
          .eq("card_id", card.id)
          .order("deactivated_at", { ascending: false })
          .limit(1)
          .single();

        if (deactivationError) throw deactivationError;
        deactivationInfo = deactivationData;
      }

      // Handle expired points
      try {
        await checkExpiredPoints(card.id);
      } catch (error: unknown) {
        console.error("Failed to check expired points:", error);
      }

      // Get expiring points data
      let expiringPoints = 0;
      let pointsExpirationDate = null;
      try {
        const expiringData = await getExpiringPoints(card.id);
        expiringPoints = expiringData.expiringPoints;
        pointsExpirationDate = expiringData.nextExpirationDate;
      } catch (error: unknown) {
        console.error("Failed to get expiring points:", error);
      }

      // 3. Fetch transactions
      const { data: transactions, error: transactionsError } = await supabase
        .from("transactions")
        .select("id, amount, item_count, status, type, created_at, points")
        .eq("card_id", card.id)
        .order("created_at", { ascending: false });

      if (transactionsError) throw transactionsError;

      // 4. Fetch rewards
      const { data: rewards, error: rewardsError } = await supabase
        .from("rewards")
        .select("id, name, description, points_required, quantity")
        .lte("points_required", card.points)
        .eq("is_active", true);

      if (rewardsError) throw rewardsError;

      // 5. Fetch redemptions
      const { data: redemptions, error: redemptionsError } = await supabase
        .from("redemptions")
        .select("id, reward_id, redeemed_at, status, points_used")
        .eq("card_id", card.id)
        .order("redeemed_at", { ascending: false });

      if (redemptionsError) throw redemptionsError;

      // Normalize card status
      const normalizedCardStatus = card.status?.toLowerCase().trim() === 'active' ? 'active' : 'inactive';

      // Prepare the updated customer data
      const updatedCustomerData: FullCustomerData = {
        ...defaultData,
        hasCard: true,
        cardNumber: card.uid,
        cardId: card.id,
        balance: card.balance,
        points: card.points,
        expiringPoints,
        pointsExpirationDate,
        pointsToNextReward: Math.max(0, 1500 - card.points),
        cardStatus: normalizedCardStatus,
        deactivationReason: deactivationInfo?.reason || null,
        deactivatedAt: deactivationInfo?.deactivated_at || null,
        activatedAt: normalizedCardStatus === 'active' ? card.created_at : null,
        recentTransactions: transactions?.map(t => ({
          id: t.id,
          date: new Date(t.created_at).toLocaleDateString(),
          amount: parseFloat(t.amount).toFixed(2),
          items: t.item_count || 0,
          type: t.type,
          status: t.status,
          points: t.points,
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
      };

      setCustomerData(updatedCustomerData);

    } catch (error: unknown) {
      console.error("Error loading customer data:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

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
          async (payload) => {
            try {
              const { expiringPoints, nextExpirationDate } = await getExpiringPoints(payload.new.id);
              setCustomerData(prev => ({
                ...prev,
                balance: payload.new.balance,
                points: payload.new.points,
                expiringPoints,
                pointsExpirationDate: nextExpirationDate,
                pointsToNextReward: Math.max(0, 1500 - payload.new.points),
                cardStatus: payload.new.status?.toLowerCase().trim() === 'active' ? 'active' : 'inactive'
              }));
            } catch (error: unknown) {
              console.error("Error updating card balance:", error);
            }
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
              try {
                const { data, error } = await supabase
                  .from("transactions")
                  .select("id, amount, item_count, status, type, created_at, points")
                  .eq("card_id", customerData.cardId)
                  .order("created_at", { ascending: false });
  
                if (error) throw error;
                
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
                      points: t.points
                    }))
                  }));
                }
              } catch (error: unknown) {
                console.error("Error updating transactions:", error);
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
            setCustomerData(prev => {
              if (!prev.cardId) return prev;
              
              const updateRewards = async () => {
                try {
                  const { data, error } = await supabase
                    .from("rewards")
                    .select("id, name, description, points_required, quantity")
                    .lte("points_required", prev.points)
                    .eq("is_active", true);

                  if (error) throw error;
                  
                  if (data) {
                    setCustomerData(current => ({
                      ...current,
                      availableRewards: data.map(r => ({
                        id: r.id,
                        name: r.name,
                        description: r.description,
                        points_required: r.points_required,
                        quantity: r.quantity
                      }))
                    }));
                  }
                } catch (error: unknown) {
                  console.error("Error updating rewards:", error);
                }
              };

              updateRewards();
              return prev;
            });
          }
        ).subscribe()
    ];
  
    return () => {
      subscriptions.forEach(sub => supabase.removeChannel(sub));
    };
  }, [user, customerData.cardId, fetchData]);

  return { 
    customerData, 
    loading, 
    refetch 
  };
}