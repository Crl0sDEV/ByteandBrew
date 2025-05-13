import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card } from "../types";
import { User } from "@supabase/supabase-js";

export function useCards(user: User | null, shouldFetch: boolean) {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchCards = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("cards")
        .select(
          `
          id,
          uid,
          balance,
          points,
          status,
          created_at,
          user_id,
          profiles:user_id(
            full_name,
            email
          )
        `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;

      const formattedCards: Card[] = (data || []).map((card) => ({
        id: card.id,
        uid: card.uid,
        balance: card.balance,
        points: card.points,
        status: card.status,
        created_at: card.created_at,
        user_id: card.user_id,
        profiles:
          card.profiles && card.profiles.length > 0
            ? {
                full_name: card.profiles[0].full_name,
              }
            : undefined,
      }));

      setCards(formattedCards);
    } catch (err) {
      console.error("Error fetching cards:", err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!shouldFetch) return;

    fetchCards();

    const subscription = supabase
      .channel("cards-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "cards",
        },
        () => shouldFetch && fetchCards()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [shouldFetch, fetchCards]);

  const registerCard = useCallback(
    async (uid: string, userId: string) => {
      try {
        const { data, error } = await supabase
          .from("cards")
          .insert([{ uid, user_id: userId, status: "active" }])
          .select();

        if (error) throw error;
        if (data) fetchCards();
        return data?.[0];
      } catch (err) {
        console.error("Error registering card:", err);
        throw err;
      }
    },
    [fetchCards]
  );

  const reloadCard = useCallback(
    async (cardId: string, amount: number) => {
      try {
        const { data, error } = await supabase
          .from("cards")
          .update({ balance: amount })
          .eq("id", cardId)
          .select();

        if (error) throw error;
        if (data) fetchCards();
        return data?.[0];
      } catch (err) {
        console.error("Error reloading card:", err);
        throw err;
      }
    },
    [fetchCards]
  );

  const deactivateCard = useCallback(
    async (cardId: string) => {
      try {
        const { data, error } = await supabase
          .from("cards")
          .update({ status: "inactive" })
          .eq("id", cardId)
          .select();

        if (error) throw error;
        if (data) fetchCards();
        return data?.[0];
      } catch (err) {
        console.error("Error deactivating card:", err);
        throw err;
      }
    },
    [fetchCards]
  );

  return {
    cards,
    loading,
    error,
    registerCard,
    reloadCard,
    deactivateCard,
    refreshCards: fetchCards,
  };
}
