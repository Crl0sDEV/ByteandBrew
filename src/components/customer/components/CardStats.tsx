import { Card as UICard, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Gift, Coffee, CheckCircle2, Clock, XCircle, AlertTriangle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface CardStatsProps {
  hasCard: boolean;
  cardNumber: string;
  points: number;
  cardStatus: string; // 'active' | 'inactive' | etc.
  createdAt?: string; // Optional
  expiringPoints?: number;
}

export function CardStats({
  hasCard,
  cardNumber,
  points,
  expiringPoints = 0,
  cardStatus = 'active', // Default value
  createdAt, // Now optional
}: CardStatsProps) {
  if (!hasCard) return null;
  
  // Safely format account age with fallback
  const accountAge = createdAt 
    ? formatDistanceToNow(new Date(createdAt), { addSuffix: true })
    : "a while";
  
  return (
    <div className="grid grid-cols-1 gap-4">
      <UICard>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Loyalty Points</CardTitle>
          <Gift className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {/* Account Age - Only show if we have a createdAt value */}
          {createdAt && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
              <Clock className="h-3 w-3" />
              <span>Member since: {accountAge}</span>
            </div>
          )}
          
          {/* Points display - simplified without stars */}
          <div className="text-2xl font-bold">{points} pts</div>

          {/* Expiring points warning */}
          {expiringPoints > 0 && (
            <div className="flex items-center gap-1 text-xs text-yellow-600 mt-1">
              <AlertTriangle className="h-3 w-3" />
              <span>{expiringPoints} pts expiring soon</span>
            </div>
          )}
          
          {/* Card Info */}
          <div className="mt-2 space-y-1">
            <p className="text-xs text-muted-foreground">
              Card: {cardNumber}
            </p>
            <div className="flex items-center gap-1 text-xs">
              {cardStatus === 'active' ? (
                <>
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                  <span className="text-green-500">Active</span>
                </>
              ) : (
                <>
                  <XCircle className="h-3 w-3 text-red-500" />
                  <span className="text-red-500">Inactive</span>
                </>
              )}
            </div>
          </div>
          
          {/* Suggested actions */}
          <div className="mt-4">
            <h4 className="text-xs font-semibold mb-2 flex items-center gap-1">
              <Coffee className="h-3 w-3" /> Ways to earn points:
            </h4>
            <ul className="text-xs space-y-1 text-muted-foreground">
              <li>• 1 Product = 1 point</li>
            </ul>
          </div>
        </CardContent>
      </UICard>
    </div>
  );
}