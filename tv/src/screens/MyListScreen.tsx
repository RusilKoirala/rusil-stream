import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { Bookmark } from 'lucide-react-native';
import { TVTopNav, type NavTab } from '@/components/ui/TVTopNav';

interface MyListScreenProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onLogout?: () => void;
  onChangeProfile?: () => void;
}

export function MyListScreen({ activeTab, onSelectTab, onLogout, onChangeProfile }: MyListScreenProps) {
  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <TVTopNav active={activeTab} onSelect={onSelectTab} onLogout={onLogout} onChangeProfile={onChangeProfile} />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>My List</Text>
      </View>

      <View style={styles.empty}>
        <View style={styles.iconWrap}>
          <Bookmark size={48} color="rgba(255,255,255,0.3)" />
        </View>
        <Text style={styles.emptyTitle}>Your list is empty</Text>
        <Text style={styles.emptySub}>
          Add movies and TV shows to your list to watch them later.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: '#050505',
  },
  content: {
    paddingBottom: 60,
  },
  header: {
    paddingTop: 16,
    paddingBottom: 24,
    paddingHorizontal: 56,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 80,
    paddingVertical: 80,
  },
  iconWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptySub: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 24,
  },
});

