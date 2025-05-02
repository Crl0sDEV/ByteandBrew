import { useUser } from "@supabase/auth-helpers-react";
import Header from "@/components/Header copy";
import { useCustomerData } from "../components/customer/hooks/useCustomerData";
import { CustomerGreeting } from "../components/customer/components/CustomerGreeting";
import { CardStats } from "../components/customer/components/CardStats";
import { TransactionsSection } from "../components/customer/components/TransactionsSection";
import { RewardsSection } from "../components/customer/components/RewardsSection";
import { GetStartedSection } from "../components/customer/components/GetStartedSection";
import { RedemptionHistorySection } from "../components/customer/components/RedemptionHistory";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function CustomerDashboard() {
  const user = useUser();
  const { customerData, loading, refetch } = useCustomerData(user);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  
  useEffect(() => {
    if (!loading && isInitialLoad) {
      console.log("Redemption History Data:", customerData?.redemptionHistory); // 👈 add this
      setIsInitialLoad(false);
    }
  }, [loading, isInitialLoad, customerData]);
  

  
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
    <>
    <Header />
    <div className="p-2 md:p-6 layout-background">
      
      <div className="mt-2 space-y-6">
        <CustomerGreeting 
          name={customerData.name} 
          hasCard={customerData.hasCard} 
        />

        <CardStats
          hasCard={customerData.hasCard}
          cardNumber={customerData.cardNumber}
          balance={customerData.balance}
          points={customerData.points}
          cardStatus={customerData.cardStatus}
  createdAt={customerData.createdAt}
          pointsToNextReward={customerData.pointsToNextReward}
          expiringPoints={customerData.expiringPoints || 0}
          cardId={customerData.cardId || ''}
          deactivatedAt={customerData.deactivatedAt}
          deactivationReason={customerData.deactivationReason}
          onReloadSuccess={() => refetch()} 
        />

        {customerData.hasCard ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TransactionsSection 
              transactions={customerData.recentTransactions} 
              key={`transactions-${customerData.recentTransactions.length}`}
            />
            <RewardsSection 
        rewards={customerData.availableRewards}
        points={customerData.points}
        cardId={customerData.cardId}
        onRedeemSuccess={refetch}
      />
          </div>
        ) : (
          <GetStartedSection hasCard={customerData.hasCard} />
        )}

        {customerData.hasCard && (
  <div className="mt-6">
    <RedemptionHistorySection redemptions={customerData.redemptionHistory || []} />
  </div>
)}
      </div>
    </div>
    </>
  );
}