/**
 * Comprehensive Variables Glossary
 * Defines all business metrics used in the MidStates Weekly Report Analytics
 */

import type { GlossaryConfig, GlossaryEntry } from '@/lib/glossaryTypes';

export const GLOSSARY_ENTRIES: Record<string, GlossaryEntry> = {
  // Workforce Metrics
  associatesOnAssignment: {
    key: 'associatesOnAssignment',
    name: 'Associates on Assignment',
    abbreviation: 'AOA',
    shortDescription: 'Number of associates that were paid during the week',
    fullDescription: 'Total count of active associates who received payment for work completed during the reporting week. This is a key indicator of workforce utilization and operational capacity.',
    calculation: 'Count of all associates with payroll activity in the week',
    example: '150 associates',
    category: 'workforce',
    format: 'number',
    relatedMetrics: ['customersBilled', 'fullTimeEquivalent', 'aoasPerFTE'],
    searchKeywords: ['associates', 'paid', 'workforce', 'headcount', 'AOA'],
  },

  customersBilled: {
    key: 'customersBilled',
    name: 'Customers Billed',
    abbreviation: 'Customers',
    shortDescription: 'Number of clients that were billed during the week',
    fullDescription: 'Total count of unique customer accounts that received invoices during the reporting week. Indicates market penetration and client base size.',
    calculation: 'Count of distinct clients with billing activity',
    example: '45 customers',
    category: 'revenue',
    format: 'number',
    relatedMetrics: ['associatesOnAssignment', 'revenuePerClient', 'totalSales'],
    searchKeywords: ['customers', 'clients', 'billed', 'accounts'],
  },

  markupPercent: {
    key: 'markupPercent',
    name: 'Mark Up %',
    abbreviation: 'MU%',
    shortDescription: 'The percentage that we mark up pay rates to equal bill rates',
    fullDescription: 'The percentage markup applied to associate pay rates to determine customer bill rates. This is a critical pricing metric that directly impacts profitability.',
    calculation: '((Bill Rate - Pay Rate) / Pay Rate) × 100',
    example: '32.5%',
    category: 'profitability',
    format: 'percentage',
    relatedMetrics: ['billRatePerHour', 'avgHourlyPayRate', 'grossProfitPercent'],
    searchKeywords: ['markup', 'margin', 'pricing', 'spread'],
  },

  avgHourlyPayRate: {
    key: 'avgHourlyPayRate',
    name: 'Average Hourly Pay Rate',
    abbreviation: 'Hourly Pay',
    shortDescription: 'Average hourly pay rate of AOAs during the week',
    fullDescription: 'The weighted average hourly compensation rate paid to associates on assignment during the week. Used for cost analysis and competitive positioning.',
    calculation: 'Total Associate Wages / Total Hours Worked',
    example: '$18.50/hr',
    category: 'billing',
    format: 'currency',
    relatedMetrics: ['billRatePerHour', 'markupPercent', 'associateWages'],
    searchKeywords: ['pay rate', 'wages', 'compensation', 'hourly'],
  },

  billRatePerHour: {
    key: 'billRatePerHour',
    name: 'Bill Rate per Hour',
    abbreviation: 'Hourly Bill',
    shortDescription: 'Average hourly bill rate of AOAs during the week',
    fullDescription: 'The weighted average hourly rate charged to customers for associate services during the week. Key metric for revenue optimization and pricing strategy.',
    calculation: 'Total Associate Billing / Total Hours Billed',
    example: '$24.50/hr',
    category: 'billing',
    format: 'currency',
    relatedMetrics: ['avgHourlyPayRate', 'markupPercent', 'associateBilling'],
    searchKeywords: ['bill rate', 'billing', 'charge rate', 'hourly'],
  },

  profitPerHour: {
    key: 'profitPerHour',
    name: 'Profit per Hour',
    abbreviation: 'Hourly GP$',
    shortDescription: 'Average hourly gross profit of AOAs during the week. GP$ = Bill rate - Pay rate',
    fullDescription: 'The average gross profit generated per hour of associate work. Calculated as the difference between bill rate and pay rate. This is a critical efficiency metric showing profit productivity.',
    calculation: 'Bill Rate per Hour - Average Hourly Pay Rate',
    example: '$6.00/hr',
    category: 'profitability',
    format: 'currency',
    relatedMetrics: ['billRatePerHour', 'avgHourlyPayRate', 'grossProfit'],
    searchKeywords: ['profit per hour', 'hourly profit', 'margin per hour'],
  },

  hoursPerAssociate: {
    key: 'hoursPerAssociate',
    name: 'Hours per Associate',
    abbreviation: 'Avg Hours',
    shortDescription: 'Average number of hours worked by AOAs during the week',
    fullDescription: 'The average number of billable hours worked per associate during the reporting week. Indicator of full-time vs. part-time utilization and scheduling efficiency.',
    calculation: 'Total Hours Billed / Associates on Assignment',
    example: '38.5 hours',
    category: 'efficiency',
    format: 'hours',
    relatedMetrics: ['hoursBilled', 'associatesOnAssignment', 'fullTimeEquivalent'],
    searchKeywords: ['hours', 'utilization', 'average hours', 'work hours'],
  },

  // Revenue Metrics
  associateBilling: {
    key: 'associateBilling',
    name: 'Associate Billing',
    abbreviation: 'Associate Bill',
    shortDescription: 'Total amount billed for the week',
    fullDescription: 'Total revenue generated from associate staffing services during the week. This excludes fee-based revenue and represents the core staffing business volume.',
    calculation: 'Sum of all associate time invoices for the week',
    example: '$125,000',
    category: 'revenue',
    format: 'currency',
    relatedMetrics: ['totalSales', 'associateGrossProfit', 'billRatePerHour'],
    searchKeywords: ['billing', 'revenue', 'associate revenue', 'staffing revenue'],
  },

  associateGrossProfit: {
    key: 'associateGrossProfit',
    name: 'Associate Gross Profit',
    abbreviation: 'Associate GP$',
    shortDescription: 'Total amount of gross profit for the week',
    fullDescription: 'Gross profit generated from associate staffing services, calculated as associate billing minus associate wages. This is the primary profit center for staffing operations.',
    calculation: 'Associate Billing - Associate Wages',
    example: '$35,000',
    category: 'profitability',
    format: 'currency',
    relatedMetrics: ['associateBilling', 'grossProfit', 'associateGrossProfitPercent'],
    searchKeywords: ['gross profit', 'profit', 'margin', 'associate profit'],
  },

  associateGrossProfitPercent: {
    key: 'associateGrossProfitPercent',
    name: 'Associate Gross Profit %',
    abbreviation: 'Associate GP%',
    shortDescription: 'Total percentage of Associate Bill that converted to Associate GP$',
    fullDescription: 'The gross profit margin on associate staffing services, expressed as a percentage of associate billing. Key indicator of pricing effectiveness and cost control.',
    calculation: '(Associate Gross Profit / Associate Billing) × 100',
    example: '28.0%',
    category: 'profitability',
    format: 'percentage',
    relatedMetrics: ['associateGrossProfit', 'grossProfitPercent', 'markupPercent'],
    searchKeywords: ['margin', 'gross profit percent', 'profit margin', 'GP%'],
  },

  feesRevenue: {
    key: 'feesRevenue',
    name: 'Fees Revenue',
    abbreviation: 'Fee Rev',
    shortDescription: 'Total amount of fees billed for the week',
    fullDescription: 'Combined revenue from all fee-based services including conversion fees, permanent placements, and quick hire fees. Represents high-margin supplemental revenue.',
    calculation: 'Conversion Fees + Permanent Placement Fees + Quick Hire Fees',
    example: '$15,000',
    category: 'fees',
    format: 'currency',
    relatedMetrics: ['conversionFees', 'permanentPlacementFees', 'quickHire', 'totalSales'],
    searchKeywords: ['fees', 'placement fees', 'conversion', 'direct hire'],
  },

  totalSales: {
    key: 'totalSales',
    name: 'TOTAL SALES (Revenue)',
    abbreviation: 'Total Sales',
    shortDescription: 'Total combined revenue: Associate Billing + Fees',
    fullDescription: 'Total revenue for the week from all sources including associate staffing services and fee-based placements. This is the top-line revenue metric for business performance.',
    calculation: 'Associate Billing + Fees Revenue',
    example: '$140,000',
    category: 'revenue',
    format: 'currency',
    relatedMetrics: ['associateBilling', 'feesRevenue', 'grossProfit'],
    searchKeywords: ['revenue', 'total sales', 'total revenue', 'top line'],
  },

  grossProfit: {
    key: 'grossProfit',
    name: 'Gross Profit',
    abbreviation: 'GP$',
    shortDescription: 'Total gross profit on combined revenue',
    fullDescription: 'Total gross profit from all revenue sources. Since fees are 100% profit, this equals Associate Gross Profit plus all fee revenue. Primary measure of operational profitability.',
    calculation: 'Associate Gross Profit + Fees Revenue',
    example: '$50,000',
    category: 'profitability',
    format: 'currency',
    relatedMetrics: ['grossProfitPercent', 'associateGrossProfit', 'totalSales'],
    searchKeywords: ['gross profit', 'profit', 'GP', 'earnings'],
  },

  grossProfitPercent: {
    key: 'grossProfitPercent',
    name: 'Gross Profit %',
    abbreviation: 'GP%',
    shortDescription: 'Total percentage of revenue that converted to GP$',
    fullDescription: 'Overall gross profit margin expressed as a percentage of total sales. This blended margin reflects both associate staffing and fee-based revenue profitability.',
    calculation: '(Gross Profit / Total Sales) × 100',
    example: '35.7%',
    category: 'profitability',
    format: 'percentage',
    relatedMetrics: ['grossProfit', 'totalSales', 'associateGrossProfitPercent'],
    searchKeywords: ['margin', 'profit margin', 'GP percent', 'profitability'],
  },

  // Efficiency & Staffing Metrics
  fullTimeEquivalent: {
    key: 'fullTimeEquivalent',
    name: 'Full Time Equivalent',
    abbreviation: 'FTE',
    shortDescription: 'Number of EB personnel during week, including Colleagues, AIB, BDM, and Other Roles',
    fullDescription: 'Total count of internal staff expressed in full-time equivalents. Includes all employee categories: colleagues (account managers/recruiters), AIB, BDM, and other administrative roles.',
    calculation: 'Sum of all internal staff headcount',
    example: '12 FTE',
    category: 'workforce',
    format: 'number',
    relatedMetrics: ['staffExcludingBDM', 'associateGPperFTE', 'aoasPerFTE'],
    searchKeywords: ['FTE', 'staff', 'employees', 'headcount', 'internal'],
  },

  staffExcludingBDM: {
    key: 'staffExcludingBDM',
    name: 'Staff Excluding BDM',
    abbreviation: 'FTE No BDM',
    shortDescription: 'FTE with BDM headcount subtracted',
    fullDescription: 'Full-time equivalent count excluding Business Development Managers. Used for operational efficiency metrics that focus on revenue-generating roles.',
    calculation: 'FTE - BDM Count',
    example: '10 FTE',
    category: 'workforce',
    format: 'number',
    relatedMetrics: ['fullTimeEquivalent', 'associateGPperFTE'],
    searchKeywords: ['staff', 'FTE', 'excluding BDM', 'operational staff'],
  },

  corporateFTEs: {
    key: 'corporateFTEs',
    name: 'Corporate FTEs',
    abbreviation: 'CFTE',
    shortDescription: 'Corporate personnel',
    fullDescription: 'Number of corporate-level staff members who support branch operations. These are typically shared services or headquarters personnel.',
    calculation: 'Count of corporate staff allocated to branch',
    example: '2 CFTE',
    category: 'workforce',
    format: 'number',
    relatedMetrics: ['fullTimeEquivalent', 'fieldFTEs'],
    searchKeywords: ['corporate', 'headquarters', 'shared services', 'support staff'],
  },

  fieldFTEs: {
    key: 'fieldFTEs',
    name: 'Field FTEs (Exc BDM)',
    abbreviation: 'Field FTE',
    shortDescription: 'Branch personnel',
    fullDescription: 'Number of field-based staff (excluding BDM) working directly in branch operations. These are front-line recruiters and account managers.',
    calculation: 'Branch staff count excluding BDM',
    example: '8 Field FTE',
    category: 'workforce',
    format: 'number',
    relatedMetrics: ['fullTimeEquivalent', 'staffExcludingBDM'],
    searchKeywords: ['field staff', 'branch staff', 'front line'],
  },

  associateGPperFTE: {
    key: 'associateGPperFTE',
    name: 'Associate GP per FTE',
    abbreviation: 'AA GP$/FTE',
    shortDescription: 'Associate GP divided by number of FTEs',
    fullDescription: 'Staff productivity metric showing the average gross profit generated per internal staff member from associate staffing services. Higher values indicate better operational efficiency.',
    calculation: 'Associate Gross Profit / FTE',
    example: '$2,917',
    category: 'efficiency',
    format: 'currency',
    relatedMetrics: ['associateGrossProfit', 'fullTimeEquivalent', 'aoasPerFTE'],
    searchKeywords: ['productivity', 'efficiency', 'GP per FTE', 'staff performance'],
  },

  gpPerFTE: {
    key: 'gpPerFTE',
    name: 'GP per FTE (Exc BDM)',
    abbreviation: 'GP$/FTE',
    shortDescription: 'Total gross profit divided by non-BDM personnel',
    fullDescription: 'Total gross profit productivity per operational staff member (excluding BDM). Comprehensive efficiency metric including both associate and fee-based profit.',
    calculation: 'Gross Profit / Staff Excluding BDM',
    example: '$5,000',
    category: 'efficiency',
    format: 'currency',
    relatedMetrics: ['grossProfit', 'staffExcludingBDM', 'associateGPperFTE'],
    searchKeywords: ['productivity', 'GP per FTE', 'efficiency'],
  },

  aoasPerFTE: {
    key: 'aoasPerFTE',
    name: 'AOAs per FTE',
    abbreviation: 'AOA/FTE',
    shortDescription: 'Number of AOAs divided by FTE',
    fullDescription: 'Staffing efficiency ratio showing the average number of associates managed per internal staff member. Indicates account manager/recruiter workload and operational leverage.',
    calculation: 'Associates on Assignment / FTE',
    example: '12.5',
    category: 'efficiency',
    format: 'decimal',
    relatedMetrics: ['associatesOnAssignment', 'fullTimeEquivalent', 'associateGPperFTE'],
    searchKeywords: ['ratio', 'AOA per FTE', 'span of control', 'efficiency'],
  },

  fieldAOAperFTE: {
    key: 'fieldAOAperFTE',
    name: 'Field AOA/FTE (Exc BDM)',
    abbreviation: 'AOA/FTE No BDM',
    shortDescription: 'Number of AOAs divided by non-BDM personnel',
    fullDescription: 'Associates per field staff ratio, excluding Business Development Managers. Shows the actual recruiter/account manager workload for operational staff.',
    calculation: 'Associates on Assignment / Staff Excluding BDM',
    example: '15.0',
    category: 'efficiency',
    format: 'decimal',
    relatedMetrics: ['aoasPerFTE', 'associatesOnAssignment', 'staffExcludingBDM'],
    searchKeywords: ['AOA per FTE', 'field ratio', 'workload'],
  },

  hoursBilled: {
    key: 'hoursBilled',
    name: 'Hours Billed',
    abbreviation: 'Hours Bill',
    shortDescription: 'Total number of hours worked by AOAs for the week',
    fullDescription: 'Total billable hours invoiced to customers during the week. Volume metric that directly drives associate billing revenue.',
    calculation: 'Sum of all associate hours on timesheets',
    example: '5,775 hours',
    category: 'billing',
    format: 'hours',
    relatedMetrics: ['hoursPerAssociate', 'associateBilling', 'billRatePerHour'],
    searchKeywords: ['hours', 'billable hours', 'timesheets', 'volume'],
  },

  revenuePerClient: {
    key: 'revenuePerClient',
    name: 'Revenue per Client',
    abbreviation: 'Per Client Rev',
    shortDescription: 'Total revenue divided by number of customers billed',
    fullDescription: 'Average revenue generated per customer account during the week. Indicates account size and penetration depth. Higher values suggest larger accounts or better cross-selling.',
    calculation: 'Total Sales / Customers Billed',
    example: '$3,111',
    category: 'efficiency',
    format: 'currency',
    relatedMetrics: ['totalSales', 'customersBilled'],
    searchKeywords: ['revenue per client', 'account size', 'average revenue'],
  },

  associateWages: {
    key: 'associateWages',
    name: 'Associate Wages',
    abbreviation: 'AOA Wage',
    shortDescription: 'Total amount paid to associates for the week',
    fullDescription: 'Total payroll cost for associates on assignment during the week. This is the primary direct cost in the staffing business model.',
    calculation: 'Sum of all associate gross pay',
    example: '$90,000',
    category: 'billing',
    format: 'currency',
    relatedMetrics: ['avgHourlyPayRate', 'associateBilling', 'associateGrossProfit'],
    searchKeywords: ['wages', 'payroll', 'labor cost', 'associate pay'],
  },

  // Fee-Based Revenue
  conversionFees: {
    key: 'conversionFees',
    name: 'Conversion Fees',
    abbreviation: 'Conv. Fee',
    shortDescription: 'Total amount billed for associate that converted to client FTE during week',
    fullDescription: 'Revenue from conversion fees charged when a temporary associate is hired as a permanent employee by the client. High-margin fee revenue representing successful placements.',
    calculation: 'Sum of all temp-to-perm conversion invoices',
    example: '$5,000',
    category: 'fees',
    format: 'currency',
    relatedMetrics: ['feesRevenue', 'permanentPlacementFees', 'quickHire'],
    searchKeywords: ['conversion', 'temp to perm', 'hire fees'],
  },

  permanentPlacementFees: {
    key: 'permanentPlacementFees',
    name: 'Permanent Placement Fees',
    abbreviation: 'DH Fee',
    shortDescription: 'Total amount billed for direct hire FTE placements',
    fullDescription: 'Revenue from direct-hire placement fees for recruiting and placing permanent employees with clients. Traditional retained or contingent search fees.',
    calculation: 'Sum of all direct hire placement invoices',
    example: '$8,000',
    category: 'fees',
    format: 'currency',
    relatedMetrics: ['feesRevenue', 'conversionFees', 'quickHire'],
    searchKeywords: ['permanent placement', 'direct hire', 'search fees', 'DH'],
  },

  quickHire: {
    key: 'quickHire',
    name: 'Quick Hire',
    abbreviation: 'QH Fee',
    shortDescription: 'Total amount billed for quick hire placements',
    fullDescription: 'Revenue from quick hire placement fees for expedited or specialized placement services. Accelerated recruitment service with premium pricing.',
    calculation: 'Sum of all quick hire invoices',
    example: '$2,000',
    category: 'fees',
    format: 'currency',
    relatedMetrics: ['feesRevenue', 'conversionFees', 'permanentPlacementFees'],
    searchKeywords: ['quick hire', 'expedited placement', 'QH'],
  },

  // Trend & Comparison Metrics
  aoaChangePriorWeek: {
    key: 'aoaChangePriorWeek',
    name: 'AOA Change vs Prior Week',
    abbreviation: 'AOA WoW',
    shortDescription: 'Week-over-week change in Associates on Assignment',
    fullDescription: 'Percentage or absolute change in AOA count compared to the previous week. Indicates short-term workforce trends and business momentum.',
    calculation: '((Current Week AOA - Prior Week AOA) / Prior Week AOA) × 100',
    example: '+3.2%',
    category: 'trends',
    format: 'percentage',
    relatedMetrics: ['associatesOnAssignment', 'aoaChangePriorYear'],
    searchKeywords: ['week over week', 'WoW', 'trend', 'change'],
  },

  aoaChangePriorYear: {
    key: 'aoaChangePriorYear',
    name: 'AOA Change vs Prior Year',
    abbreviation: 'AOA YoY',
    shortDescription: 'Year-over-year change in Associates on Assignment',
    fullDescription: 'Percentage or absolute change in AOA count compared to the same week in the prior year. Indicates annual growth trends and market conditions.',
    calculation: '((Current Year AOA - Prior Year AOA) / Prior Year AOA) × 100',
    example: '+12.5%',
    category: 'trends',
    format: 'percentage',
    relatedMetrics: ['associatesOnAssignment', 'aoaChangePriorWeek'],
    searchKeywords: ['year over year', 'YoY', 'annual growth', 'trend'],
  },

  customerChangePriorWeek: {
    key: 'customerChangePriorWeek',
    name: 'Customer Change vs Prior Week',
    abbreviation: 'Cust WoW',
    shortDescription: 'Week-over-week change in Customers Billed',
    fullDescription: 'Change in customer count compared to previous week. Indicates client retention and new business development momentum.',
    calculation: '((Current Week Customers - Prior Week Customers) / Prior Week Customers) × 100',
    example: '+2.0%',
    category: 'trends',
    format: 'percentage',
    relatedMetrics: ['customersBilled', 'customerChangePriorYear'],
    searchKeywords: ['customer change', 'WoW', 'client trend'],
  },

  customerChangePriorYear: {
    key: 'customerChangePriorYear',
    name: 'Customer Change vs Prior Year',
    abbreviation: 'Cust YoY',
    shortDescription: 'Year-over-year change in Customers Billed',
    fullDescription: 'Change in customer count compared to same week last year. Reflects market penetration and customer base growth.',
    calculation: '((Current Year Customers - Prior Year Customers) / Prior Year Customers) × 100',
    example: '+8.0%',
    category: 'trends',
    format: 'percentage',
    relatedMetrics: ['customersBilled', 'customerChangePriorWeek'],
    searchKeywords: ['customer YoY', 'annual customer growth'],
  },

  revenueChangePriorWeek: {
    key: 'revenueChangePriorWeek',
    name: 'Revenue Change vs Prior Week',
    abbreviation: 'Rev WoW',
    shortDescription: 'Week-over-week change in Total Sales',
    fullDescription: 'Percentage change in total revenue compared to previous week. Key short-term business performance indicator.',
    calculation: '((Current Week Revenue - Prior Week Revenue) / Prior Week Revenue) × 100',
    example: '+5.0%',
    category: 'trends',
    format: 'percentage',
    relatedMetrics: ['totalSales', 'revenueChangePriorYear'],
    searchKeywords: ['revenue change', 'sales trend', 'WoW'],
  },

  revenueChangePriorYear: {
    key: 'revenueChangePriorYear',
    name: 'Revenue Change vs Prior Year',
    abbreviation: 'Rev YoY',
    shortDescription: 'Year-over-year change in Total Sales',
    fullDescription: 'Percentage change in total revenue compared to same week last year. Primary measure of annual business growth.',
    calculation: '((Current Year Revenue - Prior Year Revenue) / Prior Year Revenue) × 100',
    example: '+15.0%',
    category: 'trends',
    format: 'percentage',
    relatedMetrics: ['totalSales', 'revenueChangePriorWeek'],
    searchKeywords: ['revenue YoY', 'annual growth', 'sales growth'],
  },

  gpChangePriorWeek: {
    key: 'gpChangePriorWeek',
    name: 'GP Change vs Prior Week',
    abbreviation: 'GP WoW',
    shortDescription: 'Week-over-week change in Gross Profit',
    fullDescription: 'Percentage change in gross profit compared to previous week. Indicates profitability momentum and operational execution.',
    calculation: '((Current Week GP - Prior Week GP) / Prior Week GP) × 100',
    example: '+4.5%',
    category: 'trends',
    format: 'percentage',
    relatedMetrics: ['grossProfit', 'gpChangePriorYear'],
    searchKeywords: ['profit change', 'GP trend', 'WoW'],
  },

  gpChangePriorYear: {
    key: 'gpChangePriorYear',
    name: 'GP Change vs Prior Year',
    abbreviation: 'GP YoY',
    shortDescription: 'Year-over-year change in Gross Profit',
    fullDescription: 'Percentage change in gross profit compared to same week last year. Measures annual profitability growth and margin improvement.',
    calculation: '((Current Year GP - Prior Year GP) / Prior Year GP) × 100',
    example: '+18.0%',
    category: 'trends',
    format: 'percentage',
    relatedMetrics: ['grossProfit', 'gpChangePriorWeek'],
    searchKeywords: ['profit YoY', 'annual profit growth'],
  },
};

