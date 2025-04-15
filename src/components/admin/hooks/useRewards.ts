import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Reward } from '../types';
import { deleteRewardImage, uploadRewardImage } from '@/lib/uploadImage';

export function useRewards(user: any, activeTab: string) {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);

  const createReward = async (reward: Omit<Reward, 'id' | 'created_at'>) => {
    const { data, error } = await supabase
      .from('rewards')
      .insert([reward])
      .select();
    if (error) throw error;
    return data?.[0];
  };

  const uploadImage = async (file: File): Promise<string> => {
    return uploadRewardImage(file);
  };

  const updateReward = async (id: string, updates: Partial<Reward>) => {
    const { data, error } = await supabase
      .from('rewards')
      .update(updates)
      .eq('id', id)
      .select();
    if (error) throw error;
    return data?.[0];
  };

  const deleteReward = async (id: string, image_url: string | null) => {
    try {
      if (image_url) {
        await deleteRewardImage(image_url);
      }
      const { error } = await supabase.from('rewards').delete().eq('id', id);
      if (error) throw error;
    } catch (error) {
      console.error("Error deleting reward:", error);
      throw error;
    }
  };

  useEffect(() => {
    if (!user || activeTab !== 'rewards') return;

    const fetchRewards = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("rewards")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setRewards(data || []);
      } catch (error) {
        console.error("Error fetching rewards:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRewards();

    const subscription = supabase
      .channel("rewards-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "rewards" },
        () => fetchRewards()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user, activeTab]);

  return { 
    rewards, 
    loading, 
    createReward, 
    updateReward, 
    deleteReward,
    uploadImage
  };
}