import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, Image, TouchableOpacity,
  StyleSheet, ActivityIndicator, Dimensions, Alert, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import api from '../api';

const { width: W } = Dimensions.get('window');
const CARD_W = (W - 48) / 2;

export default function SavedScreen({ navigation }) {
  const { profileId } = useAuth();
  const [myList, setMyList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchList = useCallback(async () => {
    if (!profileId) { setLoading(false); return; }
    try {
      const data = await api.getSaved(profileId);
      setMyList(
        (data?.saved || []).map(s => ({
          id: s.movieId,
          title: s.movieTitle,
          poster_path: s.posterPath,
        }))
      );
    } catch (e) {
      console.error('Saved fetch error:', e);
    } finally {
      setLoading(false);
    }
  }, [profileId]);

  useEffect(() => { fetchList(); }, [fetchList]);

  async function onRefresh() {
    setRefreshing(true);
    await fetchList();
    setRefreshing(false);
  }

  async function removeItem(movieId) {
    Alert.alert('Remove', 'Remove from your list?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove', style: 'destructive',
        onPress: async () => {
          try {
            await api.removeSaved(profileId, movieId);
            setMyList(prev => prev.filter(i => i.id !== movieId));
          } catch (e) { console.error('Remove error:', e); }
        },
      },
    ]);
  }

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#fff" /></View>;
  }

  if (!profileId) {
    return (
      <View style={styles.container}>
        <Text style={styles.pageTitle}>My List</Text>
        <View style={styles.center}>
          <Ionicons name="person-outline" size={48} color="#333" />
          <Text style={styles.emptyTitle}>No profile selected</Text>
          <Text style={styles.emptySubtitle}>Go to Settings to select a profile</Text>
        </View>
      </View>
    );
  }

  if (myList.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.pageTitle}>My List</Text>
        <View style={styles.center}>
          <Ionicons name="heart-outline" size={56} color="#333" />
          <Text style={styles.emptyTitle}>Your list is empty</Text>
          <Text style={styles.emptySubtitle}>Save movies and shows to watch later</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.pageTitle}>My List</Text>
      <Text style={styles.pageSubtitle}>{myList.length} title{myList.length !== 1 ? 's' : ''}</Text>
      <FlatList
        data={myList}
        keyExtractor={item => String(item.id)}
        numColumns={2}
        contentContainerStyle={styles.grid}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" colors={['#3b82f6']} />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('MovieDetail', { id: item.id, isTV: false })}
          >
            <View style={styles.imageWrap}>
              <Image
                source={{ uri: `https://image.tmdb.org/t/p/w342${item.poster_path}` }}
                style={styles.image}
              />
              <View style={styles.playOverlay}>
                <View style={styles.playBtn}>
                  <Ionicons name="play" size={20} color="#000" style={{ marginLeft: 2 }} />
                </View>
              </View>
              <TouchableOpacity
                style={styles.removeBtn}
                onPress={() => removeItem(item.id)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close" size={14} color="#fff" />
              </TouchableOpacity>
            </View>
            <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a', paddingTop: 52 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0a0a0a', paddingHorizontal: 32, gap: 8 },
  pageTitle: { color: '#fff', fontSize: 30, fontWeight: '900', paddingHorizontal: 16, marginBottom: 2 },
  pageSubtitle: { color: '#555', fontSize: 13, paddingHorizontal: 16, marginBottom: 16 },
  grid: { paddingHorizontal: 12, paddingBottom: 100 },
  card: { width: CARD_W, margin: 6 },
  imageWrap: { width: CARD_W, height: CARD_W * 1.5, borderRadius: 12, overflow: 'hidden', backgroundColor: '#1a1a1a' },
  image: { width: '100%', height: '100%' },
  playOverlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  playBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.9)', alignItems: 'center', justifyContent: 'center' },
  removeBtn: { position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(0,0,0,0.75)', alignItems: 'center', justifyContent: 'center' },
  cardTitle: { color: '#fff', fontSize: 12, fontWeight: '600', marginTop: 8, paddingHorizontal: 2 },
  emptyTitle: { color: '#fff', fontSize: 18, fontWeight: '700', textAlign: 'center' },
  emptySubtitle: { color: '#555', fontSize: 13, textAlign: 'center' },
});
