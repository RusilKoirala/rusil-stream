import { memo, useCallback } from "react";
import { FlatList, View } from "react-native";
import type { Content } from "@/types/content";
import { ContentCard } from "@/components/ui/content-card";
import { SectionHeader } from "@/components/ui/section-header";

interface ContentRowProps {
  title: string;
  items: Content[];
  onPressItem: (item: Content) => void;
  showRanking?: boolean;
  largeRanking?: boolean;
  hideCountBadge?: boolean;
  onSeeAll?: () => void;
  showCardTitle?: boolean;
}

function ContentRowBase({ title, items, onPressItem, showRanking = false, largeRanking = false, hideCountBadge = false, onSeeAll, showCardTitle = true }: ContentRowProps) {
  const renderItem = useCallback(
    ({ item, index }: { item: Content; index: number }) => (
      <ContentCard
        content={item}
        onPress={() => onPressItem(item)}
        rankNumber={showRanking ? index + 1 : undefined}
        showTitle={showCardTitle && !showRanking}
        rankSize={largeRanking ? "large" : "regular"}
      />
    ),
    [largeRanking, onPressItem, showCardTitle, showRanking]
  );

  const getItemLayout = useCallback(
    (_: ArrayLike<Content> | null | undefined, index: number) => ({
      length: showRanking ? (largeRanking ? 228 : 198) : 166,
      offset: (showRanking ? (largeRanking ? 228 : 198) : 166) * index,
      index,
    }),
    [largeRanking, showRanking]
  );

  if (items.length === 0) return null;

  return (
    <View className="mb-8">
      <SectionHeader
        title={title}
        rightLabel={!hideCountBadge && onSeeAll ? "See All" : undefined}
        onRightPress={onSeeAll}
      />
      <FlatList
        horizontal
        data={items}
        keyExtractor={(item) => `${item.type}-${item.id}`}
        renderItem={renderItem}
        getItemLayout={getItemLayout}
        removeClippedSubviews
        initialNumToRender={4}
        maxToRenderPerBatch={5}
        updateCellsBatchingPeriod={35}
        windowSize={5}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: showRanking ? 8 : 4 }}
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
}

export const ContentRow = memo(ContentRowBase);
