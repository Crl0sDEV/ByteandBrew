import { useState } from "react";
import { useUser } from "@supabase/auth-helpers-react";
import Header from "@/components/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

export default function AdminDashboard() {
  const user = useUser();
  const [activeTab, setActiveTab] = useState("transactions");

  const { stats, loading: statsLoading } = useAdminStats(user);
  const { transactions, loading: transactionsLoading } = useTransactions(
    user,
    activeTab
  );
  const { members, loading: membersLoading } = useMembers(user, activeTab);
  const { cards, loading: cardsLoading } = useCards(user, activeTab);
  const { products, loading: productsLoading, createProduct, updateProduct, deleteProduct } = useProducts(user, activeTab);

  const { 
    rewards, 
    loading: rewardsLoading, 
    createReward, 
    updateReward, 
    deleteReward 
  } = useRewards(user, activeTab);

  if (statsLoading) {
    return <div className="p-8">Loading dashboard stats...</div>;
  }

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
          defaultValue="transactions"
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
            <TabsTrigger
              value="transactions"
              className="flex items-center gap-2"
            >
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

          <TabsContent value="transactions" className="pt-4">
            <TransactionsTab
              transactions={transactions}
              loading={transactionsLoading}
            />
          </TabsContent>

          <TabsContent value="members" className="pt-4">
            <MembersTab members={members} loading={membersLoading} />
          </TabsContent>

          <TabsContent value="loyalty" className="pt-4 space-y-4">
            <LoyaltyTab
              cards={cards}
              members={members}
              loading={cardsLoading}
              onCardRegister={async () => {}}
              onCardReload={async () => {}}
              onCardDeactivate={async () => {}}
            />
          </TabsContent>

          <TabsContent value="rewards" className="pt-4">
  <RewardsTab 
    rewards={rewards} 
    loading={rewardsLoading}
    onCreate={createReward}
    onUpdate={updateReward}
    onDelete={deleteReward}
  />
</TabsContent>
          <TabsContent value="products" className="pt-4">
  <ProductsTab 
    products={products} 
    loading={productsLoading}
    onCreate={createProduct}
    onUpdate={updateProduct}
    onDelete={deleteProduct}
  />
</TabsContent>

          <TabsContent value="settings" className="pt-4">
            <div className="text-muted-foreground">
              Settings configuration coming soon...
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
