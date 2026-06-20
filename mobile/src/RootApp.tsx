import { useMemo, useEffect } from "react";
import { ClerkProvider } from "@clerk/clerk-expo";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { env } from "@/config/env";
import { tokenCache } from "@/lib/token-cache";
import { RootNavigator } from "@/navigation/root-navigator";

// Keep the native splash visible until we explicitly hide it
SplashScreen.preventAutoHideAsync().catch(() => {});

export function RootApp() {
  const queryClient = useMemo(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60_000,
            retry: 1,
            refetchOnMount: false,
            refetchOnReconnect: true,
          },
        },
      }),
    []
  );

  // Hide the native splash as soon as JS is ready
  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  if (!env.clerkPublishableKey) {
    return (
      <View className="flex-1 items-center justify-center bg-brand-bg px-6">
        <Text className="text-lg font-semibold text-white">Missing Clerk key</Text>
        <Text className="mt-2 text-center text-sm text-brand-muted">
          Set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in mobile environment variables.
        </Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ClerkProvider publishableKey={env.clerkPublishableKey} tokenCache={tokenCache}>
        <QueryClientProvider client={queryClient}>
          <SafeAreaProvider>
            <View className="flex-1" style={{ backgroundColor: "#080A0F" }}>
              <StatusBar style="light" backgroundColor="#050505" />
              <RootNavigator />
            </View>
          </SafeAreaProvider>
        </QueryClientProvider>
      </ClerkProvider>
    </GestureHandlerRootView>
  );
}
