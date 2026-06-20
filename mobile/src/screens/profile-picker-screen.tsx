import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import Animated, {
  FadeIn,
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { getProfilesCached } from "@/lib/api";
import { getLocalProfileAvatarSource, getProfileId } from "@/lib/local-profiles";
import { saveStoredProfileId } from "@/lib/watchlist-storage";
import { ProfileAvatar } from "@/components/ui/profile-avatar";
import { SkeletonBox } from "@/components/ui/skeleton-box";
import { colors, space, radius, type as t, shadow } from "@/lib/tokens";

interface ProfilePickerScreenProps {
  onProfileSelected: () => void;
}

// ─── Single profile tile ──────────────────────────────────────────────────────

interface ProfileTileProps {
  name: string;
  avatarSource: ReturnType<typeof getLocalProfileAvatarSource>;
  avatarSize: number;
  onPress: () => void;
  delay: number;
}

function ProfileTile({ name, avatarSource, avatarSize, onPress, delay }: ProfileTileProps) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      entering={FadeInDown.duration(320).delay(delay).springify()}
      style={animStyle}
    >
      <Pressable
        onPress={onPress}
        onPressIn={() => { scale.value = withSpring(0.94, { damping: 18, stiffness: 280 }); }}
        onPressOut={() => { scale.value = withSpring(1.0, { damping: 16, stiffness: 240 }); }}
        accessibilityRole="button"
        accessibilityLabel={`Select ${name} profile`}
        style={s.tile}
      >
        {/* Avatar container with subtle glow ring */}
        <View style={[s.avatarRing, { width: avatarSize + 4, height: avatarSize + 4, borderRadius: radius.lg + 4 }]}>
          <ProfileAvatar
            name={name}
            source={avatarSource}
            size={avatarSize}
          />
        </View>
        <Text style={[s.tileName, { maxWidth: avatarSize + 16 }]} numberOfLines={1}>
          {name}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export function ProfilePickerScreen({ onProfileSelected }: ProfilePickerScreenProps) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isTablet = width >= 600;

  // Layout math: 2 cols on phone, 3 on tablet
  const columns    = isTablet ? 3 : 2;
  const hPad       = isTablet ? space[10] : space[6];
  const colGap     = isTablet ? space[6] : space[5];
  const colWidth   = Math.floor((width - hPad * 2 - colGap * (columns - 1)) / columns);
  const avatarSize = Math.min(isTablet ? 156 : 128, colWidth - 16);

  const queryClient = useQueryClient();
  const { data: profiles = [], isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["profiles", "picker"],
    queryFn: () =>
      getProfilesCached((updated) => {
        queryClient.setQueryData(["profiles", "picker"], updated);
        queryClient.setQueryData(["profiles", "mobile"], updated);
      }),
    staleTime: Infinity,
  });

  const handleSelect = async (profileId: string) => {
    await saveStoredProfileId(profileId);
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["watchlist"] }),
      queryClient.invalidateQueries({ queryKey: ["home", "continue-watching"] }),
      queryClient.invalidateQueries({ queryKey: ["selected-profile-id", "mobile"] }),
    ]);
    onProfileSelected();
  };

  return (
    <View style={[s.root, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {/* Radial red glow from top center — cinematic identity */}
      <LinearGradient
        colors={["rgba(229,9,20,0.18)", "transparent"]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.55 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      <View style={[s.inner, { paddingHorizontal: hPad }]}>
        {/* Header */}
        <Animated.View entering={FadeIn.duration(400)} style={s.header}>
          <Text style={s.headline}>Who's{"\n"}watching?</Text>
          <Text style={s.sub}>Choose a profile to continue</Text>
        </Animated.View>

        {/* Grid */}
        {isLoading ? (
          <View style={[s.grid, { gap: colGap }]}>
            {Array.from({ length: columns * 2 }).map((_, i) => (
              <View key={i} style={{ width: colWidth, alignItems: "center", gap: space[3] }}>
                <SkeletonBox width={avatarSize} height={avatarSize} borderRadius={radius.lg} />
                <SkeletonBox width={avatarSize * 0.6} height={14} borderRadius={6} />
              </View>
            ))}
          </View>
        ) : isError ? (
          <Text style={s.errorText}>Could not load profiles. Pull down to retry.</Text>
        ) : (
          <View style={[s.grid, { gap: colGap }]}>
            {profiles.map((profile, i) => {
              const profileId = getProfileId(profile);
              if (!profileId) return null;
              return (
                <View key={profileId} style={{ width: colWidth }}>
                  <ProfileTile
                    name={profile.name}
                    avatarSource={getLocalProfileAvatarSource(profile)}
                    avatarSize={avatarSize}
                    onPress={() => void handleSelect(profileId)}
                    delay={i * 60}
                  />
                </View>
              );
            })}
          </View>
        )}

        {!isLoading && !isError && profiles.length === 0 && (
          <Animated.View entering={FadeIn.duration(300)} style={s.emptyBox}>
            <Text style={s.emptyText}>No profiles found for this account.</Text>
          </Animated.View>
        )}

        {/* Refresh button */}
        <Animated.View entering={FadeIn.duration(400).delay(300)} style={s.refreshRow}>
          <Pressable
            onPress={() => void refetch()}
            accessibilityRole="button"
            accessibilityLabel="Refresh profiles"
            style={({ pressed }) => [s.refreshBtn, pressed && { opacity: 0.7 }]}
          >
            <Text style={s.refreshText}>
              {isFetching ? "Refreshing…" : "Refresh profiles"}
            </Text>
          </Pressable>
        </Animated.View>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  inner: {
    flex: 1,
  },

  // Header
  header: {
    paddingTop: space[8],
    paddingBottom: space[8],
  },
  headline: {
    fontSize: 48,
    fontWeight: t.weight.bold,
    color: colors.text100,
    letterSpacing: t.tracking.tight,
    lineHeight: 52,
    marginBottom: space[2],
  },
  sub: {
    fontSize: t.size.base,
    fontWeight: t.weight.regular,
    color: colors.text40,
  },

  // Grid
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: space[7],
  },

  // Tile
  tile: {
    alignItems: "center",
    gap: space[3],
  },
  avatarRing: {
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    ...shadow.sm,
  },
  tileName: {
    fontSize: t.size.sm,
    fontWeight: t.weight.semibold,
    color: colors.text60,
    textAlign: "center",
  },

  // Empty + error
  emptyBox: {
    marginTop: space[6],
    padding: space[6],
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    alignItems: "center",
  },
  emptyText: {
    fontSize: t.size.sm,
    color: colors.text40,
    textAlign: "center",
  },
  errorText: {
    fontSize: t.size.sm,
    color: colors.error,
    textAlign: "center",
    marginTop: space[6],
  },

  // Refresh
  refreshRow: {
    marginTop: "auto",
    paddingTop: space[6],
    alignItems: "center",
  },
  refreshBtn: {
    paddingVertical: space[2],
    paddingHorizontal: space[4],
  },
  refreshText: {
    fontSize: t.size.sm,
    color: colors.text20,
    fontWeight: t.weight.medium,
  },
});
