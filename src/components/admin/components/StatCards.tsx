"use client";
import {
  Card as UICard,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { ShoppingCart, Users, Gift, CreditCard, Download } from "lucide-react";
import type { AdminStats } from "../types";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  Tooltip,
  ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface StatCardsProps {
  stats: AdminStats;
}

interface TransactionData {
  date: string;
  payments: number;
  cups_sold: number;
  payment_amount: number;
  points_earned: number;
  total_transactions: number;
}

interface ProductSalesData {
  name: string;
  value: number;
}

type TimeRange = "7days" | "30days" | "90days" | "year";

export function StatCards({ stats }: StatCardsProps) {
  // State for payment amount chart
  const [paymentData, setPaymentData] = useState<TransactionData[]>([]);
  const [paymentTimeRange, setPaymentTimeRange] = useState<TimeRange>("30days");
  const [paymentLoading, setPaymentLoading] = useState(true);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // State for points earned chart
  const [pointsData, setPointsData] = useState<TransactionData[]>([]);
  const [pointsTimeRange, setPointsTimeRange] = useState<TimeRange>("30days");
  const [pointsLoading, setPointsLoading] = useState(true);
  const [pointsError, setPointsError] = useState<string | null>(null);

  // State for product sales chart
  const [productSalesData, setProductSalesData] = useState<ProductSalesData[]>([]);
  const [productSalesTimeRange, setProductSalesTimeRange] = useState<TimeRange>("30days");
  const [productSalesLoading, setProductSalesLoading] = useState(true);

  // State for cups sold chart
  const [cupsData, setCupsData] = useState<TransactionData[]>([]);
const [cupsTimeRange, setCupsTimeRange] = useState<TimeRange>("30days");
const [cupsLoading, setCupsLoading] = useState(true);
const [cupsError, setCupsError] = useState<string | null>(null);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  // Fetch payment data
  useEffect(() => {
    const fetchPaymentData = async () => {
      try {
        setPaymentLoading(true);
        setPaymentError(null);

        const today = new Date();
        today.setHours(23, 59, 59, 999);
        const startDate = new Date();
        startDate.setHours(0, 0, 0, 0);

        switch (paymentTimeRange) {
          case "7days":
            startDate.setDate(today.getDate() - 7);
            break;
          case "30days":
            startDate.setDate(today.getDate() - 30);
            break;
          case "90days":
            startDate.setDate(today.getDate() - 90);
            break;
          case "year":
            startDate.setFullYear(today.getFullYear() - 1);
            break;
        }

        const formatDate = (date: Date) => {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const day = String(date.getDate()).padStart(2, "0");
          return `${year}-${month}-${day}`;
        };

        const { data, error } = await supabase
          .from("transactions")
          .select("*")
          .gte("created_at", formatDate(startDate))
          .lte("created_at", today.toISOString())
          .order("created_at", { ascending: true });

        if (error) throw error;

        if (!data || data.length === 0) {
          const processedData = generateSampleData(startDate, today);
          setPaymentData(processedData);
        } else {
          const processedData = processTransactionData(data, startDate, today);
          setPaymentData(processedData);
        }
      } catch (err) {
        console.error("Error fetching payment data:", err);
        setPaymentError("Failed to load payment data");
        const today = new Date();
        const startDate = new Date();
        startDate.setDate(today.getDate() - 30);
        setPaymentData(generateSampleData(startDate, today));
      } finally {
        setPaymentLoading(false);
      }
    };

    fetchPaymentData();
  }, [paymentTimeRange]);

  // Fetch points data
  useEffect(() => {
    const fetchPointsData = async () => {
      try {
        setPointsLoading(true);
        setPointsError(null);

        const today = new Date();
        today.setHours(23, 59, 59, 999);
        const startDate = new Date();
        startDate.setHours(0, 0, 0, 0);

        switch (pointsTimeRange) {
          case "7days":
            startDate.setDate(today.getDate() - 7);
            break;
          case "30days":
            startDate.setDate(today.getDate() - 30);
            break;
          case "90days":
            startDate.setDate(today.getDate() - 90);
            break;
          case "year":
            startDate.setFullYear(today.getFullYear() - 1);
            break;
        }

        const formatDate = (date: Date) => {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const day = String(date.getDate()).padStart(2, "0");
          return `${year}-${month}-${day}`;
        };

        const { data, error } = await supabase
          .from("transactions")
          .select("*")
          .gte("created_at", formatDate(startDate))
          .lte("created_at", today.toISOString())
          .order("created_at", { ascending: true });

        if (error) throw error;

        if (!data || data.length === 0) {
          const processedData = generateSampleData(startDate, today);
          setPointsData(processedData);
        } else {
          const processedData = processTransactionData(data, startDate, today);
          setPointsData(processedData);
        }
      } catch (err) {
        console.error("Error fetching points data:", err);
        setPointsError("Failed to load points data");
        const today = new Date();
        const startDate = new Date();
        startDate.setDate(today.getDate() - 30);
        setPointsData(generateSampleData(startDate, today));
      } finally {
        setPointsLoading(false);
      }
    };

    fetchPointsData();
  }, [pointsTimeRange]);

  // Fetch product sales data
  useEffect(() => {
    const fetchProductSalesData = async () => {
      try {
        setProductSalesLoading(true);
        
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        const startDate = new Date();
        startDate.setHours(0, 0, 0, 0);

        switch (productSalesTimeRange) {
          case "7days":
            startDate.setDate(today.getDate() - 7);
            break;
          case "30days":
            startDate.setDate(today.getDate() - 30);
            break;
          case "90days":
            startDate.setDate(today.getDate() - 90);
            break;
          case "year":
            startDate.setFullYear(today.getFullYear() - 1);
            break;
        }

        const { data, error } = await supabase
          .from("transaction_items")
          .select(`
            product_name, 
            quantity, 
            price,
            transactions!inner(created_at)
          `)
          .gte("transactions.created_at", startDate.toISOString())
          .lte("transactions.created_at", today.toISOString());

        if (error) throw error;

        if (data && data.length > 0) {
          const productMap = new Map<string, number>();
          
          data.forEach(item => {
            const total = (item.price || 0) * (item.quantity || 1);
            if (productMap.has(item.product_name)) {
              productMap.set(item.product_name, productMap.get(item.product_name)! + total);
            } else {
              productMap.set(item.product_name, total);
            }
          });

          const sortedProducts = Array.from(productMap.entries())
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);

          setProductSalesData(sortedProducts);
        } else {
          setProductSalesData([]);
        }
      } catch (err) {
        console.error("Error fetching product sales data:", err);
        setProductSalesData([
          { name: "Product A", value: 4000 },
          { name: "Product B", value: 3000 },
          { name: "Product C", value: 2000 },
          { name: "Product D", value: 1000 },
        ]);
      } finally {
        setProductSalesLoading(false);
      }
    };

    fetchProductSalesData();
  }, [productSalesTimeRange]);

  // Fetch cups sold data
useEffect(() => {
  const fetchCupsData = async () => {
    try {
      setCupsLoading(true);
      setCupsError(null);

      const today = new Date();
      today.setHours(23, 59, 59, 999);
      const startDate = new Date();
      startDate.setHours(0, 0, 0, 0);

      switch (cupsTimeRange) {
        case "7days":
          startDate.setDate(today.getDate() - 7);
          break;
        case "30days":
          startDate.setDate(today.getDate() - 30);
          break;
        case "90days":
          startDate.setDate(today.getDate() - 90);
          break;
        case "year":
          startDate.setFullYear(today.getFullYear() - 1);
          break;
      }

      const { data, error } = await supabase
        .from("transaction_items")
        .select(`
          quantity,
          transactions!inner(created_at)
        `)
        .gte("transactions.created_at", startDate.toISOString())
        .lte("transactions.created_at", today.toISOString());

      if (error) throw error;

      // Process the data to count cups per day
      const processedData = processCupsData(data || [], startDate, today);
      setCupsData(processedData);
    } catch (err) {
      console.error("Error fetching cups data:", err);
      setCupsError("Failed to load cups data");
      const today = new Date();
      const startDate = new Date();
      startDate.setDate(today.getDate() - 30);
      setCupsData(generateSampleCupsData(startDate, today));
    } finally {
      setCupsLoading(false);
    }
  };

  fetchCupsData();
}, [cupsTimeRange]);

const processCupsData = (data: any[], startDate: Date, endDate: Date) => {
  const cupsByDate: Record<string, TransactionData> = {};

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Initialize all dates in range with 0 cups
  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const dateStr = formatDate(currentDate);
    cupsByDate[dateStr] = {
      date: dateStr,
      cups_sold: 0,
      payments: 0,
      payment_amount: 0,
      points_earned: 0,
      total_transactions: 0,
    };
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Count cups for each date
  data.forEach((item) => {
    if (!item.transactions?.created_at) return;

    const transactionDate = new Date(item.transactions.created_at);
    const date = formatDate(transactionDate);

    if (!cupsByDate[date]) return;

    const quantity = item.quantity || 1;
    cupsByDate[date].cups_sold += quantity;
  });

  return Object.values(cupsByDate).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
};

const generateSampleCupsData = (startDate: Date, endDate: Date): TransactionData[] => {
  const data: TransactionData[] = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    const dateStr = currentDate.toISOString().split("T")[0];
    const cupsSold = Math.floor(Math.random() * 20) + 5;

    data.push({
      date: dateStr,
      cups_sold: cupsSold,
      payments: 0,
      payment_amount: 0,
      points_earned: 0,
      total_transactions: 0,
    });

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return data;
};

  const processTransactionData = (
    data: any[],
    startDate: Date,
    endDate: Date
  ) => {
    const transactionsByDate: Record<string, TransactionData> = {};

    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateStr = formatDate(currentDate);
      transactionsByDate[dateStr] = {
        date: dateStr,
        payments: 0,
        payment_amount: 0,
        points_earned: 0,
        total_transactions: 0,
        cups_sold: 0,
      };
      currentDate.setDate(currentDate.getDate() + 1);
    }

    data.forEach((transaction) => {
      if (!transaction.created_at) return;

      const transactionDate = new Date(transaction.created_at);
      const date = formatDate(transactionDate);

      if (!transactionsByDate[date]) return;

      const amount = parseFloat(transaction.amount) || 0;
      const points = parseFloat(transaction.points) || 0;

      if (transaction.type === "payment") {
        transactionsByDate[date].payments += 1;
        transactionsByDate[date].payment_amount += amount;
        transactionsByDate[date].points_earned += points;
      }

      transactionsByDate[date].total_transactions += 1;
    });

    return Object.values(transactionsByDate).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  };

  const generateSampleData = (
    startDate: Date,
    endDate: Date
  ): TransactionData[] => {
    const data: TransactionData[] = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split("T")[0];
      const paymentCount = Math.floor(Math.random() * 10) + 1;
      const paymentAmount =
        paymentCount * 100 + Math.floor(Math.random() * 500);
      const pointsEarned = paymentCount * 10 + Math.floor(Math.random() * 50);

      data.push({
        date: dateStr,
        payments: paymentCount,
        payment_amount: paymentAmount,
        points_earned: pointsEarned,
        total_transactions: paymentCount,
        cups_sold: Math.floor(Math.random() * 20) + 5,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return data;
  };

  const formatTooltipValue = (value: any, name: any) => {
    if (name === "Payment Amount") {
      return `₱${Number(value).toLocaleString()}`;
    }
    if (name === "Points Earned") {
      return `${Number(value).toLocaleString()} pts`;
    }
    return value;
  };

  const exportPaymentCSV = () => {
    if (!paymentData.length) return;

    const headers = [
      "Date",
      "Payments",
      "Payment Amount",
      "Points Earned",
      "Total Transactions",
    ];

    const csvRows = [
      headers.join(","),
      ...paymentData.map((row) => {
        const date = new Date(row.date).toLocaleDateString();
        return [
          date,
          row.payments,
          row.payment_amount,
          row.points_earned,
          row.total_transactions,
        ].join(",");
      }),
    ];

    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `payment_data_${paymentTimeRange}_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPointsCSV = () => {
    if (!pointsData.length) return;

    const headers = [
      "Date",
      "Payments",
      "Payment Amount",
      "Points Earned",
      "Total Transactions",
    ];

    const csvRows = [
      headers.join(","),
      ...pointsData.map((row) => {
        const date = new Date(row.date).toLocaleDateString();
        return [
          date,
          row.payments,
          row.payment_amount,
          row.points_earned,
          row.total_transactions,
        ].join(",");
      }),
    ];

    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `points_data_${pointsTimeRange}_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportProductSalesCSV = () => {
    if (!productSalesData.length) return;

    const headers = ["Product", "Sales Amount"];
    const csvRows = [
      headers.join(","),
      ...productSalesData.map(item => 
        [item.name, `₱${item.value.toLocaleString()}`].join(",")
      )
    ];

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `product_sales_${productSalesTimeRange}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const exportCupsCSV = () => {
    if (!cupsData.length) return;
  
    const headers = ["Date", "Cups Sold"];
    const csvRows = [
      headers.join(","),
      ...cupsData.map((row) => {
        const date = new Date(row.date).toLocaleDateString();
        return [date, row.cups_sold].join(",");
      }),
    ];
  
    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `cups_data_${cupsTimeRange}_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="layout-background rounded-lg space-y-4">
      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Sales Card */}
        <UICard className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-[#a2c569] to-[#4b8e3f] rounded-t-lg">
            <CardTitle className="text-sm font-medium text-white">Today's Sales</CardTitle>
            <ShoppingCart className="w-4 h-4 text-white" />
          </CardHeader>
          <CardContent className="bg-white rounded-b-lg">
            <div className="text-2xl font-bold text-[#4b8e3f]">
              ₱{stats.todaySales.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Total today sales</p>
          </CardContent>
        </UICard>

        {/* Active Members Card */}
        <UICard className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-[#a2c569] to-[#4b8e3f] rounded-t-lg">
            <CardTitle className="text-sm font-medium text-white">
              Active Members
            </CardTitle>
            <Users className="w-4 h-4 text-white" />
          </CardHeader>
          <CardContent className="bg-white rounded-b-lg">
            <div className="text-2xl font-bold text-[#4b8e3f]">{stats.activeMembers}</div>
            <p className="text-xs text-muted-foreground mt-1">Total members</p>
          </CardContent>
        </UICard>

        {/* Reward Redemptions Card */}
        <UICard className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-[#a2c569] to-[#4b8e3f] rounded-t-lg">
            <CardTitle className="text-sm font-medium text-white">
              Reward Redemptions
            </CardTitle>
            <Gift className="w-4 h-4 text-white" />
          </CardHeader>
          <CardContent className="bg-white rounded-b-lg">
            <div className="text-2xl font-bold text-[#4b8e3f]">{stats.totalRedemptions}</div>
            <div className="text-sm text-muted-foreground mt-1">
              Total rewards redeemed
            </div>
          </CardContent>
        </UICard>

        {/* Cards Issued Card */}
        <UICard className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-[#a2c569] to-[#4b8e3f] rounded-t-lg">
            <CardTitle className="text-sm font-medium text-white">Cards Issued</CardTitle>
            <CreditCard className="w-4 h-4 text-white" />
          </CardHeader>
          <CardContent className="bg-white rounded-b-lg">
            <div className="text-2xl font-bold text-[#4b8e3f]">{stats.cardsIssued}</div>
            <p className="text-xs text-muted-foreground mt-1">Total cards issued</p>
          </CardContent>
        </UICard>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Payment Amount Chart */}
        <UICard>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle>Payment Amount Overview</CardTitle>
                <CardDescription>
                  Total payment amounts over time.
                </CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Select
                  value={paymentTimeRange}
                  onValueChange={(value) => setPaymentTimeRange(value as TimeRange)}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Select range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7days">Last 7 days</SelectItem>
                    <SelectItem value="30days">Last 30 days</SelectItem>
                    <SelectItem value="90days">Last 90 days</SelectItem>
                    <SelectItem value="year">Last year</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportPaymentCSV}
                  disabled={!paymentData.length}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {paymentLoading ? (
              <div className="h-[400px] flex items-center justify-center">
                <p>Loading payment data...</p>
              </div>
            ) : paymentError && paymentData.length === 0 ? (
              <div className="h-[400px] flex items-center justify-center text-red-500">
                <p>{paymentError}</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={paymentData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return date.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      });
                    }}
                    axisLine={false}
                    tickLine={false}
                    tickMargin={8}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) => `₱${value}`}
                    tickMargin={8}
                  />
                  <Tooltip
                    formatter={formatTooltipValue}
                    labelFormatter={(label) => {
                      const date = new Date(label);
                      return date.toLocaleDateString("en-US", {
                        weekday: "short",
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      });
                    }}
                  />
                  <Legend verticalAlign="top" height={36} />
                  <Bar
                    dataKey="payment_amount"
                    fill="#4f46e5"
                    radius={[4, 4, 0, 0]}
                    name="Payment Amount"
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </UICard>

        {/* Points Earned Chart */}
        <UICard>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle>Points Earned Overview</CardTitle>
                <CardDescription>
                  Total points earned over time.
                </CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Select
                  value={pointsTimeRange}
                  onValueChange={(value) => setPointsTimeRange(value as TimeRange)}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Select range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7days">Last 7 days</SelectItem>
                    <SelectItem value="30days">Last 30 days</SelectItem>
                    <SelectItem value="90days">Last 90 days</SelectItem>
                    <SelectItem value="year">Last year</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportPointsCSV}
                  disabled={!pointsData.length}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {pointsLoading ? (
              <div className="h-[400px] flex items-center justify-center">
                <p>Loading points data...</p>
              </div>
            ) : pointsError && pointsData.length === 0 ? (
              <div className="h-[400px] flex items-center justify-center text-red-500">
                <p>{pointsError}</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={pointsData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return date.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      });
                    }}
                    axisLine={false}
                    tickLine={false}
                    tickMargin={8}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) => `${value} pts`}
                    tickMargin={8}
                  />
                  <Tooltip
                    formatter={formatTooltipValue}
                    labelFormatter={(label) => {
                      const date = new Date(label);
                      return date.toLocaleDateString("en-US", {
                        weekday: "short",
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      });
                    }}
                  />
                  <Legend verticalAlign="top" height={36} />
                  <Bar
                    dataKey="points_earned"
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                    name="Points Earned"
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </UICard>

        {/* Product Sales Distribution */}
        <UICard>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle>Product Sales Distribution</CardTitle>
                <CardDescription>
                  Breakdown of sales by product
                </CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Select
                  value={productSalesTimeRange}
                  onValueChange={(value) => setProductSalesTimeRange(value as TimeRange)}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Select range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7days">Last 7 days</SelectItem>
                    <SelectItem value="30days">Last 30 days</SelectItem>
                    <SelectItem value="90days">Last 90 days</SelectItem>
                    <SelectItem value="year">Last year</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportProductSalesCSV}
                  disabled={!productSalesData.length}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {productSalesLoading ? (
              <div className="h-[400px] flex items-center justify-center">
                <p>Loading product sales data...</p>
              </div>
            ) : productSalesData.length === 0 ? (
              <div className="h-[400px] flex items-center justify-center">
                <p>No product sales data available</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={productSalesData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => 
                      `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {productSalesData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[index % COLORS.length]} 
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [`₱${value.toLocaleString()}`, "Sales"]}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </UICard>

        {/* Cups Sold Chart */}
<UICard>
  <CardHeader>
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <CardTitle>Cups Sold Overview</CardTitle>
        <CardDescription>
          Number of cups sold each day
        </CardDescription>
      </div>
      <div className="flex flex-col sm:flex-row gap-2">
        <Select
          value={cupsTimeRange}
          onValueChange={(value) => setCupsTimeRange(value as TimeRange)}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Select range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7days">Last 7 days</SelectItem>
            <SelectItem value="30days">Last 30 days</SelectItem>
            <SelectItem value="90days">Last 90 days</SelectItem>
            <SelectItem value="year">Last year</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          size="sm"
          onClick={exportCupsCSV}
          disabled={!cupsData.length}
        >
          <Download className="h-4 w-4 mr-1" />
          Export
        </Button>
      </div>
    </div>
  </CardHeader>
  <CardContent>
    {cupsLoading ? (
      <div className="h-[400px] flex items-center justify-center">
        <p>Loading cups data...</p>
      </div>
    ) : cupsError && cupsData.length === 0 ? (
      <div className="h-[400px] flex items-center justify-center text-red-500">
        <p>{cupsError}</p>
      </div>
    ) : (
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={cupsData}
          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={(value) => {
              const date = new Date(value);
              return date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              });
            }}
            axisLine={false}
            tickLine={false}
            tickMargin={8}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tickMargin={8}
          />
          <Tooltip
            formatter={(value) => [`${value} cups`, "Cups Sold"]}
            labelFormatter={(label) => {
              const date = new Date(label);
              return date.toLocaleDateString("en-US", {
                weekday: "short",
                year: "numeric",
                month: "short",
                day: "numeric",
              });
            }}
          />
          <Legend />
          <Bar
            dataKey="cups_sold"
            fill="#FF8042"
            radius={[4, 4, 0, 0]}
            name="Cups Sold"
          />
        </BarChart>
      </ResponsiveContainer>
    )}
  </CardContent>
</UICard>
      </div>
    </div>
  );
}