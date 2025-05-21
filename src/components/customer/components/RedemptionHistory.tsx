"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { ChevronDown, ChevronUp, Store, RefreshCw } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"
import { Card as UICard, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface Redemption {
  id: string
  rewardId: string
  redeemedAt: string | null
  pointsUsed: number | null
  status: string
  rewardName?: string
  rewardDescription?: string
}

interface RedemptionHistoryProps {
  redemptions: Redemption[]
  userId?: string
}

export function RedemptionHistorySection({ redemptions: initialRedemptions, userId }: RedemptionHistoryProps) {
  const [expandedRedemption, setExpandedRedemption] = useState<string | null>(null)
  const [redemptions, setRedemptions] = useState<Redemption[]>(initialRedemptions)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const fetchRedemptions = useCallback(async () => {
    if (!userId) return

    try {
      setIsRefreshing(true)

      
      const { data: latestRedemptions, error } = await supabase
        .from("redemptions")
        .select("*")
        .eq("userId", userId)
        .order("redeemedAt", { ascending: false })

      if (error) throw error

      
      const rewardIds = latestRedemptions
        .map((r) => r.rewardId)
        .filter((id, index, self) => id && self.indexOf(id) === index)

      if (rewardIds.length === 0) {
        setRedemptions([])
        return
      }

      const { data: rewards, error: rewardsError } = await supabase
        .from("rewards")
        .select("id, name, description")
        .in("id", rewardIds)

      if (rewardsError) throw rewardsError

      const rewardsMap = rewards.reduce(
        (acc, reward) => {
          acc[reward.id] = reward
          return acc
        },
        {} as Record<string, { name: string; description: string }>,
      )

      
      const enrichedRedemptions = latestRedemptions.map((r) => ({
        ...r,
        rewardName: r.rewardId ? rewardsMap[r.rewardId]?.name || "Unknown reward" : "No reward",
        rewardDescription: r.rewardId ? rewardsMap[r.rewardId]?.description : undefined,
      }))

      setRedemptions(enrichedRedemptions)
      toast.success("Redemption history updated")
    } catch (error) {
      console.error("Error refreshing redemptions:", error)
      toast.error("Failed to refresh redemption history")
    } finally {
      setIsRefreshing(false)
    }
  }, [userId])

  const handleManualRefresh = () => {
    fetchRedemptions()
  }

  
  useEffect(() => {
    const loadAllRewardNames = async () => {
      try {
        const rewardIds = initialRedemptions
          .map((r) => r.rewardId)
          .filter((id, index, self) => id && self.indexOf(id) === index)

        if (rewardIds.length === 0) return

        const { data: rewards, error } = await supabase
          .from("rewards")
          .select("id, name, description")
          .in("id", rewardIds)

        if (error) throw error

        const rewardsMap = rewards.reduce(
          (acc, reward) => {
            acc[reward.id] = reward
            return acc
          },
          {} as Record<string, { name: string; description: string }>,
        )

        setRedemptions((prev) =>
          prev.map((r) => ({
            ...r,
            rewardName: r.rewardId ? rewardsMap[r.rewardId]?.name || "Unknown reward" : "No reward",
            rewardDescription: r.rewardId ? rewardsMap[r.rewardId]?.description : undefined,
          })),
        )
      } catch (error) {
        console.error("Error loading reward names:", error)
        toast.error("Failed to load reward information")
      }
    }

    loadAllRewardNames()
  }, [initialRedemptions])

  
  useEffect(() => {
    
    if (userId) {
      const subscription = supabase
        .channel("redemptions-changes")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "redemptions",
            filter: `userId=eq.${userId}`,
          },
          () => {
            
            
            if (refreshTimeoutRef.current) {
              clearTimeout(refreshTimeoutRef.current)
            }

            refreshTimeoutRef.current = setTimeout(() => {
              fetchRedemptions()
            }, 500)
          },
        )
        .subscribe()

      
      const intervalId = setInterval(() => {
        fetchRedemptions()
      }, 30000)

      return () => {
        subscription.unsubscribe()
        clearInterval(intervalId)
        if (refreshTimeoutRef.current) {
          clearTimeout(refreshTimeoutRef.current)
        }
      }
    }
  }, [userId, fetchRedemptions])

  const toggleRedemptionDetails = (redemptionId: string) => {
    setExpandedRedemption((prev) => (prev === redemptionId ? null : redemptionId))
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <UICard className="border-0 shadow-lg bg-gradient-to-br from-primary/5 to-background">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle>Redemption History</CardTitle>
          <Button variant="ghost" size="sm" onClick={handleManualRefresh} disabled={isRefreshing} className="h-8 px-2">
            <RefreshCw className={`h-4 w-4 mr-1 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {redemptions.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No redemptions yet.</p>
          ) : (
            <div className="max-h-[400px] overflow-y-auto pr-1 -mr-1">
              <ul className="space-y-3">
                <AnimatePresence>
                  {redemptions.map((redemption) => (
                    <motion.li
                      key={redemption.id}
                      className="border rounded-md overflow-hidden bg-background/90"
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                      layout
                    >
                      <div
                        className="p-4 flex justify-between items-center cursor-pointer hover:bg-primary/5 transition-colors"
                        onClick={() => toggleRedemptionDetails(redemption.id)}
                      >
                        <div className="space-y-1">
                          <h3 className="font-medium">{redemption.rewardName || "Unknown reward"}</h3>
                          <p className="text-sm text-muted-foreground">
                            {redemption.redeemedAt
                              ? new Date(redemption.redeemedAt).toLocaleString()
                              : "No date available"}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-semibold">
                            -{redemption.pointsUsed !== null ? redemption.pointsUsed : "?"} pts
                          </span>
                          <span
                            className={`text-xs font-semibold px-2 py-1 rounded-full ${
                              redemption.status === "completed"
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {redemption.status}
                          </span>
                          {expandedRedemption === redemption.id ? (
                            <ChevronUp className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                      </div>

                      <AnimatePresence>
                        {expandedRedemption === redemption.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="p-4 pt-0 border-t bg-background/95"
                          >
                            <div className="mb-3">
                              <h4 className="font-medium mb-1">Reward Details:</h4>
                              <p className="text-sm text-muted-foreground">
                                {redemption.rewardDescription || "No description available"}
                              </p>
                            </div>

                            <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-md">
                              <Store className="h-4 w-4 mt-0.5 text-blue-600 flex-shrink-0" />
                              <div>
                                <h4 className="font-medium text-sm mb-1">How to claim:</h4>
                                <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                                  <li>Visit our store locations</li>
                                  <li>Show this redemption to the cashier</li>
                                  <li>Present your loyalty card if required</li>
                                  <li>Enjoy your reward!</li>
                                </ul>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            </div>
          )}
        </CardContent>
      </UICard>
    </motion.div>
  )
}
