import { useState, useEffect } from "react";
import { useUser } from "@supabase/auth-helpers-react";
import { useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAdminStats } from "../components/admin/hooks/useAdminStats";
import { useTransactions } from "../components/admin/hooks/useTransactions";
import { useMembers } from "../components/admin/hooks/useMembers";
import { useCards } from "../components/admin/hooks/useCards";
import { useRewards } from "../components/admin/hooks/useRewards";
import { useProducts } from "../components/admin/hooks/useProducts";
import { StatCards } from "../components/admin/components/StatCards";
import { TransactionsTab } from "../components/admin/components/TransactionsTab";
import { MembersTab } from "../components/admin/components/MembersTab";
import { LoyaltyTab } from "../components/admin/components/LoyaltyTab";
import { RewardsTab } from "../components/admin/components/RewardsTab";
import { ProductsTab } from "../components/admin/components/ProductsTab";
import { ShoppingCart, Users, CreditCard, Gift, Settings } from "lucide-react";
import { CoffeeIcon } from "../components/admin/CoffeeIcon";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminDashboard() {
  const user = useUser();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "transactions");

  // Sync tab state with URL
  useEffect(() => {
    setSearchParams({ tab: activeTab }, { replace: true });
  }, [activeTab, setSearchParams]);

  // Handle browser tab visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        // Optional: Add data refresh logic here if needed
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  const { stats, loading: statsLoading } = useAdminStats(user);
  const { transactions, loading: transactionsLoading } = useTransactions(user, activeTab);
  const { members, loading: membersLoading } = useMembers(user, activeTab);
  const { cards, loading: cardsLoading } = useCards(user, activeTab);
  const { products, loading: productsLoading, createProduct, updateProduct, deleteProduct } = useProducts(user, activeTab);
  const { rewards, loading: rewardsLoading, createReward, updateReward, deleteReward } = useRewards(user, activeTab);

  if (statsLoading) {
    return (
      <div className="p-8">
        <div className="h-8 w-1/3 bg-muted rounded animate-pulse mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const renderTabContent = (tab: string) => {
    switch (tab) {
      case "transactions":
        return (
          <TransactionsTab
            transactions={transactions}
            loading={transactionsLoading}
          />
        );
      case "members":
        return <MembersTab members={members} loading={membersLoading} />;
      case "loyalty":
        return (
          <LoyaltyTab
            cards={cards}
            members={members}
            loading={cardsLoading}
            onCardRegister={async () => {}}
            onCardReload={async () => {}}
            onCardDeactivate={async () => {}}
          />
        );
      case "rewards":
        return (
          <RewardsTab 
            rewards={rewards} 
            loading={rewardsLoading}
            onCreate={createReward}
            onUpdate={updateReward}
            onDelete={deleteReward}
          />
        );
      case "products":
        return (
          <ProductsTab 
            products={products} 
            loading={productsLoading}
            onCreate={createProduct}
            onUpdate={updateProduct}
            onDelete={deleteProduct}
          />
        );
      case "settings":
        return <div className="text-muted-foreground">Settings configuration coming soon...</div>;
      default:
        return null;
    }
  };

  return (
    <div className="p-4 md:p-8">
      <Header />

      <div className="mt-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage loyalty cards, transactions, rewards, and products
          </p>
        </div>

        <StatCards stats={stats} />

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
            <TabsTrigger value="transactions" className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">Transactions</span>
            </TabsTrigger>
            <TabsTrigger value="members" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Members</span>
            </TabsTrigger>
            <TabsTrigger value="loyalty" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              <span className="hidden sm:inline">Loyalty</span>
            </TabsTrigger>
            <TabsTrigger value="rewards" className="flex items-center gap-2">
              <Gift className="w-4 h-4" />
              <span className="hidden sm:inline">Rewards</span>
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center gap-2">
              <CoffeeIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Products</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="pt-4"
            >
              {renderTabContent(activeTab)}
            </motion.div>
          </AnimatePresence>
        </Tabs>
      </div>
    </div>
  );
}