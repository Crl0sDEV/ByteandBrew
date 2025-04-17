import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { AdminStats } from '../types';

export function useAdminStats(user: any) {
  const [stats, setStats] = useState<AdminStats>({
    todaySales: 0,
    activeMembers: 0,
    pointsRedeemed: 0,
    cardsIssued: 0
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
          { data: redemptionsData },
          { data: cardsData }
        ] = await Promise.all([
          // Only count completed payment transactions
          supabase
            .from("transactions")
            .select("amount")
            .gte("created_at", today.toISOString())
            .eq("type", "payment")
            .eq("status", "Completed"),
            
          supabase.from("profiles").select("id").eq("role", "customer"),
          supabase.from("redemptions").select("id"),
          supabase.from("cards").select("id")
        ]);

        setStats({
          todaySales: salesData?.reduce((sum, t) => sum + t.amount, 0) || 0,
          activeMembers: membersData?.length || 0,
          pointsRedeemed: redemptionsData?.length || 0,
          cardsIssued: cardsData?.length || 0
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