import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Send, TrendingUp, AlertTriangle, Info, Loader2, Brain } from 'lucide-react';
import { formatCurrency, formatPercent, formatNumber } from '@/lib/parseExcel';
import type { SheetData } from '@/lib/parseExcel';
import { generateAIInsight } from '@/lib/openai';

interface ReportData {
  id: string;
  fileName: string;
  weekNumber: string;
  uploadDate: any;
  parsedData: SheetData[];
}

interface Insight {
  type: 'positive' | 'negative' | 'neutral';
  title: string;
  description: string;
  metric?: string;
  value?: string;
}

export default function InsightsPage() {
  const { permissions } = useAuth();
  const [reports, setReports] = useState<ReportData[]>([]);
  const [selectedReport, setSelectedReport] = useState<string>('');
  const [selectedSheet, setSelectedSheet] = useState<string>('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [autoInsights, setAutoInsights] = useState<Insight[]>([]);
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
    }
  };

  useEffect(() => {
    if (selectedReport && selectedSheet) {
      const report = reports.find(r => r.id === selectedReport);
      if (report) {
        const sheet = report.parsedData.find(s => s.sheetName === selectedSheet);
        if (sheet) {
          setCurrentData(sheet);
          generateAutoInsights(sheet);
        }
      }
    }
  }, [selectedSheet, selectedReport, reports]);

  const generateAutoInsights = (sheet: SheetData) => {
    const insights: Insight[] = [];
    const latestWeek = sheet.weeklyData[0];
    const previousWeek = sheet.weeklyData[1];

    if (!latestWeek || !previousWeek) {
      setAutoInsights([]);
      return;
    }

    // Revenue trend
    const revChange = ((latestWeek.totalSales - previousWeek.totalSales) / previousWeek.totalSales) * 100;
    if (Math.abs(revChange) > 5) {
      insights.push({
        type: revChange > 0 ? 'positive' : 'negative',
        title: revChange > 0 ? 'Revenue Growth' : 'Revenue Decline',
        description: `Total sales ${revChange > 0 ? 'increased' : 'decreased'} by ${Math.abs(revChange).toFixed(1)}% week over week`,
        metric: 'Revenue',
        value: formatCurrency(latestWeek.totalSales)
      });
    }

    // GP% movement
    const gpChange = (latestWeek.grossProfitPercent - previousWeek.grossProfitPercent) * 100;
    if (Math.abs(gpChange) > 0.5) {
      insights.push({
        type: gpChange > 0 ? 'positive' : 'negative',
        title: 'Margin Movement',
        description: `Gross profit margin ${gpChange > 0 ? 'improved' : 'declined'} by ${Math.abs(gpChange).toFixed(2)} percentage points`,
        metric: 'GP%',
        value: formatPercent(latestWeek.grossProfitPercent)
      });
    }

    // AOA changes
    const aoaChange = latestWeek.associatesOnAssignment - previousWeek.associatesOnAssignment;
    if (Math.abs(aoaChange) > 20) {
      insights.push({
        type: aoaChange > 0 ? 'positive' : 'negative',
        title: 'Staffing Changes',
        description: `Associates on assignment ${aoaChange > 0 ? 'increased' : 'decreased'} by ${Math.abs(aoaChange)} positions`,
        metric: 'AOA',
        value: formatNumber(latestWeek.associatesOnAssignment)
      });
    }

    // Efficiency check
    const revenuePerAOA = latestWeek.totalSales / latestWeek.associatesOnAssignment;
    const prevRevenuePerAOA = previousWeek.totalSales / previousWeek.associatesOnAssignment;
    const efficiencyChange = ((revenuePerAOA - prevRevenuePerAOA) / prevRevenuePerAOA) * 100;
    
    if (Math.abs(efficiencyChange) > 5) {
      insights.push({
        type: efficiencyChange > 0 ? 'positive' : 'neutral',
        title: 'Productivity Shift',
        description: `Revenue per associate ${efficiencyChange > 0 ? 'improved' : 'declined'} by ${Math.abs(efficiencyChange).toFixed(1)}%`,
        metric: 'Rev/AOA',
        value: formatCurrency(revenuePerAOA)
      });
    }

    setAutoInsights(insights);
  };

  const handleAskQuestion = async () => {
    if (!question.trim() || !currentData) return;

    setLoading(true);
    setAnswer('');

    try {
      const latestWeek = currentData.weeklyData[0];
      const previousWeek = currentData.weeklyData[1];
      const thirteenWeekAvg = currentData.thirteenWeekAverage;

      // Prepare context for AI
      const context = `
You are analyzing staffing and financial data for ${currentData.sheetName}.

Latest Week Data (${latestWeek.week}):
- Associates on Assignment: ${latestWeek.associatesOnAssignment}
- Total Sales: ${formatCurrency(latestWeek.totalSales)}
- Gross Profit: ${formatCurrency(latestWeek.grossProfit)} (${formatPercent(latestWeek.grossProfitPercent)})
- Customers Billed: ${latestWeek.customersBilled}
- Bill Rate: ${formatCurrency(latestWeek.billRatePerHour)}/hour
- Pay Rate: ${formatCurrency(latestWeek.avgHourlyPayRate)}/hour
- Markup: ${formatPercent(latestWeek.markupPercent)}
- Hours Billed: ${formatNumber(latestWeek.hoursBilled)}

Week over Week Changes:
- AOA Change: ${latestWeek.associatesOnAssignment - previousWeek.associatesOnAssignment}
- Revenue Change: ${formatCurrency(latestWeek.totalSales - previousWeek.totalSales)}
- GP Change: ${formatCurrency(latestWeek.grossProfit - previousWeek.grossProfit)}

13 Week Average (if available):
${thirteenWeekAvg ? `
- AOA: ${thirteenWeekAvg.associatesOnAssignment}
- Revenue: ${formatCurrency(thirteenWeekAvg.totalSales)}
- GP%: ${formatPercent(thirteenWeekAvg.grossProfitPercent)}
` : 'Not available'}
`;

      // Call OpenAI API
      const aiResponse = await generateAIInsight(context, question);
      setAnswer(aiResponse);
    } catch (error) {
      console.error('Error getting AI response:', error);
      setAnswer('Sorry, I encountered an error processing your question. Please check your OpenAI API key configuration and try again.');
    } finally {
      setLoading(false);
    }
  };

  const selectedReportData = reports.find(r => r.id === selectedReport);
  const availableSheets = selectedReportData?.parsedData.filter(sheet =>
    permissions?.role === 'admin' || permissions?.allowedSheets.includes(sheet.sheetName)
  ) || [];

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center">
          <Brain className="w-8 h-8 mr-3 text-purple-600" />
          AI Insights
        </h1>
        <p className="text-slate-600">Ask questions and get intelligent analysis of your data</p>
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
                Week {report.weekNumber}
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

      {currentData && (
        <>
          {/* Auto-generated Insights */}
          {autoInsights.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Sparkles className="w-5 h-5 mr-2 text-purple-600" />
                  Automatic Insights
                </CardTitle>
                <CardDescription>
                  Key trends and changes detected in the data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {autoInsights.map((insight, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border-l-4 ${
                        insight.type === 'positive' 
                          ? 'bg-green-50 border-green-500' 
                          : insight.type === 'negative'
                          ? 'bg-red-50 border-red-500'
                          : 'bg-blue-50 border-blue-500'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-slate-900">{insight.title}</h3>
                        {insight.type === 'positive' ? (
                          <TrendingUp className="w-5 h-5 text-green-600" />
                        ) : insight.type === 'negative' ? (
                          <AlertTriangle className="w-5 h-5 text-red-600" />
                        ) : (
                          <Info className="w-5 h-5 text-blue-600" />
                        )}
                      </div>
                      <p className="text-sm text-slate-700 mb-3">{insight.description}</p>
                      {insight.metric && insight.value && (
                        <div className="flex items-center justify-between text-xs">
                          <Badge variant="outline">{insight.metric}</Badge>
                          <span className="font-semibold text-slate-900">{insight.value}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Ask AI */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Brain className="w-5 h-5 mr-2 text-purple-600" />
                Ask AI Assistant
              </CardTitle>
              <CardDescription>
                Ask questions about trends, comparisons, or get recommendations (Powered by OpenAI GPT-4o)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Textarea
                  placeholder="e.g., Why did gross profit percentage drop this week? What's driving the AOA changes? How does this compare to the 13-week average?"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="min-h-24"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleAskQuestion();
                    }
                  }}
                />
                <Button
                  onClick={handleAskQuestion}
                  disabled={!question.trim() || loading}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  {loading ? (
                    <span className="flex items-center">
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <Send className="w-4 h-4 mr-2" />
                      Ask Question
                    </span>
                  )}
                </Button>
              </div>

              {answer && (
                <Alert className="bg-purple-50 border-purple-200">
                  <Brain className="h-4 w-4 text-purple-600" />
                  <AlertDescription className="text-slate-900 whitespace-pre-wrap mt-2">
                    {answer}
                  </AlertDescription>
                </Alert>
              )}

              {/* Suggested Questions */}
              <div className="pt-4 border-t">
                <p className="text-sm font-medium text-slate-700 mb-2">Suggested questions:</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    'What are the main drivers of this week\'s performance?',
                    'How does this week compare to the 13-week average?',
                    'What should I focus on to improve margins?',
                    'Identify any concerning trends in the data'
                  ].map((suggestion, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => setQuestion(suggestion)}
                      className="text-xs"
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {!selectedSheet && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Brain className="w-16 h-16 text-slate-300 mb-4" />
            <p className="text-slate-600">Select a report and cost center to view insights</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
