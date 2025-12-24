import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart, ComposedChart, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { TrendingUp, TrendingDown, Users, DollarSign, Percent, Loader2, Target, Zap, AlertTriangle, CheckCircle, Activity } from 'lucide-react';
import { formatCurrency, formatPercent, formatNumber } from '@/lib/parseExcel';
import type { SheetData } from '@/lib/parseExcel';

interface ReportData {
  id: string;
  fileName: string;
  weekNumber: string;
  uploadDate: any;
  parsedData: SheetData[];
}

const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4'];

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
  const thirteenWeekAvg = currentData?.thirteenWeekAverage;
  const ytdData = currentData?.ytdData;

  // Calculate deep insights
  const calculateInsights = () => {
    if (!latestWeek) return null;

    const weeklyTrend = currentData?.weeklyData.slice(0, 13).reverse() || [];

    // Revenue growth rate
    const revenueGrowthRate = previousWeek
      ? ((latestWeek.totalSales - previousWeek.totalSales) / previousWeek.totalSales) * 100
      : 0;

    // YoY comparisons
    const yoyRevenueChange = latestWeek.revenueChangePriorYear;
    const yoyGPChange = latestWeek.gpChangePriorYear;
    const yoyAOAChange = latestWeek.aoaChangePriorYear;

    // Efficiency metrics
    const revenuePerFTE = latestWeek.fullTimeEquivalent > 0
      ? latestWeek.totalSales / latestWeek.fullTimeEquivalent
      : 0;
    const gpPerFTE = latestWeek.associateGPperFTE;

    // Performance vs benchmarks
    const vsAvgRevenue = thirteenWeekAvg
      ? ((latestWeek.totalSales - thirteenWeekAvg.totalSales) / thirteenWeekAvg.totalSales) * 100
      : 0;
    const vsAvgGP = thirteenWeekAvg
      ? (latestWeek.grossProfitPercent - thirteenWeekAvg.grossProfitPercent) * 100
      : 0;

    // Volatility (coefficient of variation for revenue)
    const avgRevenue = weeklyTrend.reduce((sum, w) => sum + w.totalSales, 0) / weeklyTrend.length;
    const variance = weeklyTrend.reduce((sum, w) => sum + Math.pow(w.totalSales - avgRevenue, 2), 0) / weeklyTrend.length;
    const stdDev = Math.sqrt(variance);
    const volatility = avgRevenue > 0 ? (stdDev / avgRevenue) * 100 : 0;

    return {
      revenueGrowthRate,
      yoyRevenueChange,
      yoyGPChange,
      yoyAOAChange,
      revenuePerFTE,
      gpPerFTE,
      vsAvgRevenue,
      vsAvgGP,
      volatility
    };
  };

  const insights = calculateInsights();

  // Prepare chart data
  const weeklyTrendData = currentData?.weeklyData.slice(0, 13).reverse().map(week => ({
    week: week.week.replace('Week ', 'W'),
    revenue: week.totalSales,
    grossProfit: week.grossProfit,
    aoa: week.associatesOnAssignment,
    gpPercent: week.grossProfitPercent * 100,
    profitPerHour: week.profitPerHour,
    billRate: week.billRatePerHour,
    payRate: week.avgHourlyPayRate,
    customers: week.customersBilled,
    revenuePerClient: week.revenuePerClient,
    hoursBilled: week.hoursBilled,
    avgRevenue: thirteenWeekAvg?.totalSales || 0,
    avgGP: thirteenWeekAvg?.grossProfit || 0
  })) || [];

  // Revenue mix data
  const revenueMixData = latestWeek ? [
    { name: 'Associate Billing', value: latestWeek.associateBilling, color: COLORS[0] },
    { name: 'Fee Revenue', value: latestWeek.feesRevenue, color: COLORS[1] },
    { name: 'Conversion Fees', value: latestWeek.conversionFees, color: COLORS[2] },
    { name: 'Permanent Placement', value: latestWeek.permanentPlacementFees, color: COLORS[3] },
    { name: 'QuickHire', value: latestWeek.quickHire, color: COLORS[4] }
  ].filter(item => item.value > 0) : [];

  // Performance radar data
  const performanceRadarData = latestWeek && thirteenWeekAvg ? [
    {
      metric: 'Revenue',
      current: (latestWeek.totalSales / thirteenWeekAvg.totalSales) * 100,
      ytd: ytdData ? (ytdData.totalSales / thirteenWeekAvg.totalSales) * 100 : 0
    },
    {
      metric: 'GP %',
      current: (latestWeek.grossProfitPercent / thirteenWeekAvg.grossProfitPercent) * 100,
      ytd: ytdData ? (ytdData.grossProfitPercent / thirteenWeekAvg.grossProfitPercent) * 100 : 0
    },
    {
      metric: 'AOA',
      current: (latestWeek.associatesOnAssignment / thirteenWeekAvg.associatesOnAssignment) * 100,
      ytd: ytdData ? (ytdData.associatesOnAssignment / thirteenWeekAvg.associatesOnAssignment) * 100 : 0
    },
    {
      metric: 'Customers',
      current: (latestWeek.customersBilled / thirteenWeekAvg.customersBilled) * 100,
      ytd: ytdData ? (ytdData.customersBilled / thirteenWeekAvg.customersBilled) * 100 : 0
    },
    {
      metric: 'Profit/Hr',
      current: (latestWeek.profitPerHour / thirteenWeekAvg.profitPerHour) * 100,
      ytd: ytdData ? (ytdData.profitPerHour / thirteenWeekAvg.profitPerHour) * 100 : 0
    }
  ] : [];

  // YoY Comparison data
  const yoyComparisonData = currentData?.weeklyData.slice(0, 13).reverse().map(week => ({
    week: week.week.replace('Week ', 'W'),
    currentYear: week.totalSales,
    revenueYoY: week.revenueChangePriorYear,
    gpYoY: week.gpChangePriorYear,
    aoaYoY: week.aoaChangePriorYear
  })) || [];

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Analytics Dashboard</h1>
        <p className="text-slate-600">Comprehensive 13 Week Report Analysis with Deep Insights</p>
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

      {latestWeek && insights && (
        <>
          {/* Executive Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Associates on Assignment"
              value={formatNumber(latestWeek.associatesOnAssignment)}
              change={previousWeek ? latestWeek.associatesOnAssignment - previousWeek.associatesOnAssignment : 0}
              yoyChange={insights.yoyAOAChange}
              icon={<Users className="w-5 h-5" />}
              color="blue"
            />
            <MetricCard
              title="Total Sales"
              value={formatCurrency(latestWeek.totalSales)}
              change={previousWeek ? ((latestWeek.totalSales - previousWeek.totalSales) / previousWeek.totalSales) * 100 : 0}
              yoyChange={insights.yoyRevenueChange}
              icon={<DollarSign className="w-5 h-5" />}
              color="green"
              isPercentChange
            />
            <MetricCard
              title="Gross Profit"
              value={formatCurrency(latestWeek.grossProfit)}
              change={previousWeek ? ((latestWeek.grossProfit - previousWeek.grossProfit) / previousWeek.grossProfit) * 100 : 0}
              yoyChange={insights.yoyGPChange}
              icon={<TrendingUp className="w-5 h-5" />}
              color="purple"
              isPercentChange
            />
            <MetricCard
              title="GP %"
              value={formatPercent(latestWeek.grossProfitPercent)}
              change={previousWeek ? (latestWeek.grossProfitPercent - previousWeek.grossProfitPercent) * 100 : 0}
              yoyChange={insights.yoyGPChange}
              icon={<Percent className="w-5 h-5" />}
              color="cyan"
              isPercentChange
            />
          </div>

          {/* Insights Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InsightCard
              title="Performance vs 13-Week Avg"
              metrics={[
                { label: 'Revenue', value: insights.vsAvgRevenue, isPercent: true },
                { label: 'GP %', value: insights.vsAvgGP, isPercent: true, suffix: ' pp' }
              ]}
              icon={<Target className="w-5 h-5" />}
              status={insights.vsAvgRevenue > 0 ? 'positive' : 'negative'}
            />
            <InsightCard
              title="Efficiency Metrics"
              metrics={[
                { label: 'Revenue per FTE', value: insights.revenuePerFTE, prefix: '$' },
                { label: 'GP per FTE', value: insights.gpPerFTE, prefix: '$' }
              ]}
              icon={<Zap className="w-5 h-5" />}
              status="neutral"
            />
            <InsightCard
              title="Revenue Stability"
              metrics={[
                { label: 'Volatility Index', value: insights.volatility, isPercent: true },
                { label: 'Growth Rate', value: insights.revenueGrowthRate, isPercent: true }
              ]}
              icon={<Activity className="w-5 h-5" />}
              status={insights.volatility < 10 ? 'positive' : insights.volatility < 20 ? 'neutral' : 'negative'}
            />
          </div>

          {/* Main Analytics Tabs */}
          <Tabs defaultValue="trends" className="space-y-4">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="trends">Trends</TabsTrigger>
              <TabsTrigger value="yoy">YoY Analysis</TabsTrigger>
              <TabsTrigger value="efficiency">Efficiency</TabsTrigger>
              <TabsTrigger value="revenue-mix">Revenue Mix</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
            </TabsList>

            {/* Trends Tab */}
            <TabsContent value="trends" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Revenue & Gross Profit Trend</CardTitle>
                    <CardDescription>13 Week rolling view with benchmark</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={350}>
                      <ComposedChart data={weeklyTrendData}>
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
                        <Line type="monotone" dataKey="avgRevenue" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" name="13-Week Avg Revenue" dot={false} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>GP % & Profit Per Hour</CardTitle>
                    <CardDescription>Profitability metrics over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={350}>
                      <ComposedChart data={weeklyTrendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="week" stroke="#64748b" />
                        <YAxis yAxisId="left" stroke="#8b5cf6" tickFormatter={(value) => `${value.toFixed(1)}%`} />
                        <YAxis yAxisId="right" orientation="right" stroke="#06b6d4" tickFormatter={(value) => `$${value.toFixed(0)}`} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                        />
                        <Legend />
                        <Line yAxisId="left" type="monotone" dataKey="gpPercent" stroke="#8b5cf6" strokeWidth={3} name="GP %" dot={{ fill: '#8b5cf6', r: 4 }} />
                        <Bar yAxisId="right" dataKey="profitPerHour" fill="#06b6d4" name="Profit/Hour" radius={[8, 8, 0, 0]} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Associates & Customers</CardTitle>
                    <CardDescription>Workforce and client base trends</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={350}>
                      <ComposedChart data={weeklyTrendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="week" stroke="#64748b" />
                        <YAxis yAxisId="left" stroke="#3b82f6" />
                        <YAxis yAxisId="right" orientation="right" stroke="#10b981" />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                        />
                        <Legend />
                        <Bar yAxisId="left" dataKey="aoa" fill="#3b82f6" name="Associates on Assignment" radius={[8, 8, 0, 0]} />
                        <Line yAxisId="right" type="monotone" dataKey="customers" stroke="#10b981" strokeWidth={3} name="Customers Billed" dot={{ fill: '#10b981', r: 4 }} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Bill Rate vs Pay Rate</CardTitle>
                    <CardDescription>Rate analysis and margin gap</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={350}>
                      <AreaChart data={weeklyTrendData}>
                        <defs>
                          <linearGradient id="colorBillRate" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorPayRate" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="week" stroke="#64748b" />
                        <YAxis stroke="#64748b" tickFormatter={(value) => `$${value.toFixed(0)}`} />
                        <Tooltip
                          formatter={(value: any) => formatCurrency(value)}
                          contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                        />
                        <Legend />
                        <Area type="monotone" dataKey="billRate" stroke="#10b981" fillOpacity={1} fill="url(#colorBillRate)" name="Bill Rate/Hour" strokeWidth={2} />
                        <Area type="monotone" dataKey="payRate" stroke="#ef4444" fillOpacity={1} fill="url(#colorPayRate)" name="Avg Pay Rate" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* YoY Analysis Tab */}
            <TabsContent value="yoy" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Year-over-Year Revenue Change</CardTitle>
                    <CardDescription>Percentage change vs prior year</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={350}>
                      <BarChart data={yoyComparisonData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="week" stroke="#64748b" />
                        <YAxis stroke="#64748b" tickFormatter={(value) => `${value.toFixed(0)}%`} />
                        <Tooltip
                          formatter={(value: any) => `${value.toFixed(2)}%`}
                          contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                        />
                        <Legend />
                        <Bar dataKey="revenueYoY" fill="#3b82f6" name="Revenue YoY %" radius={[8, 8, 0, 0]}>
                          {yoyComparisonData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.revenueYoY >= 0 ? '#10b981' : '#ef4444'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>YoY Metrics Comparison</CardTitle>
                    <CardDescription>GP % and AOA year-over-year changes</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={350}>
                      <LineChart data={yoyComparisonData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="week" stroke="#64748b" />
                        <YAxis stroke="#64748b" tickFormatter={(value) => `${value.toFixed(0)}%`} />
                        <Tooltip
                          formatter={(value: any) => `${value.toFixed(2)}%`}
                          contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                        />
                        <Legend />
                        <Line type="monotone" dataKey="gpYoY" stroke="#8b5cf6" strokeWidth={3} name="GP YoY %" dot={{ fill: '#8b5cf6', r: 4 }} />
                        <Line type="monotone" dataKey="aoaYoY" stroke="#06b6d4" strokeWidth={3} name="AOA YoY %" dot={{ fill: '#06b6d4', r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>YoY Performance Summary</CardTitle>
                    <CardDescription>Current week vs prior year comparison</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      <YoYMetric
                        label="Revenue"
                        change={insights.yoyRevenueChange}
                        current={latestWeek.totalSales}
                        format="currency"
                      />
                      <YoYMetric
                        label="Gross Profit"
                        change={insights.yoyGPChange}
                        current={latestWeek.grossProfit}
                        format="currency"
                      />
                      <YoYMetric
                        label="Associates"
                        change={insights.yoyAOAChange}
                        current={latestWeek.associatesOnAssignment}
                        format="number"
                      />
                      <YoYMetric
                        label="Customers"
                        change={latestWeek.customerChangePriorYear}
                        current={latestWeek.customersBilled}
                        format="number"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Efficiency Tab */}
            <TabsContent value="efficiency" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Revenue Per Client Trend</CardTitle>
                    <CardDescription>Client value analysis</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={350}>
                      <AreaChart data={weeklyTrendData}>
                        <defs>
                          <linearGradient id="colorRevenuePerClient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
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
                        <Area type="monotone" dataKey="revenuePerClient" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorRevenuePerClient)" name="Revenue/Client" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Hours Billed Trend</CardTitle>
                    <CardDescription>Total billable hours over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={350}>
                      <BarChart data={weeklyTrendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="week" stroke="#64748b" />
                        <YAxis stroke="#64748b" tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
                        <Tooltip
                          formatter={(value: any) => formatNumber(value)}
                          contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                        />
                        <Legend />
                        <Bar dataKey="hoursBilled" fill="#06b6d4" name="Hours Billed" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Efficiency Metrics Breakdown</CardTitle>
                    <CardDescription>Current week productivity analysis</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      <EfficiencyMetric
                        label="Revenue per FTE"
                        value={insights.revenuePerFTE}
                        benchmark={thirteenWeekAvg ? thirteenWeekAvg.totalSales / thirteenWeekAvg.fullTimeEquivalent : 0}
                        format="currency"
                      />
                      <EfficiencyMetric
                        label="GP per FTE"
                        value={latestWeek.associateGPperFTE}
                        benchmark={thirteenWeekAvg?.associateGPperFTE || 0}
                        format="currency"
                      />
                      <EfficiencyMetric
                        label="AOAs per FTE"
                        value={latestWeek.aoasPerFTE}
                        benchmark={thirteenWeekAvg?.aoasPerFTE || 0}
                        format="number"
                      />
                      <EfficiencyMetric
                        label="Hours per Associate"
                        value={latestWeek.hoursPerAssociate}
                        benchmark={thirteenWeekAvg?.hoursPerAssociate || 0}
                        format="number"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Revenue Mix Tab */}
            <TabsContent value="revenue-mix" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Revenue Composition</CardTitle>
                    <CardDescription>Breakdown of revenue sources</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={350}>
                      <PieChart>
                        <Pie
                          data={revenueMixData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(1)}%`}
                          outerRadius={120}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {revenueMixData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: any) => formatCurrency(value)} />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Revenue Mix Details</CardTitle>
                    <CardDescription>Current week revenue breakdown</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {revenueMixData.map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: item.color }}
                            />
                            <span className="text-sm font-medium text-slate-700">{item.name}</span>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-semibold text-slate-900">
                              {formatCurrency(item.value)}
                            </p>
                            <p className="text-xs text-slate-500">
                              {((item.value / latestWeek.totalSales) * 100).toFixed(1)}% of total
                            </p>
                          </div>
                        </div>
                      ))}
                      <div className="pt-4 border-t border-slate-200">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-slate-900">Total Revenue</span>
                          <span className="text-lg font-bold text-slate-900">
                            {formatCurrency(latestWeek.totalSales)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Fee Revenue Analysis</CardTitle>
                    <CardDescription>Additional revenue streams beyond associate billing</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      <DetailMetric label="Conversion Fees" value={formatCurrency(latestWeek.conversionFees)} />
                      <DetailMetric label="Permanent Placement Fees" value={formatCurrency(latestWeek.permanentPlacementFees)} />
                      <DetailMetric label="QuickHire Revenue" value={formatCurrency(latestWeek.quickHire)} />
                      <DetailMetric label="Total Fee Revenue" value={formatCurrency(latestWeek.feesRevenue)} />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Performance Tab */}
            <TabsContent value="performance" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Performance Radar</CardTitle>
                    <CardDescription>vs 13-week average (100% = average)</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={350}>
                      <RadarChart data={performanceRadarData}>
                        <PolarGrid stroke="#e2e8f0" />
                        <PolarAngleAxis dataKey="metric" stroke="#64748b" />
                        <PolarRadiusAxis angle={90} domain={[0, 150]} stroke="#64748b" />
                        <Radar name="Current Week" dataKey="current" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.5} strokeWidth={2} />
                        {ytdData && <Radar name="YTD" dataKey="ytd" stroke="#10b981" fill="#10b981" fillOpacity={0.3} strokeWidth={2} />}
                        <Legend />
                        <Tooltip />
                      </RadarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Performance Scorecard</CardTitle>
                    <CardDescription>Key metrics vs benchmarks</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <ScoreItem
                        label="Revenue vs Avg"
                        value={insights.vsAvgRevenue}
                        threshold={5}
                      />
                      <ScoreItem
                        label="GP % vs Avg"
                        value={insights.vsAvgGP}
                        threshold={0}
                        suffix=" pp"
                      />
                      <ScoreItem
                        label="Revenue Growth WoW"
                        value={insights.revenueGrowthRate}
                        threshold={0}
                      />
                      <ScoreItem
                        label="Revenue Stability"
                        value={-insights.volatility}
                        threshold={-15}
                        invert
                      />
                    </div>
                  </CardContent>
                </Card>

                {ytdData && (
                  <Card className="lg:col-span-2">
                    <CardHeader>
                      <CardTitle>YTD Performance Summary</CardTitle>
                      <CardDescription>Year-to-date metrics</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <DetailMetric label="YTD Revenue" value={formatCurrency(ytdData.totalSales)} />
                        <DetailMetric label="YTD Gross Profit" value={formatCurrency(ytdData.grossProfit)} />
                        <DetailMetric label="YTD GP %" value={formatPercent(ytdData.grossProfitPercent)} />
                        <DetailMetric label="YTD Avg AOA" value={formatNumber(ytdData.associatesOnAssignment)} />
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Details Tab */}
            <TabsContent value="details" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Current Week Comprehensive Metrics</CardTitle>
                  <CardDescription>{latestWeek.week} - {latestWeek.fiscalYear}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    <DetailMetric label="Associates on Assignment" value={formatNumber(latestWeek.associatesOnAssignment)} />
                    <DetailMetric label="Customers Billed" value={formatNumber(latestWeek.customersBilled)} />
                    <DetailMetric label="Total Sales" value={formatCurrency(latestWeek.totalSales)} />
                    <DetailMetric label="Gross Profit" value={formatCurrency(latestWeek.grossProfit)} />
                    <DetailMetric label="GP %" value={formatPercent(latestWeek.grossProfitPercent)} />
                    <DetailMetric label="Markup %" value={formatPercent(latestWeek.markupPercent)} />
                    <DetailMetric label="Avg Pay Rate" value={formatCurrency(latestWeek.avgHourlyPayRate)} />
                    <DetailMetric label="Bill Rate/Hour" value={formatCurrency(latestWeek.billRatePerHour)} />
                    <DetailMetric label="Profit/Hour" value={formatCurrency(latestWeek.profitPerHour)} />
                    <DetailMetric label="Hours/Associate" value={formatNumber(latestWeek.hoursPerAssociate)} />
                    <DetailMetric label="Hours Billed" value={formatNumber(latestWeek.hoursBilled)} />
                    <DetailMetric label="Revenue/Client" value={formatCurrency(latestWeek.revenuePerClient)} />
                    <DetailMetric label="Associate Wages" value={formatCurrency(latestWeek.associateWages)} />
                    <DetailMetric label="Associate Billing" value={formatCurrency(latestWeek.associateBilling)} />
                    <DetailMetric label="Associate GP" value={formatCurrency(latestWeek.associateGrossProfit)} />
                    <DetailMetric label="Associate GP %" value={formatPercent(latestWeek.associateGrossProfitPercent)} />
                    <DetailMetric label="Fee Revenue" value={formatCurrency(latestWeek.feesRevenue)} />
                    <DetailMetric label="Full-Time Equivalent" value={formatNumber(latestWeek.fullTimeEquivalent)} />
                    <DetailMetric label="Staff Excluding BDM" value={formatNumber(latestWeek.staffExcludingBDM)} />
                    <DetailMetric label="Associate GP per FTE" value={formatCurrency(latestWeek.associateGPperFTE)} />
                    <DetailMetric label="AOAs per FTE" value={formatNumber(latestWeek.aoasPerFTE)} />
                    <DetailMetric label="Conversion Fees" value={formatCurrency(latestWeek.conversionFees)} />
                    <DetailMetric label="Permanent Placement Fees" value={formatCurrency(latestWeek.permanentPlacementFees)} />
                    <DetailMetric label="QuickHire" value={formatCurrency(latestWeek.quickHire)} />
                  </div>
                </CardContent>
              </Card>

              {thirteenWeekAvg && (
                <Card>
                  <CardHeader>
                    <CardTitle>13-Week Average Comparison</CardTitle>
                    <CardDescription>Current week performance vs rolling average</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                      <ComparisonMetric
                        label="Revenue"
                        current={latestWeek.totalSales}
                        benchmark={thirteenWeekAvg.totalSales}
                        format="currency"
                      />
                      <ComparisonMetric
                        label="Gross Profit"
                        current={latestWeek.grossProfit}
                        benchmark={thirteenWeekAvg.grossProfit}
                        format="currency"
                      />
                      <ComparisonMetric
                        label="GP %"
                        current={latestWeek.grossProfitPercent * 100}
                        benchmark={thirteenWeekAvg.grossProfitPercent * 100}
                        format="percent"
                      />
                      <ComparisonMetric
                        label="Associates"
                        current={latestWeek.associatesOnAssignment}
                        benchmark={thirteenWeekAvg.associatesOnAssignment}
                        format="number"
                      />
                      <ComparisonMetric
                        label="Customers"
                        current={latestWeek.customersBilled}
                        benchmark={thirteenWeekAvg.customersBilled}
                        format="number"
                      />
                      <ComparisonMetric
                        label="Profit/Hour"
                        current={latestWeek.profitPerHour}
                        benchmark={thirteenWeekAvg.profitPerHour}
                        format="currency"
                      />
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string;
  change: number;
  yoyChange: number;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'purple' | 'cyan';
  isPercentChange?: boolean;
}

function MetricCard({ title, value, change, yoyChange, icon, color, isPercentChange }: MetricCardProps) {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    cyan: 'bg-cyan-500'
  };

  const isPositive = change > 0;
  const isYoYPositive = yoyChange > 0;
  const changeText = isPercentChange
    ? `${isPositive ? '+' : ''}${change.toFixed(2)}%`
    : `${isPositive ? '+' : ''}${change}`;
  const yoyText = `${isYoYPositive ? '+' : ''}${yoyChange.toFixed(1)}%`;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-2 rounded-lg ${colorClasses[color]} bg-opacity-10`}>
            <div className={`text-${color}-600`}>{icon}</div>
          </div>
          <div className="text-right">
            <div className={`flex items-center text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
              <span>{changeText}</span>
            </div>
            <div className="text-xs text-slate-500 mt-1">
              YoY: {yoyText}
            </div>
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

interface InsightCardProps {
  title: string;
  metrics: Array<{
    label: string;
    value: number;
    prefix?: string;
    suffix?: string;
    isPercent?: boolean;
  }>;
  icon: React.ReactNode;
  status: 'positive' | 'negative' | 'neutral';
}

function InsightCard({ title, metrics, icon, status }: InsightCardProps) {
  const statusColors = {
    positive: 'text-green-600 bg-green-50',
    negative: 'text-red-600 bg-red-50',
    neutral: 'text-blue-600 bg-blue-50'
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-2 rounded-lg ${statusColors[status]}`}>
            {icon}
          </div>
          <h3 className="font-semibold text-slate-900">{title}</h3>
        </div>
        <div className="space-y-3">
          {metrics.map((metric, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-sm text-slate-600">{metric.label}</span>
              <span className="text-lg font-bold text-slate-900">
                {metric.prefix || ''}
                {metric.isPercent
                  ? `${metric.value.toFixed(2)}%`
                  : formatNumber(metric.value)
                }
                {metric.suffix || ''}
              </span>
            </div>
          ))}
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

function YoYMetric({ label, change, current, format }: {
  label: string;
  change: number;
  current: number;
  format: 'currency' | 'number' | 'percent';
}) {
  const isPositive = change > 0;
  const formattedCurrent = format === 'currency'
    ? formatCurrency(current)
    : format === 'percent'
    ? formatPercent(current)
    : formatNumber(current);

  return (
    <div>
      <p className="text-xs text-slate-500 mb-1">{label}</p>
      <p className="text-lg font-semibold text-slate-900 mb-1">{formattedCurrent}</p>
      <div className={`flex items-center text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
        <span className="font-medium">{change.toFixed(1)}% YoY</span>
      </div>
    </div>
  );
}

function EfficiencyMetric({ label, value, benchmark, format }: {
  label: string;
  value: number;
  benchmark: number;
  format: 'currency' | 'number';
}) {
  const percentDiff = benchmark > 0 ? ((value - benchmark) / benchmark) * 100 : 0;
  const isAboveBenchmark = percentDiff > 0;
  const formattedValue = format === 'currency' ? formatCurrency(value) : formatNumber(value);
  const formattedBenchmark = format === 'currency' ? formatCurrency(benchmark) : formatNumber(benchmark);

  return (
    <div>
      <p className="text-xs text-slate-500 mb-1">{label}</p>
      <p className="text-lg font-semibold text-slate-900 mb-1">{formattedValue}</p>
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-500">Avg: {formattedBenchmark}</span>
        <span className={`text-xs font-medium ${isAboveBenchmark ? 'text-green-600' : 'text-red-600'}`}>
          ({isAboveBenchmark ? '+' : ''}{percentDiff.toFixed(1)}%)
        </span>
      </div>
    </div>
  );
}

function ComparisonMetric({ label, current, benchmark, format }: {
  label: string;
  current: number;
  benchmark: number;
  format: 'currency' | 'number' | 'percent';
}) {
  const diff = current - benchmark;
  const percentDiff = benchmark > 0 ? (diff / benchmark) * 100 : 0;
  const isPositive = diff > 0;

  const formattedCurrent = format === 'currency'
    ? formatCurrency(current)
    : format === 'percent'
    ? `${current.toFixed(2)}%`
    : formatNumber(current);

  const formattedBenchmark = format === 'currency'
    ? formatCurrency(benchmark)
    : format === 'percent'
    ? `${benchmark.toFixed(2)}%`
    : formatNumber(benchmark);

  return (
    <div>
      <p className="text-xs text-slate-500 mb-1">{label}</p>
      <div className="flex items-baseline gap-2 mb-1">
        <p className="text-lg font-semibold text-slate-900">{formattedCurrent}</p>
        <span className={`text-xs font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {isPositive ? '▲' : '▼'} {Math.abs(percentDiff).toFixed(1)}%
        </span>
      </div>
      <p className="text-xs text-slate-500">Avg: {formattedBenchmark}</p>
    </div>
  );
}

function ScoreItem({ label, value, threshold, invert = false, suffix = '%' }: {
  label: string;
  value: number;
  threshold: number;
  invert?: boolean;
  suffix?: string;
}) {
  const effectiveValue = invert ? -value : value;
  const status = effectiveValue >= threshold ? 'positive' : 'negative';
  const Icon = status === 'positive' ? CheckCircle : AlertTriangle;
  const color = status === 'positive' ? 'text-green-600' : 'text-red-600';

  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
      <div className="flex items-center gap-2">
        <Icon className={`w-4 h-4 ${color}`} />
        <span className="text-sm font-medium text-slate-700">{label}</span>
      </div>
      <span className={`text-sm font-bold ${color}`}>
        {invert ? -value.toFixed(1) : value.toFixed(1)}{suffix}
      </span>
    </div>
  );
}
