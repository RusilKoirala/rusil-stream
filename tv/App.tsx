/**
 * Rusil Stream — TV App
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { BackHandler, StatusBar, View, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { NavTab } from '@/components/ui/TVTopNav';
import { HomeScreen } from '@/screens/HomeScreen';
import { SearchScreen } from '@/screens/SearchScreen';
import { MoviesScreen } from '@/screens/MoviesScreen';
import { TVShowsScreen } from '@/screens/TVShowsScreen';
import { MyListScreen } from '@/screens/MyListScreen';
import { DetailsScreen } from '@/screens/DetailsScreen';
import { PlayerScreen } from '@/screens/PlayerScreen';
import { LoginScreen } from '@/screens/LoginScreen';
import { ProfileSelectScreen } from '@/screens/ProfileSelectScreen';
import { NavigationProvider } from '@/navigation/NavigationContext';
import { hasDeviceToken, clearDeviceToken } from '@/lib/device-token';
import { getActiveProfile, clearActiveProfile } from '@/lib/active-profile';
import type { AppRoute, DetailsParams, PlayerParams } from '@/navigation/types';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 5 * 60_000, retry: 2 },
  },
});


function TVApp() {
  const [isAuthenticated, setIsAuthenticated] = useState(hasDeviceToken);
  const [profileReady, setProfileReady] = useState(!!getActiveProfile());
  const [activeTab, setActiveTab] = useState<NavTab>('Home');
  const [stack, setStack] = useState<AppRoute[]>([]);

  const openDetails = useCallback((params: DetailsParams) => {
    setStack((prev) => [...prev, { name: 'details', params }]);
  }, []);

  const openPlayer = useCallback((params: PlayerParams) => {
    setStack((prev) => [...prev, { name: 'player', params }]);
  }, []);

  const goBack = useCallback(() => {
    setStack((prev) => (prev.length > 0 ? prev.slice(0, -1) : prev));
  }, []);

  const handleLogout = useCallback(() => {
    clearDeviceToken();
    clearActiveProfile();
    setProfileReady(false);
    setIsAuthenticated(false);
    setStack([]);
    setActiveTab('Home');
  }, []);

  const handleChangeProfile = useCallback(() => {
    clearActiveProfile();
    setProfileReady(false);
    setStack([]);
    setActiveTab('Home');
  }, []);

  const navigation = useMemo(
    () => ({
      openDetails,
      openPlayer,
      goBack,
      canGoBack: stack.length > 0,
    }),
    [goBack, openDetails, openPlayer, stack.length],
  );

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (stack.length > 0) {
        goBack();
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [goBack, stack.length]);

  const topRoute = stack[stack.length - 1];

  // Not authenticated — show login screen
  if (!isAuthenticated) {
    return (
      <NavigationProvider value={navigation}>
        <LoginScreen onAuthenticated={() => setIsAuthenticated(true)} />
      </NavigationProvider>
    );
  }

  // Authenticated but no profile selected — show profile picker
  if (!profileReady) {
    return (
      <NavigationProvider value={navigation}>
        <ProfileSelectScreen onProfileSelected={() => setProfileReady(true)} />
      </NavigationProvider>
    );
  }

  if (topRoute?.name === 'player') {
    return (
      <NavigationProvider value={navigation}>
        <PlayerScreen params={topRoute.params} />
      </NavigationProvider>
    );
  }

  if (topRoute?.name === 'details') {
    return (
      <NavigationProvider value={navigation}>
        <DetailsScreen params={topRoute.params} />
      </NavigationProvider>
    );
  }

  return (
    <NavigationProvider value={navigation}>
      <View style={styles.root}>
        <StatusBar barStyle="light-content" backgroundColor="#050505" />

        {activeTab === 'Home' ? (
          <HomeScreen activeTab={activeTab} onSelectTab={setActiveTab} onLogout={handleLogout} onChangeProfile={handleChangeProfile} />
        ) : activeTab === 'Movies' ? (
          <MoviesScreen activeTab={activeTab} onSelectTab={setActiveTab} onLogout={handleLogout} onChangeProfile={handleChangeProfile} />
        ) : activeTab === 'TV Shows' ? (
          <TVShowsScreen activeTab={activeTab} onSelectTab={setActiveTab} onLogout={handleLogout} onChangeProfile={handleChangeProfile} />
        ) : activeTab === 'My List' ? (
          <MyListScreen activeTab={activeTab} onSelectTab={setActiveTab} onLogout={handleLogout} onChangeProfile={handleChangeProfile} />
        ) : activeTab === 'Search' ? (
          <SearchScreen activeTab={activeTab} onSelectTab={setActiveTab} onLogout={handleLogout} onChangeProfile={handleChangeProfile} />
        ) : (
          <HomeScreen activeTab={activeTab} onSelectTab={setActiveTab} onLogout={handleLogout} onChangeProfile={handleChangeProfile} />
        )}
      </View>
    </NavigationProvider>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <TVApp />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#050505' },
});
