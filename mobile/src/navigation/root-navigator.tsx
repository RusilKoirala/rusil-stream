import { NavigationContainer, DarkTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "@clerk/clerk-expo";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AuthScreen } from "@/components/auth/auth-screen";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { StartupAnimation } from "@/components/ui/startup-animation";
import { getProfilesCached } from "@/lib/api";
import { getStoredProfileId } from "@/lib/watchlist-storage";
import { MainTabs } from "@/navigation/main-tabs";
import { ProfilePickerScreen } from "@/screens/profile-picker-screen";
import { AppSettingsScreen } from "@/screens/app-settings-screen";
import { AccountScreen } from "@/screens/account-screen";
import { DetailsScreen } from "@/screens/details-screen";
import { HelpScreen } from "@/screens/help-screen";
import { PlayerScreen } from "@/screens/player-screen";
import type { RootStackParamList } from "@/navigation/types";

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const [startupDone, setStartupDone] = useState(false);
  const [profileGateState, setProfileGateState] = useState<"checking" | "needs-selection" | "ready">("checking");
  const { isLoaded, isSignedIn } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    let isCancelled = false;

    const hydrateProfileSelection = async () => {
      if (!isLoaded || !isSignedIn) return;

      setProfileGateState("checking");

      try {
        const [profiles, storedProfileId] = await Promise.all([
          getProfilesCached((updatedProfiles) => {
            queryClient.setQueryData(["profiles", "mobile"], updatedProfiles);
            queryClient.setQueryData(["profiles", "picker"], updatedProfiles);
          }),
          getStoredProfileId(),
        ]);

        queryClient.setQueryData(["profiles", "mobile"], profiles);
        queryClient.setQueryData(["profiles", "picker"], profiles);

        const availableProfileIds = new Set(
          profiles
            .map((profile) => profile.id || profile._id)
            .filter((profileId): profileId is string => Boolean(profileId)),
        );

        if (storedProfileId && availableProfileIds.has(storedProfileId)) {
          if (!isCancelled) setProfileGateState("ready");
          return;
        }

        if (!isCancelled) {
          setProfileGateState(availableProfileIds.size > 0 ? "needs-selection" : "ready");
        }
      } catch {
        if (!isCancelled) setProfileGateState("ready");
      }
    };

    void hydrateProfileSelection();

    return () => {
      isCancelled = true;
    };
  }, [isLoaded, isSignedIn, queryClient]);

  if (!startupDone) {
    return <StartupAnimation onDone={() => setStartupDone(true)} />;
  }

  if (!isLoaded) {
    return <LoadingScreen label="Preparing session..." />;
  }

  if (!isSignedIn) {
    return <AuthScreen />;
  }

  if (profileGateState === "checking") {
    return <LoadingScreen label="Loading profiles..." />;
  }

  if (profileGateState === "needs-selection") {
    return <ProfilePickerScreen onProfileSelected={() => setProfileGateState("ready")} />;
  }

  return (
    <NavigationContainer
      theme={{
        ...DarkTheme,
        colors: {
          ...DarkTheme.colors,
          background: "#07090F",
          card: "#0E1420",
          text: "#FFFFFF",
          border: "rgba(255,255,255,0.1)",
          primary: "#E50914",
        },
      }}
    >
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: "#07090F" },
          headerShadowVisible: false,
          headerTintColor: "#FFFFFF",
          contentStyle: { backgroundColor: "#07090F" },
          animation: "fade_from_bottom",
          animationDuration: 220,
          gestureEnabled: true,
          fullScreenGestureEnabled: true,
        }}
      >
        <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
        <Stack.Screen name="Details" component={DetailsScreen} options={{ title: "Details" }} />
        <Stack.Screen name="Player" component={PlayerScreen} options={{ title: "Player", headerShown: false }} />
        <Stack.Screen name="AppSettings" component={AppSettingsScreen} options={{ title: "App Settings" }} />
        <Stack.Screen name="Account" component={AccountScreen} options={{ title: "Account" }} />
        <Stack.Screen name="Help" component={HelpScreen} options={{ title: "Help" }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
