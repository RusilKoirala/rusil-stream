import { useClerk, useUser } from "@clerk/clerk-expo";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { getProfilesCached } from "@/lib/api";
import { getLocalProfileAvatarSource, getProfileId } from "@/lib/local-profiles";
import { clearStoredProfileId, getStoredProfileId, saveStoredProfileId } from "@/lib/watchlist-storage";
import type { MainTabParamList } from "@/navigation/types";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import { MenuRow } from "@/components/ui/menu-row";
import { OfflineBanner } from "@/components/ui/offline-banner";
import { PremiumBackground } from "@/components/ui/premium-background";
import { ProfileAvatar } from "@/components/ui/profile-avatar";
import { ScreenReveal } from "@/components/ui/screen-reveal";
import { SectionHeader } from "@/components/ui/section-header";
import { StateView } from "@/components/ui/state-view";
import { useNetworkStatus } from "@/hooks/use-network-status";

interface ProfileMenuItem {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  action: () => void;
}

export function ProfileScreen() {
  const tabNavigation = useNavigation<BottomTabNavigationProp<MainTabParamList>>();
  const stackNavigation = tabNavigation.getParent();
  const { signOut } = useClerk();
  const { user } = useUser();
  const queryClient = useQueryClient();
  const { isOffline } = useNetworkStatus();
  const {
    data: profiles = [],
    isLoading: isProfilesLoading,
    isError: isProfilesError,
    refetch: refetchProfiles,
    isFetching: isProfilesFetching,
  } = useQuery({
    queryKey: ["profiles", "mobile"],
    queryFn: () =>
      getProfilesCached((updatedProfiles) => {
        queryClient.setQueryData(["profiles", "mobile"], updatedProfiles);
        queryClient.setQueryData(["profiles", "picker"], updatedProfiles);
      }),
    staleTime: Infinity,
  });

  const {
    data: selectedProfileId,
    refetch: refetchSelectedProfile,
  } = useQuery({
    queryKey: ["selected-profile-id", "mobile"],
    queryFn: getStoredProfileId,
  });

  const selectProfile = async (profileId: string) => {
    const nextProfileId = profileId;
    if (!nextProfileId || nextProfileId === selectedProfileId) {
      return;
    }

    await saveStoredProfileId(nextProfileId);
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["watchlist"] }),
      queryClient.invalidateQueries({ queryKey: ["home", "continue-watching"] }),
      refetchSelectedProfile(),
    ]);
  };

  const currentProfile = profiles.find((profile) => getProfileId(profile) === selectedProfileId) || profiles[0];
  const appVersion = Constants.expoConfig?.version || Constants.expoConfig?.extra?.expoClient?.version || "0.0.0";

  const handleSignOut = async () => {
    await clearStoredProfileId();
    await signOut();
  };

  const menuItems: ProfileMenuItem[] = [
    {
      key: "my-list",
      label: "My List",
      icon: "checkmark",
      action: () => tabNavigation.navigate("MyList"),
    },
    {
      key: "app-settings",
      label: "App Settings",
      icon: "settings-outline",
      action: () => stackNavigation?.navigate("AppSettings" as never),
    },
    {
      key: "account",
      label: "Account",
      icon: "person-outline",
      action: () => stackNavigation?.navigate("Account" as never),
    },
    {
      key: "help",
      label: "Help",
      icon: "help-circle-outline",
      action: () => stackNavigation?.navigate("Help" as never),
    },
  ];

  const hasNoCachedData = profiles.length === 0 && !isProfilesLoading;

  if (isOffline && hasNoCachedData) {
    return (
      <SafeAreaView className="flex-1 bg-brand-bg" edges={["top"]}>
        <PremiumBackground />
        <OfflineBanner visible={isOffline} />
        <StateView
          icon="cloud-offline-outline"
          title="You're offline"
          description="Reconnect to load and switch profiles."
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-brand-bg" edges={["top"]}>
      <PremiumBackground />
      <OfflineBanner visible={isOffline} />
      <ScreenReveal className="flex-1">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 30 }}>
        <SectionHeader title={currentProfile?.name || "Profile"} subtitle="Manage your profile and account" />

        <View className="mt-4 px-4">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 14, paddingRight: 8 }}>
            {profiles.map((profile) => {
              const profileId = getProfileId(profile);
              if (!profileId) return null;

              const isActive = profileId === selectedProfileId;
              const avatarSource = getLocalProfileAvatarSource(profile);

              return (
                <Pressable
                  key={profileId}
                  onPress={() => void selectProfile(profileId)}
                  className="items-center"
                  accessibilityRole="button"
                  accessibilityLabel={`Switch to ${profile.name} profile`}
                >
                  <ProfileAvatar name={profile.name} source={avatarSource} size={60} active={isActive} />
                  <Text numberOfLines={1} className={`mt-1 max-w-[68px] text-center text-xs ${isActive ? "font-semibold text-white" : "text-zinc-400"}`}>
                    {profile.name}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {!isProfilesLoading && !isProfilesError && profiles.length === 0 ? (
            <Text className="mt-3 text-sm text-zinc-400">No profiles found for this account.</Text>
          ) : null}

          <AnimatedPressable
            className="mt-5 flex-row items-center justify-center gap-2 border-y border-white/10 py-4"
            accessibilityRole="button"
            accessibilityLabel="Manage Profiles"
          >
            <Ionicons name="create-outline" size={16} color="#A1A1AA" />
            <Text className="text-lg font-semibold text-zinc-300">Manage Profiles</Text>
          </AnimatedPressable>
        </View>

        <View className="mx-4 mt-2 overflow-hidden rounded-2xl border border-white/10 bg-[#0B0D12]">
          {menuItems.map((item, index) => (
            <MenuRow
              key={item.key}
              label={item.label}
              icon={item.icon}
              onPress={item.action}
              showDivider={index < menuItems.length - 1}
            />
          ))}
        </View>

        <View className="px-4 pt-4">
          <View className="rounded-xl border border-white/10 bg-brand-card p-3">
            <Text className="text-xs uppercase tracking-[1px] text-zinc-500">Account</Text>
            <Text className="mt-1 text-sm text-zinc-200">{user?.primaryEmailAddress?.emailAddress || "Unknown user"}</Text>
            <Text className="mt-1 text-xs text-zinc-500">{isProfilesLoading ? "Loading profiles..." : `${profiles.length} profiles`}</Text>
            {isProfilesError ? <Text className="mt-1 text-xs text-red-300">Could not load profiles.</Text> : null}
            {isProfilesFetching ? <Text className="mt-1 text-xs text-zinc-500">Refreshing profiles...</Text> : null}
          </View>
        </View>

        <AnimatedPressable
          onPress={() => void handleSignOut()}
          className="mx-4 mt-6 flex-row items-center justify-center gap-2 rounded-full bg-brand-red px-6 py-3"
          accessibilityRole="button"
          accessibilityLabel="Sign Out"
        >
          <Ionicons name="log-out-outline" size={16} color="#FFFFFF" />
          <Text className="text-center text-base font-bold text-white">Sign Out</Text>
        </AnimatedPressable>
        <View className="pt-2">
          <Text className="mt-1 text-center text-xs text-zinc-500">Version: {appVersion}</Text>
        </View>
      </ScrollView>
      </ScreenReveal>
    </SafeAreaView>
  );
}