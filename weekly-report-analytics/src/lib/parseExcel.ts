import * as XLSX from 'xlsx';

export interface WeekData {
  fiscalYear: string;
  periodType: string;
  week: string;
  status: string;
  aoaChangePriorWeek: number;
  aoaChangePriorYear: number;
  customerChangePriorWeek: number;
  customerChangePriorYear: number;
  revenueChangePriorWeek: number;
  revenueChangePriorYear: number;
  gpChangePriorWeek: number;
  gpChangePriorYear: number;
  associatesOnAssignment: number;
  customersBilled: number;
  markupPercent: number;
  avgHourlyPayRate: number;
  billRatePerHour: number;
  profitPerHour: number;
  hoursPerAssociate: number;
  associateBilling: number;
  associateGrossProfit: number;
  associateGrossProfitPercent: number;
  feesRevenue: number;
  totalSales: number;
  grossProfit: number;
  grossProfitPercent: number;
  fullTimeEquivalent: number;
  staffExcludingBDM: number;
  associateGPperFTE: number;
  aoasPerFTE: number;
  hoursBilled: number;
  revenuePerClient: number;
  associateWages: number;
  conversionFees: number;
  permanentPlacementFees: number;
  quickHire: number;
}

export interface SheetData {
  sheetName: string;
  weeklyData: WeekData[];
  thirteenWeekAverage?: WeekData;
  ytdData?: WeekData;
  priorYearData?: WeekData[];
}

export interface ParsedReport {
  fileName: string;
  weekNumber: string;
  uploadDate: Date;
  sheets: SheetData[];
}

export const parseWeeklyReport = async (file: File): Promise<ParsedReport> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        
        const sheets: SheetData[] = [];
        
        // Parse each sheet
        workbook.SheetNames.forEach(sheetName => {
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          const weeklyData: WeekData[] = [];
          
          // Parse weekly data (rows 9-21 in the original Excel, 0-indexed here)
          for (let i = 8; i <= 20 && i < jsonData.length; i++) {
            const row = jsonData[i] as any[];
            if (row[2] && row[2].toString().startsWith('Week')) {
              weeklyData.push(parseRow(row));
            }
          }
          
          // Parse 13 week average (row 23)
          let thirteenWeekAverage: WeekData | undefined;
          if (jsonData[22]) {
            const row = jsonData[22] as any[];
            if (row[2]?.toString().includes('13 Week Average')) {
              thirteenWeekAverage = parseRow(row);
            }
          }
          
          // Parse YTD data (row 24-25)
          let ytdData: WeekData | undefined;
          if (jsonData[23]) {
            const row = jsonData[23] as any[];
            if (row[2]?.toString().includes('YTD') || row[1] === 'YTD') {
              ytdData = parseRow(row);
            }
          }
          
          sheets.push({
            sheetName,
            weeklyData,
            thirteenWeekAverage,
            ytdData
          });
        });
        
        // Extract week number from filename
        const weekMatch = file.name.match(/Week[_\s](\d+)/i);
        const weekNumber = weekMatch ? weekMatch[1] : 'Unknown';
        
        resolve({
          fileName: file.name,
          weekNumber,
          uploadDate: new Date(),
          sheets
        });
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsBinaryString(file);
  });
};

const parseRow = (row: any[]): WeekData => {
  const safeNum = (val: any): number => {
    if (val === null || val === undefined || val === '') return 0;
    const num = typeof val === 'number' ? val : parseFloat(val);
    return isNaN(num) ? 0 : num;
  };
  
  return {
    fiscalYear: row[0]?.toString() || '',
    periodType: row[1]?.toString() || '',
    week: row[2]?.toString() || '',
    status: row[3]?.toString() || '',
    aoaChangePriorWeek: safeNum(row[5]),
    aoaChangePriorYear: safeNum(row[6]),
    customerChangePriorWeek: safeNum(row[7]),
    customerChangePriorYear: safeNum(row[8]),
    revenueChangePriorWeek: safeNum(row[9]),
    revenueChangePriorYear: safeNum(row[10]),
    gpChangePriorWeek: safeNum(row[11]),
    gpChangePriorYear: safeNum(row[12]),
    associatesOnAssignment: safeNum(row[14]),
    customersBilled: safeNum(row[15]),
    markupPercent: safeNum(row[16]),
    avgHourlyPayRate: safeNum(row[17]),
    billRatePerHour: safeNum(row[18]),
    profitPerHour: safeNum(row[19]),
    hoursPerAssociate: safeNum(row[20]),
    associateBilling: safeNum(row[22]),
    associateGrossProfit: safeNum(row[23]),
    associateGrossProfitPercent: safeNum(row[24]),
    feesRevenue: safeNum(row[25]),
    totalSales: safeNum(row[26]),
    grossProfit: safeNum(row[27]),
    grossProfitPercent: safeNum(row[28]),
    fullTimeEquivalent: safeNum(row[30]),
    staffExcludingBDM: safeNum(row[31]),
    associateGPperFTE: safeNum(row[34]),
    aoasPerFTE: safeNum(row[36]),
    hoursBilled: safeNum(row[40]),
    revenuePerClient: safeNum(row[41]),
    associateWages: safeNum(row[42]),
    conversionFees: safeNum(row[44]),
    permanentPlacementFees: safeNum(row[45]),
    quickHire: safeNum(row[46])
  };
};

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatPercent = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
};
