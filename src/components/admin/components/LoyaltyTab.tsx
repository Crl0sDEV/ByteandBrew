import { useState } from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Card, Profile } from "../types";
import { Card as UICard, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PlusCircle, RefreshCw, XCircle, User, Check, X, Scan } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
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
import { ReloadCardDialog } from "./ReloadCardDialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Define the onCardRegister function
const onCardRegister = async (uid: string, userId: string) => {
    const { data, error } = await supabase
      .from("cards")  // replace 'cards' with the actual table name
      .insert([
        { uid, user_id: userId, balance: 0, points: 0, status: "active" }  // adjust fields as needed
      ]);
  
    if (error) {
      throw new Error(error.message);  // Handle error
    }
  
    return data;
  };

  const onCardReload = async (cardId: string, amount: number) => {
    try {
      // First get the current balance
      const { data: cardData, error: fetchError } = await supabase
        .from('cards')
        .select('balance')
        .eq('id', cardId)
        .single();
  
      if (fetchError) throw fetchError;
      if (!cardData) throw new Error('Card not found');
  
      const currentBalance = cardData.balance;
      const newBalance = currentBalance + amount;
  
      // Then update the balance
      const { data, error } = await supabase
        .from('cards')
        .update({ balance: newBalance })
        .eq('id', cardId)
        .select();
  
      if (error) throw error;
  
      // Create a transaction record (optional but recommended)
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          card_id: cardId,
          amount: amount,
          type: 'reload',
          status: 'Completed'
        });
  
      if (transactionError) {
        console.error('Failed to create transaction record:', transactionError);
        // Don't throw error here as the reload was successful
      }
  
      return data;
    } catch (error) {
      console.error('Error reloading card:', error);
      throw error;
    }
  };  

  const onCardDeactivate = async (cardId: string) => {
    try {
      // First check if card exists and is active
      const { data: cardData, error: fetchError } = await supabase
        .from('cards')
        .select('status')
        .eq('id', cardId)
        .single();
  
      if (fetchError) throw fetchError;
      if (!cardData) throw new Error('Card not found');
      if (cardData.status !== 'active') throw new Error('Card is already inactive');
  
      // Update card status to inactive
      const { data, error } = await supabase
        .from('cards')
        .update({ status: 'inactive' })
        .eq('id', cardId)
        .select();
  
      if (error) throw error;
  
      // Create a deactivation record (optional but recommended)
      const { error: deactivationError } = await supabase
        .from('card_deactivations')
        .insert({
          card_id: cardId,
          deactivated_at: new Date().toISOString(),
          reason: 'manual_deactivation'
        });
  
      if (deactivationError) {
        console.error('Failed to create deactivation record:', deactivationError);
        // Don't throw error here as the deactivation was successful
      }
  
      return data;
    } catch (error) {
      console.error('Error deactivating card:', error);
      throw error;
    }
  };
  

  interface LoyaltyTabProps {
    cards: Card[];
    members: Profile[];
    loading: boolean;
    onCardRegister: (uid: string, userId: string) => Promise<void>;
    onCardReload: (cardId: string, amount: number) => Promise<void>;
    onCardDeactivate: (cardId: string) => Promise<void>;
  }

