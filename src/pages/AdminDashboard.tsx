import { useState, useEffect, useCallback } from "react";
import { useUser } from "@supabase/auth-helpers-react";
import { useSearchParams } from "react-router-dom";
import { Header } from "@/components/Header";
import AccountSettings from "./AccountSettings";
import { useAdminStats } from "../components/admin/hooks/useAdminStats";
import { useMembers } from "../components/admin/hooks/useMembers";
import { useCards } from "../components/admin/hooks/useCards";
import { useRewards } from "../components/admin/hooks/useRewards";
import { useProducts } from "../components/admin/hooks/useProducts";
import { useTransactions } from "../components/admin/hooks/useTransactions";
import { StatCards } from "../components/admin/components/StatCards";
import { TransactionsTab } from "../components/admin/components/TransactionsTab";
import { MembersTab } from "../components/admin/components/MembersTab";
import { LoyaltyTab } from "../components/admin/components/LoyaltyTab";
import { RewardsTab } from "../components/admin/components/RewardsTab";
import { ProductsTab } from "../components/admin/components/ProductsTab";
import {
  ShoppingCart,
  Users,
  CreditCard,
  Gift,
  Settings,
  LayoutDashboard,
  LogOut,
} from "lucide-react";
import { CoffeeIcon } from "../components/admin/CoffeeIcon";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/lib/supabaseClient";
import { motion } from "framer-motion";

export default function AdminDashboard() {
  const user = useUser();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "dashboard";
  const [activeTab, setActiveTab] = useState(initialTab);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Fetch stats
  const { stats, loading: statsLoading } = useAdminStats(user);

  // Fetch members
  const { members, loading: membersLoading } = useMembers(user, true);

  // Fetch cards
  const { cards, loading: cardsLoading } = useCards(user, true);

  // Fetch rewards
  const {
    rewards,
    loading: rewardsLoading,
    createReward,
    updateReward,
    deleteReward,
  } = useRewards(user, true);

  // Fetch products
  const {
    products,
    loading: productsLoading,
    createProduct,
    updateProduct,
    deleteProduct,
  } = useProducts(user, true);

  // Use the useTransactions hook
  const { 
    transactions, 
    loading: transactionsLoading, 
    refreshTransactions 
  } = useTransactions(user, true);

  useEffect(() => {
    if (!statsLoading && isInitialLoad) {
      setIsInitialLoad(false);
    }
  }, [statsLoading, isInitialLoad]);

  useEffect(() => {
    setSearchParams({ tab: activeTab }, { replace: true });
    localStorage.setItem("adminDashboardTab", activeTab);
  }, [activeTab, setSearchParams]);

  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab);
  }, []);

  const renderTabContent = useCallback(
    (tab: string) => {
      switch (tab) {
        case "dashboard":
          return <StatCards stats={stats} />;
        case "transactions":
          return (
            <TransactionsTab
              transactions={transactions}
              loading={transactionsLoading}
              cards={cards}
              products={products}
              onTransactionCreated={refreshTransactions}
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
          return <AccountSettings />;
        default:
          return <StatCards stats={stats} />;
      }
    },
    [
      stats,
      transactions,
      transactionsLoading,
      members,
      membersLoading,
      cards,
      cardsLoading,
      rewards,
      rewardsLoading,
      createReward,
      updateReward,
      deleteReward,
      products,
      productsLoading,
      createProduct,
      updateProduct,
      deleteProduct,
      refreshTransactions,
    ]
  );

  if (isInitialLoad) {
    return (
      <div className="flex min-h-screen">
        {/* Sidebar Skeleton */}
        <aside className="fixed top-0 left-0 h-screen w-64 bg-white/95 backdrop-blur-sm border-r border-gray-200 p-4 hidden md:flex flex-col justify-between z-50">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <Skeleton className="w-8 h-8 rounded-full bg-gray-200" />
              <Skeleton className="h-6 w-32 bg-gray-200" />
            </div>
            <div className="space-y-2">
              {[...Array(7)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full bg-gray-200" />
              ))}
            </div>
          </div>
          <Skeleton className="h-10 w-full bg-gray-200" />
        </aside>

        {/* Main Content Skeleton */}
        <div className="md:ml-64 flex flex-col flex-1 min-h-screen w-full layout-background">
          <Header />
          <div className="p-8">
            <Skeleton className="h-8 w-1/3 mb-4 bg-white/80" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-32 bg-white/80" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const menuItems = [
    { value: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { value: "transactions", icon: ShoppingCart, label: "Transactions" },
    { value: "members", icon: Users, label: "Members" },
    { value: "loyalty", icon: CreditCard, label: "Loyalty" },
    { value: "rewards", icon: Gift, label: "Rewards" },
    { value: "products", icon: CoffeeIcon, label: "Products" },
    { value: "settings", icon: Settings, label: "Settings" },
  ];

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="fixed top-0 left-0 h-screen w-64 bg-white/95 backdrop-blur-sm border-r border-gray-200 p-4 hidden md:flex flex-col justify-between z-50">
        <div>
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 mb-6 justify-center"
          >
            <img 
              src="/logo.png" 
              alt="Byte & Brew Logo" 
              className="w-8 h-8 rounded-full object-contain" 
            />
            <span className="text-xl font-bold text-gray-800">BYTE & BREW</span>
          </motion.div>
          
          <nav className="flex flex-col gap-1">
            {menuItems.map((item) => (
              <motion.button
                key={item.value}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                onClick={() => handleTabChange(item.value)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors w-full text-left ${
                  activeTab === item.value
                    ? "bg-[#4b8e3f]/10 text-[#4b8e3f] font-medium"
                    : "text-gray-600 hover:bg-gray-100/50 hover:text-gray-800"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </motion.button>
            ))}
          </nav>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <button
            onClick={async () => {
              const { error } = await supabase.auth.signOut();
              if (error) {
                console.error("Logout failed:", error.message);
              } else {
                window.location.href = "/";
              }
            }}
            className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-gray-600 hover:bg-gray-100/50 hover:text-gray-800 w-full text-left"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </motion.div>
      </aside>

      {/* Main Content Area */}
      <div className="md:ml-64 flex flex-col flex-1 min-h-screen w-full layout-background">
        <Header />
        <main className="p-4 md:p-8 flex-1 w-full overflow-x-hidden">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {renderTabContent(activeTab)}
          </motion.div>
        </main>
      </div>
    </div>
  );
}