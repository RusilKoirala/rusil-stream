import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { searchContent } from '@/lib/api';

export function useSearchContent(query: string) {
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 350);
    return () => clearTimeout(timer);
  }, [query]);

  return useQuery({
    queryKey: ['tv-search', debouncedQuery],
    queryFn: () => searchContent(debouncedQuery),
    enabled: debouncedQuery.trim().length > 1,
    staleTime: 2 * 60_000,
  });
}
