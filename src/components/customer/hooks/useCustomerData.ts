import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { CustomerData } from "../types";

export function useCustomerData(user: any) {
  const [loading, setLoading] = useState(true);
  const [customerData, setCustomerData] = useState<CustomerData & { cardId?: string }>({
    name: "",
    hasCard: false,
    cardNumber: "",
    cardId: "",
    balance: 0,
    points: 0,
    pointsToNextReward: 1500,
    recentTransactions: [],
    availableRewards: []
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
      const defaultData: CustomerData & { cardId?: string } = {
        name: profileData?.full_name || "anonymous",
        hasCard: false,
        cardNumber: "",
        cardId: "",
        balance: 0,
        points: 0,
        pointsToNextReward: 1500,
        recentTransactions: [],
        availableRewards: []
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
        .select("id, name, description, points_required")
        .lte("points_required", card.points)
        .eq("is_active", true);

      setCustomerData({
        ...defaultData,
        hasCard: true,
        cardNumber: card.uid,
        cardId: card.id, // Add cardId here
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
          points: r.points_required
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
    // Initial fetch
    fetchData();

    // Set up all realtime subscriptions
    const subscriptions = [
      // Card balance updates
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

      // New transactions
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
            // Optimistically update by fetching just the new transactions
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

      // Reward updates
      supabase.channel('reward-updates')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'rewards'
          },
          async () => {
            // Only refetch rewards if user has a card
            if (customerData.cardId) {
              const { data } = await supabase
                .from("rewards")
                .select("id, name, description, points_required")
                .lte("points_required", customerData.points)
                .eq("is_active", true);
                
              if (data) {
                setCustomerData(prev => ({
                  ...prev,
                  availableRewards: data.map(r => ({
                    id: r.id,
                    name: r.name,
                    description: r.description,
                    points: r.points_required
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
  }, [fetchData, user, customerData.cardId]); // Add customerData.cardId to dependencies

  return { 
    customerData, 
    loading, 
    refetch // Add refetch to returned object
  };
}