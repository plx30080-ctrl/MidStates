/**
 * Glossary Label Mapping
 * Maps display labels to glossary variable keys
 */

export const labelToGlossaryKey: Record<string, string> = {
  // Workforce Metrics
  'Associates on Assignment': 'associatesOnAssignment',
  'Associates': 'associatesOnAssignment',
  'Customers Billed': 'customersBilled',
  'Customers': 'customersBilled',
  'Mark Up %': 'markupPercent',
  'Markup %': 'markupPercent',

  // Billing & Rates
  'Avg Pay Rate': 'avgHourlyPayRate',
  'Bill Rate/Hour': 'billRatePerHour',
  'Profit/Hour': 'profitPerHour',
  'Profit per Hour': 'profitPerHour',
  'Hours/Associate': 'hoursPerAssociate',
  'Hours per Associate': 'hoursPerAssociate',
  'Hours Billed': 'hoursBilled',

  // Revenue Metrics
  'Total Sales': 'totalSales',
  'Revenue': 'totalSales',
  'Associate Billing': 'associateBilling',
  'Fee Revenue': 'feesRevenue',
  'Total Fee Revenue': 'feesRevenue',
  'Revenue/Client': 'revenuePerClient',
  'Revenue per Client': 'revenuePerClient',
  'Associate Wages': 'associateWages',

  // Profitability Metrics
  'Gross Profit': 'grossProfit',
  'GP': 'grossProfit',
  'GP %': 'grossProfitPercent',
  'Gross Profit %': 'grossProfitPercent',
  'Associate GP': 'associateGrossProfit',
  'Associate Gross Profit': 'associateGrossProfit',
  'Associate GP %': 'associateGrossProfitPercent',

  // Efficiency Metrics
  'Full-Time Equivalent': 'fullTimeEquivalent',
  'FTE': 'fullTimeEquivalent',
  'Staff Excluding BDM': 'staffExcludingBDM',
  'Associate GP per FTE': 'associateGPperFTE',
  'GP per FTE': 'gpPerFTE',
  'AOAs per FTE': 'aoasPerFTE',
  'Revenue per FTE': 'fullTimeEquivalent', // Calculated metric, use FTE as base

  // Fee Revenue
  'Conversion Fees': 'conversionFees',
  'Permanent Placement Fees': 'permanentPlacementFees',
  'QuickHire': 'quickHire',
  'QuickHire Revenue': 'quickHire',

  // YTD Metrics (use base metric keys)
  'YTD Revenue': 'totalSales',
  'YTD Gross Profit': 'grossProfit',
  'YTD GP %': 'grossProfitPercent',
  'YTD Avg AOA': 'associatesOnAssignment',

  // Trend Metrics
  'Revenue vs Avg': 'revenueChangePriorWeek',
  'GP % vs Avg': 'grossProfitPercent',
  'Revenue Growth WoW': 'revenueChangePriorWeek',
  'Revenue Stability': 'totalSales',
};

/**
 * Get glossary key from label text
 */
export function getGlossaryKeyFromLabel(label: string): string | undefined {
  return labelToGlossaryKey[label];
}

/**
 * Check if a label has a glossary entry
 */
export function hasGlossaryEntry(label: string): boolean {
  return label in labelToGlossaryKey;
}
