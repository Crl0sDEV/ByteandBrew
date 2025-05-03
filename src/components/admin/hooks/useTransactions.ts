import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Transaction } from '../types';
import { User } from '@supabase/supabase-js';

interface SupabaseTransaction {
  id: string;
  amount: number;
  points: number;
  points_expires_at?: string;
  item_count: number;
  type: string;
  status: string;
  created_at: string;
  card_id: string;
  category: string;
  selected_size: string | null;
  base_price: number;
  has_sizes: boolean;
  is_add_on: boolean;
  reference_number: string;
  temperature: string | null;
  card: {
    uid: string;
    user_id: string;
    profile: {
      id: string;
      full_name: string;
    } | null;
  } | null;
}

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
          points_expires_at,
          item_count,
          type,
          status,
          created_at,
          card_id,
          category,
          selected_size,
          base_price,
          has_sizes,
          is_add_on,
          reference_number,
          temperature,
          card:card_id(
            uid,
            user_id,
            profile:user_id(
              id,
              full_name
            )
          )
        `)
        .order("created_at", { ascending: false })
        .limit(50);

      if (transactionsError) throw transactionsError;
      if (!transactionsData) {
        setTransactions([]);
        return;
      }

      // Type assertion for the raw data
      const responseData = transactionsData as unknown as SupabaseTransaction[];
      
      // Transform data to match Transaction interface
      const formattedTransactions: Transaction[] = responseData.map(t => {
        const card = t.card;
        const profile = card?.profile;

        return {
          id: t.id,
          amount: t.amount,
          points: t.points,
          points_expires_at: t.points_expires_at,
          item_count: t.item_count,
          type: t.type,
          status: t.status,
          created_at: t.created_at,
          card_id: t.card_id,
          cards: {
            id: t.card_id,
            uid: card?.uid || 'N/A',
            user_id: card?.user_id || '',
            balance: 0,
            points: 0,
            status: '',
            created_at: '',
            profiles: profile ? { full_name: profile.full_name } : undefined
          },
          user: profile ? {
            id: profile.id,
            full_name: profile.full_name,
            email: '',
            role: undefined,
            created_at: undefined
          } : null,
          base_price: t.base_price || 0,
          has_sizes: t.has_sizes || false,
          selected_size: t.selected_size,
          category: t.category,
          is_add_on: t.is_add_on || false,
          price: t.amount,
          reference_number: t.reference_number || '',
          temperature: t.temperature || null,
          final_price: t.amount
        };
      });

      setTransactions(formattedTransactions);
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