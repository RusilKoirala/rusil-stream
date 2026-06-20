import { useUser } from "@clerk/clerk-expo";
import { useQuery } from "@tanstack/react-query";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import { MenuRow } from "@/components/ui/menu-row";
import { ProfileAvatar } from "@/components/ui/profile-avatar";
import { ScreenReveal } from "@/components/ui/screen-reveal";
import { SectionHeader } from "@/components/ui/section-header";
import { SkeletonBox } from "@/components/ui/skeleton-box";
import { getProfiles } from "@/lib/api";
import { getStoredProfileId } from "@/lib/watchlist-storage";
import { getProfileId, getLocalProfileAvatarSource } from "@/lib/local-profiles";
import { colors, space, radius, type as t } from "@/lib/tokens";

function truncateId(id: string | undefined | null): string {
  if (!id) return "—";
  return id.length > 16 ? `${id.slice(0, 16)}…` : id;
}

function formatDate(date: Date | null | undefined): string {
  if (!date) return "—";
  return date.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}

function providerIcon(provider: string): keyof typeof Ionicons.glyphMap {
  const p = provider.toLowerCase();
  if (p.includes("google")) return "logo-google";
  if (p.includes("apple"))  return "logo-apple";
  if (p.includes("github")) return "logo-github";
  return "person-circle-outline";
}
function providerLabel(provider: string): string {
  const p = provider.toLowerCase();
  if (p.includes("google")) return "Google";
  if (p.includes("apple"))  return "Apple";
  if (p.includes("github")) return "GitHub";
  return provider;
}

// ─── Reusable info card ───────────────────────────────────────────────────────

