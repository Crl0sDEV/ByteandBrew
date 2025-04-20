import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Member } from '../types';
import { User } from '@supabase/supabase-js';

export function useMembers(user: User | null, shouldFetch: boolean) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchMembers = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Fetch profiles
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

      // Fetch cards for these members
      const userIds = profilesData.map(p => p.id);
      const { data: cardsData, error: cardsError } = await supabase
        .from("cards")
        .select("user_id, uid, balance, points")
        .in("user_id", userIds);

      if (cardsError) throw cardsError;

      // Combine profile and card data
      const membersWithCards = profilesData.map(profile => ({
        ...profile,
        card: cardsData?.find(c => c.user_id === profile.id) || null
      }));

      setMembers(membersWithCards);
    } catch (err) {
      console.error("Error fetching members:", err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!shouldFetch) return;

    fetchMembers();

    // Set up real-time updates for both profiles and cards
    const profilesSubscription = supabase
      .channel('profiles-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: 'role=eq.customer'
        },
        () => shouldFetch && fetchMembers()
      )
      .subscribe();

    const cardsSubscription = supabase
      .channel('cards-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cards'
        },
        () => shouldFetch && fetchMembers()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(profilesSubscription);
      supabase.removeChannel(cardsSubscription);
    };
  }, [shouldFetch, fetchMembers]);

  return { 
    members, 
    loading, 
    error,
    refreshMembers: fetchMembers 
  };
}