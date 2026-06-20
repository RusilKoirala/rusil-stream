import { memo } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import type { Content } from "@/types/content";
import { ContentCard } from "@/components/ui/content-card";
import { SectionHeader } from "@/components/ui/section-header";

const MAX_ROW_ITEMS = 12;

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

function ContentRowBase({
  title,
  items,
  onPressItem,
  showRanking = false,
  largeRanking = false,
  hideCountBadge = false,
  onSeeAll,
  showCardTitle = true,
}: ContentRowProps) {
  if (items.length === 0) return null;

  // Never render a card that has no poster — a blank grey rectangle
  // looks broken and wastes a slot in the row.
  const withPoster = items.filter((item) => Boolean(item.posterPath));
  if (withPoster.length === 0) return null;

  const visibleItems = withPoster.length > MAX_ROW_ITEMS
    ? withPoster.slice(0, MAX_ROW_ITEMS)
    : withPoster;

  return (
    <View style={s.root}>
      <SectionHeader
        title={title}
        rightLabel={!hideCountBadge && onSeeAll ? "See All" : undefined}
        onRightPress={onSeeAll}
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        directionalLockEnabled
        nestedScrollEnabled
        overScrollMode="never"
        contentContainerStyle={[
          s.listContent,
          showRanking && (largeRanking ? s.listContentRankedLg : s.listContentRanked),
        ]}
        style={showRanking ? s.listWithRanking : undefined}
      >
        {visibleItems.map((item, index) => (
          <ContentCard
            key={`${item.type}-${item.id}`}
            content={item}
            onPressItem={onPressItem}
            rankNumber={showRanking ? index + 1 : undefined}
            showTitle={showCardTitle && !showRanking}
            rankSize={largeRanking ? "large" : "regular"}
          />
        ))}
      </ScrollView>
    </View>
  );
}

export const ContentRow = memo(
  ContentRowBase,
  (prev, next) =>
    prev.title === next.title &&
    prev.items === next.items &&
    prev.onPressItem === next.onPressItem &&
    prev.showRanking === next.showRanking &&
    prev.largeRanking === next.largeRanking &&
    prev.hideCountBadge === next.hideCountBadge &&
    prev.onSeeAll === next.onSeeAll &&
    prev.showCardTitle === next.showCardTitle
);

const s = StyleSheet.create({
  root: {
    marginBottom: 24,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  listContentRanked: {
    paddingLeft: 12,
    paddingRight: 16,
  },
  listContentRankedLg: {
    paddingLeft: 8,
    paddingRight: 16,
  },
  listWithRanking: {
    paddingTop: 4,
  },
});
