import { useEffect, useState } from 'react';
import { reportAPI } from '../services/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { toast } from 'sonner';
import type { MonthlyReport } from '../types';

export default function Reports() {
  const [report, setReport] = useState<MonthlyReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [month, setMonth] = useState('');

  useEffect(() => {
    // Set default month to current month
    const currentDate = new Date();
    const defaultMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
    setMonth(defaultMonth);
  }, []);

  const fetchReport = async () => {
    if (!month) {
      toast.error('Please select a month');
      return;
    }
    
    setLoading(true);
    try {
      const response = await reportAPI.getMonthly(month);
      setReport(response.data);
    } catch (error) {
      toast.error('Failed to fetch report');
      console.error('Error fetching report:', error);
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMonth(e.target.value);
  };

  const handleGenerateReport = () => {
    fetchReport();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Monthly Reports</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Generate Report</CardTitle>
          <CardDescription>Select a month to generate the report</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="month" className="block text-sm font-medium mb-1">
                Month
              </label>
              <Input
                id="month"
                type="month"
                value={month}
                onChange={handleMonthChange}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleGenerateReport} disabled={loading}>
                {loading ? 'Generating...' : 'Generate Report'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {report && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Total Purchases</CardTitle>
              <CardDescription>{report.month}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                ${report.purchases.toFixed(2)}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Total Expenses</CardTitle>
              <CardDescription>{report.month}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                ${report.expenses.toFixed(2)}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Low Stock Items</CardTitle>
              <CardDescription>Current count</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{report.lowStock}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Usage Records</CardTitle>
              <CardDescription>{report.month}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{report.usageCount}</p>
            </CardContent>
          </Card>
        </div>
      )}
      
      {!report && !loading && (
        <div className="text-center py-10 text-gray-500">
          Select a month and click "Generate Report" to view the monthly summary.
        </div>
      )}
    </div>
  );
}