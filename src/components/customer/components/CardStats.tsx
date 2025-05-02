import { Card as UICard, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Gift, Eye, EyeOff, Clock, AlertTriangle, ChevronDown, ChevronUp, Info } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { motion } from "framer-motion";
import { useState } from "react";

interface CardStatsProps {
  hasCard: boolean;
  cardNumber: string;
  points: number;
  cardStatus: 'active' | 'inactive' | string;
  createdAt?: string;
  expiringPoints?: number;
  deactivationReason?: string | null;
  deactivatedAt?: string | null;
  activatedAt?: string | null;
}

export function CardStats({
  hasCard,
  cardNumber,
  points,
  expiringPoints = 0,
  cardStatus = 'inactive',
  createdAt,
  deactivationReason,
  deactivatedAt,
  activatedAt,
}: CardStatsProps) {
  const [showCardNumber, setShowCardNumber] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  
  if (!hasCard) return null;

  const accountAge = createdAt 
    ? formatDistanceToNow(new Date(createdAt), { addSuffix: true })
    : "a while";

  const toggleCardNumber = () => setShowCardNumber(!showCardNumber);
  const toggleDetails = () => setShowDetails(!showDetails);

  // Normalize card status
  const normalizedCardStatus = cardStatus.toLowerCase().trim();

  // Get status message based on card status
  const getStatusMessage = () => {
    if (normalizedCardStatus === 'active') {
      return activatedAt 
        ? `Card activated on ${format(new Date(activatedAt), 'MMM d, yyyy')}`
        : "Your card is active and ready to use";
    } else {
      if (deactivationReason && deactivatedAt) {
        return `Card deactivated on ${format(new Date(deactivatedAt), 'MMM d, yyyy')} (Reason: ${formatDeactivationReason(deactivationReason)})`;
      }
      return deactivationReason
        ? `Card deactivated (Reason: ${formatDeactivationReason(deactivationReason)})`
        : "Your card is currently inactive";
    }
  };

  // Format deactivation reason for display
  const formatDeactivationReason = (reason: string) => {
    switch (reason) {
      case 'lost':
        return 'Lost card';
      case 'stolen':
        return 'Stolen card';
      case 'damaged':
        return 'Damaged card';
      case 'manual_deactivation':
        return 'Manual deactivation';
      case 'other':
        return 'Other reasons';
      default:
        return reason;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="grid grid-cols-1 gap-4"
    >
      <UICard className="border-0 shadow-lg bg-gradient-to-br from-primary/5 to-background">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-primary/10">
              <Gift className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-lg font-semibold">Loyalty Points</CardTitle>
          </div>
          <span className={`text-xs px-2 py-1 rounded-full ${
            normalizedCardStatus === 'active' 
              ? 'bg-primary/10 text-primary' 
              : 'bg-muted text-muted-foreground'
          }`}>
            {normalizedCardStatus === 'active' ? 'Active' : 'Inactive'}
          </span>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Points Display */}
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-end gap-2">
              <span className="text-4xl font-bold text-primary">{points}</span>
              <span className="text-sm text-muted-foreground mb-1.5">points</span>
            </div>
            <button 
              onClick={toggleDetails}
              className="p-1.5 rounded-full hover:bg-primary/10 transition-colors flex-shrink-0"
              aria-label={showDetails ? "Hide details" : "Show details"}
            >
              {showDetails ? (
                <ChevronUp className="h-5 w-5 text-primary" />
              ) : (
                <ChevronDown className="h-5 w-5 text-primary" />
              )}
            </button>
          </div>

          {/* Status Notice */}
          <div className={`p-3 rounded-lg text-sm flex items-start gap-2 ${
            normalizedCardStatus === 'active'
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <p>{getStatusMessage()}</p>
          </div>

          {/* Collapsible Details Section */}
          {showDetails && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              {/* Expiring Points Warning */}
              {expiringPoints > 0 && (
                <motion.div 
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  className="p-3 rounded-lg bg-yellow-50 border border-yellow-200 mb-3"
                >
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-yellow-800">
                        {expiringPoints} points expiring soon!
                      </p>
                      <p className="text-xs text-yellow-600 mt-1">
                        Redeem your rewards before they expire.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Account Details */}
              <div className="space-y-3 pt-2 border-t">
                {createdAt && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5" />
                      Member since
                    </span>
                    <span className="font-medium">{accountAge}</span>
                  </div>
                )}
                
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground flex items-center gap-2">
                    Card number
                  </span>
                  <span className="font-mono font-medium flex items-center gap-2">
                    {showCardNumber ? cardNumber : `${cardNumber.slice(0, 3)} **** ${cardNumber.slice(-3)}`}
                    {showCardNumber ? (
                      <EyeOff className="h-4 w-4 cursor-pointer" onClick={toggleCardNumber} />
                    ) : (
                      <Eye className="h-4 w-4 cursor-pointer" onClick={toggleCardNumber} />
                    )}
                  </span>
                </div>

                {/* Activation/Deactivation details */}
                {normalizedCardStatus === 'active' && activatedAt && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground flex items-center gap-2">
                      Activated on
                    </span>
                    <span className="font-medium">
                      {format(new Date(activatedAt), 'MMM d, yyyy')}
                    </span>
                  </div>
                )}

                {normalizedCardStatus !== 'active' && deactivatedAt && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground flex items-center gap-2">
                      Deactivated on
                    </span>
                    <span className="font-medium">
                      {format(new Date(deactivatedAt), 'MMM d, yyyy')}
                    </span>
                  </div>
                )}

                {normalizedCardStatus !== 'active' && deactivationReason && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground flex items-center gap-2">
                      Deactivation reason
                    </span>
                    <span className="font-medium">
                      {formatDeactivationReason(deactivationReason)}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </CardContent>
      </UICard>
    </motion.div>
  );
}