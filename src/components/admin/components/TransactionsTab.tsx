import { useEffect, useState } from "react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Transaction } from "../types";
import {
  Card as UICard,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface TransactionsTabProps {
  transactions: Transaction[];
  loading: boolean;
  onStatusChange?: () => void;
}

export function TransactionsTab({
  transactions,
  loading,
  onStatusChange,
}: TransactionsTabProps) {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [filteredTransactions, setFilteredTransactions] =
    useState<Transaction[]>(transactions);
  const [pendingTransactions, setPendingTransactions] = useState<Transaction[]>(
    []
  );

  const [currentPage, setCurrentPage] = useState(1);
  const transactionsPerPage = 5;

  const totalPages = Math.ceil(
    filteredTransactions.length / transactionsPerPage
  );
  const indexOfLastTransaction = currentPage * transactionsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
  const currentTransactions = filteredTransactions.slice(
    indexOfFirstTransaction,
    indexOfLastTransaction
  );

  useEffect(() => {
    if (statusFilter === "all") {
      setFilteredTransactions(transactions);
    } else {
      setFilteredTransactions(
        transactions.filter(
          (t) => t.status.toLowerCase() === statusFilter.toLowerCase()
        )
      );
    }

    setPendingTransactions(transactions.filter((t) => t.status === "Pending"));
  }, [statusFilter, transactions]);

  useEffect(() => {
    setCurrentPage(1); // Reset page on filter change
  }, [statusFilter]);

  const verifyAdmin = async () => {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      throw new Error("Not authenticated");
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single();

    if (profileError || !profile || profile.role !== "admin") {
      throw new Error("Only admins can perform this action");
    }

    return true;
  };

  const handleApprove = async (transactionId: string) => {
    try {
      await verifyAdmin();

      const { error } = await supabase.rpc("approve_transaction", {
        tx_id: transactionId,
      });

      if (error) throw error;

      toast.success("Transaction approved successfully");
      if (onStatusChange) onStatusChange();
    } catch (error) {
      console.error("Approval error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to approve transaction"
      );
    }
  };

  const handleReject = async (transactionId: string) => {
    try {
      await verifyAdmin();

      const { error } = await supabase.rpc("reject_transaction", {
        tx_id: transactionId,
      });

      if (error) throw error;

      toast.success("Transaction rejected");
      if (onStatusChange) onStatusChange();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to reject transaction"
      );
    }
  };

  const handleApproveAll = async () => {
    try {
      await verifyAdmin();

      const { error } = await supabase.rpc("approve_all_pending_transactions");

      if (error) throw error;

      toast.success("All pending transactions approved");
      if (onStatusChange) onStatusChange();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to approve all"
      );
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">Loading transactions...</div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Approval Card */}
      {pendingTransactions.length > 0 && (
        <UICard>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Pending Approvals</CardTitle>
                <CardDescription>
                  {pendingTransactions.length} transactions awaiting approval
                </CardDescription>
              </div>
              <Button
                size="sm"
                onClick={handleApproveAll}
                variant="outline"
                className="bg-green-100 hover:bg-green-200 text-green-800"
              >
                Approve All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingTransactions.map((t) => (
                <div key={t.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Card: {t.cards?.uid || "N/A"}</p>
                  <p className="text-sm text-muted-foreground">
                    {t.user?.full_name || "Anonymous"} - ₱{t.amount.toFixed(2)}
                    {t.selected_size && ` • Size: ${t.selected_size}`} {/* Display as plain string */}
        {t.category && ` • ${t.category}`}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t.is_add_on && "Add-on • "}
                    {format(new Date(t.created_at), "MMM d, h:mm a")}
                  </p>
                </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleApprove(t.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleReject(t.id)}
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </UICard>
      )}

      {/* Transactions History Card */}
      <UICard>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Transactions History</CardTitle>
              <CardDescription>All customer purchase records</CardDescription>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Transactions</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Card</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentTransactions.length > 0 ? (
                currentTransactions.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell>{t.cards?.uid || "N/A"}</TableCell>
                    <TableCell>{t.user?.full_name || "Anonymous"}</TableCell>
                    <TableCell>₱{t.amount.toFixed(2)}</TableCell>
                    <TableCell>
                      {t.selected_size ? (
                        <Badge variant="outline">
                          {t.selected_size.toUpperCase()}
                        </Badge>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {t.category || "N/A"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          t.status === "Completed"
                            ? "default"
                            : t.status === "Pending"
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {t.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{t.type}</TableCell>
                    <TableCell className="text-right">
                      {format(new Date(t.created_at), "MMM d, h:mm a")}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">
                    No transactions found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination className="mt-4">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    className={
                      currentPage === 1 ? "pointer-events-none opacity-50" : ""
                    }
                  />
                </PaginationItem>

                {[...Array(totalPages)].map((_, index) => (
                  <PaginationItem key={index}>
                    <button
                      onClick={() => setCurrentPage(index + 1)}
                      className={`px-3 py-1 rounded-md ${
                        currentPage === index + 1
                          ? "bg-primary text-white"
                          : "hover:bg-muted"
                      }`}
                    >
                      {index + 1}
                    </button>
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    className={
                      currentPage === totalPages
                        ? "pointer-events-none opacity-50"
                        : ""
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </CardContent>
      </UICard>
    </div>
  );
}