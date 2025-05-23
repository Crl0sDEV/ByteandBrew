"use client"

import { useState, useEffect, useCallback } from "react"
import { useUser } from "@supabase/auth-helpers-react"
import { useSearchParams } from "react-router-dom"
import { Header } from "@/components/Header"
import AccountSettings from "./AccountSettings"
import { useAdminStats } from "../components/admin/hooks/useAdminStats"
import { useMembers } from "../components/admin/hooks/useMembers"
import { useCards } from "../components/admin/hooks/useCards"
import { useRewards } from "../components/admin/hooks/useRewards"
import { useProducts } from "../components/admin/hooks/useProducts"
import { useTransactions } from "../components/admin/hooks/useTransactions"
import { StatCards } from "../components/admin/components/StatCards"
import { TransactionsTab } from "../components/admin/components/TransactionsTab"
import { MembersTab } from "../components/admin/components/MembersTab"
import { LoyaltyTab } from "../components/admin/components/LoyaltyTab"
import { RewardsTab } from "../components/admin/components/RewardsTab"
import { ProductsTab } from "../components/admin/components/ProductsTab"
import { ShoppingCart, Users, CreditCard, Gift, Settings, LayoutDashboard, LogOut } from "lucide-react"
import { CoffeeIcon } from "../components/admin/CoffeeIcon"
import { Skeleton } from "@/components/ui/skeleton"
import { supabase } from "@/lib/supabaseClient"
import { motion } from "framer-motion"

export default function AdminDashboard() {
  const user = useUser()
  const [searchParams, setSearchParams] = useSearchParams()
  const initialTab = searchParams.get("tab") || "dashboard"
  const [activeTab, setActiveTab] = useState(initialTab)
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  
  const { stats, loading: statsLoading } = useAdminStats(user)

  
  const { members, loading: membersLoading } = useMembers(user, true)

  
  const { cards, loading: cardsLoading } = useCards(user, true)

  
  const { rewards, loading: rewardsLoading, createReward, updateReward, deleteReward } = useRewards(user, true)

  
  const { products, loading: productsLoading, createProduct, updateProduct, deleteProduct } = useProducts(user, true)

  
  const { transactions, loading: transactionsLoading, refreshTransactions } = useTransactions(user, true)

  useEffect(() => {
    if (!statsLoading && isInitialLoad) {
      setIsInitialLoad(false)
    }
  }, [statsLoading, isInitialLoad])

  useEffect(() => {
    setSearchParams({ tab: activeTab }, { replace: true })
    localStorage.setItem("adminDashboardTab", activeTab)
  }, [activeTab, setSearchParams])

  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab)
  }, [])

  const uploadProductImage = async (file: File): Promise<string> => {
    try {
      const fileExt = file.name.split(".").pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `product-images/${fileName}`

      const { error: uploadError } = await supabase.storage.from("products").upload(filePath, file)

      if (uploadError) {
        throw uploadError
      }

      const { data } = supabase.storage.from("products").getPublicUrl(filePath)

      return data.publicUrl
    } catch (error) {
      console.error("Error uploading image:", error)
      throw new Error("Failed to upload image")
    }
  }

  const deleteProductImage = async (url: string): Promise<void> => {
    try {
      
      const storageUrl = supabase.storage.from("products").getPublicUrl("").data.publicUrl
      const filePath = url.replace(storageUrl, "")

      const { error } = await supabase.storage.from("products").remove([filePath])

      if (error) {
        throw error
      }
    } catch (error) {
      console.error("Error deleting image:", error)
      throw new Error("Failed to delete image")
    }
  }

  const renderTabContent = useCallback(
    (tab: string) => {
      switch (tab) {
        case "dashboard":
          return <StatCards stats={stats} />
        case "transactions":
          return (
            <TransactionsTab
              transactions={transactions}
              loading={transactionsLoading}
              cards={cards}
              products={products}
              onTransactionCreated={refreshTransactions}
            />
          )
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
              uploadProductImage={uploadProductImage}
              deleteProductImage={deleteProductImage}
            />
          )
        case "settings":
          return <AccountSettings />
        default:
          return <StatCards stats={stats} />
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
    ],
  )

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
    )
  }

  const menuItems = [
    { value: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { value: "transactions", icon: ShoppingCart, label: "Transactions" },
    { value: "members", icon: Users, label: "Members" },
    { value: "loyalty", icon: CreditCard, label: "Loyalty" },
    { value: "rewards", icon: Gift, label: "Rewards" },
    { value: "products", icon: CoffeeIcon, label: "Inventory" },
    { value: "settings", icon: Settings, label: "Settings" },
  ]

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="fixed top-0 left-0 h-screen w-64 bg-white/95 backdrop-blur-sm border-r border-gray-200 p-4 hidden md:flex flex-col justify-between z-50">
        <div>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-4 mb-6"
          >
            {/* Dual Logo Container */}
            <div className="flex items-center justify-center gap-4">
              <img src="/logo.png" alt="Byte & Brew Logo" className="h-14 w-auto object-contain rounded-full" />
              <img src="/logo2.png" alt="Partner Logo" className="h-14 w-auto object-contain rounded-full" />
            </div>

            {/* Title with divider */}
            <div className="w-full text-center">
              <span className="text-xl font-bold text-gray-800">BYTE & BREW</span>
              <div className="w-full h-px bg-gray-200 my-2"></div>
              <p className="text-xs text-gray-500">Partnered with</p>
              <p className="text-sm font-medium text-gray-700">9BARs coffee</p>
            </div>
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

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <button
            onClick={async () => {
              const { error } = await supabase.auth.signOut()
              if (error) {
                console.error("Logout failed:", error.message)
              } else {
                window.location.href = "/"
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
  )
}
