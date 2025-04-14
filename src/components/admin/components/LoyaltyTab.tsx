import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Card } from "../types";
import { Card as UICard, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PlusCircle, RefreshCw, XCircle } from "lucide-react";

interface LoyaltyTabProps {
  cards: Card[];
  loading: boolean;
}

export function LoyaltyTab({ cards, loading }: LoyaltyTabProps) {
  if (loading) {
    return <div className="flex justify-center p-8">Loading cards...</div>;
  }

  return (
    <>
      <UICard>
        <CardHeader>
          <CardTitle>Card Operations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="flex items-center gap-2 h-24">
              <PlusCircle className="w-6 h-6" />
              <div className="text-left">
                <div className="font-medium">Issue New Card</div>
                <div className="text-sm text-muted-foreground">Create new loyalty card</div>
              </div>
            </Button>
            <Button variant="outline" className="flex items-center gap-2 h-24">
              <RefreshCw className="w-6 h-6" />
              <div className="text-left">
                <div className="font-medium">Reload Card</div>
                <div className="text-sm text-muted-foreground">Add balance to existing card</div>
              </div>
            </Button>
            <Button variant="outline" className="flex items-center gap-2 h-24">
              <XCircle className="w-6 h-6" />
              <div className="text-left">
                <div className="font-medium">Deactivate Card</div>
                <div className="text-sm text-muted-foreground">Disable lost/stolen cards</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </UICard>

      <UICard>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Loyalty Cards</CardTitle>
              <CardDescription>All issued loyalty cards</CardDescription>
            </div>
            <Input placeholder="Search cards..." className="max-w-sm" />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Card ID</TableHead>
                <TableHead>Member</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Points</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Issued</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cards.length > 0 ? (
                cards.map((card) => (
                  <TableRow key={card.id}>
                    <TableCell>{card.uid}</TableCell>
                    <TableCell>{card.profiles?.full_name || 'No member'}</TableCell>
                    <TableCell>₱{card.balance.toFixed(2)}</TableCell>
                    <TableCell>{card.points}</TableCell>
                    <TableCell>
                      <Badge variant={card.status === 'active' ? 'default' : 'destructive'}>
                        {card.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {format(new Date(card.created_at), 'MMM d, yyyy')}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    No cards found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </UICard>
    </>
  );
}