/**
 * GlossaryTooltip Component
 * Wraps metric labels with hover tooltips showing variable definitions
 */

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { getGlossaryEntry } from '@/data/glossary';
import type { GlossaryEntry } from '@/lib/glossaryTypes';
import { Badge } from '@/components/ui/badge';
import { InfoIcon } from 'lucide-react';

interface GlossaryTooltipProps {
  /** The variable key from the glossary */
  variableKey: string;
  /** The content to wrap (usually the metric label) */
  children: React.ReactNode;
  /** Whether to show detailed hover card instead of simple tooltip */
  detailed?: boolean;
  /** Optional custom className */
  className?: string;
}

/**
 * Simple tooltip variant - shows brief description on hover
 */
export function GlossaryTooltip({
  variableKey,
  children,
  detailed = false,
  className = '',
}: GlossaryTooltipProps) {
  const entry = getGlossaryEntry(variableKey);

  // If no glossary entry found, return children without tooltip
  if (!entry) {
    return <>{children}</>;
  }

  // Use detailed hover card if requested
  if (detailed) {
    return <DetailedGlossaryCard entry={entry} className={className}>{children}</DetailedGlossaryCard>;
  }

  // Use simple tooltip for compact display
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={`cursor-help border-b border-dotted border-gray-400 ${className}`}>
            {children}
          </span>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs" side="top">
          <div className="space-y-1">
            <p className="font-semibold text-sm">{entry.name}</p>
            {entry.abbreviation && (
              <p className="text-xs text-gray-400">({entry.abbreviation})</p>
            )}
            <p className="text-xs">{entry.shortDescription}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * Detailed hover card variant - shows comprehensive information
 */
function DetailedGlossaryCard({
  entry,
  children,
  className = '',
}: {
  entry: GlossaryEntry;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <HoverCard openDelay={300}>
      <HoverCardTrigger asChild>
        <span className={`cursor-help inline-flex items-center gap-1 group ${className}`}>
          {children}
          <InfoIcon className="h-3 w-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
        </span>
      </HoverCardTrigger>
      <HoverCardContent className="w-96" side="right">
        <div className="space-y-3">
          {/* Header */}
          <div>
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-base">{entry.name}</h4>
              <Badge variant="outline" className="text-xs">
                {entry.category}
              </Badge>
            </div>
            {entry.abbreviation && (
              <p className="text-sm text-gray-500 mt-1">
                Variable: <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">{entry.abbreviation}</code>
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <p className="text-sm text-gray-700">{entry.fullDescription}</p>
          </div>

          {/* Calculation */}
          {entry.calculation && (
            <div className="border-t pt-2">
              <p className="text-xs font-semibold text-gray-600 mb-1">Calculation:</p>
              <code className="text-xs bg-blue-50 px-2 py-1 rounded block">
                {entry.calculation}
              </code>
            </div>
          )}

          {/* Example */}
          {entry.example && (
            <div className="border-t pt-2">
              <p className="text-xs font-semibold text-gray-600 mb-1">Example:</p>
              <p className="text-sm font-mono text-blue-600">{entry.example}</p>
            </div>
          )}

          {/* Related Metrics */}
          {entry.relatedMetrics && entry.relatedMetrics.length > 0 && (
            <div className="border-t pt-2">
              <p className="text-xs font-semibold text-gray-600 mb-1">Related Metrics:</p>
              <div className="flex flex-wrap gap-1">
                {entry.relatedMetrics.slice(0, 4).map((relatedKey) => {
                  const relatedEntry = getGlossaryEntry(relatedKey);
                  return (
                    <Badge key={relatedKey} variant="secondary" className="text-xs">
                      {relatedEntry?.abbreviation || relatedKey}
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}

/**
 * Inline glossary indicator - shows info icon with tooltip
 */
export function GlossaryIndicator({ variableKey }: { variableKey: string }) {
  const entry = getGlossaryEntry(variableKey);

  if (!entry) return null;

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <InfoIcon className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-help inline-block ml-1" />
        </TooltipTrigger>
        <TooltipContent className="max-w-sm" side="top">
          <div className="space-y-1">
            <p className="font-semibold text-sm">{entry.name}</p>
            <p className="text-xs">{entry.shortDescription}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * Format value according to glossary format type
 */
export function formatGlossaryValue(variableKey: string, value: number): string {
  const entry = getGlossaryEntry(variableKey);
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
}

export default GlossaryTooltip;
