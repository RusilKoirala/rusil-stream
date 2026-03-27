import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View, Text, ScrollView, FlatList, Image, TouchableOpacity,
  StyleSheet, Dimensions, ActivityIndicator, TextInput, Modal,
  StatusBar, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import Logo from '../components/Logo';

const { width: W, height: H } = Dimensions.get('window');
const CARD_W = W * 0.34;
const CARD_H = CARD_W * 1.5;
const IMG = 'https://image.tmdb.org/t/p/';
const NAVBAR_H = 60;

// All deferred sections — fetched one at a time as user scrolls
const DEFERRED_SECTIONS = [
  { title: 'Popular TV Shows',     url: '/api/movies?type=popular&mediaType=tv' },
  { title: 'Top Rated Movies',     url: '/api/movies?type=top_rated&mediaType=movie' },
  { title: 'Top Rated TV',         url: '/api/movies?type=top_rated&mediaType=tv' },
  { title: 'Action Blockbusters',  url: '/api/movies?genre=28&mediaType=movie' },
  { title: 'Comedy Picks',         url: '/api/movies?genre=35&mediaType=movie' },
  { title: 'Sci-Fi Adventures',    url: '/api/movies?genre=878&mediaType=movie' },
  { title: 'Animation & Family',   url: '/api/movies?genre=16&mediaType=movie' },
  { title: 'Crime & Mystery',      url: '/api/movies?genre=80&mediaType=movie' },
];

