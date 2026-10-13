'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { ContentCard } from '@/components/content';
import { CardGridSkeleton } from '@/components/ui/skeleton';
import { useQuery } from '@tanstack/react-query';
import type { Content } from '@/lib/tmdb/types';

interface SearchResults {
  movies: Content[];
  tvShows: Content[];
  people: any[];
  totalResults: number;
}

export function SearchTab() {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery.trim()) return null;
      const response = await fetch(`/api/content/search?query=${encodeURIComponent(debouncedQuery)}`);
      if (!response.ok) throw new Error('Search failed');
      return response.json() as Promise<SearchResults>;
    },
    enabled: debouncedQuery.length > 0,
    staleTime: 1000 * 60 * 5,
  });

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    const timer = setTimeout(() => setDebouncedQuery(value), 500);
    return () => clearTimeout(timer);
  };

  // Combine movies and TV shows into a single array
  const results: Content[] = searchResults 
    ? [...searchResults.movies, ...searchResults.tvShows]
    : [];

  return (
    <main className="mx-auto max-w-400 px-4 pb-16 pt-24 md:px-8">
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        {/* Header */}
        <div className="text-center mb-8 space-y-3">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white">
            What are you watching?
          </h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            Search movies and TV shows, then pick up exactly where you left off.
          </p>
        </div>

        {/* Search Input */}
        <div className="w-full max-w-3xl mb-12">
          <div className="relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search movies, shows, people..."
              className="w-full h-16 pl-16 pr-6 bg-[#2a2a2a] border border-white/10 rounded-full text-white placeholder:text-white/40 focus:outline-none focus:border-white/30 focus:bg-[#333] transition-all"
            />
          </div>
        </div>

        {/* Results */}
        {isLoading && debouncedQuery ? (
          <div className="w-full">
            <CardGridSkeleton count={12} />
          </div>
        ) : null}

        {!isLoading && results.length > 0 ? (
          <div className="w-full">
            <h2 className="text-xl font-semibold text-white mb-4">
              {searchResults?.totalResults ? `${searchResults.totalResults} results` : 'Search Results'}
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {results.slice(0, 12).map((item: Content, idx: number) => {
                const position = idx % 6 === 0 ? 'start' : idx % 6 === 5 ? 'end' : 'middle';
                return (
                  <ContentCard
                    key={`search-${item.type}-${item.id}`}
                    content={item}
                    position={position}
                  />
                );
              })}
            </div>
          </div>
        ) : null}

        {!isLoading && debouncedQuery && results.length === 0 ? (
          <div className="text-center text-white/60">
            No results found for "{debouncedQuery}"
          </div>
        ) : null}
      </div>
    </main>
  );
}
