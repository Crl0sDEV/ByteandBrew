// components/ReloadCardDialog.tsx
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RefreshCw } from "lucide-react";
import { Card } from "../types";
import { RFIDScanner } from "./RFIDScanner";

interface ReloadCardDialogProps {
  scannedUid: string | null;
  onScan: (uid: string) => void;
  selectedCard: Card | null;
  reloadAmount: string;
  setReloadAmount: (amount: string) => void;
  onReloadCard: () => Promise<void>;
  onClose: () => void;
}

const presetAmounts = [100, 200, 500, 1000];

export function ReloadCardDialog({
  scannedUid,
  onScan,
  selectedCard,
  reloadAmount,
  setReloadAmount,
  onReloadCard,
  onClose,
}: ReloadCardDialogProps) {
  return (
    <>
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
