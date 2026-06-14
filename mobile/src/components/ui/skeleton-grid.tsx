import { View } from "react-native";
import { SkeletonBox } from "@/components/ui/skeleton-box";

interface SkeletonGridProps {
  count?: number;
  itemHeight?: number;
}

export function SkeletonGrid({ count = 9, itemHeight = 176 }: SkeletonGridProps) {
  return (
    <View className="mt-4 px-4">
      <View className="mb-3 flex-row flex-wrap justify-between">
        {Array.from({ length: count }).map((_, i) => (
          <View key={i} className="mb-4 basis-[31%]">
            <SkeletonBox height={itemHeight} borderRadius={10} />
          </View>
        ))}
      </View>
    </View>
  );
}
