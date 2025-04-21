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

  useEffect(() => {
    fetchPendingTransactions(); // Initial fetch

    const channel = supabase
      .channel("realtime-transactions")
      .on(
        "postgres_changes",
        {
          event: "*", // Can be 'INSERT' | 'UPDATE' | 'DELETE' or '*'
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
      .select("id, created_at, amount, cards(uid)")
      .eq("status", "Pending")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setPendingTransactions(data);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full px-6 py-4 bg-white shadow flex justify-end items-center gap-4">
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
        <DropdownMenuContent sideOffset={12} className="w-[320px] mr-2">

          <div className="px-3 py-2 font-semibold text-sm">Notifications</div>
          <DropdownMenuSeparator />
          {pendingTransactions.length === 0 ? (
            <DropdownMenuItem disabled>No new transactions</DropdownMenuItem>
          ) : (
            pendingTransactions.slice(0, 5).map((txn) => (
              <DropdownMenuItem key={txn.id} className="flex flex-col items-start">
                <span className="font-medium">
                  ₱{txn.amount.toFixed(2)} — Transaction ID: {txn.id}
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
    </header>
  );
}
