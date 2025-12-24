import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrendingUp, TrendingDown, Users, DollarSign, Percent, Loader2 } from 'lucide-react';
import { formatCurrency, formatPercent, formatNumber } from '@/lib/parseExcel';
import type { SheetData } from '@/lib/parseExcel';

interface ReportData {
  id: string;
  fileName: string;
  weekNumber: string;
  uploadDate: any;
  parsedData: SheetData[];
}

export default function DashboardPage() {
  const { permissions } = useAuth();
  const [reports, setReports] = useState<ReportData[]>([]);
  const [selectedReport, setSelectedReport] = useState<string>('');
  const [selectedSheet, setSelectedSheet] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [currentData, setCurrentData] = useState<SheetData | null>(null);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const q = query(
        collection(db, 'reports'),
        orderBy('uploadDate', 'desc'),
        limit(20)
      );
      
      const snapshot = await getDocs(q);
      const reportsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ReportData[];
      
      setReports(reportsData);
      
      if (reportsData.length > 0) {
        setSelectedReport(reportsData[0].id);
      }
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedReport && reports.length > 0) {
      const report = reports.find(r => r.id === selectedReport);
      if (report && report.parsedData) {
        // Filter sheets based on user permissions
        const allowedSheets = report.parsedData.filter(sheet => 
          permissions?.role === 'admin' || 
          permissions?.allowedSheets.includes(sheet.sheetName)
        );
        
        if (allowedSheets.length > 0 && !selectedSheet) {
          setSelectedSheet(allowedSheets[0].sheetName);
          setCurrentData(allowedSheets[0]);
        }
      }
    }
  }, [selectedReport, reports, permissions]);

  useEffect(() => {
    if (selectedReport && selectedSheet) {
      const report = reports.find(r => r.id === selectedReport);
      if (report) {
        const sheet = report.parsedData.find(s => s.sheetName === selectedSheet);
        if (sheet) {
          setCurrentData(sheet);
        }
      }
    }
  }, [selectedSheet, selectedReport, reports]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-slate-600 mb-4">No reports uploaded yet</p>
            <p className="text-sm text-slate-500">Contact an administrator to upload weekly reports</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const selectedReportData = reports.find(r => r.id === selectedReport);
  const availableSheets = selectedReportData?.parsedData.filter(sheet =>
    permissions?.role === 'admin' || permissions?.allowedSheets.includes(sheet.sheetName)
  ) || [];

  const latestWeek = currentData?.weeklyData[0];
  const previousWeek = currentData?.weeklyData[1];

  // Prepare chart data
  const weeklyTrendData = currentData?.weeklyData.slice(0, 13).reverse().map(week => ({
    week: week.week.replace('Week ', 'W'),
    revenue: week.totalSales,
    grossProfit: week.grossProfit,
    aoa: week.associatesOnAssignment,
    gpPercent: week.grossProfitPercent * 100
  })) || [];

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Analytics Dashboard</h1>
        <p className="text-slate-600">13 Week Report Analysis</p>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <Select value={selectedReport} onValueChange={setSelectedReport}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Select report" />
          </SelectTrigger>
          <SelectContent>
            {reports.map(report => (
              <SelectItem key={report.id} value={report.id}>
                Week {report.weekNumber} - {report.fileName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedSheet} onValueChange={setSelectedSheet}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Select cost center" />
          </SelectTrigger>
          <SelectContent>
            {availableSheets.map(sheet => (
              <SelectItem key={sheet.sheetName} value={sheet.sheetName}>
                {sheet.sheetName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {latestWeek && (
        <>
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Associates on Assignment"
              value={formatNumber(latestWeek.associatesOnAssignment)}
              change={previousWeek ? latestWeek.associatesOnAssignment - previousWeek.associatesOnAssignment : 0}
              icon={<Users className="w-5 h-5" />}
              color="blue"
            />
            <MetricCard
              title="Total Sales"
              value={formatCurrency(latestWeek.totalSales)}
              change={previousWeek ? ((latestWeek.totalSales - previousWeek.totalSales) / previousWeek.totalSales) * 100 : 0}
              icon={<DollarSign className="w-5 h-5" />}
              color="green"
              isPercentChange
            />
            <MetricCard
              title="Gross Profit"
              value={formatCurrency(latestWeek.grossProfit)}
              change={previousWeek ? ((latestWeek.grossProfit - previousWeek.grossProfit) / previousWeek.grossProfit) * 100 : 0}
              icon={<TrendingUp className="w-5 h-5" />}
              color="purple"
              isPercentChange
            />
            <MetricCard
              title="GP %"
              value={formatPercent(latestWeek.grossProfitPercent)}
              change={previousWeek ? (latestWeek.grossProfitPercent - previousWeek.grossProfitPercent) * 100 : 0}
              icon={<Percent className="w-5 h-5" />}
              color="cyan"
              isPercentChange
            />
          </div>

          {/* Charts */}
          <Tabs defaultValue="revenue" className="space-y-4">
            <TabsList>
              <TabsTrigger value="revenue">Revenue & GP</TabsTrigger>
              <TabsTrigger value="aoa">Associates</TabsTrigger>
              <TabsTrigger value="rates">Rates & Margins</TabsTrigger>
            </TabsList>

            <TabsContent value="revenue" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue & Gross Profit Trend</CardTitle>
                  <CardDescription>13 Week rolling view</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <AreaChart data={weeklyTrendData}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorGP" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="week" stroke="#64748b" />
                      <YAxis stroke="#64748b" tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                      <Tooltip 
                        formatter={(value: any) => formatCurrency(value)}
                        contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                      />
                      <Legend />
                      <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRevenue)" name="Revenue" strokeWidth={2} />
                      <Area type="monotone" dataKey="grossProfit" stroke="#10b981" fillOpacity={1} fill="url(#colorGP)" name="Gross Profit" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="aoa" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Associates on Assignment</CardTitle>
                  <CardDescription>13 Week trend</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={weeklyTrendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="week" stroke="#64748b" />
                      <YAxis stroke="#64748b" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                      />
                      <Legend />
                      <Bar dataKey="aoa" fill="#3b82f6" name="Associates on Assignment" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="rates" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>GP % Trend</CardTitle>
                  <CardDescription>Gross profit percentage over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <LineChart data={weeklyTrendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="week" stroke="#64748b" />
                      <YAxis stroke="#64748b" tickFormatter={(value) => `${value.toFixed(1)}%`} />
                      <Tooltip 
                        formatter={(value: any) => `${value.toFixed(2)}%`}
                        contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="gpPercent" stroke="#8b5cf6" strokeWidth={3} name="GP %" dot={{ fill: '#8b5cf6', r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Detailed Metrics Table */}
          <Card>
            <CardHeader>
              <CardTitle>Current Week Details</CardTitle>
              <CardDescription>{latestWeek.week} - {latestWeek.fiscalYear}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <DetailMetric label="Customers Billed" value={formatNumber(latestWeek.customersBilled)} />
                <DetailMetric label="Markup %" value={formatPercent(latestWeek.markupPercent)} />
                <DetailMetric label="Avg Pay Rate" value={formatCurrency(latestWeek.avgHourlyPayRate)} />
                <DetailMetric label="Bill Rate/Hour" value={formatCurrency(latestWeek.billRatePerHour)} />
                <DetailMetric label="Profit/Hour" value={formatCurrency(latestWeek.profitPerHour)} />
                <DetailMetric label="Hours/Associate" value={formatNumber(latestWeek.hoursPerAssociate)} />
                <DetailMetric label="Hours Billed" value={formatNumber(latestWeek.hoursBilled)} />
                <DetailMetric label="Revenue/Client" value={formatCurrency(latestWeek.revenuePerClient)} />
                <DetailMetric label="Associate Wages" value={formatCurrency(latestWeek.associateWages)} />
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string;
  change: number;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'purple' | 'cyan';
  isPercentChange?: boolean;
}

function MetricCard({ title, value, change, icon, color, isPercentChange }: MetricCardProps) {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    cyan: 'bg-cyan-500'
  };

  const isPositive = change > 0;
  const changeText = isPercentChange 
    ? `${isPositive ? '+' : ''}${change.toFixed(2)}%`
    : `${isPositive ? '+' : ''}${change}`;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-2 rounded-lg ${colorClasses[color]} bg-opacity-10`}>
            <div className={`text-${color}-600`}>{icon}</div>
          </div>
          <div className={`flex items-center text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
            <span className="font-medium">{changeText}</span>
          </div>
        </div>
        <div>
          <p className="text-sm text-slate-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function DetailMetric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-slate-500 mb-1">{label}</p>
      <p className="text-lg font-semibold text-slate-900">{value}</p>
    </div>
  );
}
