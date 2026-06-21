import { Image, StyleSheet, Text, View } from 'react-native';
import { getActiveProfile } from '@/lib/active-profile';

interface ProfileAvatarProps {
  size?: number;
}

const DEFAULT_AVATAR = require('../../../assets/avatars/avatar1.png');

function resolveAvatarUrl(url: string): string {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `https://www.rusilstream.app${url}`;
}

export function ProfileAvatar({ size = 40 }: ProfileAvatarProps) {
  const profile = getActiveProfile();
  const avatarUri = profile ? resolveAvatarUrl(profile.avatarUrl) : '';
  const initial = profile?.name?.[0]?.toUpperCase() || '?';

  return (
    <View style={[styles.wrap, { width: size, height: size, borderRadius: size * 0.22 }]}>
      {avatarUri ? (
        <Image source={{ uri: avatarUri }} style={styles.image} resizeMode="cover" />
      ) : (
        <View style={styles.fallback}>
          <Text style={[styles.initial, { fontSize: size * 0.4 }]}>{initial}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: '#1a1a1a',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  fallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1f1f1f',
  },
  initial: {
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '700',
  },
});
