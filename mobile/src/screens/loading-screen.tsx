import { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { BrandLogo } from "@/components/ui/brand-logo";
import { colors } from "@/lib/tokens";

interface LoadingScreenProps {
  label?: string;
  showApiProbe?: boolean; // kept for API compatibility, unused in UI
}

export function LoadingScreen(_props: LoadingScreenProps) {
  const opacity  = useRef(new Animated.Value(0)).current;
  const pulse    = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    // Logo fades in once
    Animated.timing(opacity, {
      toValue: 1,
      duration: 350,
      useNativeDriver: true,
    }).start();

    // Dot pulses indefinitely
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.6,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [opacity, pulse]);

  return (
    <View style={s.root}>
      <Animated.View style={{ opacity }}>
        <BrandLogo size="lg" styleVariant="web-navbar" style={s.logo} />
      </Animated.View>

      {/* Single pulsing red dot */}
      <Animated.View style={[s.dot, { opacity: pulse }]} />
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: "center",
    justifyContent: "center",
    gap: 28,
  },
  logo: {
    width: 48,
    height: 48,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.red,
  },
});
