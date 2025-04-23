import { Card as UICard, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CreditCard, Gift, RotateCw } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

interface CardStatsProps {
  hasCard: boolean;
  cardNumber: string;
  balance: number;
  points: number;
  pointsToNextReward: number;
  onReloadRequest?: (amount: number, referenceNumber: string) => Promise<void>;
  gcashQrImageUrl?: string; // Add this prop for the QR code image
}

export function CardStats({
  hasCard,
  cardNumber,
  balance,
  points,
  pointsToNextReward,
  onReloadRequest,
  gcashQrImageUrl = "/gcash-qr.png" // Default path if not provided
}: CardStatsProps) {
  const [amount, setAmount] = useState<string>("");
  const [referenceNumber, setReferenceNumber] = useState<string>("");
  const [showQRCode, setShowQRCode] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);

  if (!hasCard) return null;

  const handleReloadRequest = async () => {
    const amountValue = parseFloat(amount);
    if (!amount || isNaN(amountValue)) {
      toast.error("Please enter a valid amount");
      return;
    }
    if (amountValue <= 0) {
      toast.error("Amount must be greater than 0");
      return;
    }
    setShowQRCode(true);
  };

  const handleSubmitPayment = async () => {
    if (!referenceNumber) {
      toast.error("Please enter your payment reference number");
      return;
    }

    setIsSubmitting(true);
    try {
      if (onReloadRequest) {
        await onReloadRequest(parseFloat(amount), referenceNumber);
      } else {
        // Default behavior if no handler provided
        toast.success(`Reload request of ₱${amount} submitted for approval. Reference: ${referenceNumber}`);
      }
      setDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error("Failed to submit reload request");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setAmount("");
    setReferenceNumber("");
    setShowQRCode(false);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Balance Card */}
      <UICard>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Card Balance</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">₱{balance.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Card: {cardNumber}
          </p>
        </CardContent>
      </UICard>

      {/* Points Card */}
      <UICard>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Points</CardTitle>
          <Gift className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{points} pts</div>
          <div className="mt-2">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Next reward in {pointsToNextReward} pts</span>
              <span>{Math.min(100, ((points / 1500) * 100)).toFixed(0)}%</span>
            </div>
            <Progress value={(points / 1500) * 100} className="h-2" />
          </div>
        </CardContent>
      </UICard>

      {/* Reload Card */}
      <UICard className="flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Request Reload</CardTitle>
          <RotateCw className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="flex-grow flex flex-col justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-4">
              Need more balance? Request a card reload that will be approved by admin.
            </p>
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full mt-2">
                Request Reload
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Request Card Reload</DialogTitle>
                <DialogDescription>
                  {showQRCode 
                    ? "Please send the exact amount to the GCash QR code below" 
                    : "Enter the amount you want to reload to your card"}
                </DialogDescription>
              </DialogHeader>
              
              {!showQRCode ? (
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="amount" className="text-right">
                      Amount (₱)
                    </Label>
                    <Input
                      id="amount"
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="col-span-3"
                      placeholder="Enter amount"
                      min="1"
                      step="any"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex flex-col items-center">
                    <div className="border p-4 rounded-lg bg-white">
                      <img
                        src={gcashQrImageUrl}
                        alt="GCash QR Code"
                        className="w-48 h-48 mx-auto"
                      />
                      <p className="text-center font-bold mt-2">₱{parseFloat(amount).toFixed(2)}</p>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2 text-center">
                      Scan or save this QR code to pay via GCash
                    </p>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="reference" className="text-right">
                      Reference #
                    </Label>
                    <Input
                      id="reference"
                      value={referenceNumber}
                      onChange={(e) => setReferenceNumber(e.target.value)}
                      className="col-span-3"
                      placeholder="Enter GCash reference number"
                    />
                  </div>
                  <div className="text-sm text-muted-foreground space-y-2">
                    <p>1. Send <span className="font-bold">exactly ₱{parseFloat(amount).toFixed(2)}</span> to this GCash QR</p>
                    <p>2. After payment, enter the reference number above</p>
                    <p>3. Click "Submit Request" to complete the process</p>
                  </div>
                </div>
              )}

              <DialogFooter>
                {!showQRCode ? (
                  <Button 
                    type="button" 
                    onClick={handleReloadRequest}
                    disabled={!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0}
                  >
                    Continue to Payment
                  </Button>
                ) : (
                  <div className="flex gap-2 w-full">
                    <Button 
                      variant="outline" 
                      onClick={() => setShowQRCode(false)}
                      disabled={isSubmitting}
                    >
                      Back
                    </Button>
                    <Button 
                      type="button" 
                      onClick={handleSubmitPayment}
                      disabled={!referenceNumber || isSubmitting}
                    >
                      {isSubmitting ? "Submitting..." : "Submit Request"}
                    </Button>
                  </div>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </UICard>
    </div>
  );
}