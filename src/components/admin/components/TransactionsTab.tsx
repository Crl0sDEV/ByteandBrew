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
import { Transaction, Card, Product } from "../types";
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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { ManualTransactionCard } from "./ManualTransactionCard";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";

interface TransactionsTabProps {
  transactions: Transaction[];
  loading: boolean;
  cards: Card[];
  products: Product[];
  onTransactionCreated: () => void;
}

export function TransactionsTab({
  transactions,
  loading,
  cards,
  products,
  onTransactionCreated,
}: TransactionsTabProps) {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [filteredTransactions, setFilteredTransactions] =
    useState<Transaction[]>(transactions);

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
  }, [statusFilter, transactions]);

  useEffect(() => {
    setCurrentPage(1); // Reset page on filter change
  }, [statusFilter]);

  const handleSubmitTransaction = async (txData: any) => {
    try {
      // Calculate total points from all products
      const totalPoints = txData.items.reduce((sum, item) => {
        return sum + (item.pointValue * item.quantity);
      }, 0);
  
      // Calculate expiration date (15 days from now) if points are being earned
      const pointsExpiresAt = totalPoints > 0 
        ? new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString()
        : null;
  
      // Create the transaction record first
      const { data: transactionData, error: txError } = await supabase
        .from("transactions")
        .insert({
          card_id: txData.cardId,
          amount: txData.totalAmount,
          points: totalPoints,
          points_expires_at: pointsExpiresAt, // Add expiration date
          item_count: txData.items.reduce((sum, item) => sum + item.quantity, 0),
          type: "payment",
          status: "Completed",
          confirmed: true,
        })
        .select()
        .single();
  
      if (txError) throw txError;
      if (!transactionData) throw new Error("Transaction not created");
  
      // Create transaction items for each product
      const { error: itemsError } = await supabase
        .from("transaction_items")
        .insert(
          txData.items.map((item: any) => ({
            transaction_id: transactionData.id,
            product_id: item.productId,
            product_name: item.productName,
            quantity: item.quantity,
            price: item.finalPrice,
            size: item.size,
            temperature: item.temperature,
            is_add_on: item.isAddOn,
            points_earned: item.pointValue * item.quantity,
          }))
        );
  
      if (itemsError) throw itemsError;
  
      // Update card points if there are points to add
      if (totalPoints > 0) {
        const { data: cardData, error: fetchError } = await supabase
          .from("cards")
          .select("points")
          .eq("id", txData.cardId)
          .single();
  
        if (fetchError) throw fetchError;
        if (!cardData) throw new Error("Card not found");
  
        const newPoints = (cardData.points || 0) + totalPoints;
  
        const { error: updateError } = await supabase
          .from("cards")
          .update({ points: newPoints })
          .eq("id", txData.cardId);
  
        if (updateError) throw updateError;
      }
  
      toast.success(
        totalPoints > 0 
          ? `Transaction recorded and ${totalPoints} points added!` + 
            (pointsExpiresAt ? ` (expires in 15 days)` : '')
          : "Transaction recorded!"
      );
      
      // Refresh transactions
      onTransactionCreated();
    } catch (err) {
      console.error("Transaction error:", err);
      toast.error("Error recording transaction");
    }
  };
  if (loading) {
    return (
      <div className="flex justify-center p-8">Loading transactions...</div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Manual Transaction Card */}
      <ManualTransactionCard 
        cards={cards} 
        products={products} 
        onSubmit={handleSubmitTransaction} 
      />

      {/* Purchase History Card */}
      <UICard>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Purchase History</CardTitle>
              <CardDescription>
                All customer points and amounts transactions
              </CardDescription>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Transactions</SelectItem>
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
                <TableHead>Points Earned</TableHead>
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
                    <TableCell>{t.amount || "No Amount"}</TableCell>
                    <TableCell>{t.points || 0} pts</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          t.status === "Completed" ? "default" : "destructive"
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
                  <TableCell colSpan={7} className="text-center">
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