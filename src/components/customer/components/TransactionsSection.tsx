import { Card as UICard, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Transaction } from "../types";

interface TransactionsSectionProps {
  transactions: Transaction[];
}

export function TransactionsSection({ transactions }: TransactionsSectionProps) {
  return (
    <UICard>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
        <CardDescription>Your purchase history</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Points</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.length > 0 ? (
              transactions.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>{t.date}</TableCell>
                  <TableCell>₱{t.amount}</TableCell>
                  <TableCell>{t.items}</TableCell>
                  <TableCell>+{t.pointsEarned}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant="outline">{t.status}</Badge>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  No transactions found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </UICard>
  );
}