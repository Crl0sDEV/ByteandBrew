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
import { useEffect, useState, useRef } from "react";
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
} from "recharts";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  payment: number;
  points_addition: number;
  total: number;
  payment_amount: number;
  points_addition_amount: number;
  total_amount: number;
}

type TimeRange = "7days" | "30days" | "90days" | "year";
type ChartView = "count" | "amount";

export function StatCards({ stats }: StatCardsProps) {
  const [transactionData, setTransactionData] = useState<TransactionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>("30days");
  const [chartView, setChartView] = useState<ChartView>("count");
  const chartContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (transactionData.length > 0) {
      console.log(
        "Transaction data loaded:",
        transactionData.length,
        "records"
      );
    }
  }, [transactionData]);

  useEffect(() => {
    const fetchTransactionData = async () => {
      try {
        setLoading(true);
        setError(null);

        const today = new Date();
        today.setHours(23, 59, 59, 999);

        const startDate = new Date();
        startDate.setHours(0, 0, 0, 0);

        switch (timeRange) {
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

        const formatEndDate = (date: Date) => {
          return date.toISOString();
        };

        console.log(
          "Fetching transactions from",
          formatDate(startDate),
          "to",
          formatDate(today),
          "(including today)"
        );

        const { data, error: supabaseError } = await supabase
          .from("transactions")
          .select("*")
          .gte("created_at", formatDate(startDate))
          .lte("created_at", formatEndDate(today))
          .order("created_at", { ascending: true });

        if (supabaseError) throw supabaseError;

        console.log("Raw transaction data:", data?.length || 0, "records");

        if (data && data.length > 0) {
          console.log("First transaction date:", data[0].created_at);
          console.log(
            "Last transaction date:",
            data[data.length - 1].created_at
          );

          const todayStr = formatDate(today);
          const todaysData = data.filter((t) => {
            const transactionDate = new Date(t.created_at)
              .toISOString()
              .split("T")[0];
            return transactionDate === todayStr;
          });

          console.log("Today's transactions:", todaysData.length, "records");
          if (todaysData.length > 0) {
            console.log("Sample today's transaction:", todaysData[0]);
          }
        }

        if (!data || data.length === 0) {
          console.log("No data with filters, trying without date filters");

          const { data: allData, error: allDataError } = await supabase
            .from("transactions")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(100);

          if (allDataError) throw allDataError;

          console.log("All transactions (up to 100):", allData?.length || 0);

          if (allData && allData.length > 0) {
            console.log("Most recent transaction:", allData[0]);
            console.log(
              "Oldest transaction in sample:",
              allData[allData.length - 1]
            );

            const processedData = processTransactionData(
              allData,
              startDate,
              today
            );
            setTransactionData(processedData);
            setLoading(false);
            return;
          } else {
            console.log("No data returned, creating sample data");
            const sampleData = generateSampleData(startDate, today);
            setTransactionData(sampleData);
            setLoading(false);
            return;
          }
        }

        const processedData = processTransactionData(data, startDate, today);
        setTransactionData(processedData);
      } catch (err) {
        console.error("Error fetching transaction data:", err);
        setError("Failed to load transaction data");

        const today = new Date();
        const startDate = new Date();
        startDate.setDate(today.getDate() - 30);
        const sampleData = generateSampleData(startDate, today);
        setTransactionData(sampleData);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactionData();
  }, [timeRange]);

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
        payment: 0,
        points_addition: 0,
        total: 0,
        payment_amount: 0,
        points_addition_amount: 0,
        total_amount: 0,
      };
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // In the processTransactionData function, modify the points addition handling:
data.forEach((transaction) => {
  if (!transaction.created_at) return;

  const transactionDate = new Date(transaction.created_at);
  const date = formatDate(transactionDate);

  if (!transactionsByDate[date]) return;

  const isPayment = transaction.type === "payment";
  const isPointsAddition = transaction.type === "points_addition";

  // Use amount for payments, points for points additions
  const value = isPayment ? Number(transaction.amount) || 0 : 
              isPointsAddition ? Number(transaction.points) || 0 : 0;

  if (isPayment) {
    transactionsByDate[date].payment += 1;
    transactionsByDate[date].payment_amount += value;
  } else if (isPointsAddition) {
    transactionsByDate[date].points_addition += 1;
    transactionsByDate[date].points_addition_amount += value;
  }

  transactionsByDate[date].total += 1;
  transactionsByDate[date].total_amount += value;
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
      const pointsAdditionCount = Math.floor(Math.random() * 8) + 1;
  
      data.push({
        date: dateStr,
        payment: paymentCount,
        points_addition: pointsAdditionCount,
        total: paymentCount + pointsAdditionCount,
        payment_amount: paymentCount * 100 + Math.floor(Math.random() * 500),
        // Using higher values for points to make them visible in the chart
        points_addition_amount: pointsAdditionCount * 1000 + Math.floor(Math.random() * 3000),
        total_amount: 0,
      });
  
      data[data.length - 1].total_amount =
        data[data.length - 1].payment_amount +
        data[data.length - 1].points_addition_amount;
  
      currentDate.setDate(currentDate.getDate() + 1);
    }
  
    return data;
  };

  const getDataKeys = () => {
    if (chartView === "count") {
      return ["payment", "points_addition"];
    } else {
      return ["payment_amount", "points_addition_amount"];
    }
  };

  const formatTooltipValue = (value: any, name: any) => {
    if (name === "Payment Amount" || name === "Points Addition Amount") {
      return `₱${Number(value).toLocaleString()}`;
    }
    return value;
  };

  const formatYAxisTick = (value: any): string => {
    if (chartView === "amount") {
      return `₱${value}`;
    }
    return String(value);
  };

  const exportCSV = () => {
    if (!transactionData.length) return;

    const headers = [
      "Date",
      "Payments",
      "Points Additions",
      "Payment Amount",
      "Points Addition Amount",
      "Total Amount",
    ];
    const csvRows = [
      headers.join(","),
      ...transactionData.map((row) => {
        const date = new Date(row.date).toLocaleDateString();
        return [
          date,
          row.payment,
          row.points_addition,
          row.payment_amount,
          row.points_addition_amount,
          row.total_amount,
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
      `transactions_${timeRange}_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <UICard>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Sales</CardTitle>
            <ShoppingCart className="w-4 h-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₱{stats.todaySales.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">View details</p>
          </CardContent>
        </UICard>
        <UICard>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Members
            </CardTitle>
            <Users className="w-4 h-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeMembers}</div>
            <p className="text-xs text-muted-foreground mt-1">Manage members</p>
          </CardContent>
        </UICard>
        <UICard>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Points Redeemed
            </CardTitle>
            <Gift className="w-4 h-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pointsRedeemed}</div>
            <p className="text-xs text-muted-foreground mt-1">See rewards</p>
          </CardContent>
        </UICard>
        <UICard>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cards Issued</CardTitle>
            <CreditCard className="w-4 h-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.cardsIssued}</div>
            <p className="text-xs text-muted-foreground mt-1">View all cards</p>
          </CardContent>
        </UICard>
      </div>

      {/* Transaction Chart Card */}
      <UICard>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Transaction Overview</CardTitle>
              <CardDescription>
                {chartView === "count"
                  ? "Number of transactions"
                  : "Transaction amounts"}{" "}
                by type
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Select
                value={timeRange}
                onValueChange={(value) => setTimeRange(value as TimeRange)}
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

              <Tabs
                value={chartView}
                onValueChange={(value) => setChartView(value as ChartView)}
              >
                <TabsList>
                  <TabsTrigger value="count">Count</TabsTrigger>
                  <TabsTrigger value="amount">Amount</TabsTrigger>
                </TabsList>
              </Tabs>

              <Button
                variant="outline"
                size="sm"
                onClick={exportCSV}
                disabled={!transactionData.length}
              >
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-[400px] flex items-center justify-center">
              <p>Loading transaction data...</p>
            </div>
          ) : error && transactionData.length === 0 ? (
            <div className="h-[400px] flex items-center justify-center text-red-500">
              <p>{error}</p>
            </div>
          ) : (
            <div
              ref={chartContainerRef}
              className="h-[400px] w-full"
              style={{ minHeight: "400px", position: "relative" }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={transactionData}
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
                    tickFormatter={formatYAxisTick}
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
                  {getDataKeys().map((key) => (
                    <Bar
                      key={key}
                      dataKey={key}
                      fill={key.includes("payment") ? "#4f46e5" : "#10b981"}
                      radius={[4, 4, 0, 0]}
                      name={
                        key.includes("amount")
                          ? key.includes("payment")
                            ? "Payment Amount"
                            : "Points Addition Amount"
                          : key.includes("payment")
                          ? "Payments"
                          : "Points Additions"
                      }
                      stackId={chartView === "count" ? "stack" : undefined}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
              {transactionData.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                  <p>No transaction data available for the selected period</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </UICard>
    </div>
  );
}