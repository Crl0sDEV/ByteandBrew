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

interface Notification {
  id: string;
  created_at: string;
  points: number;
  cards: { uid: string } | null;
  type: string;
  status: string;
  read: boolean;
}

export function Header() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [selectedNotification, setSelectedNotification] =
    useState<Notification | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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
    fetchNotifications();

    const channel = supabase
      .channel("realtime-notifications")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "transactions",
          filter: "status=eq.Completed",
        },
        () => {
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchNotifications = async () => {
    const { data, error } = await supabase
      .from("transactions")
      .select("id, created_at, points, cards(uid), type, status, read")
      .eq("status", "Completed")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching notifications:", error);
      return;
    }

    if (data) {
      setNotifications(data);
      const unread = data.filter((n) => !n.read).length;
      setUnreadCount(unread);
    }
  };

  const markAsRead = async (notificationId: string) => {
    const { error } = await supabase
      .from("transactions")
      .update({ read: true })
      .eq("id", notificationId);

    if (error) {
      console.error("Error marking as read:", error);
      return;
    }

    setNotifications(
      notifications.map((n) =>
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const handleNotificationClick = (
    notification: Notification,
    e: React.MouseEvent
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedNotification(notification);
    setIsDropdownOpen(false);
    if (!notification.read) {
      markAsRead(notification.id);
    }
  };

  const markAllAsRead = async () => {
    const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id);

    if (unreadIds.length === 0) return;

    const { error } = await supabase
      .from("transactions")
      .update({ read: true })
      .in("id", unreadIds);

    if (error) {
      console.error("Error marking all as read:", error);
      return;
    }

    // Update local state
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
    setIsDropdownOpen(false); // Close dropdown after marking all as read
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
            <div className="px-3 py-2 font-semibold text-sm">Notifications</div>
            <DropdownMenuSeparator />
            <ScrollArea className="h-[300px]">
              {notifications.length === 0 ? (
                <DropdownMenuItem disabled className="text-center py-4">
                  No new notifications
                </DropdownMenuItem>
              ) : (
                notifications.map((notification) => (
                  <DropdownMenuItem
                    key={notification.id}
                    className={`flex flex-col items-start ${
                      !notification.read ? "bg-gray-50" : ""
                    }`}
                    onClick={(e) => handleNotificationClick(notification, e)}
                  >
                    <div className="flex w-full justify-between">
                      <span className="font-medium">
                        {notification.points || 0} points — {notification.type}
                      </span>
                      {!notification.read && (
                        <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      Card: {notification.cards?.uid || "N/A"} •{" "}
                      {format(
                        new Date(notification.created_at),
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

        {/* Notification Detail Dialog */}
        <Dialog
          open={!!selectedNotification}
          onOpenChange={(open) => {
            if (!open) setSelectedNotification(null);
          }}
        >
          <DialogContent className="sm:max-w-[425px]">
            {selectedNotification && (
              <>
                <DialogHeader>
                  <DialogTitle>Transaction Details</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <span className="text-sm font-medium">Points:</span>
                    <span className="col-span-3">
                      {selectedNotification.points || 0}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <span className="text-sm font-medium">Type:</span>
                    <span className="col-span-3">
                      {selectedNotification.type}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <span className="text-sm font-medium">Card:</span>
                    <span className="col-span-3">
                      {selectedNotification.cards?.uid || "N/A"}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <span className="text-sm font-medium">Date:</span>
                    <span className="col-span-3">
                      {format(
                        new Date(selectedNotification.created_at),
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
