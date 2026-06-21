import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  ImageBackground,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Play, Star } from 'lucide-react-native';
import { getContentDetails } from '@/lib/api';
import { getCachedContentLogo } from '@/lib/logo-cache';
import { useNavigation } from '@/navigation/NavigationContext';
import type { DetailsParams } from '@/navigation/types';
import { ContentRow } from '@/components/home/ContentRow';
import { formatRating, formatYear } from '@/utils/format';
import { backdropUrl, logoUrl as resolveLogoUrl, posterUrl } from '@/utils/images';
import type { Content } from '@/types/content';

interface DetailsScreenProps {
  params: DetailsParams;
}

function mergeSimilar(items: Content[]): Content[] {
  return items.reduce<Content[]>((acc, item) => {
    if (!acc.some((existing) => existing.id === item.id && existing.type === item.type)) {
      acc.push(item);
    }
    return acc;
  }, []);
}

export function DetailsScreen({ params }: DetailsScreenProps) {
  const { id, type } = params;
  const { goBack, openPlayer, openDetails } = useNavigation();
  const [focusedBtn, setFocusedBtn] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoFailed, setLogoFailed] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState(1);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['tv-details', id, type],
    queryFn: () => getContentDetails(id, type),
  });

  const moreLikeThis = useMemo(() => {
    if (!data) return [];
    return mergeSimilar([...data.recommendations, ...data.similar]).slice(0, 20);
  }, [data]);

  useEffect(() => {
    if (!data?.id) return;
    setLogoUrl(null);
    setLogoFailed(false);
    let alive = true;
    getCachedContentLogo(data.id, data.type)
      .then((path) => { if (alive) setLogoUrl(resolveLogoUrl(path)); })
      .catch(() => { if (alive) setLogoFailed(true); });
    return () => { alive = false; };
  }, [data?.id, data?.type]);

  const episodesPerSeason = useMemo(() => {
    if (!data || data.type !== 'tv' || !data.numberOfSeasons || !data.numberOfEpisodes) return 0;
    return Math.ceil(data.numberOfEpisodes / data.numberOfSeasons);
  }, [data]);

  const handlePlay = useCallback((season?: number, episode?: number) => {
    if (!data) return;
    openPlayer({
      id: data.id,
      type: data.type,
      title: data.title,
      ...(data.type === 'tv' ? { season: season ?? selectedSeason, episode: episode ?? selectedEpisode } : {}),
    });
  }, [data, openPlayer, selectedSeason, selectedEpisode]);

  const changeSeason = useCallback((delta: number) => {
    setSelectedSeason((prev) => {
      const next = prev + delta;
      if (!data?.numberOfSeasons) return prev;
      return Math.max(1, Math.min(data.numberOfSeasons, next));
    });
    setSelectedEpisode(1);
  }, [data?.numberOfSeasons]);

  if (isLoading || !data) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#E50914" />
        <Text style={styles.loadingText}>Loading details…</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorTitle}>Unable to load details</Text>
        <TouchableOpacity style={styles.backBtn} activeOpacity={0.85} onPress={goBack}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const showLogo = Boolean(logoUrl) && !logoFailed;
  const isTV = data.type === 'tv';
  const epCount = episodesPerSeason;

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
      >
        {/* ── Hero with Play button ── */}
        <View style={styles.hero}>
          {data.backdropPath ? (
            <ImageBackground source={{ uri: backdropUrl(data.backdropPath)! }} style={styles.backdrop} resizeMode="cover" />
          ) : (
            <View style={[styles.backdrop, styles.backdropFallback]} />
          )}

          <View style={styles.heroContent} pointerEvents="box-none">
            {showLogo ? (
              <Image
                source={{ uri: logoUrl! }}
                style={styles.logo}
                resizeMode="contain"
                onError={() => setLogoFailed(true)}
              />
            ) : (
              <Text style={styles.title}>{data.title}</Text>
            )}

            {data.tagline ? <Text style={styles.tagline}>{data.tagline}</Text> : null}

            <View style={styles.meta}>
              {data.voteAverage > 0 ? (
                <View style={styles.ratingRow}>
                  <Star size={13} color="#ffd24d" fill="#ffd24d" />
                  <Text style={styles.ratingText}>{formatRating(data.voteAverage)}</Text>
                </View>
              ) : null}
              <Text style={styles.metaText}>{formatYear(data.releaseDate)}</Text>
              <Text style={styles.metaText}>{data.type.toUpperCase()}</Text>
              {isTV && data.numberOfSeasons != null ? (
                <Text style={styles.metaText}>{data.numberOfSeasons} Season{data.numberOfSeasons !== 1 ? 's' : ''}</Text>
              ) : null}
              {isTV && data.numberOfEpisodes != null ? (
                <Text style={styles.metaText}>{data.numberOfEpisodes} Episodes</Text>
              ) : null}
              {!isTV && data.runtime ? (
                <Text style={styles.metaText}>{data.runtime} min</Text>
              ) : null}
              <View style={styles.badge}><Text style={styles.badgeText}>HD</Text></View>
            </View>

            {/* Play button — always visible in the hero */}
            <View style={styles.heroActions}>
              <TouchableOpacity
                style={[styles.playBtn, focusedBtn === 'play' && styles.playBtnFocused]}
                onFocus={() => setFocusedBtn('play')}
                onBlur={() => setFocusedBtn(null)}
                activeOpacity={0.85}
                hasTVPreferredFocus
                onPress={() => handlePlay()}
              >
                <Play size={18} color={focusedBtn === 'play' ? '#fff' : '#0b0c10'} fill={focusedBtn === 'play' ? '#fff' : '#0b0c10'} />
                <Text style={[styles.playText, focusedBtn === 'play' && styles.playTextFocused]}>
                  {isTV ? `Play S${selectedSeason} E${selectedEpisode}` : 'Play'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* ── Body ── */}
        <View style={styles.body}>

          {/* Overview */}
          <Text style={styles.sectionLabel}>Storyline</Text>
          <Text style={styles.overview}>{data.overview || 'No overview available.'}</Text>

          {/* Genres */}
          {data.genres.length > 0 ? (
            <View style={styles.genres}>
              {data.genres.slice(0, 5).map((genre) => (
                <View key={genre.id} style={styles.genreChip}>
                  <Text style={styles.genreText}>{genre.name}</Text>
                </View>
              ))}
            </View>
          ) : null}

          {/* Season selector (TV only) */}
          {isTV && data.numberOfSeasons && data.numberOfSeasons > 1 ? (
            <View style={styles.seasonSection}>
              <Text style={styles.sectionLabel}>Season</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.seasonRow}>
                {Array.from({ length: data.numberOfSeasons }, (_, i) => i + 1).map((s) => (
                  <TouchableOpacity
                    key={s}
                    style={[styles.seasonChip, s === selectedSeason && styles.seasonChipActive, focusedBtn === `s${s}` && styles.seasonChipFocused]}
                    onFocus={() => setFocusedBtn(`s${s}`)}
                    onBlur={() => setFocusedBtn(null)}
                    onPress={() => { setSelectedSeason(s); setSelectedEpisode(1); }}
                    activeOpacity={0.85}
                  >
                    <Text style={[styles.seasonChipText, s === selectedSeason && styles.seasonChipTextActive]}>
                      {s}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          ) : null}

          {/* Episode picker (TV only) — clickable cards */}
          {isTV && epCount > 0 ? (
            <View style={styles.epSection}>
              <Text style={styles.sectionLabel}>
                Episodes · Season {selectedSeason}
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.epRow}>
                {Array.from({ length: epCount }, (_, i) => i + 1).map((ep) => (
                  <TouchableOpacity
                    key={ep}
                    style={[styles.epCard, ep === selectedEpisode && styles.epCardActive, focusedBtn === `ep${ep}` && styles.epCardFocused]}
                    onFocus={() => setFocusedBtn(`ep${ep}`)}
                    onBlur={() => setFocusedBtn(null)}
                    onPress={() => { setSelectedEpisode(ep); handlePlay(selectedSeason, ep); }}
                    activeOpacity={0.85}
                  >
                    <Text style={[styles.epNum, ep === selectedEpisode && styles.epNumActive]}>{ep}</Text>
                    <Text style={[styles.epLabel, ep === selectedEpisode && styles.epLabelActive]}>Episode {ep}</Text>
                    {ep === selectedEpisode ? (
                      <View style={styles.epPlayIcon}>
                        <Play size={12} color="#E50914" fill="#E50914" />
                      </View>
                    ) : null}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          ) : null}

          {/* Cast */}
          {data.cast.length > 0 ? (
            <View style={styles.castSection}>
              <Text style={styles.sectionLabel}>Cast</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.castRow}>
                {data.cast.slice(0, 10).map((person) => (
                  <View key={person.id} style={styles.castCard}>
                    {person.profilePath ? (
                      <Image
                        source={{ uri: posterUrl(person.profilePath)! }}
                        style={styles.castAvatar}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={[styles.castAvatar, styles.castAvatarFallback]}>
                        <Text style={styles.castInitial}>{person.name[0]}</Text>
                      </View>
                    )}
                    <Text style={styles.castName} numberOfLines={1}>{person.name}</Text>
                    <Text style={styles.castChar} numberOfLines={1}>{person.character}</Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          ) : null}

          {/* Status */}
          <View style={styles.statusRow}>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Status</Text>
              <Text style={styles.statusValue}>{data.status || 'Available'}</Text>
            </View>
            {data.releaseDate ? (
              <View style={styles.statusItem}>
                <Text style={styles.statusLabel}>Released</Text>
                <Text style={styles.statusValue}>{formatYear(data.releaseDate)}</Text>
              </View>
            ) : null}
            {data.voteAverage > 0 ? (
              <View style={styles.statusItem}>
                <Text style={styles.statusLabel}>Rating</Text>
                <Text style={styles.statusValue}>{formatRating(data.voteAverage)} / 10</Text>
              </View>
            ) : null}
          </View>
        </View>

        {moreLikeThis.length > 0 ? (
          <ContentRow
            title="More Like This"
            items={moreLikeThis}
            onPressItem={(item) => openDetails({ id: item.id, type: item.type })}
          />
        ) : null}

        <View style={styles.bottomPad} />
      </ScrollView>

      {/* Back button — floating */}
      <TouchableOpacity
        style={[styles.backFloating, focusedBtn === 'back' && styles.backFloatingFocused]}
        onFocus={() => setFocusedBtn('back')}
        onBlur={() => setFocusedBtn(null)}
        activeOpacity={0.85}
        onPress={goBack}
      >
        <ArrowLeft size={22} color={focusedBtn === 'back' ? '#0b0c10' : '#fff'} />
        <Text style={[styles.backFloatingText, focusedBtn === 'back' && styles.backFloatingTextFocused]}>Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0b0c10' },
  scroll: { flex: 1 },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0b0c10',
  },
  loadingText: { color: 'rgba(255,255,255,0.6)', marginTop: 12, fontSize: 16 },
  errorTitle: { color: '#fff', fontSize: 20, fontWeight: '600' },
  backBtn: {
    marginTop: 16,
    backgroundColor: '#E50914',
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  backBtnText: { color: '#fff', fontWeight: '700' },

  /* ── Hero ── */
  hero: { height: 520, backgroundColor: '#111319' },
  backdrop: { ...StyleSheet.absoluteFillObject },
  backdropFallback: { backgroundColor: '#111319' },
  heroContent: {
    position: 'absolute',
    left: 56,
    right: 56,
    bottom: 44,
  },
  logo: { width: 320, height: 96, marginBottom: 10 },
  title: {
    color: '#fff',
    fontSize: 44,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  tagline: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 15,
    fontStyle: 'italic',
    marginBottom: 12,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  metaText: { color: 'rgba(255,255,255,0.55)', fontSize: 14, textTransform: 'uppercase' },
  badge: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: { color: 'rgba(255,255,255,0.7)', fontSize: 10, fontWeight: '700' },

  /* ── Play button in hero ── */
  heroActions: { flexDirection: 'row', gap: 12 },
  playBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#fff',
    borderRadius: 28,
    paddingHorizontal: 32,
    paddingVertical: 14,
  },
  playBtnFocused: {
    backgroundColor: '#E50914',
    transform: [{ scale: 1.05 }],
  },
  playText: { color: '#0b0c10', fontSize: 16, fontWeight: '800' },
  playTextFocused: { color: '#fff' },

  /* ── Body ── */
  body: { paddingHorizontal: 56, paddingTop: 32, paddingBottom: 16 },
  sectionLabel: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  overview: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: 16,
    lineHeight: 28,
  },
  genres: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 24 },
  genreChip: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 16,
    paddingVertical: 7,
  },
  genreText: { color: 'rgba(255,255,255,0.65)', fontSize: 13 },

  /* ── Season selector ── */
  seasonSection: { marginTop: 28 },
  seasonRow: { gap: 10, paddingHorizontal: 0 },
  seasonChip: {
    minWidth: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  seasonChipActive: {
    borderColor: '#E50914',
    backgroundColor: 'rgba(229,9,20,0.15)',
  },
  seasonChipFocused: {
    borderColor: '#fff',
    transform: [{ scale: 1.06 }],
  },
  seasonChipText: { color: 'rgba(255,255,255,0.5)', fontSize: 16, fontWeight: '700' },
  seasonChipTextActive: { color: '#fff' },

  /* ── Episode picker ── */
  epSection: { marginTop: 28 },
  epRow: { gap: 12 },
  epCard: {
    width: 120,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: '#111319',
    padding: 14,
    alignItems: 'center',
  },
  epCardActive: {
    borderColor: '#E50914',
    backgroundColor: 'rgba(229,9,20,0.08)',
  },
  epCardFocused: {
    borderColor: '#fff',
    transform: [{ scale: 1.04 }],
  },
  epNum: { color: 'rgba(255,255,255,0.3)', fontSize: 28, fontWeight: '800' },
  epNumActive: { color: '#fff' },
  epLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: '600', marginTop: 4 },
  epLabelActive: { color: 'rgba(255,255,255,0.8)' },
  epPlayIcon: { marginTop: 6 },

  /* ── Cast ── */
  castSection: { marginTop: 28 },
  castRow: { gap: 16 },
  castCard: { width: 100, alignItems: 'center' },
  castAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1a1d26',
  },
  castAvatarFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  castInitial: { color: 'rgba(255,255,255,0.4)', fontSize: 28, fontWeight: '700' },
  castName: { color: '#fff', fontSize: 12, fontWeight: '600', marginTop: 8, textAlign: 'center' },
  castChar: { color: 'rgba(255,255,255,0.4)', fontSize: 11, textAlign: 'center' },

  /* ── Status ── */
  statusRow: {
    flexDirection: 'row',
    gap: 32,
    marginTop: 28,
    paddingTop: 20,
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  statusItem: {},
  statusLabel: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  statusValue: { color: 'rgba(255,255,255,0.7)', fontSize: 14, marginTop: 4 },

  bottomPad: { height: 80 },

  /* ── Back button ── */
  backFloating: {
    position: 'absolute',
    top: 28,
    left: 40,
    zIndex: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(0,0,0,0.65)',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  backFloatingFocused: {
    backgroundColor: '#fff',
    borderColor: '#fff',
    transform: [{ scale: 1.05 }],
  },
  backFloatingText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  backFloatingTextFocused: { color: '#0b0c10' },
});
