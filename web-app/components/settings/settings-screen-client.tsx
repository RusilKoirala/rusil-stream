'use client';

import { useEffect, useState } from 'react';
import { SettingsScreen } from './settings-screen';

export function SettingsScreenClient() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="mx-auto max-w-1400 px-4 pb-14 pt-24 md:px-8">
        <div className="mb-8 space-y-2">
          <div className="h-8 w-44 animate-pulse rounded bg-white/10" />
          <div className="h-4 w-72 animate-pulse rounded bg-white/10" />
        </div>
        <div className="h-96 animate-pulse rounded-2xl border border-white/10 bg-white/[0.03]" />
      </div>
    );
  }

  return <SettingsScreen />;
}
