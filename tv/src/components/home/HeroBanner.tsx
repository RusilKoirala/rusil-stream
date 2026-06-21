import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Play, Info, Star } from 'lucide-react-native';
import type { Content } from '@/types/content';
import { getCachedContentLogo } from '@/lib/logo-cache';
import { backdropUrl, logoUrl as resolveLogoUrl, posterUrl } from '@/utils/images';

const { width: W, height: H } = Dimensions.get('window');
const HERO_H = Math.round(H * 0.78);

interface HeroBannerProps {
  items: Content[];
  onWatch?: (item: Content) => void;
  onDetails?: (item: Content) => void;
  onFocus?: () => void;
}

export function HeroBanner({ items, onWatch, onDetails, onFocus }: HeroBannerProps) {
  const [idx, setIdx] = useState(0);
  const [logoUri, setLogoUri] = useState<string | null>(null);
  const [logoFailed, setLogoFailed] = useState(false);
  const [bgFailed, setBgFailed] = useState(false);
  const [focusedBtn, setFocusedBtn] = useState<'watch' | 'details' | null>(null);
  const opacity = useRef(new Animated.Value(1)).current;

  const list = items.filter((item) => item.backdropPath || item.posterPath).slice(0, 5);
  const safeIdx = list.length > 0 ? idx % list.length : 0;
  const current = list[safeIdx];

  const backdropUri = current
    ? backdropUrl(current.backdropPath) || posterUrl(current.posterPath)
    : null;
  const fallbackUri = current ? posterUrl(current.posterPath) : null;
  const imageUri = bgFailed && fallbackUri ? fallbackUri : backdropUri;

  useEffect(() => {
    setBgFailed(false);
  }, [current?.id, current?.type]);

  useEffect(() => {
    if (list.length <= 1) return;
    const timer = setInterval(() => {
      Animated.timing(opacity, { toValue: 0, duration: 500, useNativeDriver: true }).start(() => {
        setIdx((p) => (p + 1) % list.length);
        Animated.timing(opacity, { toValue: 1, duration: 500, useNativeDriver: true }).start();
      });
    }, 6000);
    return () => clearInterval(timer);
  }, [list.length, opacity]);

  useEffect(() => {
    if (!current?.id) return;
    setLogoUri(null);
    setLogoFailed(false);
    let alive = true;
    getCachedContentLogo(current.id, current.type)
      .then((path) => {
        if (!alive) return;
        setLogoUri(resolveLogoUrl(path));
      })
      .catch(() => { if (alive) setLogoFailed(true); });
    return () => { alive = false; };
  }, [current?.id, current?.type]);

  if (!current || !imageUri) return null;

  const year = current.releaseDate ? new Date(current.releaseDate).getFullYear() : null;
  const rating = Number.isFinite(current.voteAverage) ? current.voteAverage.toFixed(1) : '6.8';
  const showLogo = Boolean(logoUri) && !logoFailed;

  return (
    <View style={[s.root, { height: HERO_H }]}>
      <Animated.View style={[StyleSheet.absoluteFill, { opacity }]}>
        <Image
          source={{ uri: imageUri }}
          style={StyleSheet.absoluteFillObject}
          resizeMode="cover"
          onError={() => setBgFailed(true)}
        />
      </Animated.View>

      <View style={s.gradientHorizontal} pointerEvents="none" />
      <View style={s.gradientVertical} pointerEvents="none" />

      <Animated.View style={[s.contentWrap, { opacity }]}>
        <View style={s.content}>
          <View style={s.meta}>
            <View style={s.ratingRow}>
              <Star size={14} color="#ffd24d" fill="#ffd24d" />
              <Text style={s.ratingText}>{rating}</Text>
            </View>
            {year ? <Text style={s.metaText}>{year}</Text> : null}
            <Text style={s.metaText}>{current.type.toUpperCase()}</Text>
            <View style={s.badge}><Text style={s.badgeText}>HD</Text></View>
            <View style={s.badge}><Text style={s.badgeText}>CC</Text></View>
          </View>

          {showLogo ? (
            <Image
              source={{ uri: logoUri! }}
              style={s.logo}
              resizeMode="contain"
              onError={() => setLogoFailed(true)}
            />
          ) : (
            <Text style={s.title} numberOfLines={2}>{current.title}</Text>
          )}

          <Text style={s.overview} numberOfLines={3}>{current.overview}</Text>

          <View style={s.buttons}>
            <TouchableOpacity
              style={[s.btnWatch, focusedBtn === 'watch' && s.btnWatchFocused]}
              onFocus={() => { setFocusedBtn('watch'); onFocus?.(); }}
              onBlur={() => setFocusedBtn(null)}
              activeOpacity={0.85}
              onPress={() => onWatch?.(current)}
            >
              <Play size={14} color="#fff" fill="#fff" />
              <Text style={s.btnWatchText}>WATCH</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.btnDetails, focusedBtn === 'details' && s.btnDetailsFocused]}
              onFocus={() => { setFocusedBtn('details'); onFocus?.(); }}
              onBlur={() => setFocusedBtn(null)}
              activeOpacity={0.85}
              onPress={() => onDetails?.(current)}
            >
              <Info size={15} color="#fff" />
              <Text style={s.btnDetailsText}>DETAILS</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>

      <View style={s.dots}>
        {list.map((item, i) => (
          <View key={`${item.type}-${item.id}`} style={i === safeIdx ? s.dotActive : s.dot} />
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    width: W - 48,
    marginHorizontal: 24,
    borderRadius: 20,
    backgroundColor: '#141414',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  gradientHorizontal: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  gradientVertical: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '40%',
    backgroundColor: 'transparent',
  },
  contentWrap: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
  },
  content: {
    paddingHorizontal: 56,
    paddingBottom: 56,
    maxWidth: W * 0.62,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 18,
    flexWrap: 'wrap',
  },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { color: '#ffd24d', fontSize: 14, fontWeight: '600' },
  metaText: { color: 'rgba(255,255,255,0.85)', fontSize: 14 },
  badge: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: { color: 'rgba(255,255,255,0.8)', fontSize: 10, letterSpacing: 0.5 },
  logo: {
    width: W * 0.38,
    height: 120,
    marginBottom: 20,
    alignSelf: 'flex-start',
  },
  title: {
    color: '#fff',
    fontSize: 48,
    fontWeight: '800',
    lineHeight: 52,
    letterSpacing: 0.3,
    marginBottom: 20,
  },
  overview: {
    color: 'rgba(255,255,255,0.86)',
    fontSize: 16,
    lineHeight: 26,
    marginBottom: 24,
  },
  buttons: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  btnWatch: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#E50914',
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  btnWatchFocused: {
    backgroundColor: '#f6121d',
    transform: [{ scale: 1.05 }],
  },
  btnWatchText: { color: '#fff', fontSize: 13, fontWeight: '800', letterSpacing: 0.8 },
  btnDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 24,
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  btnDetailsFocused: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderColor: '#fff',
    transform: [{ scale: 1.05 }],
  },
  btnDetailsText: { color: '#fff', fontSize: 13, fontWeight: '600', letterSpacing: 0.5 },
  dots: {
    position: 'absolute',
    bottom: 28,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.45)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  dotActive: { width: 32, height: 6, borderRadius: 3, backgroundColor: '#ff4b2b', borderWidth: 1, borderColor: 'rgba(255,255,255,0.5)' },
});
