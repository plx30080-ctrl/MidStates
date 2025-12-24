/**
 * GlossarySearch Component
 * Searchable dialog for exploring variable definitions
 */

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpenIcon, SearchIcon, SparklesIcon } from 'lucide-react';
import { useGlossary } from '@/hooks/useGlossary';
import type { GlossaryEntry, GlossaryCategory } from '@/lib/glossaryTypes';
import { generateAIInsight } from '@/lib/openai';

interface GlossarySearchProps {
  /** Optional trigger button text */
  triggerText?: string;
  /** Optional trigger button variant */
  variant?: 'default' | 'outline' | 'ghost';
}

export function GlossarySearch({
  triggerText = 'Variables Glossary',
  variant = 'outline',
}: GlossarySearchProps) {
  const [open, setOpen] = useState(false);
  const { searchQuery, setSearchQuery, searchResults, categories, getByCategory } = useGlossary();
  const [selectedEntry, setSelectedEntry] = useState<GlossaryEntry | null>(null);
  const [aiExplanation, setAiExplanation] = useState<string>('');
  const [loadingAI, setLoadingAI] = useState(false);

  const handleAIExplain = async (entry: GlossaryEntry) => {
    setLoadingAI(true);
    setAiExplanation('');
    try {
      const context = `
Variable: ${entry.name} (${entry.abbreviation})
Description: ${entry.fullDescription}
${entry.calculation ? `Calculation: ${entry.calculation}` : ''}
Category: ${entry.category}
      `.trim();

      const question = 'Explain this business metric in simple terms and provide insights on how to improve it.';
      const response = await generateAIInsight(context, question);
      setAiExplanation(response);
    } catch (error) {
      setAiExplanation('AI explanation unavailable. Please check your API key configuration.');
    } finally {
      setLoadingAI(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} className="gap-2">
          <BookOpenIcon className="h-4 w-4" />
          {triggerText}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Variables Glossary</DialogTitle>
          <DialogDescription>
            Search and explore all business metrics and their definitions
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search variables, metrics, or descriptions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <Tabs defaultValue="search" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="search">
                <SearchIcon className="h-4 w-4 mr-2" />
                Search Results ({searchResults.length})
              </TabsTrigger>
              <TabsTrigger value="categories">
                <BookOpenIcon className="h-4 w-4 mr-2" />
                Browse by Category
              </TabsTrigger>
            </TabsList>

            <TabsContent value="search" className="space-y-2">
              <ScrollArea className="h-[400px] pr-4">
                {searchResults.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <SearchIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>No variables found matching "{searchQuery}"</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {searchResults.map((entry) => (
                      <GlossaryEntryCard
                        key={entry.key}
                        entry={entry}
                        onSelect={setSelectedEntry}
                        onAIExplain={handleAIExplain}
                        isSelected={selectedEntry?.key === entry.key}
                        aiExplanation={selectedEntry?.key === entry.key ? aiExplanation : ''}
                        loadingAI={loadingAI && selectedEntry?.key === entry.key}
                      />
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="categories" className="space-y-2">
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-4">
                  {Object.entries(categories).map(([key, category]) => {
                    const categoryEntries = getByCategory(key as GlossaryCategory);
                    return (
                      <div key={key} className="border rounded-lg p-4">
                        <div className="mb-3">
                          <h3 className="font-semibold text-sm">{category.name}</h3>
                          <p className="text-xs text-gray-500">{category.description}</p>
                        </div>
                        <div className="space-y-2">
                          {categoryEntries.map((entry) => (
                            <GlossaryEntryCard
                              key={entry.key}
                              entry={entry}
                              onSelect={setSelectedEntry}
                              onAIExplain={handleAIExplain}
                              isSelected={selectedEntry?.key === entry.key}
                              aiExplanation={selectedEntry?.key === entry.key ? aiExplanation : ''}
                              loadingAI={loadingAI && selectedEntry?.key === entry.key}
                              compact
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface GlossaryEntryCardProps {
  entry: GlossaryEntry;
  onSelect: (entry: GlossaryEntry) => void;
  onAIExplain: (entry: GlossaryEntry) => void;
  isSelected: boolean;
  aiExplanation: string;
  loadingAI: boolean;
  compact?: boolean;
}

function GlossaryEntryCard({
  entry,
  onSelect,
  onAIExplain,
  isSelected,
  aiExplanation,
  loadingAI,
  compact = false,
}: GlossaryEntryCardProps) {
  return (
    <div
      className={`border rounded-lg p-3 hover:bg-gray-50 cursor-pointer transition-colors ${
        isSelected ? 'border-blue-500 bg-blue-50' : ''
      }`}
      onClick={() => onSelect(entry)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-sm truncate">{entry.name}</h4>
            {entry.abbreviation && (
              <Badge variant="secondary" className="text-xs shrink-0">
                {entry.abbreviation}
              </Badge>
            )}
          </div>
          <p className="text-xs text-gray-600 mb-2">
            {compact ? entry.shortDescription : entry.fullDescription}
          </p>

          {!compact && entry.calculation && (
            <div className="mb-2">
              <p className="text-xs font-semibold text-gray-500 mb-1">Calculation:</p>
              <code className="text-xs bg-gray-100 px-2 py-1 rounded block">
                {entry.calculation}
              </code>
            </div>
          )}

          {!compact && entry.example && (
            <p className="text-xs text-gray-500">
              <span className="font-semibold">Example:</span>{' '}
              <span className="font-mono text-blue-600">{entry.example}</span>
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1 shrink-0">
          <Badge variant="outline" className="text-xs">
            {entry.category}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {entry.format}
          </Badge>
        </div>
      </div>

      {/* AI Explanation Section */}
      {isSelected && (
        <div className="mt-3 pt-3 border-t">
          <Button
            size="sm"
            variant="outline"
            className="w-full gap-2"
            onClick={(e) => {
              e.stopPropagation();
              onAIExplain(entry);
            }}
            disabled={loadingAI}
          >
            <SparklesIcon className="h-4 w-4" />
            {loadingAI ? 'Generating AI Insights...' : 'Get AI Explanation'}
          </Button>

          {aiExplanation && (
            <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs font-semibold text-blue-900 mb-1 flex items-center gap-1">
                <SparklesIcon className="h-3 w-3" />
                AI Insights
              </p>
              <p className="text-xs text-blue-800 whitespace-pre-line">{aiExplanation}</p>
            </div>
          )}
        </div>
      )}

      {/* Related Metrics */}
      {!compact && entry.relatedMetrics && entry.relatedMetrics.length > 0 && (
        <div className="mt-2 pt-2 border-t">
          <p className="text-xs font-semibold text-gray-500 mb-1">Related:</p>
          <div className="flex flex-wrap gap-1">
            {entry.relatedMetrics.slice(0, 5).map((relatedKey) => (
              <Badge key={relatedKey} variant="secondary" className="text-xs">
                {relatedKey}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default GlossarySearch;
