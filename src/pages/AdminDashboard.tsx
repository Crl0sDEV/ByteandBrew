"use client"

import { useState, useEffect, useCallback } from "react"
import { useUser } from "@supabase/auth-helpers-react"
import { useSearchParams } from "react-router-dom"
import Header from "@/components/Header"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAdminStats } from "../components/admin/hooks/useAdminStats"
import { useTransactions } from "../components/admin/hooks/useTransactions"
import { useMembers } from "../components/admin/hooks/useMembers"
import { useCards } from "../components/admin/hooks/useCards"
import { useRewards } from "../components/admin/hooks/useRewards"
import { useProducts } from "../components/admin/hooks/useProducts"
import { StatCards } from "../components/admin/components/StatCards"
import { TransactionsTab } from "../components/admin/components/TransactionsTab"
import { MembersTab } from "../components/admin/components/MembersTab"
import { LoyaltyTab } from "../components/admin/components/LoyaltyTab"
import { RewardsTab } from "../components/admin/components/RewardsTab"
import { ProductsTab } from "../components/admin/components/ProductsTab"
import { ShoppingCart, Users, CreditCard, Gift, Settings } from "lucide-react"
import { CoffeeIcon } from "../components/admin/CoffeeIcon"

export default function AdminDashboard() {
  const user = useUser()
  const [searchParams, setSearchParams] = useSearchParams()
  const initialTab = searchParams.get("tab") || "transactions"
  const [activeTab, setActiveTab] = useState(initialTab)

  // Data fetching hooks
  const { stats, loading: statsLoading } = useAdminStats(user)
  const { transactions, loading: transactionsLoading } = useTransactions(user, activeTab === "transactions")
  const { members, loading: membersLoading } = useMembers(user, activeTab === "members")
  const { cards, loading: cardsLoading } = useCards(user, activeTab === "loyalty")
  const {
    products,
    loading: productsLoading,
    createProduct,
    updateProduct,
    deleteProduct,
  } = useProducts(user, activeTab === "products")
  const {
    rewards,
    loading: rewardsLoading,
    createReward,
    updateReward,
    deleteReward,
  } = useRewards(user, activeTab === "rewards")

  // Update URL when tab changes
  useEffect(() => {
    setSearchParams({ tab: activeTab }, { replace: true })
    // Save current tab to localStorage
    localStorage.setItem("adminDashboardTab", activeTab)
  }, [activeTab, setSearchParams])

  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const currentTab = searchParams.get("tab") || "transactions"
      if (currentTab !== activeTab) {
        setActiveTab(currentTab)
      }
    }

    window.addEventListener("popstate", handlePopState)
    return () => window.removeEventListener("popstate", handlePopState)
  }, [activeTab, searchParams])

  // Prevent refresh on tab visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      // Don't do anything that would cause a refresh when tab becomes visible again
      if (document.visibilityState === "visible") {
        // Restore the tab from localStorage if needed
        const savedTab = localStorage.getItem("adminDashboardTab")
        if (savedTab && savedTab !== activeTab) {
          setActiveTab(savedTab)
        }
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange)
  }, [activeTab])

  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab)
  }, [])

  const renderTabContent = useCallback(
    (tab: string) => {
      switch (tab) {
        case "transactions":
          return <TransactionsTab transactions={transactions} loading={transactionsLoading} />
        case "members":
          return <MembersTab members={members} loading={membersLoading} />
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
          )
        case "rewards":
          return (
            <RewardsTab
              rewards={rewards}
              loading={rewardsLoading}
              onCreate={createReward}
              onUpdate={updateReward}
              onDelete={deleteReward}
            />
          )
        case "products":
          return (
            <ProductsTab
              products={products}
              loading={productsLoading}
              onCreate={createProduct}
              onUpdate={updateProduct}
              onDelete={deleteProduct}
              // Pass key to force component to maintain its state
              key="products-tab"
            />
          )
        case "settings":
          return <div className="text-muted-foreground">Settings configuration coming soon...</div>
        default:
          return null
      }
    },
    [
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
    ],
  )

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
    )
  }

  return (
    <div className="p-4 md:p-8">
      <Header />

      <div className="mt-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage loyalty cards, transactions, rewards, and products</p>
        </div>

        <StatCards stats={stats} />

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
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

          <div className="pt-4">{renderTabContent(activeTab)}</div>
        </Tabs>
      </div>
    </div>
  )
}
