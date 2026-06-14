import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Pressable, Text, View, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getProfilesCached } from "@/lib/api";
import { getLocalProfileAvatarSource, getProfileId } from "@/lib/local-profiles";
import { saveStoredProfileId } from "@/lib/watchlist-storage";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import { PremiumBackground } from "@/components/ui/premium-background";
import { ProfileAvatar } from "@/components/ui/profile-avatar";
import { ScreenReveal } from "@/components/ui/screen-reveal";
import { SectionHeader } from "@/components/ui/section-header";
import { SkeletonBox } from "@/components/ui/skeleton-box";

interface ProfilePickerScreenProps {
  onProfileSelected: () => void;
}

export function ProfilePickerScreen({ onProfileSelected }: ProfilePickerScreenProps) {
  const { width, height } = useWindowDimensions();
  const shortestSide = Math.min(width, height);
  const isTablet = shortestSide >= 600;
  const columns = isTablet ? 3 : 2;
  const horizontalPadding = isTablet ? 36 : 24;
  const gap = isTablet ? 20 : 12;
  const cardWidth = Math.floor((width - horizontalPadding * 2 - gap * (columns - 1)) / columns);
  const avatarSize = Math.max(96, Math.min(isTablet ? 180 : 140, cardWidth - (isTablet ? 14 : 18)));
  const titleFontSize = isTablet ? 56 : 42;
  const subtitleFontSize = isTablet ? 20 : 16;
  const profileNameFontSize = isTablet ? 24 : 18;

  const queryClient = useQueryClient();
  const { data: profiles = [], isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["profiles", "picker"],
    queryFn: () =>
      getProfilesCached((updatedProfiles) => {
        queryClient.setQueryData(["profiles", "picker"], updatedProfiles);
        queryClient.setQueryData(["profiles", "mobile"], updatedProfiles);
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
    <SafeAreaView className="flex-1 bg-black" edges={["top"]}>
      <PremiumBackground />
      <ScreenReveal className="flex-1 pt-6" style={{ paddingHorizontal: horizontalPadding }}>
        <View className="mb-10 px-1">
          <Text
            className="text-center font-black text-white"
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.72}
            style={{ fontSize: titleFontSize, lineHeight: titleFontSize + 8 }}
          >
            Who&apos;s watching?
          </Text>
          <Text className="mt-3 text-center text-zinc-400" style={{ fontSize: subtitleFontSize }}>
            Choose a profile to continue
          </Text>
        </View>

        <View className="mb-8 flex-row justify-end">
          <AnimatedPressable
            className="rounded-full border border-white/20 bg-white/5 px-4 py-2"
            accessibilityRole="button"
            accessibilityLabel="Edit Profiles"
          >
            <Text className="text-sm font-semibold text-zinc-200">Edit Profiles</Text>
          </AnimatedPressable>
        </View>

        {isLoading ? (
          <View className="w-full flex-row flex-wrap justify-between" style={{ rowGap: isTablet ? 26 : 18 }}>
            {Array.from({ length: columns * 2 }).map((_, i) => (
              <View key={i} className="items-center" style={{ width: cardWidth }}>
                <SkeletonBox
                  width={avatarSize}
                  height={avatarSize}
                  borderRadius={Math.max(14, Math.floor(avatarSize * 0.17))}
                />
                <View className="mt-3">
                  <SkeletonBox width={avatarSize * 0.7} height={isTablet ? 20 : 16} borderRadius={4} />
                </View>
              </View>
            ))}
          </View>
        ) : null}
        {isError ? <Text className="text-center text-red-300">Could not load profiles.</Text> : null}

        {!isLoading && !isError ? (
          <View className="w-full flex-row flex-wrap justify-between" style={{ rowGap: isTablet ? 26 : 18 }}>
            {profiles.map((profile) => {
              const profileId = getProfileId(profile);
              if (!profileId) return null;

              const avatarSource = getLocalProfileAvatarSource(profile);

              return (
                <Pressable
                  key={profileId}
                  onPress={() => void handleSelect(profileId)}
                  className="items-center"
                  accessibilityRole="button"
                  accessibilityLabel={`Select ${profile.name} profile`}
                  style={({ pressed }) => ({ width: cardWidth, opacity: pressed ? 0.85 : 1 })}
                >
                  <ProfileAvatar name={profile.name} source={avatarSource} size={avatarSize} />
                  <Text
                    numberOfLines={1}
                    className="mt-3 text-center font-bold text-zinc-100"
                    style={{ maxWidth: avatarSize + 10, fontSize: profileNameFontSize }}
                  >
                    {profile.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ) : null}

        {!isLoading && !isError && profiles.length === 0 ? (
          <Text className="mt-4 text-center text-sm text-zinc-400">No profiles found for this account.</Text>
        ) : null}

        <AnimatedPressable
          onPress={() => void refetch()}
          className="mt-auto self-center rounded-full border border-white/20 bg-white/5 px-5 py-3"
          accessibilityRole="button"
          accessibilityLabel="Refresh Profiles"
        >
          <Text className="text-sm font-semibold text-white">{isFetching ? "Refreshing..." : "Refresh Profiles"}</Text>
        </AnimatedPressable>
      </ScreenReveal>
    </SafeAreaView>
  );
}
