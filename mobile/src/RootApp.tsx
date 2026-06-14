import { useMemo } from "react";
import { ClerkProvider } from "@clerk/clerk-expo";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import { Text, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { env } from "@/config/env";
import { tokenCache } from "@/lib/token-cache";
import { RootNavigator } from "@/navigation/root-navigator";

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
    <ClerkProvider publishableKey={env.clerkPublishableKey} tokenCache={tokenCache}>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <View className="flex-1 bg-brand-bg">
            <StatusBar style="light" backgroundColor="#050505" />
            <RootNavigator />
          </View>
        </SafeAreaProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}
