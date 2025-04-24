import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Transaction } from '../types';
import { User } from '@supabase/supabase-js';

export function useTransactions(user: User | null, shouldFetch: boolean) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchTransactions = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const { data: transactionsData, error: transactionsError } = await supabase
        .from("transactions")
        .select(`
          id,
          amount,
          points,
          item_count,
          type,
          status,
          created_at,
          card_id,
          category,
          selected_size,
          cards!inner(
            uid,
            user_id
          )
        `)
        .order("created_at", { ascending: false })
        .limit(50);

      if (transactionsError) throw transactionsError;
      if (!transactionsData) {
        setTransactions([]);
        return;
      }

      const userIds = transactionsData.map(t => t.cards.user_id);
      const { data: usersData, error: usersError } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", [...new Set(userIds)]);

      if (usersError) throw usersError;

      const enhancedTransactions = transactionsData.map(t => ({
        ...t,
        card: t.cards,
        user: usersData?.find(u => u.id === t.cards.user_id) || null
      }));

      setTransactions(enhancedTransactions);
    } catch (err) {
      console.error("Error fetching transactions:", err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!shouldFetch) return;

    fetchTransactions();

    const subscription = supabase
      .channel('transactions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions'
        },
        () => shouldFetch && fetchTransactions()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [shouldFetch, fetchTransactions]);

  return { 
    transactions, 
    loading, 
    error,
    refreshTransactions: fetchTransactions 
  };
}