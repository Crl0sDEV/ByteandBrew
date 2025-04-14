import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Reward } from '../types';

export function useRewards(user: any, activeTab: string) {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchRewards = async () => {
      if (!user || activeTab !== 'rewards') return;
      
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("rewards")
          .select("*")
          .order("points_required", { ascending: true });

        if (error) throw error;
        setRewards(data || []);
      } catch (error) {
        console.error("Error fetching rewards:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRewards();
  }, [user, activeTab]);

  return { rewards, loading };
}