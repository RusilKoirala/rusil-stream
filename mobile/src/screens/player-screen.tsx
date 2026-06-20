import { useEffect, useMemo, useRef, useState } from "react";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, Text, View } from "react-native";
import * as Linking from "expo-linking";
import * as ScreenOrientation from "expo-screen-orientation";
import { StatusBar } from "expo-status-bar";
import { WebView } from "react-native-webview";
import type { WebViewNavigation } from "react-native-webview/lib/WebViewTypes";
import { env } from "@/config/env";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import type { RootStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "Player">;

const ALLOWED_HOSTS = ["vidking.net", "www.vidking.net"];

function canNavigate(url: string) {
  try {
    if (url.startsWith("about:blank") || url.startsWith("data:")) return true;

    const parsed = new URL(url);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      return false;
    }

    const host = parsed.hostname.toLowerCase();
    return ALLOWED_HOSTS.some((allowed) => host === allowed || host.endsWith(`.${allowed}`));
  } catch {
    return false;
  }
}

const BLOCK_REDIRECT_SCRIPT = `
  (function() {
    const originalOpen = window.open;
    window.open = function(url) {
      if (!url) return null;
      try {
        const parsed = new URL(url, window.location.href);
        if (parsed.hostname.includes('vidking.net')) {
          return originalOpen ? originalOpen.apply(window, arguments) : null;
        }
      } catch (e) {}
      return null;
    };
  })();
  true;
`;

export function PlayerScreen({ navigation, route }: Props) {
  const { id, type, season = 1, episode = 1 } = route.params;
  const [isLoading, setIsLoading] = useState(true);
  const [loadingTick, setLoadingTick] = useState(0);
  const [hasError, setHasError] = useState(false);
  const webRef = useRef<WebView>(null);

  const src = useMemo(() => {
    const base = env.vidkingBaseUrl.replace(/\/$/, "");
    if (type === "tv") {
      return `${base}/embed/tv/${id}/${season}/${episode}`;
    }
    return `${base}/embed/movie/${id}`;
  }, [episode, id, season, type]);

  useEffect(() => {
    const sub = Linking.addEventListener("url", ({ url }) => {
      // If an external deep link was triggered while playing, force close player.
      if (!canNavigate(url)) {
        navigation.goBack();
      }
    });

    return () => {
      sub.remove();
    };
  }, [navigation]);

  useEffect(() => {
    let mounted = true;

    const enterLandscape = async () => {
      try {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
      } catch {
        // Ignore orientation lock failures to avoid blocking playback.
      }
    };

    void enterLandscape();

    return () => {
      if (!mounted) return;
      mounted = false;

      void ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP).catch(() => {
        // Ignore orientation reset failures.
      });
    };
  }, []);

  useEffect(() => {
    if (!isLoading) {
      return;
    }

    const timer = setInterval(() => {
      setLoadingTick((value) => (value + 1) % 12);
    }, 430);

    return () => {
      clearInterval(timer);
    };
  }, [isLoading]);

  const loadingProgress = Math.min(92, 22 + loadingTick * 6);
  const loadingStage =
    loadingProgress < 45 ? "Establishing secure player" : loadingProgress < 75 ? "Buffering stream" : "Finalizing playback";
  const loadingDots = ".".repeat((loadingTick % 4) + 1);

  return (
    <View className="flex-1 bg-black">
      <StatusBar hidden style="light" />

      <View className="absolute left-0 right-0 top-4 z-20 flex-row items-center px-4">
        <AnimatedPressable
          onPress={() => navigation.goBack()}
          className="h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/70"
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
        </AnimatedPressable>
      </View>

      {isLoading ? (
        <View className="absolute inset-0 z-10 items-center justify-center bg-black px-6">
          <View className="w-full max-w-sm rounded-3xl border border-white/10 bg-zinc-950/90 px-6 py-7">
            <View className="flex-row items-center justify-center">
              <ActivityIndicator size="small" color="#E50914" />
              <Text className="ml-2 text-xs uppercase tracking-[2px] text-zinc-400">Loading{loadingDots}</Text>
            </View>

            <Text className="mt-4 text-center text-lg font-semibold text-white">Preparing playback</Text>
            <Text className="mt-2 text-center text-sm text-zinc-400">{loadingStage}</Text>

            <View className="mt-4 overflow-hidden rounded-full bg-zinc-800/80">
              <View className="h-1.5 rounded-full bg-brand-red" style={{ width: `${loadingProgress}%` }} />
            </View>
          </View>
        </View>
      ) : null}

      {hasError ? (
        <View className="absolute inset-0 z-10 items-center justify-center bg-black px-6">
          <View className="w-full max-w-sm rounded-3xl border border-white/10 bg-[#0E1420]/95 px-6 py-7">
            <Text className="text-center text-base text-white">Could not load video stream.</Text>
            <Text className="mt-2 text-center text-sm text-zinc-400">Try opening this title again from Details.</Text>
            <AnimatedPressable onPress={() => navigation.goBack()} className="mt-5 self-center rounded-full bg-zinc-700 px-5 py-2.5" accessibilityRole="button" accessibilityLabel="Go Back">
            <Text className="font-semibold text-white">Go Back</Text>
            </AnimatedPressable>
          </View>
        </View>
      ) : null}

      <WebView
        ref={webRef}
        source={{ uri: src }}
        injectedJavaScriptBeforeContentLoaded={BLOCK_REDIRECT_SCRIPT}
        onLoadStart={() => {
          setIsLoading(true);
          setHasError(false);
        }}
        onLoadEnd={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
        onShouldStartLoadWithRequest={(request) => {
          if (request.isTopFrame === false) {
            return true;
          }

          if (canNavigate(request.url)) {
            return true;
          }

          webRef.current?.stopLoading();
          navigation.goBack();
          return false;
        }}
        originWhitelist={["https://vidking.net/*", "https://www.vidking.net/*", "about:blank"]}
        setSupportMultipleWindows={false}
        javaScriptCanOpenWindowsAutomatically={false}
        allowsBackForwardNavigationGestures={false}
        allowsLinkPreview={false}
        sharedCookiesEnabled={false}
        thirdPartyCookiesEnabled={false}
        mediaPlaybackRequiresUserAction={false}
        allowsInlineMediaPlayback
      />
    </View>
  );
}
