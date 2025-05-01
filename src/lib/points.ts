import { supabase } from "./supabaseClient";

// Calculate points that will expire soon (within X days)
export async function getExpiringPoints(cardId: string, daysThreshold = 7) {
  const thresholdDate = new Date();
  thresholdDate.setDate(thresholdDate.getDate() + daysThreshold);
  
  const { data, error } = await supabase
    .from('transactions')
    .select('points, points_expires_at')
    .eq('card_id', cardId)
    .lt('points_expires_at', thresholdDate.toISOString())
    .gt('points_expires_at', new Date().toISOString())
    .is('points_deducted', null)
    .not('points', 'is', null);

  if (error) return 0;
  return data.reduce((sum, t) => sum + (t.points || 0), 0);
}

// Handle expired points deduction
export async function handleExpiredPoints(cardId: string) {
  // Get all transactions with points that have expired but haven't been deducted yet
  const { data: expiredTransactions, error } = await supabase
    .from('transactions')
    .select('id, points')
    .eq('card_id', cardId)
    .lt('points_expires_at', new Date().toISOString())
    .is('points_deducted', null)
    .not('points', 'is', null);

  if (error || !expiredTransactions?.length) return 0;

  const totalPointsToDeduct = expiredTransactions.reduce(
    (sum, t) => sum + (t.points || 0), 0
  );

  if (totalPointsToDeduct > 0) {
    // Deduct points from card
    const { error: deductionError } = await supabase.rpc('deduct_points', {
      card_id: cardId,
      points: totalPointsToDeduct
    });

    if (!deductionError) {
      // Mark transactions as having points deducted
      await supabase
        .from('transactions')
        .update({ points_deducted: true })
        .in('id', expiredTransactions.map(t => t.id));
    }
  }

  return totalPointsToDeduct;
}

// Get non-expired points balance
export async function getNonExpiredPoints(cardId: string) {
  const { data, error } = await supabase
    .from('transactions')
    .select('points')
    .eq('card_id', cardId)
    .or(`points_expires_at.is.null,points_expires_at.gt.${new Date().toISOString()}`)
    .is('points_deducted', null)
    .not('points', 'is', null);

  if (error) return 0;
  return data.reduce((sum, t) => sum + (t.points || 0), 0);
}