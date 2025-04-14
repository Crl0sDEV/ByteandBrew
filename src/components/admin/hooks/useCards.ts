import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Card } from '../types';

export function useCards(user: any, activeTab: string) {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCards = async () => {
      if (!user || activeTab !== 'loyalty') return;
      
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("cards")
          .select(`
            id,
            uid,
            balance,
            points,
            status,
            created_at,
            user_id,
            profiles:user_id(
              full_name
            )
          `)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setCards(data || []);
      } catch (error) {
        console.error("Error fetching cards:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCards();
  }, [user, activeTab]);

  return { cards, loading };
}