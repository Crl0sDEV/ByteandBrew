import { useUser } from "@supabase/auth-helpers-react";
import Header from "@/components/Header copy";
import { useCustomerData } from "../components/customer/hooks/useCustomerData";
import { CustomerGreeting } from "../components/customer/components/CustomerGreeting";
import { CardStats } from "../components/customer/components/CardStats";
import { TransactionsSection } from "../components/customer/components/TransactionsSection";
import { RewardsSection } from "../components/customer/components/RewardsSection";
import { GetStartedSection } from "../components/customer/components/GetStartedSection";
import { QuickActions } from "../components/customer/components/QuickActions";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function CustomerDashboard() {
  const user = useUser();
  const { customerData, loading } = useCustomerData(user);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Track initial load separately to prevent flash of loading state
  useEffect(() => {
    if (!loading && isInitialLoad) {
      setIsInitialLoad(false);
    }
  }, [loading, isInitialLoad]);

  // Show skeleton loader only on initial load
  if (isInitialLoad) {
    return (
      <div className="p-4 md:p-8">
        <Header />
        <div className="mt-6 space-y-6">
          <Skeleton className="h-10 w-1/2" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
        </div>
      </div>
    );
  }

  // Show empty state if no data (shouldn't happen with realtime updates)
  if (!customerData) {
    return (
      <div className="p-4 md:p-8">
        <Header />
        <div className="mt-6 text-center p-8">
          <p>No customer data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <Header />
      
      <div className="mt-6 space-y-6">
        <CustomerGreeting 
          name={customerData.name} 
          hasCard={customerData.hasCard} 
        />

        <CardStats
          hasCard={customerData.hasCard}
          cardNumber={customerData.cardNumber}
          balance={customerData.balance}
          points={customerData.points}
          pointsToNextReward={customerData.pointsToNextReward}
          transactionCount={customerData.recentTransactions.length}
        />

        {customerData.hasCard ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TransactionsSection 
              transactions={customerData.recentTransactions} 
              // Add key to force re-render when transactions update
              key={`transactions-${customerData.recentTransactions.length}`}
            />
            <RewardsSection 
              rewards={customerData.availableRewards} 
              points={customerData.points}
              // Add key to force re-render when rewards update
              key={`rewards-${customerData.availableRewards.length}`}
            />
          </div>
        ) : (
          <GetStartedSection hasCard={customerData.hasCard} />
        )}

        <QuickActions hasCard={customerData.hasCard} />
      </div>
    </div>
  );
}