import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Member } from '../types';

export function useMembers(user: any, activeTab: string) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchMembers = async () => {
      if (!user || activeTab !== 'members') return;
      
      try {
        setLoading(true);
        const { data: profilesData, error: profilesError } = await supabase
          .from("profiles")
          .select("id, full_name, email, created_at")
          .eq("role", "customer")
          .order("created_at", { ascending: false });

        if (profilesError) throw profilesError;
        if (!profilesData) {
          setMembers([]);
          return;
        }

        const userIds = profilesData.map(p => p.id);
        const { data: cardsData, error: cardsError } = await supabase
          .from("cards")
          .select("user_id, uid, balance, points")
          .in("user_id", userIds);

        if (cardsError) throw cardsError;

        const membersWithCards = profilesData.map(profile => ({
          ...profile,
          card: cardsData?.find(c => c.user_id === profile.id) || null
        }));

        setMembers(membersWithCards);
      } catch (error) {
        console.error("Error fetching members:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [user, activeTab]);

  return { members, loading };
}