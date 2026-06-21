import { useCallback, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Search, X } from 'lucide-react-native';
import { useSearchContent } from '@/hooks/useSearchContent';
import { useNavigation } from '@/navigation/NavigationContext';
import { ContentRow } from '@/components/home/ContentRow';
import { TVTopNav, type NavTab } from '@/components/ui/TVTopNav';
import { scrollVerticalRowToCenter } from '@/lib/focus-scroll';
import type { Content } from '@/types/content';

interface SearchScreenProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onLogout?: () => void;
  onChangeProfile?: () => void;
}

const NAV_HEIGHT = 84;

function withBackdrop(items: Content[]): Content[] {
  return items.filter((item) => Boolean(item.backdropPath || item.posterPath));
}

export function SearchScreen({ activeTab, onSelectTab, onLogout, onChangeProfile }: SearchScreenProps) {
  const { openDetails } = useNavigation();
  const [query, setQuery] = useState('');
  const [inputFocused, setInputFocused] = useState(false);
  const trimmed = query.trim();
  const scrollRef = useRef<ScrollView>(null);
  const contentRef = useRef<View>(null);

  const { data, isLoading, isError, refetch } = useSearchContent(trimmed);

  const movies = useMemo(
    () => withBackdrop(data?.movies ?? []).sort((a, b) => b.voteAverage - a.voteAverage),
    [data?.movies],
  );
  const tvShows = useMemo(
    () => withBackdrop(data?.tvShows ?? []).sort((a, b) => b.voteAverage - a.voteAverage),
    [data?.tvShows],
  );
  const totalResults = movies.length + tvShows.length;

  const scrollRowToCenter = useCallback((rowRef: View) => {
    scrollVerticalRowToCenter(scrollRef.current, contentRef.current, rowRef, NAV_HEIGHT);
  }, []);

  const openItem = useCallback(
    (item: Content) => openDetails({ id: item.id, type: item.type }),
    [openDetails],
  );

  return (
    <ScrollView
      ref={scrollRef}
      style={styles.scroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View ref={contentRef}>
        <TVTopNav active={activeTab} onSelect={onSelectTab} onLogout={onLogout} onChangeProfile={onChangeProfile} />
        <View style={styles.header}>
          <Text style={styles.heading}>Search</Text>
          <Text style={styles.subheading}>Find movies, series, and genres</Text>

          <View style={[styles.inputWrap, inputFocused && styles.inputWrapFocused]}>
            <Search size={18} color={inputFocused ? '#fff' : '#9AA3B2'} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Movies, shows, genres"
              placeholderTextColor="#7A7A7A"
              style={styles.input}
              autoCorrect={false}
              autoCapitalize="none"
              onFocus={() => setInputFocused(true)}
              onBlur={() => setInputFocused(false)}
            />
            {query.length > 0 ? (
              <TouchableOpacity style={styles.clearBtn} onPress={() => setQuery('')}>
                <X size={14} color="#D1D5DB" />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        {trimmed.length < 2 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>Start your search</Text>
            <Text style={styles.emptySub}>Type at least 2 characters to find titles.</Text>
          </View>
        ) : isLoading ? (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color="#E50914" />
            <Text style={styles.loadingText}>Searching…</Text>
          </View>
        ) : isError ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>Search failed</Text>
            <Text style={styles.emptySub}>Check your connection and try again.</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={() => { refetch(); }}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : totalResults === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No results</Text>
            <Text style={styles.emptySub}>Try a different title or keyword.</Text>
          </View>
        ) : (
          <View style={styles.results}>
            <Text style={styles.resultCount}>{totalResults} results</Text>
            {movies.length > 0 ? (
              <ContentRow
                title="Movies"
                items={movies}
                onPressItem={openItem}
                onRowFocus={scrollRowToCenter}
              />
            ) : null}
            {tvShows.length > 0 ? (
              <ContentRow
                title="TV Shows"
                items={tvShows}
                onPressItem={openItem}
                onRowFocus={scrollRowToCenter}
              />
            ) : null}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: '#050505' },
  content: { paddingBottom: 60 },
  header: { paddingHorizontal: 56, marginBottom: 24 },
  heading: { color: '#fff', fontSize: 32, fontWeight: '800' },
  subheading: { color: 'rgba(255,255,255,0.5)', fontSize: 15, marginTop: 6 },
  inputWrap: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: '#111319',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  inputWrapFocused: {
    borderColor: '#fff',
    backgroundColor: '#1C1F26',
  },
  input: { flex: 1, color: '#fff', fontSize: 16, padding: 0 },
  clearBtn: {
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 6,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 56,
    paddingVertical: 80,
  },
  emptyTitle: { color: '#fff', fontSize: 22, fontWeight: '700' },
  emptySub: { color: 'rgba(255,255,255,0.5)', fontSize: 15, marginTop: 8, textAlign: 'center' },
  loading: { alignItems: 'center', paddingVertical: 80 },
  loadingText: { color: 'rgba(255,255,255,0.6)', marginTop: 12, fontSize: 15 },
  retryBtn: {
    marginTop: 16,
    backgroundColor: '#E50914',
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  retryText: { color: '#fff', fontWeight: '700' },
  results: { gap: 24 },
  resultCount: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
    paddingHorizontal: 56,
  },
});
