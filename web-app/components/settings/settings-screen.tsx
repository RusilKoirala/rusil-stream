'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Bell, PlayCircle, Users } from 'lucide-react';
import { ProfileManager } from '@/components/profiles/profile-manager';
import { NotificationSettings } from '@/components/settings/notification-settings';
import { PlaybackSettings } from '@/components/settings/playback-settings';

type ActiveTab = 'profiles' | 'notifications' | 'playback';

export function SettingsScreen() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<ActiveTab>('profiles');

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'profiles' || tab === 'notifications' || tab === 'playback') {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const tabs = [
    { id: 'profiles' as const, label: 'Profiles', icon: Users, hint: 'Create and customize profiles' },
    { id: 'notifications' as const, label: 'Notifications', icon: Bell, hint: 'Alerts and reminders' },
    { id: 'playback' as const, label: 'Playback', icon: PlayCircle, hint: 'Autoplay and data options' },
  ];

  return (
    <main className="mx-auto max-w-1400 px-4 pb-14 pt-24 md:px-8">
      <div className="mb-8 space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-white">Settings</h1>
        <p className="text-white/70">Manage your account and viewing preferences</p>
      </div>

      <div className="flex flex-col gap-6 md:flex-row md:items-start">
        <aside className="h-fit rounded-2xl border border-white/10 bg-[#141414]/85 p-3 backdrop-blur-sm md:sticky md:top-24 md:w-64 md:shrink-0 lg:w-72">
          <nav className="space-y-1.5">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition ${
                    isActive
                      ? 'bg-red-600/20 text-white ring-1 ring-red-500/60'
                      : 'text-white/75 hover:bg-white/8 hover:text-white'
                  }`}
                >
                  <Icon className="h-4.5 w-4.5" />
                  <div>
                    <p className="text-sm font-medium">{tab.label}</p>
                    <p className="text-xs text-white/50">{tab.hint}</p>
                  </div>
                </button>
              );
            })}
          </nav>
        </aside>

        <section className="rounded-2xl border border-white/10 bg-[#141414]/72 p-5 md:flex-1 md:p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-white">
              {activeTab === 'profiles' && 'Profile Management'}
              {activeTab === 'notifications' && 'Notification Preferences'}
              {activeTab === 'playback' && 'Playback Settings'}
            </h2>
            <p className="mt-1 text-sm text-white/70">
              {activeTab === 'profiles' && 'Create and manage profiles for different users.'}
              {activeTab === 'notifications' && 'Control the notifications you receive.'}
              {activeTab === 'playback' && 'Adjust autoplay and data usage.'}
            </p>
          </div>

          <div>
            {activeTab === 'profiles' && <ProfileManager />}
            {activeTab === 'notifications' && <NotificationSettings />}
            {activeTab === 'playback' && <PlaybackSettings />}
          </div>
        </section>
      </div>
    </main>
  );
}
