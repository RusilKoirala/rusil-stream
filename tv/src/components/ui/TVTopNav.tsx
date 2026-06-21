import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Search, LogOut, Users, ChevronDown } from 'lucide-react-native';
import { BrandLogo } from './BrandLogo';
import { ProfileAvatar } from './ProfileAvatar';
import { getActiveProfile } from '@/lib/active-profile';

export type NavTab = 'Home' | 'Movies' | 'TV Shows' | 'My List' | 'Search';

const TABS: NavTab[] = ['Home', 'Movies', 'TV Shows', 'My List'];

interface TVTopNavProps {
  active: NavTab;
  onSelect: (tab: NavTab) => void;
  onLogout?: () => void;
  onChangeProfile?: () => void;
}

export function TVTopNav({ active, onSelect, onLogout, onChangeProfile }: TVTopNavProps) {
  const [focusedTab, setFocusedTab] = useState<NavTab | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [focusedItem, setFocusedItem] = useState<string | null>(null);
  const profile = getActiveProfile();

  const toggleMenu = () => setMenuOpen((prev) => !prev);
  const closeMenu = () => {
    setMenuOpen(false);
    setFocusedItem(null);
  };

  const handleTabSelect = (tab: NavTab) => {
    closeMenu();
    onSelect(tab);
  };

  const handleChangeProfile = () => {
    closeMenu();
    onChangeProfile?.();
  };

  const handleLogout = () => {
    closeMenu();
    onLogout?.();
  };

  return (
    <View style={styles.root}>
      <View style={styles.bar}>
        <View style={styles.side}>
          <BrandLogo size={44} />
        </View>

        <View style={styles.center} pointerEvents="box-none">
          <View style={styles.centerInner}>
            <TouchableOpacity
              onPress={() => handleTabSelect('Search')}
              onFocus={() => setFocusedTab('Search')}
              onBlur={() => setFocusedTab(null)}
              activeOpacity={0.85}
              style={[
                styles.searchBtn,
                active === 'Search' && styles.tabActive,
                focusedTab === 'Search' && styles.tabFocused,
              ]}
            >
              <Search
                size={18}
                color={active === 'Search' || focusedTab === 'Search' ? '#fff' : '#9AA3B2'}
              />
            </TouchableOpacity>

            {TABS.map((tab) => {
              const isActive = active === tab;
              const isFocused = focusedTab === tab;
              return (
                <TouchableOpacity
                  key={tab}
                  onPress={() => handleTabSelect(tab)}
                  onFocus={() => setFocusedTab(tab)}
                  onBlur={() => setFocusedTab(null)}
                  activeOpacity={0.85}
                  style={[
                    styles.tab,
                    isActive && styles.tabActive,
                    isFocused && styles.tabFocused,
                  ]}
                >
                  <Text style={[styles.tabText, (isActive || isFocused) && styles.tabTextActive]}>
                    {tab}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={[styles.side, styles.sideRight]}>
          <TouchableOpacity
            onPress={toggleMenu}
            onFocus={() => setFocusedItem('avatar')}
            onBlur={() => setFocusedItem(null)}
            activeOpacity={0.85}
            style={[styles.avatarBtn, focusedItem === 'avatar' && styles.avatarBtnFocused]}
          >
            <ProfileAvatar size={40} />
            <ChevronDown
              size={14}
              color={menuOpen ? '#fff' : 'rgba(255,255,255,0.4)'}
              style={{ marginLeft: 6 }}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Dropdown menu */}
      {menuOpen ? (
        <View style={styles.dropdown}>
          {profile ? (
            <View style={styles.dropdownHeader}>
              <Text style={styles.dropdownName} numberOfLines={1}>{profile.name}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={[styles.dropdownItem, focusedItem === 'change' && styles.dropdownItemFocused]}
            onFocus={() => setFocusedItem('change')}
            onBlur={() => setFocusedItem(null)}
            onPress={handleChangeProfile}
            activeOpacity={0.85}
            hasTVPreferredFocus
          >
            <Users size={18} color={focusedItem === 'change' ? '#fff' : 'rgba(255,255,255,0.6)'} />
            <Text style={[styles.dropdownItemText, focusedItem === 'change' && styles.dropdownItemTextFocused]}>
              Change Profile
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.dropdownItem, focusedItem === 'logout' && styles.dropdownItemFocused]}
            onFocus={() => setFocusedItem('logout')}
            onBlur={() => setFocusedItem(null)}
            onPress={handleLogout}
            activeOpacity={0.85}
          >
            <LogOut size={18} color={focusedItem === 'logout' ? '#E50914' : 'rgba(255,255,255,0.6)'} />
            <Text style={[styles.dropdownItemText, focusedItem === 'logout' && styles.dropdownItemTextFocused, focusedItem === 'logout' && { color: '#E50914' }]}>
              Logout
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
}

const SIDE_WIDTH = 120;

const styles = StyleSheet.create({
  root: {
    position: 'relative',
    zIndex: 200,
  },
  bar: {
    height: 84,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 48,
    backgroundColor: 'rgba(5,5,5,0.95)',
  },
  side: {
    width: SIDE_WIDTH,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  sideRight: {
    alignItems: 'flex-end',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  tabFocused: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    transform: [{ scale: 1.05 }],
  },
  tabText: {
    color: '#B3B3B3',
    fontSize: 15,
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#fff',
    fontWeight: '700',
  },

  /* Avatar button */
  avatarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 24,
  },
  avatarBtnFocused: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },

  /* Dropdown */
  dropdown: {
    position: 'absolute',
    top: 84,
    right: 48,
    width: 240,
    backgroundColor: '#1a1d26',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
  },
  dropdownHeader: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    marginBottom: 4,
  },
  dropdownName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 6,
    borderRadius: 10,
  },
  dropdownItemFocused: {
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  dropdownItemText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    fontWeight: '500',
  },
  dropdownItemTextFocused: {
    color: '#fff',
    fontWeight: '700',
  },
});
