import { useState } from "react";
import { Card as UICard, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { Transaction } from "../types";
import { motion } from "framer-motion";

const ITEMS_PER_PAGE = 5;

export function TransactionsSection({ transactions }: { transactions: Transaction[] }) {
  const [currentPage, setCurrentPage] = useState(1);
  
  const totalPages = Math.ceil(transactions.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedTransactions = transactions.slice(startIndex, endIndex);

  const goToPage = (page: number) => setCurrentPage(page);
  const goToNextPage = () => currentPage < totalPages && setCurrentPage(currentPage + 1);
  const goToPrevPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <UICard className="border-0 shadow-lg bg-gradient-to-br from-primary/5 to-background">
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Your purchase and balance history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Desktop Table */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Points</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedTransactions.length > 0 ? (
                    paginatedTransactions.map((t) => (
                      <TableRow key={t.id} className="hover:bg-primary/5">
                        <TableCell>{t.date}</TableCell>
                        <TableCell>₱{t.amount}</TableCell>
                        <TableCell>{t.items}</TableCell>
                        <TableCell>{t.type}</TableCell>
                        <TableCell className="text-green-500">+{t.points}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant="outline">{t.status}</Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center h-24">
                        No transactions found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-2">
              {paginatedTransactions.length > 0 ? (
                paginatedTransactions.map((t) => (
                  <div key={t.id} className="border rounded-lg p-4 bg-background/90">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{t.date}</p>
                        <p className="text-sm text-muted-foreground">{t.type}</p>
                      </div>
                      <Badge variant="outline">{t.status}</Badge>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-sm text-muted-foreground">Amount</p>
                        <p>₱{t.amount}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Items</p>
                        <p>{t.items}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Points</p>
                        <p className="text-green-500">+{t.points}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center p-6 text-muted-foreground">
                  No transactions found.
                </div>
              )}
            </div>

            {/* Pagination */}
            {transactions.length > ITEMS_PER_PAGE && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
                <div className="text-sm text-muted-foreground">
                  Showing {startIndex + 1}-{Math.min(endIndex, transactions.length)} of {transactions.length}
                </div>
                
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToPrevPage}
                    disabled={currentPage === 1}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  {/* Mobile Pagination */}
                  <div className="md:hidden flex items-center gap-1">
                    <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                      {currentPage}
                    </Button>
                    <span className="text-sm px-1">/</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0"
                      onClick={() => goToPage(totalPages)}
                    >
                      {totalPages}
                    </Button>
                  </div>

                  {/* Desktop Pagination */}
                  <div className="hidden md:flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) pageNum = i + 1;
                      else if (currentPage <= 3) pageNum = i + 1;
                      else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                      else pageNum = currentPage - 2 + i;

                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => goToPage(pageNum)}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                    {totalPages > 5 && currentPage < totalPages - 2 && (
                      <>
                        <MoreHorizontal className="h-4 w-4 mx-1" />
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => goToPage(totalPages)}
                        >
                          {totalPages}
                        </Button>
                      </>
                    )}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </UICard>
    </motion.div>
  );
}