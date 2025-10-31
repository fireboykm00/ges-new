import { useEffect, useState } from "react";
import { reportAPI } from "../services/api";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import type { MonthlyReport } from "../types";

export default function Dashboard() {
  const [report, setReport] = useState<MonthlyReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current month in YYYY-MM format
      const currentDate = new Date();
      const currentMonth = `${currentDate.getFullYear()}-${String(
        currentDate.getMonth() + 1
      ).padStart(2, "0")}`;

      const response = await reportAPI.getMonthly(currentMonth);
      setReport(response.data);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to fetch report"
      );
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-6 w-24 bg-gray-200 animate-pulse rounded" />
              <div className="h-4 w-16 bg-gray-200 animate-pulse rounded mt-2" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-20 bg-gray-200 animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <p className="text-red-500">{error}</p>
        <Button onClick={fetchReport}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Purchases</CardTitle>
            <CardDescription>This month</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              ${report?.purchases ? report.purchases.toFixed(2) : "0.00"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Expenses</CardTitle>
            <CardDescription>This month</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              ${report?.expenses ? report.expenses.toFixed(2) : "0.00"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Low Stock Items</CardTitle>
            <CardDescription>Reorder needed</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{report?.lowStock || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Usage Records</CardTitle>
            <CardDescription>This month</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{report?.usageCount || 0}</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center mt-8">
        <Button onClick={() => window.location.reload()}>Refresh Data</Button>
      </div>
    </div>
  );
}
