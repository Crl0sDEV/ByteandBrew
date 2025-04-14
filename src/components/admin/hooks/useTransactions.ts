import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Transaction } from '../types';

export function useTransactions(user: any, activeTab: string) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user || activeTab !== 'transactions') return;
      
      try {
        setLoading(true);
        const { data: transactionsData, error: transactionsError } = await supabase
          .from("transactions")
          .select(`
            id,
            amount,
            item_count,
            status,
            created_at,
            card_id,
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
      } catch (error) {
        console.error("Error fetching transactions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [user, activeTab]);

  return { transactions, loading };
}