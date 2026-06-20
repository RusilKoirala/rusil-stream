import { Image, StyleSheet, View } from "react-native";
import AppLogo from "@assets/logo.png";

interface BrandLogoProps {
  size?: "sm" | "md" | "lg";
  style?: object;
  styleVariant?: "default" | "web-navbar";
}

const SIZE = { sm: 28, md: 36, lg: 48 } as const;

export function BrandLogo({ size = "md", style, styleVariant = "web-navbar" }: BrandLogoProps) {
  const px = SIZE[size];

  if (styleVariant === "web-navbar") {
    return (
      <View style={[s.navbarWrap, { width: px, height: px }, style]}>
        <Image source={AppLogo} style={s.navbarImage} resizeMode="cover" fadeDuration={0} />
      </View>
    );
  }

  return (
    <View style={[{ width: px, height: px }, style]}>
      <Image source={AppLogo} style={s.defaultImage} resizeMode="contain" fadeDuration={0} />
    </View>
  );
}

const s = StyleSheet.create({
  navbarWrap: {
    overflow: "hidden",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    backgroundColor: "#fff",
  },
  navbarImage: {
    width: "100%",
    height: "100%",
  },
  defaultImage: {
    width: "100%",
    height: "100%",
  },
});
