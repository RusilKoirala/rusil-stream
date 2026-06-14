import { useUser } from "@clerk/clerk-expo";
import { useQuery } from "@tanstack/react-query";
import { Alert, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import { MenuRow } from "@/components/ui/menu-row";
import { PremiumBackground } from "@/components/ui/premium-background";
import { ProfileAvatar } from "@/components/ui/profile-avatar";
import { ScreenReveal } from "@/components/ui/screen-reveal";
import { SectionHeader } from "@/components/ui/section-header";
import { getProfiles } from "@/lib/api";
import { getStoredProfileId } from "@/lib/watchlist-storage";
import { getProfileId, getLocalProfileAvatarSource } from "@/lib/local-profiles";
import { SkeletonBox } from "@/components/ui/skeleton-box";

function truncateUserId(id: string | undefined | null): string {
  if (!id) return "—";
  return id.length > 16 ? id.slice(0, 16) + "…" : id;
}

function formatDate(date: Date | null | undefined): string {
  if (!date) return "—";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function getProviderIcon(provider: string): keyof typeof Ionicons.glyphMap {
  const p = provider.toLowerCase();
  if (p.includes("google")) return "logo-google";
  if (p.includes("apple")) return "logo-apple";
  if (p.includes("github")) return "logo-github";
  return "person-circle-outline";
}

function getProviderLabel(provider: string): string {
  const p = provider.toLowerCase();
  if (p.includes("google")) return "Google";
  if (p.includes("apple")) return "Apple";
  if (p.includes("github")) return "GitHub";
  return provider;
}

export function AccountScreen() {
  const { user } = useUser();

  const { data: profiles = [], isLoading: profilesLoading } = useQuery({
    queryKey: ["profiles", "account"],
    queryFn: getProfiles,
  });

  const { data: selectedProfileId } = useQuery({
    queryKey: ["selected-profile-id", "account"],
    queryFn: getStoredProfileId,
  });

  const activeProfile =
    profiles.find((p) => getProfileId(p) === selectedProfileId) || profiles[0] || null;

  const isLoading = !user || profilesLoading;

  function handleManageProfiles() {
    Alert.alert("Manage Profiles", "Profile management is coming soon.");
  }

  function handleChangePassword() {
    Alert.alert(
      "Change Password",
      "To change your password, please visit the account portal at rusil.me or use the web app.",
      [{ text: "OK" }]
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-brand-bg" edges={["top"]}>
      <PremiumBackground />
      <ScreenReveal className="flex-1">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <SectionHeader title="Account" subtitle="Manage your account identity and profile context" />

        {/* ── Account Info Card ── */}
        <View className="mt-2 rounded-2xl border border-white/10 bg-[#0B0D12] p-4">
          <Text className="text-xs uppercase tracking-[1px] text-zinc-500">Account</Text>

          {isLoading ? (
            <View className="mt-3 gap-y-2">
              <SkeletonBox height={16} borderRadius={4} />
              <SkeletonBox height={14} width="60%" borderRadius={4} />
              <SkeletonBox height={14} width="70%" borderRadius={4} />
            </View>
          ) : (
            <>
              <Text className="mt-2 text-base font-semibold text-zinc-100">
                {user?.primaryEmailAddress?.emailAddress || "Unknown user"}
              </Text>
              <Text className="mt-1 text-xs text-zinc-500">
                ID: {truncateUserId(user?.id)}
              </Text>
              <Text className="mt-1 text-xs text-zinc-500">
                Member since: {formatDate(user?.createdAt)}
              </Text>
            </>
          )}
        </View>

        {/* ── Active Profile Card ── */}
        <View className="mt-4 rounded-2xl border border-white/10 bg-[#0B0D12] p-4">
          <Text className="text-xs uppercase tracking-[1px] text-zinc-500">Active Profile</Text>

          {isLoading ? (
            <View className="mt-3 flex-row items-center gap-x-3">
              <SkeletonBox width={48} height={48} borderRadius={8} />
              <View className="flex-1 gap-y-2">
                <SkeletonBox height={16} width="50%" borderRadius={4} />
                <SkeletonBox height={12} width="35%" borderRadius={4} />
              </View>
            </View>
          ) : activeProfile ? (
            <View className="mt-3 flex-row items-center gap-x-3">
              <ProfileAvatar
                name={activeProfile.name}
                source={getLocalProfileAvatarSource(activeProfile)}
                size={48}
                active
              />
              <View className="flex-1">
                <Text className="text-base font-semibold text-zinc-100">
                  {activeProfile.name}
                </Text>
                {activeProfile.maturityRating && (
                  <Text className="mt-0.5 text-xs text-zinc-500">
                    {activeProfile.maturityRating}
                  </Text>
                )}
              </View>
            </View>
          ) : (
            <Text className="mt-2 text-sm text-zinc-500">No profile selected</Text>
          )}
        </View>

        {/* ── All Profiles ── */}
        <View className="mt-4 rounded-2xl border border-white/10 bg-[#0B0D12] p-4">
          <Text className="text-xs uppercase tracking-[1px] text-zinc-500">Profiles</Text>

          {isLoading ? (
            <View className="mt-3 gap-y-3">
              {[0, 1, 2].map((i) => (
                <View key={i} className="flex-row items-center gap-x-3">
                  <SkeletonBox width={40} height={40} borderRadius={6} />
                  <SkeletonBox height={14} width="45%" borderRadius={4} />
                </View>
              ))}
            </View>
          ) : profiles.length === 0 ? (
            <Text className="mt-2 text-sm text-zinc-500">No profiles found</Text>
          ) : (
            <View className="mt-3 gap-y-3">
              {profiles.map((profile) => {
                const avatarSource = getLocalProfileAvatarSource(profile);
                const profileId = getProfileId(profile);
                return (
                  <View key={profileId} className="flex-row items-center gap-x-3">
                    <ProfileAvatar name={profile.name} source={avatarSource} size={40} />
                    <Text className="flex-1 text-sm font-medium text-zinc-100">
                      {profile.name}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* ── Linked Accounts ── */}
        <View className="mt-4 rounded-2xl border border-white/10 bg-[#0B0D12] p-4">
          <Text className="text-xs uppercase tracking-[1px] text-zinc-500">Linked Accounts</Text>

          {isLoading ? (
            <View className="mt-3 gap-y-3">
              {[0, 1].map((i) => (
                <View key={i} className="flex-row items-center gap-x-3">
                  <SkeletonBox width={32} height={32} borderRadius={16} />
                  <View className="flex-1 gap-y-1.5">
                    <SkeletonBox height={14} width="40%" borderRadius={4} />
                    <SkeletonBox height={12} width="60%" borderRadius={4} />
                  </View>
                </View>
              ))}
            </View>
          ) : !user?.externalAccounts || user.externalAccounts.length === 0 ? (
            <Text className="mt-2 text-sm text-zinc-500">No linked accounts</Text>
          ) : (
            <View className="mt-3 gap-y-3">
              {user.externalAccounts.map((account) => {
                const iconName = getProviderIcon(account.provider);
                const label = getProviderLabel(account.provider);
                const email =
                  "emailAddress" in account
                    ? (account as { emailAddress?: string }).emailAddress
                    : undefined;
                return (
                  <View
                    key={account.id}
                    className="flex-row items-center gap-x-3"
                  >
                    <View className="h-8 w-8 items-center justify-center rounded-full bg-zinc-800">
                      <Ionicons name={iconName} size={18} color="#F8F8F8" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-sm font-medium text-zinc-100">{label}</Text>
                      {email && (
                        <Text className="mt-0.5 text-xs text-zinc-500">{email}</Text>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* ── Action Rows ── */}
        <View className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-[#0B0D12]">
          <MenuRow
            label="Manage Profiles"
            icon="people-outline"
            onPress={handleManageProfiles}
          />
          <MenuRow
            label="Change Password"
            icon="lock-closed-outline"
            onPress={handleChangePassword}
            showDivider={false}
          />
        </View>
      </ScrollView>
      </ScreenReveal>
    </SafeAreaView>
  );
}