function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={s.card}>
      <Text style={s.cardLabel}>{title}</Text>
      {children}
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

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
    profiles.find((p) => getProfileId(p) === selectedProfileId) ?? profiles[0] ?? null;
  const loading = !user || profilesLoading;

  function handleManageProfiles() {
    Alert.alert("Manage Profiles", "Profile management is coming soon.");
  }
  function handleChangePassword() {
    Alert.alert(
      "Change Password",
      "To change your password, visit rusil.me or use the web app.",
      [{ text: "OK" }]
    );
  }

  return (
    <SafeAreaView style={s.root} edges={["top"]}>
      <ScreenReveal style={{ flex: 1 }}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={s.scroll}
          showsVerticalScrollIndicator={false}
        >
          <SectionHeader title="Account" subtitle="Identity and profile details" />

          {/* Account info */}
          <InfoCard title="Account">
            {loading ? (
              <View style={{ gap: space[2], marginTop: space[3] }}>
                <SkeletonBox height={16} borderRadius={4} />
                <SkeletonBox height={13} width="60%" borderRadius={4} />
                <SkeletonBox height={13} width="70%" borderRadius={4} />
              </View>
            ) : (
              <View style={{ gap: space[1], marginTop: space[3] }}>
                <Text style={s.cardValue}>{user?.primaryEmailAddress?.emailAddress ?? "Unknown user"}</Text>
                <Text style={s.cardMeta}>ID: {truncateId(user?.id)}</Text>
                <Text style={s.cardMeta}>Member since: {formatDate(user?.createdAt)}</Text>
              </View>
            )}
          </InfoCard>

          {/* Active profile */}
          <InfoCard title="Active profile">
            {loading ? (
              <View style={[s.row, { marginTop: space[3] }]}>
                <SkeletonBox width={48} height={48} borderRadius={10} />
                <View style={{ flex: 1, gap: space[2] }}>
                  <SkeletonBox height={16} width="50%" borderRadius={4} />
                  <SkeletonBox height={12} width="35%" borderRadius={4} />
                </View>
              </View>
            ) : activeProfile ? (
              <View style={[s.row, { marginTop: space[3] }]}>
                <ProfileAvatar
                  name={activeProfile.name}
                  source={getLocalProfileAvatarSource(activeProfile)}
                  size={48}
                  active
                />
                <View style={{ flex: 1 }}>
                  <Text style={s.cardValue}>{activeProfile.name}</Text>
                  {activeProfile.maturityRating ? (
                    <Text style={s.cardMeta}>{activeProfile.maturityRating}</Text>
                  ) : null}
                </View>
              </View>
            ) : (
              <Text style={[s.cardMeta, { marginTop: space[3] }]}>No profile selected</Text>
            )}
          </InfoCard>

          {/* All profiles */}
          <InfoCard title={`Profiles (${profiles.length})`}>
            {loading ? (
              <View style={{ gap: space[3], marginTop: space[3] }}>
                {[0, 1, 2].map((i) => (
                  <View key={i} style={s.row}>
                    <SkeletonBox width={36} height={36} borderRadius={8} />
                    <SkeletonBox height={14} width="45%" borderRadius={4} />
                  </View>
                ))}
              </View>
            ) : profiles.length === 0 ? (
              <Text style={[s.cardMeta, { marginTop: space[3] }]}>No profiles found</Text>
            ) : (
              <View style={{ gap: space[3], marginTop: space[3] }}>
                {profiles.map((profile) => (
                  <View key={getProfileId(profile)} style={s.row}>
                    <ProfileAvatar
                      name={profile.name}
                      source={getLocalProfileAvatarSource(profile)}
                      size={36}
                    />
                    <Text style={s.cardValue}>{profile.name}</Text>
                  </View>
                ))}
              </View>
            )}
          </InfoCard>

          {/* Linked accounts */}
          <InfoCard title="Linked accounts">
            {loading ? (
              <View style={{ gap: space[3], marginTop: space[3] }}>
                {[0, 1].map((i) => (
                  <View key={i} style={s.row}>
                    <SkeletonBox width={32} height={32} borderRadius={16} />
                    <View style={{ flex: 1, gap: space[1] }}>
                      <SkeletonBox height={14} width="40%" borderRadius={4} />
                      <SkeletonBox height={12} width="60%" borderRadius={4} />
                    </View>
                  </View>
                ))}
              </View>
            ) : !user?.externalAccounts?.length ? (
              <Text style={[s.cardMeta, { marginTop: space[3] }]}>No linked accounts</Text>
            ) : (
              <View style={{ gap: space[3], marginTop: space[3] }}>
                {user.externalAccounts.map((acct) => {
                  const email = "emailAddress" in acct
                    ? (acct as { emailAddress?: string }).emailAddress
                    : undefined;
                  return (
                    <View key={acct.id} style={s.row}>
                      <View style={s.providerIcon}>
                        <Ionicons name={providerIcon(acct.provider)} size={16} color={colors.text60} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={s.cardValue}>{providerLabel(acct.provider)}</Text>
                        {email ? <Text style={s.cardMeta}>{email}</Text> : null}
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </InfoCard>

          {/* Actions */}
          <View style={s.actionsCard}>
            <MenuRow label="Manage Profiles" icon="people-outline" onPress={handleManageProfiles} />
            <MenuRow label="Change Password" icon="lock-closed-outline" onPress={handleChangePassword} showDivider={false} />
          </View>
        </ScrollView>
      </ScreenReveal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingBottom: 48, gap: space[3] },

  // Cards
  card: {
    marginHorizontal: space[4],
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    padding: space[5],
  },
  cardLabel: {
    fontSize: t.size.xs,
    fontWeight: t.weight.semibold,
    color: colors.text20,
    letterSpacing: t.tracking.widest,
    textTransform: "uppercase",
  },
  cardValue: {
    fontSize: t.size.base,
    fontWeight: t.weight.medium,
    color: colors.text80,
  },
  cardMeta: {
    fontSize: t.size.xs,
    color: colors.text40,
    lineHeight: t.size.xs * 1.6,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: space[3],
  },
  providerIcon: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: colors.bgRaised,
    alignItems: "center",
    justifyContent: "center",
  },

  // Actions card
  actionsCard: {
    marginHorizontal: space[4],
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    overflow: "hidden",
  },
});
