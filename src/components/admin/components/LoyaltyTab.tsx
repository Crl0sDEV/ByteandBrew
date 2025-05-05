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
import { Card, Profile } from "../types";
import {
  Card as UICard,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PlusCircle, XCircle, User, Check, X, Scan } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { RFIDScanner } from "./RFIDScanner";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const onCardRegister = async (uid: string, userId: string) => {
  const { data, error } = await supabase.from("cards").insert([
    {
      uid,
      user_id: userId,
      points: 0,
      status: "active",
    },
  ]);

  if (error) throw error;
  return data;
};

const onCardDeactivate = async (cardId: string, reason: string, deactivatedBy: string) => {
  try {
    const { data, error } = await supabase.rpc('deactivate_card_with_reason', {
      card_id: cardId,
      deactivation_reason: reason,
      deactivated_by: deactivatedBy
    });

    if (error) throw error;

    return data;
  } catch (error) {
    console.error("Error deactivating card:", error);
    throw error;
  }
};

interface LoyaltyTabProps {
  cards: Card[];
  members: Profile[];
  loading: boolean;
  onCardRegister: (uid: string, userId: string) => Promise<void>;
  onCardDeactivate: (cardId: string, reason: string, deactivatedBy: string) => Promise<void>;
  onCardReload: () => void;
}