function ContentCard({ item, onPress }) {
  const isTV = item.media_type === 'tv' || item.name;
  const title = item.title || item.name;
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={() => onPress(item)}>
      <View style={styles.cardImageWrap}>
        <Image source={{ uri: `${IMG}w342${item.poster_path}` }} style={styles.cardImage} />
        {isTV && <View style={styles.tvBadge}><Text style={styles.tvBadgeText}>TV</Text></View>}
        {item.watchedPercentage > 0 && (
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${item.watchedPercentage}%` }]} />
          </View>
        )}
        <View style={styles.playOverlay}>
          <View style={styles.playBtn}>
            <Ionicons name="play" size={16} color="#000" style={{ marginLeft: 2 }} />
          </View>
        </View>
      </View>
      <Text style={styles.cardTitle} numberOfLines={1}>{title}</Text>
    </TouchableOpacity>
  );
}

function Carousel({ title, items, onCardPress }) {
  if (!items?.length) return null;
  return (
    <View style={styles.carousel}>
      <Text style={styles.carouselTitle}>{title}</Text>
      <FlatList
        data={items}
        keyExtractor={item => String(item.id)}
        renderItem={({ item }) => <ContentCard item={item} onPress={onCardPress} />}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.carouselList}
      />
    </View>
  );
}

// Lazy section — only fetches when it becomes visible in the scroll
function LazySection({ title, url, onCardPress, unlockedIndex, myIndex, onLoaded }) {
  const [items, setItems] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (loaded || unlockedIndex < myIndex) return;
    const baseUrl = process.env.EXPO_PUBLIC_API_URL ?? 'https://api.rusilstream.app';
    fetch(`${baseUrl}${url}`)
      .then(r => r.json())
      .then(d => { setItems(d?.results || []); })
      .catch(() => {})
      .finally(() => { setLoaded(true); onLoaded?.(); });
  }, [unlockedIndex, myIndex, loaded]);

  if (!loaded) {
    return (
      <View style={styles.skeletonSection}>
        <Text style={styles.carouselTitle}>{title}</Text>
        <View style={styles.skeletonRow}>
          {[0,1,2,3].map(i => <View key={i} style={styles.skeletonCard} />)}
        </View>
      </View>
    );
  }

  return <Carousel title={title} items={items} onCardPress={onCardPress} />;
}

export default function HomeScreen({ navigation }) {
  const { user, profileId } = useAuth();
  const [trending, setTrending] = useState([]);
  const [movies, setMovies] = useState([]);
  const [continueWatching, setContinueWatching] = useState([]);
  const [myList, setMyList] = useState([]);
  const [heroIndex, setHeroIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [unlockedSection, setUnlockedSection] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const searchTimeout = useRef(null);

  useEffect(() => {
    async function init() {
      try {
        const [trendingData, moviesData] = await Promise.all([
          api.getTrending(),
          api.getPopular(),
        ]);
        setTrending(trendingData?.results || []);
        setMovies(moviesData?.results || []);
        if (profileId) {
          const [historyData, savedData] = await Promise.all([
            api.getHistory(profileId).catch(() => null),
            api.getSaved(profileId).catch(() => null),
          ]);
          if (historyData?.history?.length) {
            setContinueWatching(historyData.history.map(h => ({
              id: h.movieId, title: h.movieTitle,
              poster_path: h.posterPath, watchedPercentage: h.watchedPercentage,
            })));
          }
          if (savedData?.saved?.length) {
            setMyList(savedData.saved.map(s => ({
              id: s.movieId, title: s.movieTitle, poster_path: s.posterPath,
            })));
          }
        }
      } catch (e) {
        console.error('Home init error:', e);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [user, profileId]);

  useEffect(() => {
    if (trending.length < 2) return;
    const t = setInterval(() => setHeroIndex(p => (p + 1) % Math.min(trending.length, 5)), 8000);
    return () => clearInterval(t);
  }, [trending]);

  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (searchTerm.trim().length < 2) { setSearchResults([]); return; }
    setSearchLoading(true);
    searchTimeout.current = setTimeout(async () => {
      try {
        const data = await api.searchContent(searchTerm.trim());
        setSearchResults((data?.results || []).filter(m => m.poster_path));
      } catch { setSearchResults([]); }
      finally { setSearchLoading(false); }
    }, 350);
    return () => clearTimeout(searchTimeout.current);
  }, [searchTerm]);

  async function refresh() {
    setRefreshing(true);
    setUnlockedSection(0);
    try {
      const [trendingData, moviesData] = await Promise.all([
        api.getTrending(),
        api.getPopular(),
      ]);
      setTrending(trendingData?.results || []);
      setMovies(moviesData?.results || []);
      if (profileId) {
        const [historyData, savedData] = await Promise.all([
          api.getHistory(profileId).catch(() => null),
          api.getSaved(profileId).catch(() => null),
        ]);
        if (historyData?.history?.length) {
          setContinueWatching(historyData.history.map(h => ({
            id: h.movieId, title: h.movieTitle,
            poster_path: h.posterPath, watchedPercentage: h.watchedPercentage,
          })));
        }
        if (savedData?.saved?.length) {
          setMyList(savedData.saved.map(s => ({
            id: s.movieId, title: s.movieTitle, poster_path: s.posterPath,
          })));
        }
      }
    } catch (e) {
      console.error('Refresh error:', e);
    } finally {
      setRefreshing(false);
    }
  }

  const handleCardPress = useCallback((item) => {
    const isTV = item.media_type === 'tv' || item.name;
    navigation.navigate('MovieDetail', { id: item.id, isTV });
  }, [navigation]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  const featured = trending[heroIndex];
  const featuredTitle = featured?.title || featured?.name;
  const featuredIsTV = featured?.media_type === 'tv' || featured?.name;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Fixed navbar — logo + search */}
      <View style={styles.navbar}>
        <Logo size={0.82} />
        <TouchableOpacity style={styles.searchBtn} onPress={() => setSearchOpen(true)} activeOpacity={0.7}>
          <View style={styles.searchBtnInner}>
            <Ionicons name="search-outline" size={20} color="#fff" />
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor="#fff"
            colors={['#3b82f6']}
          />
        }
        // Unlock next deferred section when user scrolls near the bottom
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          const nearBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 600;
          if (nearBottom) setUnlockedSection(prev => Math.min(prev + 1, DEFERRED_SECTIONS.length - 1));
        }}
        scrollEventThrottle={200}
      >
        {/* Hero */}
        {featured && (
          <View style={styles.hero}>
            <Image
              source={{ uri: `${IMG}w780${featured.backdrop_path || featured.poster_path}` }}
              style={styles.heroImage}
            />
            <View style={styles.heroGradient} />
            <View style={styles.heroContent}>
              {featuredIsTV && (
                <View style={styles.tvSeriesBadge}>
                  <Text style={styles.tvSeriesBadgeText}>TV SERIES</Text>
                </View>
              )}
              <Text style={styles.heroTitle}>{featuredTitle}</Text>
              {featured.vote_average > 0 && (
                <View style={styles.ratingRow}>
                  <Ionicons name="star" size={13} color="#eab308" />
                  <Text style={styles.ratingText}>{featured.vote_average.toFixed(1)}</Text>
                </View>
              )}
              <Text style={styles.heroOverview} numberOfLines={3}>{featured.overview}</Text>
              <View style={styles.heroButtons}>
                <TouchableOpacity
                  style={styles.playNowBtn}
                  activeOpacity={0.85}
                  onPress={() => navigation.navigate('MovieDetail', { id: featured.id, isTV: featuredIsTV })}
                >
                  <Ionicons name="play" size={15} color="#000" />
                  <Text style={styles.playNowText}>Play Now</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.moreInfoBtn}
                  activeOpacity={0.85}
                  onPress={() => navigation.navigate('MovieDetail', { id: featured.id, isTV: featuredIsTV })}
                >
                  <Ionicons name="information-circle-outline" size={17} color="#fff" />
                  <Text style={styles.moreInfoText}>More Info</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.heroDots}>
              {trending.slice(0, 5).map((_, i) => (
                <TouchableOpacity key={i} onPress={() => setHeroIndex(i)}>
                  <View style={[styles.dot, i === heroIndex && styles.dotActive]} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Immediate sections */}
        <View style={styles.content}>
          {continueWatching.length > 0 && (
            <Carousel title="Continue Watching" items={continueWatching} onCardPress={handleCardPress} />
          )}
          {myList.length > 0 && (
            <Carousel title="My List" items={myList} onCardPress={handleCardPress} />
          )}
          <Carousel title="Trending Now" items={trending} onCardPress={handleCardPress} />
          <Carousel title="Popular Movies" items={movies} onCardPress={handleCardPress} />

          {/* Deferred sections — load one at a time as user scrolls */}
          {DEFERRED_SECTIONS.map((section, index) => (
            <LazySection
              key={section.title}
              title={section.title}
              url={section.url}
              onCardPress={handleCardPress}
              unlockedIndex={unlockedSection}
              myIndex={index}
              onLoaded={() => setUnlockedSection(prev => Math.max(prev, index + 1))}
            />
          ))}
        </View>
      </ScrollView>

      {/* Search Modal */}
      <Modal visible={searchOpen} animationType="slide" statusBarTranslucent>
        <View style={styles.searchModal}>
          <View style={styles.searchHeader}>
            <TouchableOpacity
              onPress={() => { setSearchOpen(false); setSearchTerm(''); setSearchResults([]); }}
              style={styles.backBtn}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <View style={styles.searchInputWrap}>
              <Ionicons name="search" size={17} color="#555" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search movies and TV shows..."
                placeholderTextColor="#555"
                value={searchTerm}
                onChangeText={setSearchTerm}
                autoFocus
              />
              {!!searchTerm && (
                <TouchableOpacity onPress={() => { setSearchTerm(''); setSearchResults([]); }}>
                  <Ionicons name="close-circle" size={17} color="#555" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {searchLoading ? (
            <View style={styles.searchCenter}>
              <ActivityIndicator size="large" color="#fff" />
            </View>
          ) : searchResults.length > 0 ? (
            <FlatList
              data={searchResults}
              keyExtractor={item => String(item.id)}
              numColumns={3}
              contentContainerStyle={styles.searchGrid}
              renderItem={({ item }) => {
                const title = item.title || item.name;
                return (
                  <TouchableOpacity
                    style={styles.searchCard}
                    onPress={() => {
                      setSearchOpen(false);
                      navigation.navigate('MovieDetail', {
                        id: item.id,
                        isTV: item.media_type === 'tv' || !!item.name,
                      });
                    }}
                    activeOpacity={0.8}
                  >
                    <Image source={{ uri: `${IMG}w342${item.poster_path}` }} style={styles.searchCardImage} />
                    <Text style={styles.searchCardTitle} numberOfLines={1}>{title}</Text>
                  </TouchableOpacity>
                );
              }}
            />
          ) : searchTerm.length >= 2 ? (
            <View style={styles.searchCenter}>
              <Text style={styles.noResults}>No results for "{searchTerm}"</Text>
            </View>
          ) : (
            <View style={styles.searchCenter}>
              <Ionicons name="search" size={48} color="#333" />
              <Text style={styles.searchHint}>Search Movies & TV Shows</Text>
              <Text style={styles.searchHintSub}>Start typing to find content</Text>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0a0a0a' },

  // Navbar — absolute over hero, transparent, scrolls with content
  navbar: {
    position: 'absolute', top: 36, left: 0, right: 0, zIndex: 100,
    height: NAVBAR_H,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  searchBtn: { padding: 4 },
  searchBtnInner: {
    width: 38, height: 38, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center', justifyContent: 'center',
  },

  // Hero
  hero: { width: W, height: H * 0.6 },
  heroImage: { width: '100%', height: '100%', position: 'absolute' },
  heroGradient: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(10,10,10,0.45)' },
  heroContent: { position: 'absolute', bottom: 48, left: 16, right: 16 },
  tvSeriesBadge: {
    backgroundColor: '#3b82f6', borderRadius: 6, paddingHorizontal: 10,
    paddingVertical: 4, alignSelf: 'flex-start', marginBottom: 8,
  },
  tvSeriesBadgeText: { color: '#fff', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  heroTitle: { color: '#fff', fontSize: 26, fontWeight: '900', marginBottom: 8, lineHeight: 32 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8 },
  ratingText: { color: '#eab308', fontWeight: '700', fontSize: 13 },
  heroOverview: { color: '#ccc', fontSize: 13, lineHeight: 19, marginBottom: 16 },
  heroButtons: { flexDirection: 'row', gap: 10 },
  playNowBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#fff', borderRadius: 10,
    paddingHorizontal: 20, paddingVertical: 12, flex: 1, justifyContent: 'center',
  },
  playNowText: { color: '#000', fontWeight: '800', fontSize: 14 },
  moreInfoBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 10,
    paddingHorizontal: 20, paddingVertical: 12, flex: 1, justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
  },
  moreInfoText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  heroDots: { position: 'absolute', bottom: 16, right: 16, flexDirection: 'row', gap: 6 },
  dot: { width: 20, height: 3, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.3)' },
  dotActive: { width: 32, backgroundColor: '#fff' },

  // Content
  content: { paddingTop: 8, paddingBottom: 80 },
  carousel: { marginBottom: 28 },
  carouselTitle: { color: '#fff', fontSize: 17, fontWeight: '800', marginBottom: 12, paddingHorizontal: 16 },
  carouselList: { paddingHorizontal: 16, gap: 10 },

  // Card
  card: { width: CARD_W, marginRight: 10 },
  cardImageWrap: { width: CARD_W, height: CARD_H, borderRadius: 10, overflow: 'hidden', backgroundColor: '#1a1a1a' },
  cardImage: { width: '100%', height: '100%' },
  tvBadge: {
    position: 'absolute', top: 6, right: 6, backgroundColor: '#3b82f6',
    borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2,
  },
  tvBadgeText: { color: '#fff', fontSize: 9, fontWeight: '800' },
  progressBar: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, backgroundColor: '#333' },
  progressFill: { height: '100%', backgroundColor: '#3b82f6' },
  playOverlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  playBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.9)', alignItems: 'center', justifyContent: 'center',
  },
  cardTitle: { color: '#ccc', fontSize: 11, fontWeight: '600', marginTop: 6, paddingHorizontal: 2 },

  // Skeleton
  skeletonSection: { marginBottom: 28 },
  skeletonRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 10 },
  skeletonCard: {
    width: CARD_W, height: CARD_H, borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },

  // Search modal
  searchModal: { flex: 1, backgroundColor: '#0a0a0a' },
  searchHeader: {
    flexDirection: 'row', alignItems: 'center', padding: 16, paddingTop: 52,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)', gap: 12,
  },
  backBtn: { padding: 4 },
  searchInputWrap: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 10,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', gap: 8,
  },
  searchInput: { flex: 1, color: '#fff', fontSize: 15 },
  searchCenter: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  noResults: { color: '#666', fontSize: 16 },
  searchHint: { color: '#888', fontSize: 18, fontWeight: '700', marginTop: 12 },
  searchHintSub: { color: '#444', fontSize: 14 },
  searchGrid: { padding: 12 },
  searchCard: { flex: 1 / 3, margin: 4 },
  searchCardImage: { width: '100%', aspectRatio: 2 / 3, borderRadius: 8, backgroundColor: '#1a1a1a' },
  searchCardTitle: { color: '#aaa', fontSize: 11, marginTop: 4, textAlign: 'center' },
});
