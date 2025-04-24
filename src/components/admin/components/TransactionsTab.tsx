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
}

export function TransactionsTab({
  transactions,
  loading,
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

  if (loading) {
    return (
      <div className="flex justify-center p-8">Loading transactions...</div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Points History Card */}
      <UICard>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Points History</CardTitle>
              <CardDescription>All customer points transactions</CardDescription>
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
                <TableHead>Points</TableHead>
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
                    <TableCell>{t.points || 0} pts</TableCell>
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