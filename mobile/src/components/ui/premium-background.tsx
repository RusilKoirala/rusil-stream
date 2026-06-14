import { LinearGradient } from "expo-linear-gradient";
import { View } from "react-native";

export function PremiumBackground() {
  return (
    <>
      <LinearGradient
        colors={["#07090F", "#090C15", "#07090F"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ position: "absolute", inset: 0 }}
      />
      <View className="pointer-events-none absolute -top-28 right-[-92px] h-72 w-72 rounded-full bg-brand-red/18" />
      <View className="pointer-events-none absolute bottom-[-110px] left-[-84px] h-80 w-80 rounded-full bg-cyan-400/10" />
    </>
  );
}
