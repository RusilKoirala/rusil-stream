import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, FlatList, Image, TouchableOpacity,
  StyleSheet, ActivityIndicator, Dimensions, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 48) / 3;
const IMAGE_BASE = 'https://image.tmdb.org/t/p/w342';

export default function SearchScreen({ navigation }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const searchTimeout = useRef(null);

  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (searchTerm.trim().length < 2) { setResults([]); return; }
    setLoading(true);
    searchTimeout.current = setTimeout(async () => {
      try {
        const data = await api.searchContent(searchTerm.trim());
        setResults((data?.results || []).filter(m => m.poster_path));
      } catch { setResults([]); }
      finally { setLoading(false); }
    }, 350);
    return () => clearTimeout(searchTimeout.current);
  }, [searchTerm]);

  return (
    <View style={styles.container}>
      {/* Search bar */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color="#555" />
        <TextInput
          style={styles.input}
          placeholder="Search movies and TV shows..."
          placeholderTextColor="#555"
          value={searchTerm}
          onChangeText={setSearchTerm}
          autoCapitalize="none"
        />
        {!!searchTerm && (
          <TouchableOpacity onPress={() => { setSearchTerm(''); setResults([]); }}>
            <Ionicons name="close-circle" size={18} color="#555" />
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      ) : results.length > 0 ? (
        <>
          <Text style={styles.resultsLabel}>Results for "{searchTerm}"</Text>
          <FlatList
            data={results}
            keyExtractor={item => String(item.id)}
            numColumns={3}
            contentContainerStyle={styles.grid}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => { setRefreshing(true); setSearchTerm(''); setResults([]); setRefreshing(false); }}
                tintColor="#fff"
                colors={['#3b82f6']}
              />
            }
            renderItem={({ item }) => {
              const title = item.title || item.name;
              const isTV = item.media_type === 'tv' || item.name;
              return (
                <TouchableOpacity
                  style={styles.card}
                  activeOpacity={0.8}
                  onPress={() => navigation.navigate('MovieDetail', { id: item.id, isTV: item.media_type === 'tv' || !!item.name })}
                >
                  <View style={styles.imageWrap}>
                    <Image
                      source={{ uri: `${IMAGE_BASE}${item.poster_path}` }}
                      style={styles.image}
                    />
                    {isTV && (
                      <View style={styles.tvBadge}>
                        <Text style={styles.tvBadgeText}>TV</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.cardTitle} numberOfLines={1}>{title}</Text>
                </TouchableOpacity>
              );
            }}
          />
        </>
      ) : searchTerm.length >= 2 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>No results for "{searchTerm}"</Text>
        </View>
      ) : (
        <View style={styles.center}>
          <Ionicons name="search" size={48} color="#333" />
          <Text style={styles.emptyTitle}>Search Movies & TV Shows</Text>
          <Text style={styles.emptySubtitle}>Start typing to find your favorite content</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a', paddingTop: 52 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    marginHorizontal: 16,
    marginBottom: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    gap: 10,
  },
  searchIcon: { fontSize: 16 },
  input: { flex: 1, color: '#fff', fontSize: 15 },
  clearIcon: { color: '#888', fontSize: 14 },
  resultsLabel: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  grid: { paddingHorizontal: 12, paddingBottom: 100 },
  card: { width: CARD_WIDTH, margin: 4 },
  imageWrap: {
    width: CARD_WIDTH,
    height: CARD_WIDTH * 1.5,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
  },
  image: { width: '100%', height: '100%' },
  tvBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: '#3b82f6',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  tvBadgeText: { color: '#fff', fontSize: 9, fontWeight: '800' },
  cardTitle: { color: '#ccc', fontSize: 11, marginTop: 5, textAlign: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { color: '#888', fontSize: 18, fontWeight: '700', marginBottom: 8, textAlign: 'center' },
  emptySubtitle: { color: '#555', fontSize: 14, textAlign: 'center' },
  emptyText: { color: '#888', fontSize: 16 },
});
