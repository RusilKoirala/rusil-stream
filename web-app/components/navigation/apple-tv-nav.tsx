'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiSearch } from 'react-icons/fi';
import { cn } from '@/lib/utils';
import { useEffect, useRef, useState } from 'react';
import { UserButton } from '@/components/auth/user-button';
import { BrandLogo } from '@/components/ui/brand-logo';

export type TabType = 'home' | 'movies' | 'tv' | 'my-list' | 'search' | 'settings';

interface AppleTVNavProps {
  activeTab?: TabType;
  onTabChange?: (tab: TabType) => void;
  onTabHover?: (tab: TabType) => void;
}

export function AppleTVNav({ activeTab, onTabChange, onTabHover }: AppleTVNavProps) {
  const pathname = usePathname();
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const navRef = useRef<HTMLDivElement>(null);

  const navItems: { label: string; href: string; id: TabType }[] = [
    { label: 'Home', href: '/', id: 'home' },
    { label: 'Movies', href: '/movies', id: 'movies' },
    { label: 'TV', href: '/tv', id: 'tv' },
    { label: 'My List', href: '/my-list', id: 'my-list' },
  ];

  const isActive = (item: { href: string; id: TabType }) => {
    if (activeTab) return activeTab === item.id;
    return pathname === item.href;
  };

  const isSearchActive = activeTab === 'search' || pathname === '/search';

  // Find active index including search icon
  let activeIndex = navItems.findIndex((item) => isActive(item));
  if (isSearchActive) activeIndex = navItems.length;

  useEffect(() => {
    if (navRef.current && activeIndex !== -1) {
      const allButtons = navRef.current.querySelectorAll('button, a');
      const activeButton = allButtons[activeIndex] as HTMLElement;

      if (activeButton) {
        setIndicatorStyle({
          left: activeButton.offsetLeft,
          width: activeButton.offsetWidth,
        });
      }
    }
  }, [activeIndex]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-6 sm:px-8 py-4">
      <div className="flex items-center justify-between max-w-[1800px] mx-auto relative">
        {/* Logo - Left Side (same as landing page) */}
        <Link
          href="/"
          className="flex items-center hover:scale-105 active:scale-95 transition-all duration-200 ml-2 sm:ml-4 z-10"
          title="Rusil Stream"
        >
          <BrandLogo className="h-9 w-9 sm:h-10 sm:w-10" />
        </Link>

        {/* Center Cluster: | pills like home etc | with little space, profile icon in circle */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2.5 sm:gap-3 z-10">
          {/* Pills Container */}
          <nav className="relative flex items-center px-3 sm:px-4 py-1.5 sm:py-2 bg-black/45 backdrop-blur-2xl rounded-full border border-white/10 shadow-2xl">
            <div ref={navRef} className="relative flex items-center gap-1">
              {/* Animated white background indicator */}
              <div
                className="absolute top-0 h-full bg-white rounded-full transition-all duration-300 ease-out pointer-events-none"
                style={{
                  left: `${indicatorStyle.left}px`,
                  width: `${indicatorStyle.width}px`,
                  opacity: activeIndex === -1 ? 0 : 1,
                }}
              />

              {/* Text Navigation Items */}
              {navItems.map((item) => {
                const active = isActive(item);

                if (onTabChange) {
                  return (
                    <button
                      key={item.id}
                      onClick={() => onTabChange(item.id)}
                      onMouseEnter={() => onTabHover?.(item.id)}
                      className={cn(
                        'relative z-10 px-3.5 sm:px-5 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-colors duration-200 whitespace-nowrap cursor-pointer',
                        active ? 'text-black font-semibold' : 'text-white/70 hover:text-white'
                      )}
                    >
                      {item.label}
                    </button>
                  );
                }

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onMouseEnter={() => onTabHover?.(item.id)}
                    className={cn(
                      'relative z-10 px-3.5 sm:px-5 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-colors duration-200 whitespace-nowrap',
                      active ? 'text-black font-semibold' : 'text-white/70 hover:text-white'
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}

              {/* Divider */}
              <div className="w-px h-4 sm:h-5 bg-white/20 mx-1 sm:mx-1.5" />

              {/* Search Icon */}
              {onTabChange ? (
                <button
                  onClick={() => onTabChange('search')}
                  onMouseEnter={() => onTabHover?.('search')}
                  className={cn(
                    'relative z-10 p-1.5 sm:p-2 rounded-full transition-colors duration-200 cursor-pointer',
                    isSearchActive ? 'text-black' : 'text-white/70 hover:text-white'
                  )}
                  aria-label="Search"
                >
                  <FiSearch size={17} />
                </button>
              ) : (
                <Link
                  href="/search"
                  onMouseEnter={() => onTabHover?.('search')}
                  className="relative z-10 p-1.5 sm:p-2 text-white/70 hover:text-white rounded-full transition-colors duration-200"
                  aria-label="Search"
                >
                  <FiSearch size={17} />
                </Link>
              )}
            </div>
          </nav>

          {/* Profile icon in circle with picture from Clerk of user */}
          <UserButton onTabChange={onTabChange} activeTab={activeTab} />
        </div>

        {/* Right placeholder to keep header balanced */}
        <div className="w-9 sm:w-10 pointer-events-none opacity-0 ml-2 sm:ml-4" />
      </div>
    </header>
  );
}
