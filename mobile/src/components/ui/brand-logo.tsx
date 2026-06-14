import { Image, View } from "react-native";
import AppLogo from "@assets/logo.png";

interface BrandLogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  imageClassName?: string;
  styleVariant?: "default" | "web-navbar";
}

const SIZE_MAP = {
  sm: { container: "h-11 w-11" },
  md: { container: "h-14 w-14" },
  lg: { container: "h-20 w-20" },
} as const;

export function BrandLogo({ size = "md", className = "", imageClassName = "", styleVariant = "web-navbar" }: BrandLogoProps) {
  const preset = SIZE_MAP[size];

  if (styleVariant === "web-navbar") {
    return (
      <View className={`${preset.container} overflow-hidden rounded-2xl border border-white/25 bg-white p-0.5 shadow-floating ${className}`}>
        <View className="h-full w-full items-center justify-center overflow-hidden rounded-[13px] bg-white/95">
          <Image
            source={AppLogo}
            className={`h-full w-full ${imageClassName}`}
            resizeMode="cover"
            style={{ transform: [{ scale: 2.25 }] }}
          />
        </View>
      </View>
    );
  }

  return (
    <View className={`${preset.container} ${className}`}>
      <Image
        source={AppLogo}
        className={`h-full w-full ${imageClassName}`}
        resizeMode="contain"
      />
    </View>
  );
}