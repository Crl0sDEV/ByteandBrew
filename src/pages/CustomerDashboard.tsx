import Header from "@/components/Header";
import { CreditCard, Gift, ShoppingBag, History, Coffee } from "lucide-react";
import { Card as UICard, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function CustomerDashboard() {
  // Sample data - replace with real data from your backend
  const customerData = {
    name: "Juan Dela Cruz",
    cardNumber: "LC-4892",
    balance: "₱1,250",
    points: 1250,
    pointsToNextReward: 250,
    recentTransactions: [
      { id: 1, date: "2023-11-15", amount: "₱220", items: "3 items", status: "Completed" },
      { id: 2, date: "2023-11-14", amount: "₱150", items: "2 items", status: "Completed" },
      { id: 3, date: "2023-11-12", amount: "₱180", items: "1 item", status: "Completed" },
    ],
    availableRewards: [
      { id: 1, name: "Free Coffee", points: 1000, description: "Medium Americano" },
      { id: 2, name: "Discount Voucher", points: 500, description: "20% off next purchase" },
    ]
  };

  return (
    <div className="p-4 md:p-8">
      <Header />
      
      <div className="mt-6 space-y-6">
        {/* Welcome Header */}
        <div>
          <h1 className="text-2xl font-bold">Welcome, {customerData.name}!</h1>
          <p className="text-muted-foreground">Your loyalty card details and activity</p>
        </div>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <UICard>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Card Balance
              </CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{customerData.balance}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Card: {customerData.cardNumber}
              </p>
            </CardContent>
          </UICard>

          <UICard>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Reward Points
              </CardTitle>
              <Gift className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{customerData.points} pts</div>
              <div className="mt-2">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Next reward in {customerData.pointsToNextReward} pts</span>
                  <span>{(customerData.points/1500*100).toFixed(0)}%</span>
                </div>
                <Progress value={customerData.points/15} className="h-2" />
              </div>
            </CardContent>
          </UICard>

          <UICard>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Recent Visits
              </CardTitle>
              <History className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground mt-1">
                This month
              </p>
            </CardContent>
          </UICard>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Transactions */}
          <UICard>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Your purchase history</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customerData.recentTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{transaction.date}</TableCell>
                      <TableCell>{transaction.amount}</TableCell>
                      <TableCell>{transaction.items}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline">{transaction.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </UICard>

          {/* Available Rewards */}
          <UICard>
            <CardHeader>
              <CardTitle>Available Rewards</CardTitle>
              <CardDescription>Redeem your points</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              {customerData.availableRewards.map((reward) => (
                <div key={reward.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{reward.name}</div>
                    <div className="text-sm text-muted-foreground">{reward.description}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Gift className="h-3 w-3" />
                      {reward.points} pts
                    </Badge>
                    <Button variant="outline" size="sm">
                      Redeem
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </UICard>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Button variant="outline" className="flex items-center gap-2 h-16">
            <ShoppingBag className="w-5 h-5" />
            <div className="text-left">
              <div className="font-medium">View Full History</div>
              <div className="text-sm text-muted-foreground">All your transactions</div>
            </div>
          </Button>
          <Button variant="outline" className="flex items-center gap-2 h-16">
            <Gift className="w-5 h-5" />
            <div className="text-left">
              <div className="font-medium">All Rewards</div>
              <div className="text-sm text-muted-foreground">Browse available rewards</div>
            </div>
          </Button>
          <Button variant="outline" className="flex items-center gap-2 h-16">
            <Coffee className="w-5 h-5" />
            <div className="text-left">
              <div className="font-medium">Menu</div>
              <div className="text-sm text-muted-foreground">View our products</div>
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
}