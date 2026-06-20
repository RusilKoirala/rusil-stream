import { memo } from "react";
import { Image } from "expo-image";
import { StyleSheet, View, type ImageStyle, type StyleProp } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/lib/tokens";

interface PosterImageProps {
  uri: string | null | undefined;
  recyclingKey: string;
  style?: StyleProp<ImageStyle>;
}

function PosterImageBase({ uri, recyclingKey, style }: PosterImageProps) {
  if (!uri) {
    return (
      <View style={[s.placeholder, style]}>
        <Ionicons name="film-outline" size={18} color={colors.text40} />
      </View>
    );
  }

  return (
    <Image
      source={{ uri }}
      style={[s.image, style]}
      contentFit="cover"
      transition={0}
      cachePolicy="memory-disk"
      recyclingKey={recyclingKey}
    />
  );
}

export const PosterImage = memo(PosterImageBase);

const s = StyleSheet.create({
  image: {
    width: "100%",
    height: "100%",
  },
  placeholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.bgRaised,
  },
});
