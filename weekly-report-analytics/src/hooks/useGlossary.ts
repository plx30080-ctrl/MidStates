/**
 * useGlossary Hook
 * Provides easy access to glossary data and search functionality
 */

import { useMemo, useState, useCallback } from 'react';
import {
  GLOSSARY_ENTRIES,
  GLOSSARY_CATEGORIES,
  getGlossaryEntry,
  searchGlossary,
  getEntriesByCategory,
} from '@/data/glossary';
import type { GlossaryEntry, GlossaryCategory } from '@/lib/glossaryTypes';

export interface UseGlossaryReturn {
  /** Get a specific glossary entry by key */
  getEntry: (key: string) => GlossaryEntry | undefined;
  /** Search glossary entries by query */
  search: (query: string) => GlossaryEntry[];
  /** Get entries filtered by category */
  getByCategory: (category: GlossaryCategory) => GlossaryEntry[];
  /** All glossary entries */
  allEntries: GlossaryEntry[];
  /** All categories */
  categories: typeof GLOSSARY_CATEGORIES;
  /** Current search query */
  searchQuery: string;
  /** Set search query */
  setSearchQuery: (query: string) => void;
  /** Search results based on current query */
  searchResults: GlossaryEntry[];
}

/**
 * Hook for accessing glossary functionality
 */
export function useGlossary(): UseGlossaryReturn {
  const [searchQuery, setSearchQuery] = useState('');

  const allEntries = useMemo(() => Object.values(GLOSSARY_ENTRIES), []);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) {
      return allEntries;
    }
    return searchGlossary(searchQuery);
  }, [searchQuery, allEntries]);

  const getEntry = useCallback((key: string) => {
    return getGlossaryEntry(key);
  }, []);

  const search = useCallback((query: string) => {
    return searchGlossary(query);
  }, []);

  const getByCategory = useCallback((category: GlossaryCategory) => {
    return getEntriesByCategory(category);
  }, []);

  return {
    getEntry,
    search,
    getByCategory,
    allEntries,
    categories: GLOSSARY_CATEGORIES,
    searchQuery,
    setSearchQuery,
    searchResults,
  };
}

/**
 * Hook for getting a specific glossary entry
 */
export function useGlossaryEntry(key: string): GlossaryEntry | undefined {
  return useMemo(() => getGlossaryEntry(key), [key]);
}

/**
 * Hook for formatting values according to glossary format
 */
export function useGlossaryFormat() {
  const formatValue = useCallback((key: string, value: number): string => {
    const entry = getGlossaryEntry(key);
    if (!entry) return String(value);

    switch (entry.format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(value);
      case 'percentage':
        return `${value.toFixed(1)}%`;
      case 'hours':
        return `${value.toLocaleString()} hrs`;
      case 'decimal':
        return value.toFixed(1);
      case 'number':
      default:
        return value.toLocaleString();
    }
  }, []);

  return { formatValue };
}

export default useGlossary;
