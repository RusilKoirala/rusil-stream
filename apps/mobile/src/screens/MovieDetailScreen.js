import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, ScrollView, Image, TouchableOpacity, StyleSheet,
  Dimensions, ActivityIndicator, StatusBar, Animated, Modal, FlatList, Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import api from '../api';

const { width: W } = Dimensions.get('window');
const IMG = 'https://image.tmdb.org/t/p/';
const CARD_W = (W - 48) / 3;
const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'https://api.rusilstream.app';

const SOURCES = [
  { name: 'vidsrc.xyz', index: 0 },
  { name: 'vidsrc.in', index: 1 },
  { name: 'vidsrc.pm', index: 2 },
];

export default function MovieDetailScreen({ route, navigation }) {
  const { id, isTV = false } = route.params;
  const { profileId } = useAuth();
  const [movie, setMovie] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [sourceIndex, setSourceIndex] = useState(0);
  // TV episode state
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const [seasonEpisodes, setSeasonEpisodes] = useState([]);
  const [showEpisodePicker, setShowEpisodePicker] = useState(false);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    async function init() {
      try {
        const movieData = isTV
          ? await api.getTVDetail(id)
          : await api.getMovieDetail(id);
        setMovie(movieData);

        // For TV, fetch first season episodes immediately
        if (isTV && movieData) {
          fetchSeasonEpisodes(1);
        }

        if (profileId) {
          const savedData = await api.getSaved(profileId).catch(() => null);
          if (savedData?.saved) {
            setIsSaved(savedData.saved.some(s => s.movieId === parseInt(id)));
          }
        }

        if (movieData?.genres?.length) {
          const genreId = movieData.genres[0].id;
          const similarData = await fetch(`${BASE_URL}/api/movies?genre=${genreId}`)
            .then(r => r.json()).catch(() => null);
          setSimilar((similarData?.results || []).filter(m => m.id !== parseInt(id)).slice(0, 12));
        }
      } catch (e) {
        console.error('Movie detail error:', e);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [id, isTV, profileId]);

  async function fetchSeasonEpisodes(season) {
    setLoadingEpisodes(true);
    try {
      const res = await fetch(`${BASE_URL}/api/movies?tvId=${id}&season=${season}`);
      const data = await res.json();
      setSeasonEpisodes(data?.episodes || []);
      setSelectedEpisode(1);
    } catch { setSeasonEpisodes([]); }
    finally { setLoadingEpisodes(false); }
  }

  async function toggleSaved() {
    if (!profileId || !movie) return;
    try {
      if (isSaved) {
        await api.removeSaved(profileId, id);
        setIsSaved(false);
      } else {
        await api.addSaved(profileId, {
          movieId: parseInt(id),
          movieTitle: movie.title || movie.name,
          posterPath: movie.poster_path,
        });
        setIsSaved(true);
      }
    } catch (e) {
      console.error('Toggle saved error:', e);
    }
  }

  async function handleShare() {
    const title = movie?.title || movie?.name || 'Check this out';
    const url = `${process.env.EXPO_PUBLIC_WEB_URL ?? 'https://rusilstream.app'}/player/${id}`;
    try {
      await Share.share({
        title,
        message: `Watch "${title}" on Rusil Stream\n${url}`,
      });
    } catch (e) {
      console.error('Share error:', e);
    }
  }

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  if (!movie) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ color: '#fff' }}>Content not found</Text>
      </View>
    );
  }

  const title = movie.title || movie.name;
  const year = (movie.release_date || movie.first_air_date || '').slice(0, 4);
  const runtime = movie.runtime
    ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m`
    : null;
  const genres = (movie.genres || []).slice(0, 3).map(g => g.name).join(' · ');

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Sticky header */}
      <Animated.View style={[styles.stickyHeader, { opacity: headerOpacity }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.stickyTitle} numberOfLines={1}>{title}</Text>
        <TouchableOpacity onPress={toggleSaved} style={styles.saveBtn}>
          <Ionicons name={isSaved ? 'bookmark' : 'bookmark-outline'} size={22} color="#fff" />
        </TouchableOpacity>
      </Animated.View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        {/* Hero */}
        <View style={styles.hero}>
          <Image
            source={{ uri: `${IMG}w780${movie.backdrop_path || movie.poster_path}` }}
            style={styles.heroImage}
          />
          <View style={styles.heroGradient} />
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.heroBack}>
            <View style={styles.heroBackCircle}>
              <Ionicons name="arrow-back" size={20} color="#fff" />
            </View>
          </TouchableOpacity>
          <View style={styles.heroBottom}>
            <Image source={{ uri: `${IMG}w342${movie.poster_path}` }} style={styles.poster} />
            <View style={styles.heroInfo}>
              <Text style={styles.heroTitle} numberOfLines={2}>{title}</Text>
              <View style={styles.metaRow}>
                {year ? <Text style={styles.metaText}>{year}</Text> : null}
                {runtime ? <><View style={styles.metaDot} /><Text style={styles.metaText}>{runtime}</Text></> : null}
                {movie.vote_average > 0 && (
                  <><View style={styles.metaDot} />
                  <Ionicons name="star" size={12} color="#eab308" />
                  <Text style={[styles.metaText, { color: '#eab308' }]}>{movie.vote_average.toFixed(1)}</Text></>
                )}
              </View>
              {genres ? <Text style={styles.genreText}>{genres}</Text> : null}
            </View>
          </View>
        </View>

        {/* TV Season/Episode Picker */}
        {isTV && movie?.seasons && (
          <View style={styles.tvSection}>
            <Text style={styles.sourceLabel}>SEASON & EPISODE</Text>

            {/* Season selector */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.seasonScroll}>
              {movie.seasons
                .filter(s => s.season_number > 0)
                .map(s => (
                  <TouchableOpacity
                    key={s.season_number}
                    style={[styles.seasonBtn, selectedSeason === s.season_number && styles.seasonBtnActive]}
                    onPress={() => {
                      setSelectedSeason(s.season_number);
                      fetchSeasonEpisodes(s.season_number);
                    }}
                  >
                    <Text style={[styles.seasonBtnText, selectedSeason === s.season_number && styles.seasonBtnTextActive]}>
                      S{s.season_number}
                    </Text>
                  </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Episode list */}
            <TouchableOpacity
              style={styles.episodePickerBtn}
              onPress={() => setShowEpisodePicker(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="list" size={16} color="#fff" />
              <Text style={styles.episodePickerText}>
                {loadingEpisodes
                  ? 'Loading episodes...'
                  : `Episode ${selectedEpisode}${seasonEpisodes[selectedEpisode - 1]?.name ? ` — ${seasonEpisodes[selectedEpisode - 1].name}` : ''}`
                }
              </Text>
              <Ionicons name="chevron-down" size={16} color="#888" />
            </TouchableOpacity>
          </View>
        )}

        {/* Source selector */}
        <View style={styles.sourceSection}>
          <Text style={styles.sourceLabel}>SOURCE</Text>
          <View style={styles.sourceRow}>
            {SOURCES.map((s) => (
              <TouchableOpacity
                key={s.index}
                style={[styles.sourceBtn, sourceIndex === s.index && styles.sourceBtnActive]}
                onPress={() => setSourceIndex(s.index)}
              >
                <Text style={[styles.sourceBtnText, sourceIndex === s.index && styles.sourceBtnTextActive]}>
                  {s.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.playBtn}
            onPress={() => navigation.navigate('Player', {
              id, isTV, title,
              sourceIndex,
              season: selectedSeason,
              episode: selectedEpisode,
            })}
            activeOpacity={0.85}
          >
            <Ionicons name="play" size={18} color="#000" />
            <Text style={styles.playBtnText}>Play Now</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.saveActionBtn, isSaved && styles.saveActionBtnActive]}
            onPress={toggleSaved}
            activeOpacity={0.85}
          >
            <Ionicons name={isSaved ? 'bookmark' : 'bookmark-outline'} size={18} color={isSaved ? '#000' : '#fff'} />
            <Text style={[styles.saveActionBtnText, isSaved && { color: '#000' }]}>
              {isSaved ? 'Saved' : 'My List'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.shareBtn}
            onPress={handleShare}
            activeOpacity={0.85}
          >
            <Ionicons name="share-social-outline" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Overview */}
        {movie.overview ? (
          <View style={styles.section}>
            <Text style={styles.overview}>{movie.overview}</Text>
          </View>
        ) : null}

        {/* Similar */}
        {similar.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>More Like This</Text>
            <View style={styles.similarGrid}>
              {similar.map(item => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.similarCard}
                  onPress={() => navigation.push('MovieDetail', { id: item.id, isTV: !!item.name })}
                  activeOpacity={0.8}
                >
                  <Image source={{ uri: `${IMG}w342${item.poster_path}` }} style={styles.similarImage} />
                  <Text style={styles.similarTitle} numberOfLines={1}>{item.title || item.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <View style={{ height: 40 }} />
      </Animated.ScrollView>

      {/* Episode Picker Modal */}
      {isTV && (
        <Modal visible={showEpisodePicker} transparent animationType="slide">
          <View style={styles.episodeModalOverlay}>
            <View style={styles.episodeModalCard}>
              <View style={styles.episodeModalHeader}>
                <Text style={styles.episodeModalTitle}>
                  Season {selectedSeason} — {seasonEpisodes.length} Episodes
                </Text>
                <TouchableOpacity onPress={() => setShowEpisodePicker(false)}>
                  <Ionicons name="close" size={22} color="#fff" />
                </TouchableOpacity>
              </View>
              {loadingEpisodes ? (
                <View style={styles.episodeLoading}>
                  <ActivityIndicator color="#fff" />
                </View>
              ) : (
                <FlatList
                  data={seasonEpisodes}
                  keyExtractor={(_, i) => String(i)}
                  showsVerticalScrollIndicator={false}
                  renderItem={({ item, index }) => {
                    const epNum = index + 1;
                    const isSelected = selectedEpisode === epNum;
                    return (
                      <TouchableOpacity
                        style={[styles.episodeRow, isSelected && styles.episodeRowActive]}
                        onPress={() => {
                          setSelectedEpisode(epNum);
                          setShowEpisodePicker(false);
                        }}
                        activeOpacity={0.7}
                      >
                        <View style={[styles.epNumBadge, isSelected && styles.epNumBadgeActive]}>
                          <Text style={[styles.epNum, isSelected && styles.epNumActive]}>{epNum}</Text>
                        </View>
                        <View style={styles.epInfo}>
                          <Text style={[styles.epName, isSelected && { color: '#fff' }]} numberOfLines={1}>
                            {item.name || `Episode ${epNum}`}
                          </Text>
                          {item.air_date && (
                            <Text style={styles.epDate}>{item.air_date}</Text>
                          )}
                        </View>
                        {isSelected && <Ionicons name="checkmark" size={18} color="#3b82f6" />}
                      </TouchableOpacity>
                    );
                  }}
                />
              )}
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  loadingContainer: { flex: 1, backgroundColor: '#0a0a0a', alignItems: 'center', justifyContent: 'center' },

  stickyHeader: {
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100,
    flexDirection: 'row', alignItems: 'center',
    paddingTop: 48, paddingBottom: 12, paddingHorizontal: 16,
    backgroundColor: '#0a0a0a',
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  backBtn: { padding: 4, marginRight: 12 },
  stickyTitle: { flex: 1, color: '#fff', fontSize: 16, fontWeight: '700' },
  saveBtn: { padding: 4, marginLeft: 12 },

  hero: { width: W, height: W * 0.56, position: 'relative' },
  heroImage: { width: '100%', height: '100%', position: 'absolute' },
  heroGradient: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(10,10,10,0.3)' },
  heroBack: { position: 'absolute', top: 52, left: 16 },
  heroBackCircle: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.85)', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.4)',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.8, shadowRadius: 4,
    elevation: 8,
  },
  heroBottom: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'flex-end',
    padding: 16, paddingBottom: 20,
    backgroundColor: 'rgba(10,10,10,0.75)',
  },
  poster: { width: 72, height: 108, borderRadius: 10, marginRight: 14, backgroundColor: '#1a1a1a' },
  heroInfo: { flex: 1 },
  heroTitle: { color: '#fff', fontSize: 18, fontWeight: '900', marginBottom: 6, lineHeight: 24 },
  metaRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 4, marginBottom: 4 },
  metaText: { color: '#aaa', fontSize: 12 },
  metaDot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: '#555' },
  genreText: { color: '#666', fontSize: 11 },

  sourceSection: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 4 },
  sourceLabel: { color: '#444', fontSize: 10, fontWeight: '700', letterSpacing: 1.5, marginBottom: 8 },
  sourceRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  sourceBtn: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  sourceBtnActive: { backgroundColor: '#fff' },
  sourceBtnText: { color: '#666', fontSize: 12, fontWeight: '600' },
  sourceBtnTextActive: { color: '#000' },

  actions: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingVertical: 14 },
  playBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: '#fff', borderRadius: 12, paddingVertical: 14,
  },
  playBtnText: { color: '#000', fontWeight: '800', fontSize: 15 },
  saveActionBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12, paddingVertical: 14,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
  saveActionBtnActive: { backgroundColor: '#fff' },
  saveActionBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  shareBtn: {
    width: 50, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },

  section: { paddingHorizontal: 16, marginBottom: 24 },
  sectionTitle: { color: '#fff', fontSize: 17, fontWeight: '800', marginBottom: 14 },
  overview: { color: '#bbb', fontSize: 14, lineHeight: 22 },

  similarGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  similarCard: { width: CARD_W },
  similarImage: { width: CARD_W, height: CARD_W * 1.5, borderRadius: 8, backgroundColor: '#1a1a1a', marginBottom: 4 },
  similarTitle: { color: '#aaa', fontSize: 11, textAlign: 'center' },

  // TV section
  tvSection: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 4 },
  seasonScroll: { marginBottom: 10 },
  seasonBtn: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 8, marginRight: 8,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  seasonBtnActive: { backgroundColor: '#3b82f6', borderColor: '#3b82f6' },
  seasonBtnText: { color: '#666', fontSize: 12, fontWeight: '700' },
  seasonBtnTextActive: { color: '#fff' },
  episodePickerBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 12,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  episodePickerText: { flex: 1, color: '#ccc', fontSize: 13 },

  // Episode modal
  episodeModalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end',
  },
  episodeModalCard: {
    backgroundColor: '#111', borderTopLeftRadius: 20, borderTopRightRadius: 20,
    maxHeight: '75%', paddingBottom: 32,
    borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  episodeModalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  episodeModalTitle: { color: '#fff', fontSize: 15, fontWeight: '700' },
  episodeLoading: { padding: 40, alignItems: 'center' },
  episodeRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  episodeRowActive: { backgroundColor: 'rgba(59,130,246,0.08)' },
  epNumBadge: {
    width: 36, height: 36, borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center', justifyContent: 'center',
  },
  epNumBadgeActive: { backgroundColor: '#3b82f6' },
  epNum: { color: '#888', fontSize: 13, fontWeight: '700' },
  epNumActive: { color: '#fff' },
  epInfo: { flex: 1 },
  epName: { color: '#aaa', fontSize: 14, fontWeight: '500' },
  epDate: { color: '#555', fontSize: 11, marginTop: 2 },
});