export function LoyaltyTab({ 
  cards, 
  members, 
  loading,  
}: LoyaltyTabProps) {
  const [action, setAction] = useState<'issue' | 'reload' | 'deactivate' | null>(null);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [selectedMember, setSelectedMember] = useState<Profile | null>(null);
  const [scannedUid, setScannedUid] = useState<string | null>(null);
  const [reloadAmount, setReloadAmount] = useState<string>("100");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectionMethod, setSelectionMethod] = useState<'member' | 'scan'>('member');

  // Filter members without cards
  const membersWithoutCards = (members ?? []).filter(member =>
    !(cards ?? []).some(card => card.user_id === member.id)
  );  
  // Filter members with cards
  const membersWithCards = (members ?? []).filter(member =>
    (cards ?? []).some(card => card.user_id === member.id)
  );

  const handleMemberSelect = (memberId: string) => {
    const member = membersWithCards.find(m => m.id === memberId);
    setSelectedMember(member || null);
    
    // Find the member's card
    const memberCard = cards.find(card => card.user_id === memberId);
    setSelectedCard(memberCard || null);
  };

  // Filter cards based on search term
  const filteredCards = cards.filter(card => 
    card.uid.toLowerCase().includes(searchTerm.toLowerCase()) ||
    card.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const MAX_RELOAD_AMOUNT = 10000; 
  const [showConfirmation, setShowConfirmation] = useState(false);
const [pendingReload, setPendingReload] = useState<{cardId: string, amount: number} | null>(null);

const [deactivationReason, setDeactivationReason] = useState('lost');
const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);

  const handleScan = (uid: string) => {
    setScannedUid(uid);
    
    // Check if card already exists
    const existingCard = cards.find(card => card.uid === uid);
    if (existingCard) {
      setSelectedCard(existingCard);
      if (action === 'issue') {
        toast.error("This card is already registered to another member.", {
            description: "Card Already Exists",
          });
          
      }
    }
  };

  const handleIssueCard = async () => {
    if (!scannedUid || !selectedMember) return;
    
    try {
      console.log('Registering card with UID:', scannedUid, 'for member:', selectedMember.id);
      await onCardRegister(scannedUid, selectedMember.id);
      toast.success(`Card ${scannedUid} registered to ${selectedMember.full_name}`, {
        description: "Card Issued Successfully"
      });
      
      resetState();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not register card", {
        description: "Registration Failed"
      });
    }
  };  

  const handleReloadCard = async () => {
    if (!selectedCard) return;
    
    const amount = parseFloat(reloadAmount);
    if (isNaN(amount)) {
      toast.error("Please enter a valid number for reload amount", {
        description: "Invalid Amount",
      });
      return;
    }
  
    if (amount <= 0) {
      toast.error("Reload amount must be positive", {
        description: "Invalid Amount",
      });
      return;
    }
  
    if (amount > MAX_RELOAD_AMOUNT) {
      toast.error(`Maximum reload amount is ${formatCurrency(MAX_RELOAD_AMOUNT)}`, {
        description: "Amount Too Large",
      });
      return;
    }
  
    // Show confirmation for amounts over 1000
    if (amount > 1000) {
      setPendingReload({
        cardId: selectedCard.id,
        amount
      });
      setShowConfirmation(true);
      return;
    }
  
    await performReload(selectedCard.id, amount);
  };
  
  // Add this new function
  const performReload = async (cardId: string, amount: number) => {
    try {

      await onCardReload(cardId, amount);
      toast.success("Card Reloaded", {
        description: `₱${amount.toFixed(2)} added to card ${selectedCard?.uid}`,
        action: {
          label: "View Card",
          onClick: () => setSelectedCard(selectedCard),
        },
      });
      resetState();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not reload card", {
        description: "Reload Failed",
      });
    } finally {
      setPendingReload(null);
      setShowConfirmation(false);
    }
  };
  

  const handleDeactivateCard = async () => {
    if (!selectedCard) return;
    
    try {
      await onCardDeactivate(selectedCard.id);
      toast.success("Card Deactivated", {
        description: `Card ${selectedCard.uid} has been deactivated`,
        action: {
          label: "View Card",
          onClick: () => setSelectedCard(selectedCard),
        },
      });
      
      resetState();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not deactivate card", {
        description: "Deactivation Failed",
      });
    }
  };
  

  const resetState = () => {
    setAction(null);
    setSelectedCard(null);
    setSelectedMember(null);
    setScannedUid(null);
    setReloadAmount("100");
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading cards...</div>;
  }

  return (
    <>
      {/* Card Operations */}
      <UICard>
        <CardHeader>
          <CardTitle>Card Operations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="flex items-center gap-2 h-24"
              onClick={() => setAction('issue')}
            >
              <PlusCircle className="w-6 h-6" />
              <div className="text-left">
                <div className="font-medium">Issue New Card</div>
                <div className="text-sm text-muted-foreground">Create new loyalty card</div>
              </div>
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center gap-2 h-24"
              onClick={() => setAction('reload')}
              disabled={cards.length === 0}
            >
              <RefreshCw className="w-6 h-6" />
              <div className="text-left">
                <div className="font-medium">Reload Card</div>
                <div className="text-sm text-muted-foreground">Add balance to existing card</div>
              </div>
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center gap-2 h-24"
              onClick={() => setAction('deactivate')}
              disabled={cards.length === 0}
            >
              <XCircle className="w-6 h-6" />
              <div className="text-left">
                <div className="font-medium">Deactivate Card</div>
                <div className="text-sm text-muted-foreground">Disable lost/stolen cards</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </UICard>

      {/* Action Dialogs */}
      <Dialog open={action !== null} onOpenChange={(open) => !open && resetState()}>
        <DialogContent>
          {action === 'issue' && (
            <>
              <DialogHeader>
                <DialogTitle>Issue New Card</DialogTitle>
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
                      const member = membersWithoutCards.find(m => m.id === value);
                      setSelectedMember(member || null);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a member">
                        {selectedMember ? selectedMember.full_name : "Select member"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {membersWithoutCards.length > 0 ? (
                        membersWithoutCards.map(member => (
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

{action === 'reload' && (
  <>
    <DialogHeader>
      <DialogTitle>Reload Card Balance</DialogTitle>
      <DialogDescription>
        Add balance to an existing loyalty card
      </DialogDescription>
    </DialogHeader>
    <ReloadCardDialog
  scannedUid={scannedUid}
  onScan={handleScan}
  selectedCard={selectedCard}
  selectedMember={selectedMember}
  membersWithCards={membersWithCards}
  reloadAmount={reloadAmount}
  setReloadAmount={setReloadAmount}
  onReloadCard={handleReloadCard}
  onClose={resetState}
  onMemberSelect={handleMemberSelect}
/>
  </>
)}

{action === 'deactivate' && (
            <>
              <DialogHeader>
                <DialogTitle>Deactivate Card</DialogTitle>
                <DialogDescription>
                  Deactivate a lost or stolen loyalty card
                </DialogDescription>
              </DialogHeader>
              
              <Tabs 
                value={selectionMethod} 
                onValueChange={(value) => setSelectionMethod(value as 'member' | 'scan')}
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

              {selectionMethod === 'member' ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Select Member</Label>
                    <Select
                      value={selectedMember?.id || ""}
                      onValueChange={handleMemberSelect}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a member">
                          {selectedMember ? selectedMember.full_name : "Select member"}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {membersWithCards.length > 0 ? (
                          membersWithCards.map(member => (
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
                          <p className="text-sm text-muted-foreground">Card ID</p>
                          <p>{selectedCard.uid}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Current Balance</p>
                          <p>{formatCurrency(selectedCard.balance)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Status</p>
                          <Badge variant={selectedCard.status === 'active' ? 'default' : 'destructive'}>
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
                    <p className="text-red-500">Card not found. Please scan a registered card.</p>
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
  onClick={() => {
    if (selectedCard && selectedCard.balance > 0) {
      setShowDeactivateConfirm(true);
    } else {
      handleDeactivateCard();
    }
  }}
  disabled={!selectedCard || selectedCard.status !== 'active'}
>
  <X className="mr-2 h-4 w-4" />
  Deactivate Card
</Button>
              </DialogFooter>
            </>
          )}

        </DialogContent>
      </Dialog>
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Confirm Large Reload</DialogTitle>
      <DialogDescription>
        Are you sure you want to reload ₱{pendingReload?.amount.toFixed(2)} to this card?
      </DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <Button variant="outline" onClick={() => setShowConfirmation(false)}>
        Cancel
      </Button>
      <Button 
        onClick={() => {
          if (pendingReload) {
            performReload(pendingReload.cardId, pendingReload.amount);
          }
        }}
      >
        Confirm Reload
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

<Dialog open={showDeactivateConfirm} onOpenChange={setShowDeactivateConfirm}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Confirm Deactivation</DialogTitle>
      <DialogDescription>
        This card has a balance of {formatCurrency(selectedCard?.balance || 0)}. 
        Are you sure you want to deactivate it?
      </DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <Button variant="outline" onClick={() => setShowDeactivateConfirm(false)}>
        Cancel
      </Button>
      <Button variant="destructive" onClick={handleDeactivateCard}>
        Confirm Deactivation
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

      {/* Cards Table */}
      <UICard>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Loyalty Cards</CardTitle>
              <CardDescription>All issued loyalty cards</CardDescription>
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
                <TableHead>Member</TableHead>
                <TableHead>Balance</TableHead>
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
                    className={selectedCard?.id === card.id ? "bg-muted/50" : ""}
                    onClick={() => setSelectedCard(card)}
                  >
                    <TableCell>{card.uid}</TableCell>
                    <TableCell>{card.profiles?.full_name || 'No member'}</TableCell>
                    <TableCell>{formatCurrency(card.balance)}</TableCell>
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