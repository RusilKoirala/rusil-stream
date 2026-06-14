import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { getApiHealthInfo } from "@/lib/api";
import { BrandLogo } from "@/components/ui/brand-logo";
import { PremiumBackground } from "@/components/ui/premium-background";

interface LoadingScreenProps {
  label?: string;
  showApiProbe?: boolean;
}

const LOADING_STEPS = ["Starting secure session", "Syncing profile state", "Preparing your home feed"];

export function LoadingScreen({ label = "Loading...", showApiProbe = false }: LoadingScreenProps) {
  const [apiMessage, setApiMessage] = useState<string>("");
  const [stepIndex, setStepIndex] = useState(0);
  const [dotCount, setDotCount] = useState(0);

  useEffect(() => {
    const statusTimer = setInterval(() => {
      setStepIndex((value) => (value + 1) % LOADING_STEPS.length);
    }, 1500);

    const dotsTimer = setInterval(() => {
      setDotCount((value) => (value + 1) % 4);
    }, 380);

    return () => {
      clearInterval(statusTimer);
      clearInterval(dotsTimer);
    };
  }, []);

  useEffect(() => {
    if (!showApiProbe) {
      setApiMessage("");
      return;
    }

    let mounted = true;
    setApiMessage("Checking API connection...");

    void getApiHealthInfo().then((health) => {
      if (!mounted) return;

      if (health.status === "healthy") {
        const collections = typeof health.collections === "number" ? ` | ${health.collections} collections` : "";
        setApiMessage(`API connected${collections}`);
        return;
      }

      if (health.status === "unhealthy") {
        setApiMessage(`API unhealthy: ${health.error || "database check failed"}`);
        return;
      }

      setApiMessage(`API check pending: ${health.error || "unknown state"}`);
    });

    return () => {
      mounted = false;
    };
  }, [showApiProbe]);

  return (
    <View className="flex-1 items-center justify-center bg-brand-bg px-6">
      <PremiumBackground />
      <View className="pointer-events-none absolute -top-28 -right-16 h-64 w-64 rounded-full bg-brand-red/20" />
      <View className="pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-orange-500/10" />

      <View className="w-full max-w-sm rounded-3xl border border-white/12 bg-brand-card/92 px-6 py-8">
        <View className="items-center">
          <BrandLogo size="md" styleVariant="web-navbar" className="h-16 w-16" />

          <View className="mt-4 flex-row items-center">
            <ActivityIndicator size="small" color="#E50914" />
            <Text className="ml-2 text-xs uppercase tracking-[2px] text-zinc-400">
              Working{Array.from({ length: dotCount }, () => ".").join("")}
            </Text>
          </View>
        </View>

        <Text className="mt-5 text-center text-lg font-bold text-white">{label}</Text>
        <Text className="mt-2 text-center text-sm text-brand-muted">{LOADING_STEPS[stepIndex]}</Text>

        <View className="mt-4 overflow-hidden rounded-full bg-black/40">
          <View className="h-1.5 rounded-full bg-brand-red" style={{ width: `${22 + stepIndex * 26}%` }} />
        </View>

        {showApiProbe && apiMessage ? (
          <View className="mt-4 rounded-xl border border-white/10 bg-black/25 px-3 py-2">
            <Text className="text-center text-xs text-zinc-400">{apiMessage}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}