export const GLOSSARY_CATEGORIES = {
  workforce: {
    name: 'Workforce & Staffing',
    description: 'Metrics related to associates, employees, and headcount',
  },
  revenue: {
    name: 'Revenue',
    description: 'Sales and billing metrics',
  },
  profitability: {
    name: 'Profitability',
    description: 'Gross profit and margin metrics',
  },
  efficiency: {
    name: 'Efficiency & Productivity',
    description: 'Operational efficiency and productivity ratios',
  },
  billing: {
    name: 'Billing & Rates',
    description: 'Hourly rates, hours, and wage metrics',
  },
  fees: {
    name: 'Fee Revenue',
    description: 'Placement fees and conversion revenue',
  },
  trends: {
    name: 'Trends & Comparisons',
    description: 'Week-over-week and year-over-year changes',
  },
  ratios: {
    name: 'Key Ratios',
    description: 'Important business ratios and KPIs',
  },
};

export const GLOSSARY_CONFIG: GlossaryConfig = {
  entries: GLOSSARY_ENTRIES,
  categories: GLOSSARY_CATEGORIES,
};

/**
 * Helper function to get a glossary entry by key
 */
export function getGlossaryEntry(key: string): GlossaryEntry | undefined {
  return GLOSSARY_ENTRIES[key];
}

/**
 * Helper function to search glossary entries
 */
export function searchGlossary(query: string): GlossaryEntry[] {
  const lowerQuery = query.toLowerCase();
  return Object.values(GLOSSARY_ENTRIES).filter(
    (entry) =>
      entry.name.toLowerCase().includes(lowerQuery) ||
      entry.abbreviation?.toLowerCase().includes(lowerQuery) ||
      entry.shortDescription.toLowerCase().includes(lowerQuery) ||
      entry.searchKeywords?.some((keyword) => keyword.toLowerCase().includes(lowerQuery))
  );
}

/**
 * Helper function to get entries by category
 */
export function getEntriesByCategory(category: string): GlossaryEntry[] {
  return Object.values(GLOSSARY_ENTRIES).filter((entry) => entry.category === category);
}
