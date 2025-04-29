import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { AdminStats } from '../types';

export function useAdminStats(user: any) {
  const [stats, setStats] = useState<AdminStats>({
    todaySales: 0,
    activeMembers: 0,
    cardsIssued: 0,
    totalRedemptions: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [
          { data: salesData },
          { data: membersData },
          { count: totalRedemptions },
          { data: cardsData }
        ] = await Promise.all([
          // Today's completed payment transactions
          supabase
            .from("transactions")
            .select("amount")
            .gte("created_at", today.toISOString())
            .eq("type", "payment")
            .eq("status", "Completed"),
            
          // Active members
          supabase.from("profiles").select("id").eq("role", "customer"),
          
          // Total redemptions count - CORRECTED QUERY
          supabase
            .from("redemptions")
            .select('*', { count: 'exact' }),
            
            
          // All issued cards
          supabase.from("cards").select("id")
        ]);

        setStats({
          todaySales: salesData?.reduce((sum, t) => sum + t.amount, 0) || 0,
          activeMembers: membersData?.length || 0,
          cardsIssued: cardsData?.length || 0,
          totalRedemptions: totalRedemptions || 0
        });
      } catch (error) {
        console.error("Error loading stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  return { stats, loading };
}