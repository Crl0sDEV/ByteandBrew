import Header from "@/components/Header";
import { CreditCard, Users, ShoppingCart, Settings, Gift, Plus, PlusCircle, RefreshCw, XCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card as UICard, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AdminDashboard() {
  return (
    <div className="p-4 md:p-8">
      <Header />
      
      <div className="mt-6 space-y-6">
        {/* Dashboard Header */}
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage loyalty cards, transactions, rewards, and products</p>
        </div>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            icon={<ShoppingCart size={20} />}
            title="Today's Sales"
            value="₱12,450"
            change="+5% from yesterday"
          />
          <StatCard 
            icon={<Users size={20} />}
            title="Active Members"
            value="248"
            change="+12 this week"
          />
          <StatCard 
            icon={<Gift size={20} />}
            title="Points Redeemed"
            value="1,240"
            change="32 today"
          />
          <StatCard 
            icon={<CreditCard size={20} />}
            title="Cards Issued"
            value="356"
            change="+8 this month"
          />
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="transactions" className="w-full">
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

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="pt-4 space-y-4">
            <UICard>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Recent Transactions</CardTitle>
                    <CardDescription>Today's customer purchases</CardDescription>
                  </div>
                  <Select>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Transactions</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Card ID</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>LC-4892</TableCell>
                      <TableCell>₱150</TableCell>
                      <TableCell>2 items</TableCell>
                      <TableCell><Badge variant="outline">Completed</Badge></TableCell>
                      <TableCell className="text-right">10:42 AM</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>LC-6721</TableCell>
                      <TableCell>₱220</TableCell>
                      <TableCell>3 items</TableCell>
                      <TableCell><Badge variant="outline">Completed</Badge></TableCell>
                      <TableCell className="text-right">9:15 AM</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </UICard>
          </TabsContent>

          {/* Members Tab */}
          <TabsContent value="members" className="pt-4">
            <UICard>
              <CardHeader>
                <CardTitle>Member Management</CardTitle>
                <CardDescription>All registered loyalty program members</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center py-4">
                  <Input
                    placeholder="Filter members..."
                    className="max-w-sm"
                  />
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Join Date</TableHead>
                      <TableHead className="text-right">Points</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>M-4821</TableCell>
                      <TableCell>Juan Dela Cruz</TableCell>
                      <TableCell>juan@example.com</TableCell>
                      <TableCell>2023-10-15</TableCell>
                      <TableCell className="text-right">1,250</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </UICard>
          </TabsContent>

          {/* Loyalty Cards Tab */}
          <TabsContent value="loyalty" className="pt-4 space-y-4">
            <UICard>
              <CardHeader>
                <CardTitle>Card Operations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button variant="outline" className="flex items-center gap-2 h-24">
                    <PlusCircle className="w-6 h-6" />
                    <div className="text-left">
                      <div className="font-medium">Issue New Card</div>
                      <div className="text-sm text-muted-foreground">Create new loyalty card</div>
                    </div>
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2 h-24">
                    <RefreshCw className="w-6 h-6" />
                    <div className="text-left">
                      <div className="font-medium">Reload Card</div>
                      <div className="text-sm text-muted-foreground">Add balance to existing card</div>
                    </div>
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2 h-24">
                    <XCircle className="w-6 h-6" />
                    <div className="text-left">
                      <div className="font-medium">Deactivate Card</div>
                      <div className="text-sm text-muted-foreground">Disable lost/stolen cards</div>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </UICard>

            <UICard>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Loyalty Cards</CardTitle>
                    <CardDescription>All issued loyalty cards</CardDescription>
                  </div>
                  <Input
                    placeholder="Search cards..."
                    className="max-w-sm"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Card ID</TableHead>
                      <TableHead>Member</TableHead>
                      <TableHead>Balance</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Last Used</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>LC-4892</TableCell>
                      <TableCell>Juan Dela Cruz</TableCell>
                      <TableCell>₱1,250</TableCell>
                      <TableCell><Badge variant="default">Active</Badge></TableCell>
                      <TableCell className="text-right">Today, 10:42 AM</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </UICard>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products" className="pt-4">
            <UICard>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Product Management</CardTitle>
                    <CardDescription>Your cafe menu items</CardDescription>
                  </div>
                  <Button className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Add Product
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price (S)</TableHead>
                      <TableHead>Price (M)</TableHead>
                      <TableHead>Price (L)</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Americano</TableCell>
                      <TableCell>Coffee</TableCell>
                      <TableCell>₱120</TableCell>
                      <TableCell>₱140</TableCell>
                      <TableCell>₱160</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">Edit</Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </UICard>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({ icon, title, value, change }: { 
  icon: React.ReactNode, 
  title: string, 
  value: string, 
  change: string 
}) {
  return (
    <UICard>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {title}
        </CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">
          {change}
        </p>
      </CardContent>
    </UICard>
  );
}

// Coffee icon component
function CoffeeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
      <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
      <line x1="6" x2="6" y1="2" y2="4" />
      <line x1="10" x2="10" y1="2" y2="4" />
      <line x1="14" x2="14" y1="2" y2="4" />
    </svg>
  );
}