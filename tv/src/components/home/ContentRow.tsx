import { useRef } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { CARD_GAP, CARD_W, ContentCard, ROW_PADDING } from './ContentCard';
import { scrollHorizontalToIndex } from '@/lib/focus-scroll';
import type { Content } from '@/types/content';

interface ContentRowProps {
  title?: string;
  items: Content[];
  showRanks?: boolean;
  onRowFocus?: (rowRef: View) => void;
  onPressItem?: (item: Content) => void;
}

export function ContentRow({ title, items, showRanks = false, onRowFocus, onPressItem }: ContentRowProps) {
  const scrollRef = useRef<ScrollView>(null);
  const sectionRef = useRef<View>(null);

  if (!items.length) return null;

  const visibleItems = items.slice(0, 20);

  const handleItemFocus = (index: number) => {
    scrollHorizontalToIndex(
      scrollRef.current,
      index,
      visibleItems.length,
      CARD_W,
      CARD_GAP,
      ROW_PADDING,
    );
    if (sectionRef.current) {
      onRowFocus?.(sectionRef.current);
    }
  };

  return (
    <View ref={sectionRef} style={styles.section}>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
        decelerationRate="fast"
      >
        {visibleItems.map((item, i) => (
          <ContentCard
            key={`${item.type}-${item.id}`}
            content={item}
            rank={showRanks ? i + 1 : undefined}
            onFocusItem={() => handleItemFocus(i)}
            onPress={() => onPressItem?.(item)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 8 },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
    paddingHorizontal: ROW_PADDING,
  },
  row: { paddingHorizontal: ROW_PADDING, gap: CARD_GAP, paddingVertical: 20 },
});
