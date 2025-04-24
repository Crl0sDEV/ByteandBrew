"use client";

import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Bell, BellDot } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { format } from "date-fns";

export function Header() {
  const [pendingTransactions, setPendingTransactions] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    // Fetch user session
    const fetchSession = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        fetchProfile(user.id);
      }
    };

    // Fetch user profile
    const fetchProfile = async (userId: string) => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (!error && data) {
        setProfile(data);
      }
    };

    fetchSession();
    fetchPendingTransactions(); // Initial fetch

    const channel = supabase
      .channel("realtime-transactions")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "transactions",
        },
        () => {
          fetchPendingTransactions(); // Re-fetch on any change
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchPendingTransactions = async () => {
    const { data, error } = await supabase
      .from("transactions")
      .select("id, created_at, amount, cards(uid), type")
      .eq("status", "Pending")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setPendingTransactions(data);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full px-6 py-4 bg-white shadow flex justify-between items-center">
      {/* Left side - Welcome message and role */}
      <div className="flex items-center gap-2">
        {profile && (
          <>
            <div className="text-sm font-medium">
              Welcome, {profile.full_name || user?.email}
            </div>
            
          </>
        )}
      </div>

      {/* Right side - Notification bell */}
      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger className="relative">
            {pendingTransactions.length > 0 ? (
              <BellDot className="w-6 h-6 text-red-600 animate-pulse" />
            ) : (
              <Bell className="w-6 h-6" />
            )}
            {pendingTransactions.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 rounded-full">
                {pendingTransactions.length}
              </span>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent sideOffset={12} className="w-[320px] mr-4">
            <div className="px-3 py-2 font-semibold text-sm">Notifications</div>
            <DropdownMenuSeparator />
            {pendingTransactions.length === 0 ? (
              <DropdownMenuItem disabled>No new notifications</DropdownMenuItem>
            ) : (
              pendingTransactions.slice(0, 5).map((txn) => (
                <DropdownMenuItem key={txn.id} className="flex flex-col items-start">
                  <span className="font-medium">
                    ₱{txn.amount.toFixed(2)} — Type: {txn.type}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Card: {txn.cards?.uid || "N/A"} •{" "}
                    {format(new Date(txn.created_at), "MMM d, h:mm a")}
                  </span>
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}