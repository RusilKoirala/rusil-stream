import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface OfflineBannerProps {
  visible: boolean;
}

export function OfflineBanner({ visible }: OfflineBannerProps) {
  if (!visible) return null;

  return (
    <View style={s.banner}>
      <Ionicons name="cloud-offline-outline" size={14} color="#A3A3A3" />
      <Text style={s.text}>No internet connection</Text>
    </View>
  );
}

const s = StyleSheet.create({
  banner: {
    marginHorizontal: 16,
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    backgroundColor: "#111827",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  text: {
    fontSize: 12,
    fontWeight: "500",
    color: "rgba(255,255,255,0.55)",
  },
});
