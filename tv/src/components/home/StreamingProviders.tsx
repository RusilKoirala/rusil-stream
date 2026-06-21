import { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, StyleSheet } from 'react-native';
import { scrollHorizontalToIndex } from '@/lib/focus-scroll';

const ROW_PADDING = 56;
const CHIP_W = 160;
const CHIP_GAP = 14;

const PROVIDERS = [
  { id: 8,    name: 'Netflix',     logo: require('../../../assets/providers/netflix.png') },
  { id: 337,  name: 'Disney+',     logo: require('../../../assets/providers/disney-plus.jpeg') },
  { id: 350,  name: 'Apple TV+',   logo: require('../../../assets/providers/apple-tv-plus.png') },
  { id: 9,    name: 'Prime Video', logo: require('../../../assets/providers/prime-video.png') },
  { id: 1899, name: 'Max',         logo: require('../../../assets/providers/max.png') },
];

interface StreamingProvidersProps {
  selectedId: number;
  onSelect: (id: number) => void;
  onSectionFocus?: (sectionRef: View) => void;
}

export function StreamingProviders({ selectedId, onSelect, onSectionFocus }: StreamingProvidersProps) {
  const scrollRef = useRef<ScrollView>(null);
  const sectionRef = useRef<View>(null);
  const [focusedId, setFocusedId] = useState<number | null>(null);

  const selectedName = PROVIDERS.find((p) => p.id === selectedId)?.name ?? 'Provider';

  const handleChipFocus = (index: number) => {
    scrollHorizontalToIndex(
      scrollRef.current,
      index,
      PROVIDERS.length,
      CHIP_W,
      CHIP_GAP,
      ROW_PADDING,
    );
    if (sectionRef.current) {
      onSectionFocus?.(sectionRef.current);
    }
  };

  return (
    <View ref={sectionRef} style={styles.section}>
      <Text style={styles.heading}>{selectedName} Movies</Text>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {PROVIDERS.map((p, index) => {
          const selected = p.id === selectedId;
          const focused = p.id === focusedId;

          return (
            <TouchableOpacity
              key={p.id}
              onPress={() => onSelect(p.id)}
              onFocus={() => {
                setFocusedId(p.id);
                handleChipFocus(index);
              }}
              onBlur={() => setFocusedId((prev) => (prev === p.id ? null : prev))}
              activeOpacity={0.8}
              style={[
                styles.chip,
                selected ? styles.chipSelected : styles.chipDefault,
                focused && styles.chipFocused,
              ]}
            >
              <Image source={p.logo} style={styles.logo} resizeMode="contain" />
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { paddingVertical: 24, backgroundColor: '#000' },
  heading: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 16,
    paddingHorizontal: ROW_PADDING,
  },
  row: { paddingHorizontal: ROW_PADDING, gap: CHIP_GAP },
  chip: {
    width: CHIP_W,
    height: 88,
    borderRadius: 20,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 14,
  },
  chipDefault: { backgroundColor: '#130c0d', borderColor: '#231819' },
  chipSelected: { backgroundColor: '#261b0f', borderColor: '#f0cb65' },
  chipFocused: {
    transform: [{ scale: 1.05 }],
    borderColor: '#fff',
    borderWidth: 2,
  },
  logo: { width: '80%', height: 40 },
});
