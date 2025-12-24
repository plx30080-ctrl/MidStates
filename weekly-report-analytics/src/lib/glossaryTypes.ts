/**
 * Type definitions for the Variables Glossary System
 * Provides comprehensive metadata for all business metrics
 */

export interface GlossaryEntry {
  /** Unique identifier/key for the variable */
  key: string;

  /** Display name of the variable */
  name: string;

  /** Short abbreviation or variable code */
  abbreviation?: string;

  /** Brief one-line description for tooltips */
  shortDescription: string;

  /** Detailed explanation with context and usage */
  fullDescription: string;

  /** How the metric is calculated */
  calculation?: string;

  /** Example value to illustrate the metric */
  example?: string;

  /** Category for grouping related metrics */
  category: GlossaryCategory;

  /** Format type for display (currency, percentage, number, etc.) */
  format: GlossaryFormat;

  /** Related metrics that users might want to see */
  relatedMetrics?: string[];

  /** Keywords for AI search and discovery */
  searchKeywords?: string[];
}

export type GlossaryCategory =
  | 'workforce'
  | 'revenue'
  | 'profitability'
  | 'efficiency'
  | 'billing'
  | 'fees'
  | 'trends'
  | 'ratios';

export type GlossaryFormat =
  | 'currency'
  | 'percentage'
  | 'number'
  | 'decimal'
  | 'hours';

export interface GlossaryConfig {
  entries: Record<string, GlossaryEntry>;
  categories: Record<GlossaryCategory, CategoryMetadata>;
}

export interface CategoryMetadata {
  name: string;
  description: string;
  icon?: string;
}

/**
 * AI-powered search result
 */
export interface GlossarySearchResult extends GlossaryEntry {
  relevanceScore: number;
  matchReason: string;
}
