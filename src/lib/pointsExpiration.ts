import { supabase } from "@/lib/supabaseClient";

export async function checkExpiredPoints(cardId: string): Promise<number> {
  try {
    const { data, error } = await supabase.rpc('handle_expired_points', { 
      p_card_id: cardId 
    });
    
    if (error) throw error;
    return Number(data) || 0; // Explicit conversion to number
  } catch (error) {
    console.error("Error handling expired points:", error);
    return 0;
  }
}

export async function getExpiringPoints(cardId: string): Promise<{
  expiringPoints: number;
  nextExpirationDate: Date | null;
}> {
  try {
    const { data, error } = await supabase.rpc('get_expiring_points', { 
      p_card_id: cardId 
    });
    
    if (error) throw error;
    
    // Handle both array and single object responses
    const result = Array.isArray(data) ? data[0] : data;
    
    return {
      expiringPoints: Number(result?.expiring_points) || 0,
      nextExpirationDate: result?.next_expiration_date ? new Date(result.next_expiration_date) : null
    };
  } catch (error) {
    console.error("Error getting expiring points:", error);
    return {
      expiringPoints: 0,
      nextExpirationDate: null
    };
  }
}

// Bonus: Additional function for points summary
export async function getPointsSummary(cardId: string): Promise<{
  totalPoints: number;
  expiredPoints: number;
  expiringPoints: number;
  nextExpirationDate: Date | null;
  safePoints: number;
}> {
  try {
    const { data, error } = await supabase.rpc('get_points_summary', {
      p_card_id: cardId
    });
    
    if (error) throw error;
    
    const result = Array.isArray(data) ? data[0] : data;
    
    return {
      totalPoints: Number(result?.total_points) || 0,
      expiredPoints: Number(result?.expired_points) || 0,
      expiringPoints: Number(result?.expiring_points) || 0,
      nextExpirationDate: result?.next_expiration_date ? new Date(result.next_expiration_date) : null,
      safePoints: Number(result?.safe_points) || 0
    };
  } catch (error) {
    console.error("Error getting points summary:", error);
    return {
      totalPoints: 0,
      expiredPoints: 0,
      expiringPoints: 0,
      nextExpirationDate: null,
      safePoints: 0
    };
  }
}