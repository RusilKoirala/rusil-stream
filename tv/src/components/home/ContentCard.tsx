import { useEffect, useRef, useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Play } from 'lucide-react-native';
import type { Content } from '@/types/content';
import { posterUrl } from '@/utils/images';

/** Web-style poster card: 2:3 ratio (140×210 on mobile, scaled for TV). */
export const CARD_W = 175;
export const CARD_GAP = 14;
export const ROW_PADDING = 56;
export const CARD_H = Math.round(CARD_W * (3 / 2));

interface ContentCardProps {
  content: Content;
  rank?: number;
  onPress?: () => void;
  onFocusItem?: () => void;
}

export function ContentCard({ content, rank, onPress, onFocusItem }: ContentCardProps) {
  const [focused, setFocused] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const uri = posterUrl(content.posterPath) || posterUrl(content.backdropPath);

  useEffect(() => {
    Animated.timing(scaleAnim, {
      toValue: focused ? 1.1 : 1.0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [focused, scaleAnim]);

  return (
    <TouchableOpacity
      onPress={onPress}
      onFocus={() => {
        setFocused(true);
        onFocusItem?.();
      }}
      onBlur={() => setFocused(false)}
      activeOpacity={0.85}
      style={styles.card}
    >
      <Animated.View
        style={[
          styles.cardInner,
          { transform: [{ scale: scaleAnim }] },
          focused && styles.cardFocused,
        ]}
      >
        <View style={styles.posterWrap}>
          {uri ? (
            <Image source={{ uri }} style={styles.poster} resizeMode="cover" />
          ) : (
            <View style={[styles.poster, styles.placeholder]}>
              <Text style={styles.placeholderText} numberOfLines={2}>{content.title}</Text>
            </View>
          )}

          {rank != null && (
            <View style={styles.rankBadge}>
              <Text style={styles.rankText}>#{rank}</Text>
            </View>
          )}

          {focused && (
            <View style={styles.overlay}>
              <View style={styles.playBtn}>
                <Play size={20} color="#fff" fill="#fff" />
              </View>
            </View>
          )}
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_W,
    height: CARD_H,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardInner: {
    width: CARD_W,
    height: CARD_H,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
    borderWidth: 2.5,
    borderColor: 'transparent',
  },
  cardFocused: {
    borderColor: '#fff',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
  },
  posterWrap: {
    width: '100%',
    height: '100%',
  },
  poster: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1e1e1e',
  },
  placeholderText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 13,
    textAlign: 'center',
    paddingHorizontal: 12,
  },
  rankBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#E50914',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  rankText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playBtn: {
    backgroundColor: '#E50914',
    borderRadius: 30,
    padding: 12,
    elevation: 4,
  },
});
