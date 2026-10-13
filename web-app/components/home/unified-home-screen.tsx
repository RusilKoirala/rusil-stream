'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { AppleTVNav, type TabType } from '@/components/navigation';
import { AmbientBackground } from '@/components/ui/ambient-background';
import { HomeTab } from './tabs/home-tab';
import { MoviesTab } from './tabs/movies-tab';
import { TvTab } from './tabs/tv-tab';
import { MyListTab } from './tabs/my-list-tab';
import { SearchTab } from './tabs/search-tab';
import { SettingsTab } from './tabs/settings-tab';

function UnifiedHomeScreenContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab') as TabType | null;
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [visitedTabs, setVisitedTabs] = useState<Set<TabType>>(() => new Set(['home']));

  useEffect(() => {
    if (tabParam && ['home', 'movies', 'tv', 'my-list', 'search', 'settings'].includes(tabParam)) {
      setActiveTab(tabParam);
      setVisitedTabs((prev) => new Set(prev).add(tabParam));
    }
  }, [tabParam]);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setVisitedTabs((prev) => new Set(prev).add(tab));
  };

  const handleTabHover = (tab: TabType) => {
    // Pre-mount tab in background upon hover for instant switching
    setVisitedTabs((prev) => {
      if (prev.has(tab)) return prev;
      return new Set(prev).add(tab);
    });
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      <AmbientBackground />
      <AppleTVNav
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onTabHover={handleTabHover}
      />
      
      <div className="relative">
        {/* Lazy mount visited tabs and keep active in DOM for instant switching */}
        {visitedTabs.has('home') && (
          <div className={activeTab === 'home' ? 'block' : 'hidden'}>
            <HomeTab isActive={activeTab === 'home'} />
          </div>
        )}
        {visitedTabs.has('movies') && (
          <div className={activeTab === 'movies' ? 'block' : 'hidden'}>
            <MoviesTab isActive={activeTab === 'movies'} />
          </div>
        )}
        {visitedTabs.has('tv') && (
          <div className={activeTab === 'tv' ? 'block' : 'hidden'}>
            <TvTab isActive={activeTab === 'tv'} />
          </div>
        )}
        {visitedTabs.has('my-list') && (
          <div className={activeTab === 'my-list' ? 'block' : 'hidden'}>
            <MyListTab />
          </div>
        )}
        {visitedTabs.has('search') && (
          <div className={activeTab === 'search' ? 'block' : 'hidden'}>
            <SearchTab />
          </div>
        )}
        {visitedTabs.has('settings') && (
          <div className={activeTab === 'settings' ? 'block' : 'hidden'}>
            <SettingsTab />
          </div>
        )}
      </div>
    </div>
  );
}

export function UnifiedHomeScreen() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <UnifiedHomeScreenContent />
    </Suspense>
  );
}
