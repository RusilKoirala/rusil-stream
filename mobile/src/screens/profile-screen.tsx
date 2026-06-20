import { useClerk, useUser } from "@clerk/clerk-expo";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
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
import { ProfileAvatar } from "@/components/ui/profile-avatar";
import { ScreenReveal } from "@/components/ui/screen-reveal";
import { StateView } from "@/components/ui/state-view";
import { useNetworkStatus } from "@/hooks/use-network-status";
import { colors, space, radius, type as t, shadow } from "@/lib/tokens";

interface ProfileMenuItem {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  action: () => void;
  destructive?: boolean;
}

export function ProfileScreen() {
  const tabNav = useNavigation<BottomTabNavigationProp<MainTabParamList>>();
  const stackNav = tabNav.getParent();
  const { signOut } = useClerk();
  const { user } = useUser();
  const queryClient = useQueryClient();
  const { isOffline } = useNetworkStatus();

  const { data: profiles = [], isLoading, isError, isFetching } = useQuery({
    queryKey: ["profiles", "mobile"],
    queryFn: () =>
      getProfilesCached((updated) => {
        queryClient.setQueryData(["profiles", "mobile"], updated);
        queryClient.setQueryData(["profiles", "picker"], updated);
      }),
    staleTime: Infinity,
  });

  const { data: selectedProfileId, refetch: refetchSelected } = useQuery({
    queryKey: ["selected-profile-id", "mobile"],
    queryFn: getStoredProfileId,
  });

  const selectProfile = async (profileId: string) => {
    if (!profileId || profileId === selectedProfileId) return;
    await saveStoredProfileId(profileId);
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["watchlist"] }),
      queryClient.invalidateQueries({ queryKey: ["home", "continue-watching"] }),
      refetchSelected(),
    ]);
  };

  const handleSignOut = async () => {
    await clearStoredProfileId();
    await signOut();
  };

  const currentProfile =
    profiles.find((p) => getProfileId(p) === selectedProfileId) ?? profiles[0];
  const appVersion =
    Constants.expoConfig?.version ??
    Constants.expoConfig?.extra?.expoClient?.version ??
    "0.0.0";

  const menuItems: ProfileMenuItem[] = [
    { key: "my-list",      label: "My List",      icon: "bookmark-outline",       action: () => tabNav.navigate("MyList") },
    { key: "app-settings", label: "App Settings", icon: "settings-outline",       action: () => stackNav?.navigate("AppSettings" as never) },
    { key: "account",      label: "Account",      icon: "person-outline",         action: () => stackNav?.navigate("Account" as never) },
    { key: "help",         label: "Help",         icon: "help-circle-outline",    action: () => stackNav?.navigate("Help" as never) },
  ];

  if (isOffline && profiles.length === 0 && !isLoading) {
    return (
      <SafeAreaView style={s.root} edges={["top"]}>
        <OfflineBanner visible />
        <StateView icon="cloud-offline-outline" title="You're offline" description="Reconnect to load and switch profiles." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.root} edges={["top"]}>
      <OfflineBanner visible={isOffline} />
      <ScreenReveal style={{ flex: 1 }}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={s.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Active profile hero ─────────────────────────────────── */}
          <View style={s.heroSection}>
            {currentProfile ? (
              <>
                <ProfileAvatar
                  name={currentProfile.name}
                  source={getLocalProfileAvatarSource(currentProfile)}
                  size={72}
                  active
                />
                <View style={s.heroText}>
                  <Text style={s.heroName}>{currentProfile.name}</Text>
                  <Text style={s.heroEmail}>
                    {user?.primaryEmailAddress?.emailAddress ?? "—"}
                  </Text>
                </View>
              </>
            ) : (
              <View style={s.heroText}>
                <Text style={s.heroName}>My Profile</Text>
                <Text style={s.heroEmail}>
                  {user?.primaryEmailAddress?.emailAddress ?? "—"}
                </Text>
              </View>
            )}
          </View>

          {/* ── Profile switcher ────────────────────────────────────── */}
          {profiles.length > 1 && (
            <View style={s.switcherSection}>
              <Text style={s.label}>Switch profile</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={s.switcherRow}
              >
                {profiles.map((profile) => {
                  const profileId = getProfileId(profile);
                  if (!profileId) return null;
                  const isActive = profileId === selectedProfileId;
                  return (
                    <Pressable
                      key={profileId}
                      onPress={() => void selectProfile(profileId)}
                      accessibilityRole="button"
                      accessibilityLabel={`Switch to ${profile.name}`}
                      style={({ pressed }) => [s.switcherTile, pressed && { opacity: 0.7 }]}
                    >
                      <View style={[s.switcherRing, isActive && s.switcherRingActive]}>
                        <ProfileAvatar
                          name={profile.name}
                          source={getLocalProfileAvatarSource(profile)}
                          size={48}
                          active={isActive}
                        />
                      </View>
                      <Text style={[s.switcherName, isActive && s.switcherNameActive]} numberOfLines={1}>
                        {profile.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* ── Menu ────────────────────────────────────────────────── */}
          <View style={s.card}>
            {menuItems.map((item, i) => (
              <MenuRow
                key={item.key}
                label={item.label}
                icon={item.icon}
                onPress={item.action}
                showDivider={i < menuItems.length - 1}
              />
            ))}
          </View>

          {/* ── Sign out ────────────────────────────────────────────── */}
          <AnimatedPressable
            onPress={() => void handleSignOut()}
            accessibilityRole="button"
            accessibilityLabel="Sign out"
            style={s.signOutBtn}
          >
            <Ionicons name="log-out-outline" size={16} color={colors.text40} />
            <Text style={s.signOutText}>Sign out</Text>
          </AnimatedPressable>

          <Text style={s.version}>v{appVersion}</Text>
        </ScrollView>
      </ScreenReveal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingBottom: 40 },

  // Hero
  heroSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: space[4],
    paddingHorizontal: space[5],
    paddingTop: space[6],
    paddingBottom: space[6],
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  heroText: { flex: 1, gap: space[1] },
  heroName: {
    fontSize: t.size.xl,
    fontWeight: t.weight.bold,
    color: colors.text100,
    letterSpacing: t.tracking.tight,
  },
  heroEmail: {
    fontSize: t.size.sm,
    color: colors.text40,
  },

  // Switcher
  switcherSection: { paddingTop: space[5], paddingBottom: space[2] },
  label: {
    fontSize: t.size.xs,
    fontWeight: t.weight.semibold,
    color: colors.text20,
    letterSpacing: t.tracking.widest,
    textTransform: "uppercase",
    paddingHorizontal: space[5],
    marginBottom: space[3],
  },
  switcherRow: {
    gap: space[4],
    paddingHorizontal: space[5],
  },
  switcherTile: { alignItems: "center", gap: space[2] },
  switcherRing: {
    borderWidth: 2,
    borderColor: "transparent",
    borderRadius: radius.md + 2,
    padding: 2,
  },
  switcherRingActive: { borderColor: colors.red },
  switcherName: {
    fontSize: 11,
    color: colors.text40,
    fontWeight: t.weight.medium,
    maxWidth: 64,
    textAlign: "center",
  },
  switcherNameActive: { color: colors.text80, fontWeight: t.weight.semibold },

  // Menu card
  card: {
    marginHorizontal: space[4],
    marginTop: space[4],
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    overflow: "hidden",
  },

  // Sign out
  signOutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: space[2],
    marginHorizontal: space[4],
    marginTop: space[4],
    paddingVertical: space[4],
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
  },
  signOutText: {
    fontSize: t.size.base,
    fontWeight: t.weight.semibold,
    color: colors.text40,
  },

  // Version
  version: {
    textAlign: "center",
    fontSize: t.size.xs,
    color: colors.text20,
    marginTop: space[5],
  },
});
