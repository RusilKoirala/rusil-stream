import { useCallback, useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, ActivityIndicator, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { getProfiles, type TVProfile } from '@/lib/api';
import { setActiveProfile } from '@/lib/active-profile';

const { width: W } = Dimensions.get('window');
const AVATAR_SIZE = 140;

interface ProfileSelectScreenProps {
  onProfileSelected: () => void;
}

function resolveAvatarUrl(url: string): string {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  // Relative path — prepend the web app origin
  return `https://www.rusilstream.app${url}`;
}

export function ProfileSelectScreen({ onProfileSelected }: ProfileSelectScreenProps) {
  const [profiles, setProfiles] = useState<TVProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [focused, setFocused] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    getProfiles()
      .then((data) => {
        if (!alive) return;
        setProfiles(data);
        setLoading(false);
      })
      .catch(() => {
        if (!alive) return;
        setError('Could not load profiles. Check your connection.');
        setLoading(false);
      });
    return () => { alive = false; };
  }, []);

  const selectProfile = useCallback((profile: TVProfile) => {
    setActiveProfile(profile);
    onProfileSelected();
  }, [onProfileSelected]);

  if (loading) {
    return (
      <View style={styles.root}>
        <ActivityIndicator size="large" color="#E50914" />
        <Text style={styles.loadingText}>Loading profiles…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.root}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  // No profiles yet — auto-select a default
  if (profiles.length === 0) {
    const defaultProfile: TVProfile = {
      _id: 'default',
      userId: 'default',
      name: 'Default',
      avatarUrl: '',
      isKids: false,
      maturityRating: 'R',
      pinEnabled: false,
      language: 'en',
    };
    setActiveProfile(defaultProfile);
    // Trigger on next tick to avoid state update during render
    setTimeout(() => onProfileSelected(), 0);
    return (
      <View style={styles.root}>
        <ActivityIndicator size="large" color="#E50914" />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <View style={styles.container}>
        <Text style={styles.title}>Who&apos;s watching?</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.profileRow}
        >
          {profiles.map((profile) => {
            const isFocused = focused === profile._id;
            const avatarUri = resolveAvatarUrl(profile.avatarUrl);

            return (
              <TouchableOpacity
                key={profile._id}
                style={[styles.card, isFocused && styles.cardFocused]}
                onFocus={() => setFocused(profile._id)}
                onBlur={() => setFocused(null)}
                onPress={() => selectProfile(profile)}
                activeOpacity={0.85}
              >
                <View style={[styles.avatarWrap, isFocused && styles.avatarWrapFocused]}>
                  {avatarUri ? (
                    <Image
                      source={{ uri: avatarUri }}
                      style={styles.avatar}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.avatarFallback}>
                      <Text style={styles.avatarInitial}>
                        {profile.name[0]?.toUpperCase() || '?'}
                      </Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.name, isFocused && styles.nameFocused]} numberOfLines={1}>
                  {profile.name}
                </Text>
                {profile.isKids ? (
                  <Text style={styles.kidsBadge}>Kids</Text>
                ) : null}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    alignItems: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 40,
    fontWeight: '700',
    marginBottom: 48,
  },
  profileRow: {
    gap: 36,
    paddingHorizontal: 40,
  },
  card: {
    alignItems: 'center',
    width: AVATAR_SIZE + 20,
  },
  cardFocused: {
    transform: [{ scale: 1.08 }],
  },
  avatarWrap: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE * 0.12,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: 'transparent',
    backgroundColor: '#1a1a1a',
  },
  avatarWrapFocused: {
    borderColor: '#fff',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  avatarFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1f1f1f',
  },
  avatarInitial: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 48,
    fontWeight: '700',
  },
  name: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 16,
    fontWeight: '500',
    marginTop: 14,
    textAlign: 'center',
  },
  nameFocused: {
    color: '#fff',
    fontWeight: '700',
  },
  kidsBadge: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  loadingText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 16,
    marginTop: 16,
  },
  errorText: {
    color: '#f87171',
    fontSize: 16,
  },
});
