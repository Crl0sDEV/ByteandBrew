// components/ReloadCardDialog.tsx
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RefreshCw, User, Scan } from "lucide-react";
import { Card, Profile } from "../types";
import { RFIDScanner } from "./RFIDScanner";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

interface ReloadCardDialogProps {
  scannedUid: string | null;
  onScan: (uid: string) => void;
  selectedCard: Card | null;
  selectedMember: Profile | null;
  membersWithCards: Profile[];
  reloadAmount: string;
  setReloadAmount: (amount: string) => void;
  onReloadCard: () => Promise<void>;
  onClose: () => void;
  onMemberSelect: (memberId: string) => void;
}

const presetAmounts = [100, 200, 500, 1000];

export function ReloadCardDialog({
  scannedUid,
  onScan,
  selectedCard,
  selectedMember,
  membersWithCards,
  reloadAmount,
  setReloadAmount,
  onReloadCard,
  onClose,
  onMemberSelect,
}: ReloadCardDialogProps) {
  const [selectionMethod, setSelectionMethod] = useState<'member' | 'scan'>('member');

  return (
    <>
      <div className="space-y-4">
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
                onValueChange={onMemberSelect}
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
                    <p>₱{selectedCard.balance.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <p className={selectedCard.status === 'active' ? 'text-green-500' : 'text-red-500'}>
                      {selectedCard.status}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <RFIDScanner onScan={onScan} />
            
            {selectedCard ? (
              <div className="p-3 border rounded-lg space-y-2">
                <p className="font-medium">Selected Card: {selectedCard.uid}</p>
                <p>Current Balance: ₱{selectedCard.balance.toFixed(2)}</p>
                <p>Member: {selectedCard.profiles?.full_name || "No member"}</p>
              </div>
            ) : scannedUid ? (
              <p className="text-red-500">
                Card not found. Please scan a registered card.
              </p>
            ) : null}
          </div>
        )}

        {selectedCard && (
          <div className="space-y-2">
            <Label>Reload Amount (₱)</Label>
            <div className="grid grid-cols-4 gap-2 mt-2">
              {presetAmounts.map((amount) => (
                <Button
                  key={amount}
                  variant="outline"
                  onClick={() => setReloadAmount(amount.toString())}
                >
                  ₱{amount}
                </Button>
              ))}
            </div>
            <Input
              type="number"
              value={reloadAmount}
              onChange={(e) => setReloadAmount(e.target.value)}
              placeholder="Enter amount"
              min="0"
              step="0.01"
            />
          </div>
        )}
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={onReloadCard} disabled={!selectedCard}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Reload Card
        </Button>
      </DialogFooter>
    </>
  );
}