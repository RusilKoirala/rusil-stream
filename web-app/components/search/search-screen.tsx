'use client';

import { useEffect, useState } from 'react';
import { useContentSearch } from '@/lib/hooks/use-content';
import { ContentCard } from '@/components/content';
import { CardGridSkeleton, LoadingSpinner } from '@/components/ui/skeleton';
import { Search as SearchIcon } from 'lucide-react';

export function SearchScreen() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  const normalizedDebouncedQuery = debouncedQuery.trim();
  const canSearch = normalizedDebouncedQuery.length >= 2;

  // Only fetch when debouncedQuery changes
  const { data: results = [], isLoading, error } = useContentSearch(normalizedDebouncedQuery);

  return (
    <main className="mx-auto max-w-400 px-4 pb-16 pt-24 md:px-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-white">Search</h1>
        <p className="text-white/70">Find your favorite movies and TV shows</p>
      </div>

      {/* Search Input */}
      <div className="mt-8 relative">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white/50" />
          <input
            type="text"
            placeholder="Search movies, shows..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-lg border border-white/20 bg-white/5 py-2.5 pl-10 pr-4 text-white placeholder-white/40 focus:border-white/40 focus:bg-white/10 focus:outline-none transition-colors"
          />
        </div>
        {query.trim().length > 0 && query.trim().length < 2 ? (
          <p className="mt-2 text-xs text-white/55">Type at least 2 characters to search.</p>
        ) : null}
      </div>

      {/* Loading State */}
      {isLoading && canSearch ? (
        <div className="mt-8">
          <div className="flex items-center justify-center gap-2 mb-6">
            <LoadingSpinner size="sm" />
            <p className="text-white/70">Searching...</p>
          </div>
          <CardGridSkeleton count={12} />
        </div>
      ) : null}

      {/* Error State */}
      {!isLoading && error ? (
        <div className="mt-8 rounded-md border border-red-500/40 bg-red-950/30 p-4 text-sm text-red-200">
          Failed to search. Please try again.
        </div>
      ) : null}

      {/* Empty State - No Query */}
      {!canSearch && !isLoading ? (
        <div className="mt-16 flex flex-col items-center justify-center gap-4 py-12 text-center">
          <SearchIcon className="h-16 w-16 text-white/20" />
          <div>
            <p className="text-white/70">Start typing to search</p>
            <p className="text-sm text-white/50">Search by movie or show title</p>
          </div>
        </div>
      ) : null}

      {/* No Results State */}
      {!isLoading && canSearch && results.length === 0 ? (
        <div className="mt-8 rounded-md border border-white/10 bg-white/5 p-6 text-center">
          <p className="text-white/70">No results found for "{query}"</p>
          <p className="text-sm text-white/50 mt-1">Try a different search term</p>
        </div>
      ) : null}

      {/* Results Grid */}
      {!isLoading && canSearch && results.length > 0 ? (
        <div className="mt-8">
          <p className="text-sm text-white/70 mb-4">
            Found {results.length} result{results.length !== 1 ? 's' : ''}
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {results.map((item: any, idx: number) => {
              const position = idx % 6 === 0 ? 'start' : idx % 6 === 5 ? 'end' : 'middle';
              return (
                <ContentCard
                  key={`${item.type}-${item.id}`}
                  content={item}
                  position={position}
                />
              );
            })}
          </div>
        </div>
      ) : null}
    </main>
  );
}
