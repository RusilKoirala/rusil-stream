'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Bell, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserButton } from '@/components/auth/user-button';
import { BrandLogo } from '@/components/ui/brand-logo';

interface TopNavProps {
  solid?: boolean;
  fixed?: boolean;
}

export function TopNav({ solid = false, fixed = true }: TopNavProps) {
  const pathname = usePathname();
  const [notificationOpen, setNotificationOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!notificationRef.current) return;
      if (!notificationRef.current.contains(event.target as Node)) {
        setNotificationOpen(false);
      }
    };

    if (notificationOpen) {
      window.addEventListener('mousedown', handleClickOutside);
    }

    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, [notificationOpen]);

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/tv', label: 'TV Shows' },
    { href: '/movies', label: 'Movies' },
    { href: '/my-list', label: 'My List' },
  ];

  const isActivePath = (href: string) => {
    const cleanHref = href.split('?')[0];
    return pathname === cleanHref;
  };

  return (
    <header
      className={cn(
        fixed ? 'fixed inset-x-0 top-0 z-50' : 'absolute inset-x-0 top-0 z-50',
        'supports-backdrop-filter:backdrop-blur-[2px]',
        solid
          ? 'bg-[#141414]/95 shadow-[0_10px_30px_rgba(0,0,0,0.4)]'
          : 'bg-[linear-gradient(180deg,rgba(0,0,0,0.85)_0%,rgba(0,0,0,0.45)_64%,rgba(0,0,0,0)_100%)]'
      )}
    >
      <div className="relative flex h-20 items-center justify-between px-6 md:px-12 lg:px-14">
        <div className="flex items-center">
          <Link href="/" className="flex items-center gap-3">
            <BrandLogo className="h-11 w-11" />
            <span className="hidden text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-white/82 sm:inline">
              Rusil Stream
            </span>
          </Link>
        </div>

        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 text-[0.88rem] uppercase tracking-[0.12em] text-white/86 lg:flex">
          {navItems.map((item) => {
            const isActive = isActivePath(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'relative pb-1.5 transition-colors hover:text-white',
                  "after:absolute after:bottom-0 after:left-1/2 after:h-0.5 after:w-0 after:-translate-x-1/2 after:rounded-full after:bg-[#E50914] after:transition-[width] after:duration-300",
                  isActive ? 'text-white after:w-5' : 'after:w-0 hover:after:w-4'
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3 text-white">
          <Link
            href="/search"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/35 hover:bg-black/60"
            aria-label="Search"
          >
            <Search className="h-4 w-4" />
          </Link>
          <div ref={notificationRef} className="relative">
            <button
              type="button"
              onClick={() => setNotificationOpen((value) => !value)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/35 hover:bg-black/60"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
            </button>

            {notificationOpen ? (
              <div className="absolute right-0 mt-2 w-80 overflow-hidden rounded-xl border border-white/12 bg-[#181818] shadow-[0_20px_38px_rgba(0,0,0,0.55)]">
                <div className="border-b border-white/10 px-4 py-3">
                  <p className="text-sm font-semibold text-white">Notifications</p>
                </div>

                <div className="space-y-2 px-4 py-4">
                  <div className="rounded-lg border border-white/10 bg-white/3 p-3">
                    <p className="text-sm text-white/90">No new notifications right now.</p>
                    <p className="mt-1 text-xs text-white/55">When updates arrive, they will appear here.</p>
                  </div>

                  <Link
                    href="/settings?tab=notifications"
                    className="inline-flex items-center gap-2 text-sm text-white/80 hover:text-white"
                    onClick={() => setNotificationOpen(false)}
                  >
                    <Settings className="h-4 w-4" />
                    Manage notification settings
                  </Link>
                </div>
              </div>
            ) : null}
          </div>
          <UserButton />
        </div>
      </div>
    </header>
  );
}
