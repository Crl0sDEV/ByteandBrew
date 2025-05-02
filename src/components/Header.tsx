"use client";

import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Bell, BellDot, Check } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

interface Redemption {
  id: string;
  redeemed_at: string;
  points_used: number;
  status: string;
  read: boolean;
  rewards: {
    name: string;
    points_required: number;
  } | null;
  cards: {
    uid: string;
  } | null;
}

export function Header() {
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [selectedRedemption, setSelectedRedemption] =
    useState<Redemption | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    if (!user?.id) return;

    const profileChannel = supabase
      .channel('realtime-profile')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`
        },
        (payload) => {
          setProfile(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(profileChannel);
    };
  }, [user?.id]);

  useEffect(() => {
    const fetchSession = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error) {
        console.error("Error fetching user:", error);
        return;
      }
      if (user) {
        setUser(user);
        fetchProfile(user.id);
      }
    };

    const fetchProfile = async (userId: string) => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        return;
      }
      if (data) {
        setProfile(data);
      }
    };

    fetchSession();
    fetchRedemptions();

    const channel = supabase
      .channel("realtime-redemptions")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "redemptions",
        },
        () => {
          fetchRedemptions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchRedemptions = async () => {
    const { data, error } = await supabase
      .from("redemptions")
      .select(`
        id, 
        redeemed_at, 
        points_used, 
        status, 
        read,
        rewards:reward_id (name, points_required),
        cards:card_id (uid)
      `)
      .order("redeemed_at", { ascending: false });

    if (error) {
      console.error("Error fetching redemptions:", error);
      return;
    }

    if (data) {
      setRedemptions(data);
      const unread = data.filter((r) => !r.read).length;
      setUnreadCount(unread);
    }
  };

  const markAsRead = async (redemptionId: string) => {
    const { error } = await supabase
      .from("redemptions")
      .update({ read: true })
      .eq("id", redemptionId);

    if (error) {
      console.error("Error marking as read:", error);
      return;
    }

    setRedemptions(
      redemptions.map((r) =>
        r.id === redemptionId ? { ...r, read: true } : r
      )
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const handleRedemptionClick = (
    redemption: Redemption,
    e: React.MouseEvent
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedRedemption(redemption);
    setIsDropdownOpen(false);
    if (!redemption.read) {
      markAsRead(redemption.id);
    }
  };

  const markAllAsRead = async () => {
    const unreadIds = redemptions.filter((r) => !r.read).map((r) => r.id);

    if (unreadIds.length === 0) return;

    const { error } = await supabase
      .from("redemptions")
      .update({ read: true })
      .in("id", unreadIds);

    if (error) {
      console.error("Error marking all as read:", error);
      return;
    }

    setRedemptions(redemptions.map((r) => ({ ...r, read: true })));
    setUnreadCount(0);
    setIsDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full px-6 py-4 bg-white shadow flex justify-between items-center">
      {/* Left side - Welcome message */}
      <div className="flex items-center gap-2">
        {profile && (
          <div className="text-sm font-medium">
            Welcome, {profile.full_name || user?.email}
          </div>
        )}
      </div>

      {/* Right side - Notification bell */}
      <div className="flex items-center gap-4">
        <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
          <DropdownMenuTrigger className="relative outline-none">
            {unreadCount > 0 ? (
              <BellDot className="w-6 h-6 text-red-600" />
            ) : (
              <Bell className="w-6 h-6" />
            )}
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent
            sideOffset={12}
            className="w-[350px] mr-4"
            onCloseAutoFocus={(e) => e.preventDefault()}
          >
            <div className="px-3 py-2 font-semibold text-sm">Reward Redemptions</div>
            <DropdownMenuSeparator />
            <ScrollArea className="h-[300px]">
              {redemptions.length === 0 ? (
                <DropdownMenuItem disabled className="text-center py-4">
                  No new redemptions
                </DropdownMenuItem>
              ) : (
                redemptions.map((redemption) => (
                  <DropdownMenuItem
                    key={redemption.id}
                    className={`flex flex-col items-start ${
                      !redemption.read ? "bg-gray-50" : ""
                    }`}
                    onClick={(e) => handleRedemptionClick(redemption, e)}
                  >
                    <div className="flex w-full justify-between">
                      <span className="font-medium">
                        {redemption.rewards?.name || "Unknown Reward"} redeemed
                      </span>
                      {!redemption.read && (
                        <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {redemption.points_used} points • Status: {redemption.status}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Card: {redemption.cards?.uid || "N/A"} •{" "}
                      {format(
                        new Date(redemption.redeemed_at),
                        "MMM d, h:mm a"
                      )}
                    </span>
                  </DropdownMenuItem>
                ))
              )}
            </ScrollArea>

            {/* Custom footer section */}
            <div className="border-t p-1 flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                className="text-sm"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  markAllAsRead();
                }}
                disabled={unreadCount === 0}
              >
                <Check className="mr-2 h-4 w-4" />
                Mark all as read
              </Button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Redemption Detail Dialog */}
        <Dialog
          open={!!selectedRedemption}
          onOpenChange={(open) => {
            if (!open) setSelectedRedemption(null);
          }}
        >
          <DialogContent className="sm:max-w-[425px]">
            {selectedRedemption && (
              <>
                <DialogHeader>
                  <DialogTitle>Redemption Details</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <span className="text-sm font-medium">Reward:</span>
                    <span className="col-span-3">
                      {selectedRedemption.rewards?.name || "Unknown Reward"}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <span className="text-sm font-medium">Points Used:</span>
                    <span className="col-span-3">
                      {selectedRedemption.points_used}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <span className="text-sm font-medium">Status:</span>
                    <span className="col-span-3">
                      {selectedRedemption.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <span className="text-sm font-medium">Card:</span>
                    <span className="col-span-3">
                      {selectedRedemption.cards?.uid || "N/A"}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <span className="text-sm font-medium">Redeemed:</span>
                    <span className="col-span-3">
                      {format(
                        new Date(selectedRedemption.redeemed_at),
                        "MMM d, yyyy h:mm a"
                      )}
                    </span>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </header>
  );
}