import { Dimensions, ScrollView, View } from 'react-native';

const SCREEN_W = Dimensions.get('window').width;
const SCREEN_H = Dimensions.get('window').height;

export function scrollHorizontalToIndex(
  scrollRef: ScrollView | null,
  index: number,
  itemCount: number,
  itemWidth: number,
  gap: number,
  padding: number,
) {
  if (!scrollRef || itemCount <= 0) return;

  const stride = itemWidth + gap;
  const contentWidth = padding * 2 + itemCount * itemWidth + (itemCount - 1) * gap;
  const itemCenter = padding + index * stride + itemWidth / 2;
  const targetX = itemCenter - SCREEN_W / 2;
  const maxScroll = Math.max(0, contentWidth - SCREEN_W);

  scrollRef.scrollTo({
    x: Math.min(maxScroll, Math.max(0, targetX)),
    animated: true,
  });
}

export function scrollVerticalRowToCenter(
  scrollRef: ScrollView | null,
  contentRef: View | null,
  rowRef: View | null,
  navHeight: number,
) {
  if (!scrollRef || !contentRef || !rowRef) return;

  rowRef.measureLayout(
    contentRef,
    (_x, y, _w, height) => {
      const viewportHeight = SCREEN_H - navHeight;
      const targetY = y + height / 2 - viewportHeight / 2;
      scrollRef.scrollTo({ y: Math.max(0, targetY), animated: true });
    },
    () => {},
  );
}
