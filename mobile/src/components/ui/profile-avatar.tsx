import { Image, Text, View } from "react-native";
import type { ImageSourcePropType } from "react-native";

interface ProfileAvatarProps {
  name: string;
  source?: ImageSourcePropType | null;
  size?: number;
  active?: boolean;
}

export function ProfileAvatar({ name, source, size = 56, active = false }: ProfileAvatarProps) {
  const radius = Math.max(8, Math.floor(size * 0.18));
  const initial = name.slice(0, 1).toUpperCase();

  return (
    <View
      className={`overflow-hidden bg-zinc-800 ${active ? "border-white" : "border-white/15"}`}
      style={{ width: size, height: size, borderRadius: radius, borderWidth: 1.4 }}
    >
      {source ? (
        <Image source={source} className="h-full w-full" resizeMode="cover" />
      ) : (
        <View className="h-full w-full items-center justify-center bg-zinc-700">
          <Text className="font-black text-white" style={{ fontSize: Math.max(14, Math.floor(size * 0.32)) }}>
            {initial}
          </Text>
        </View>
      )}
    </View>
  );
}
