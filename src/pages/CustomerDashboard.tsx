import { useUser } from "@supabase/auth-helpers-react";
import Header from "@/components/Header copy";
import { useCustomerData } from "../components/customer/hooks/useCustomerData";
import { CustomerGreeting } from "../components/customer/components/CustomerGreeting";
import { CardStats } from "../components/customer/components/CardStats";
import { TransactionsSection } from "../components/customer/components/TransactionsSection";
import { RewardsSection } from "../components/customer/components/RewardsSection";
import { GetStartedSection } from "../components/customer/components/GetStartedSection";
import { QuickActions } from "../components/customer/components/QuickActions";

export default function CustomerDashboard() {
  const user = useUser();
  const { customerData, loading } = useCustomerData(user);

  if (loading) return <div className="p-8">Loading dashboard...</div>;

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
            <TransactionsSection transactions={customerData.recentTransactions} />
            <RewardsSection 
              rewards={customerData.availableRewards} 
              points={customerData.points} 
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