export function LoyaltyTab({ cards, members, loading }: LoyaltyTabProps) {
  const [action, setAction] = useState<"issue" | "deactivate" | null>(null);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [selectedMember, setSelectedMember] = useState<Profile | null>(null);
  const [scannedUid, setScannedUid] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectionMethod, setSelectionMethod] = useState<"member" | "scan">(
    "member"
  );
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);
  const [deactivationReason, setDeactivationReason] = useState("lost");
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    };
    fetchUser();
  }, []);

  const membersWithoutCards = (members ?? []).filter(
    (member) => !(cards ?? []).some((card) => card.user_id === member.id)
  );
  const membersWithCards = (members ?? []).filter((member) =>
    (cards ?? []).some((card) => card.user_id === member.id)
  );

  const handleMemberSelect = (memberId: string) => {
    const member = membersWithCards.find((m) => m.id === memberId);
    setSelectedMember(member || null);
    const memberCard = cards.find((card) => card.user_id === memberId);
    setSelectedCard(memberCard || null);
  };

  const filteredCards = cards.filter(
    (card) =>
      card.uid.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleScan = (uid: string) => {
    setScannedUid(uid);
    const existingCard = cards.find((card) => card.uid === uid);
    if (existingCard) {
      setSelectedCard(existingCard);
      if (action === "issue") {
        toast.error("This card is already registered to another member.");
      }
    }
  };

  const handleIssueCard = async () => {
    if (!scannedUid || !selectedMember) return;

    try {
      await onCardRegister(scannedUid, selectedMember.id);
      toast.success(
        `Card ${scannedUid} registered to ${selectedMember.full_name}`
      );
      resetState();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not register card"
      );
    }
  };

  const handleDeactivateCard = async () => {
    if (!selectedCard || !currentUser) return;

    try {
      await onCardDeactivate(
        selectedCard.id, 
        deactivationReason, 
        currentUser.id
      );
      
      toast.success("Card Deactivated", {
        description: `Card ${selectedCard.uid} has been deactivated (Reason: ${deactivationReason})`,
      });
      resetState();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not deactivate card"
      );
    } finally {
      setShowDeactivateConfirm(false);
    }
  };

  const resetState = () => {
    setAction(null);
    setSelectedCard(null);
    setSelectedMember(null);
    setScannedUid(null);
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading cards...</div>;
  }

  return (
    <>
      {/* Card Operations */}
      <UICard>
        <CardHeader>
          <CardTitle>Loyalty Card Operations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              variant="outline"
              className="flex items-center gap-2 h-24"
              onClick={() => setAction("issue")}
            >
              <PlusCircle className="w-6 h-6" />
              <div className="text-left">
                <div className="font-medium">Issue New Card</div>
                <div className="text-sm text-muted-foreground">
                  Register new loyalty card
                </div>
              </div>
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2 h-24"
              onClick={() => setAction("deactivate")}
              disabled={cards.length === 0}
            >
              <XCircle className="w-6 h-6" />
              <div className="text-left">
                <div className="font-medium">Deactivate Card</div>
                <div className="text-sm text-muted-foreground">
                  Disable lost/stolen cards
                </div>
              </div>
            </Button>
          </div>
        </CardContent>
      </UICard>

      {/* Action Dialogs */}
      <Dialog
        open={action !== null}
        onOpenChange={(open) => !open && resetState()}
      >
        <DialogContent>
          {action === "issue" && (
            <>
              <DialogHeader>
                <DialogTitle>Issue New Loyalty Card</DialogTitle>
                <DialogDescription>
                  Register a new loyalty card to a member
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <RFIDScanner onScan={handleScan} />

                {scannedUid && (
                  <div className="p-3 border rounded-lg">
                    <p className="font-medium">Scanned Card: {scannedUid}</p>
                    {selectedCard && (
                      <p className="text-sm text-red-500 mt-1">
                        Warning: This card is already registered
                      </p>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Select Member</Label>
                  <Select
                    value={selectedMember?.id || ""}
                    onValueChange={(value) => {
                      const member = membersWithoutCards.find(
                        (m) => m.id === value
                      );
                      setSelectedMember(member || null);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a member">
                        {selectedMember
                          ? selectedMember.full_name
                          : "Select member"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {membersWithoutCards.length > 0 ? (
                        membersWithoutCards.map((member) => (
                          <SelectItem key={member.id} value={member.id}>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              {member.full_name}
                            </div>
                          </SelectItem>
                        ))
                      ) : (
                        <div className="text-sm text-muted-foreground p-2">
                          No members available without cards
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={resetState}>
                  Cancel
                </Button>
                <Button
                  onClick={handleIssueCard}
                  disabled={!scannedUid || !selectedMember || !!selectedCard}
                >
                  <Check className="mr-2 h-4 w-4" />
                  Register Card
                </Button>
              </DialogFooter>
            </>
          )}

          {action === "deactivate" && (
            <>
              <DialogHeader>
                <DialogTitle>Deactivate Loyalty Card</DialogTitle>
                <DialogDescription>
                  Deactivate a lost or stolen loyalty card
                </DialogDescription>
              </DialogHeader>

              <Tabs
                value={selectionMethod}
                onValueChange={(value) =>
                  setSelectionMethod(value as "member" | "scan")
                }
                className="mb-4"
              >
                <TabsList>
                  <TabsTrigger value="member">
                    <User className="h-4 w-4 mr-2" />
                    Select Member
                  </TabsTrigger>
                  <TabsTrigger value="scan">
                    <Scan className="h-4 w-4 mr-2" />
                    Scan Card
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {selectionMethod === "member" ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Select Member</Label>
                    <Select
                      value={selectedMember?.id || ""}
                      onValueChange={handleMemberSelect}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a member">
                          {selectedMember
                            ? selectedMember.full_name
                            : "Select member"}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {membersWithCards.length > 0 ? (
                          membersWithCards.map((member) => (
                            <SelectItem key={member.id} value={member.id}>
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                {member.full_name}
                              </div>
                            </SelectItem>
                          ))
                        ) : (
                          <div className="text-sm text-muted-foreground p-2">
                            No members with cards available
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedCard && (
                    <div className="p-4 border rounded-lg space-y-2 bg-muted/50">
                      <p className="font-medium">Card Details</p>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Card ID
                          </p>
                          <p>{selectedCard.uid}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Current Points
                          </p>
                          <p>{selectedCard.points}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Status
                          </p>
                          <Badge
                            variant={
                              selectedCard.status === "active"
                                ? "default"
                                : "destructive"
                            }
                          >
                            {selectedCard.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <RFIDScanner onScan={handleScan} />
                  {scannedUid && !selectedCard && (
                    <p className="text-red-500">
                      Card not found. Please scan a registered card.
                    </p>
                  )}
                </div>
              )}

              {selectedCard && (
                <div className="space-y-2">
                  <Label>Reason for Deactivation</Label>
                  <Select
                    value={deactivationReason}
                    onValueChange={setDeactivationReason}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select reason" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lost">Lost</SelectItem>
                      <SelectItem value="stolen">Stolen</SelectItem>
                      <SelectItem value="damaged">Damaged</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <DialogFooter>
                <Button variant="outline" onClick={resetState}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setShowDeactivateConfirm(true)}
                  disabled={!selectedCard || selectedCard.status !== "active"}
                >
                  <X className="mr-2 h-4 w-4" />
                  Deactivate Card
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={showDeactivateConfirm}
        onOpenChange={setShowDeactivateConfirm}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deactivation</DialogTitle>
            <DialogDescription>
              This card has {selectedCard?.points || 0} points. Are you sure you
              want to deactivate it?
              {selectedCard && (
                <div className="mt-2">
                  <p className="text-sm font-medium">Reason: {deactivationReason}</p>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeactivateConfirm(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeactivateCard}>
              Confirm Deactivation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cards Table */}
      <UICard className="mt-6">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Loyalty Cards</CardTitle>
              <CardDescription>
                All issued loyalty cards and their points
              </CardDescription>
            </div>
            <Input
              placeholder="Search cards..."
              className="max-w-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Card ID</TableHead>
                <TableHead>Points</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Issued</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCards.length > 0 ? (
                filteredCards.map((card) => (
                  <TableRow
                    key={card.id}
                    className={
                      selectedCard?.id === card.id ? "bg-muted/50" : ""
                    }
                    onClick={() => setSelectedCard(card)}
                  >
                    <TableCell>{card.uid}</TableCell>
                    <TableCell>{card.points}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          card.status === "active" ? "default" : "destructive"
                        }
                      >
                        {card.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {format(new Date(card.created_at), "MMM d, yyyy")}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    {searchTerm ? "No matching cards found" : "No cards found"}
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