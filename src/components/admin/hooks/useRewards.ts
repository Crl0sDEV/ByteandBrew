import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Reward } from '../types';
import { deleteRewardImage, uploadRewardImage } from '@/lib/uploadImage';
import { User } from '@supabase/supabase-js';

export function useRewards(user: User | null, shouldFetch: boolean) {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchRewards = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("rewards")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRewards(data || []);
    } catch (err) {
      console.error("Error fetching rewards:", err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const uploadImage = useCallback(async (file: File): Promise<string> => {
    try {
      return await uploadRewardImage(file);
    } catch (err) {
      console.error("Error uploading reward image:", err);
      throw err;
    }
  }, []);

  const createReward = useCallback(async (reward: Omit<Reward, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('rewards')
        .insert([reward])
        .select();
      if (error) throw error;
      return data?.[0];
    } catch (err) {
      console.error("Error creating reward:", err);
      throw err;
    }
  }, []);

  const updateReward = useCallback(async (id: string, updates: Partial<Reward>) => {
    try {
      const { data, error } = await supabase
        .from('rewards')
        .update(updates)
        .eq('id', id)
        .select();
      if (error) throw error;
      return data?.[0];
    } catch (err) {
      console.error("Error updating reward:", err);
      throw err;
    }
  }, []);

  const deleteReward = useCallback(async (id: string, image_url: string | null) => {
    try {
      if (image_url) {
        await deleteRewardImage(image_url);
      }
      const { error } = await supabase.from('rewards').delete().eq('id', id);
      if (error) throw error;
    } catch (err) {
      console.error("Error deleting reward:", err);
      throw err;
    }
  }, []);

  useEffect(() => {
    if (!shouldFetch) return;

    fetchRewards();

    const subscription = supabase
      .channel("rewards-changes")
      .on(
        "postgres_changes",
        { 
          event: "*", 
          schema: "public", 
          table: "rewards" 
        },
        () => shouldFetch && fetchRewards()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [shouldFetch, fetchRewards]);

  return { 
    rewards, 
    loading,
    error,
    createReward, 
    updateReward, 
    deleteReward,
    uploadImage,
    refreshRewards: fetchRewards
  };
}