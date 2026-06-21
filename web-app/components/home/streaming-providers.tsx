'use client';

import type { IconType } from 'react-icons';
import { FaAmazon } from 'react-icons/fa';
import { SiAppletv, SiHbomax, SiNetflix } from 'react-icons/si';
import { TbBrandDisney } from 'react-icons/tb';

interface ProviderLogo {
  id: number;
  slug: string;
  name: string;
  icon: IconType;
}

export const STREAMING_PROVIDER_LOGOS: ProviderLogo[] = [
  { id: 8, slug: 'netflix', name: 'Netflix', icon: SiNetflix },
  { id: 337, slug: 'disney-plus', name: 'Disney+', icon: TbBrandDisney },
  { id: 350, slug: 'apple-tv-plus', name: 'Apple TV+', icon: SiAppletv },
  { id: 9, slug: 'prime-video', name: 'Prime Video', icon: FaAmazon },
  { id: 1899, slug: 'max', name: 'Max', icon: SiHbomax },
];

export function getStreamingProviderName(providerId: number): string {
  return (
    STREAMING_PROVIDER_LOGOS.find((provider) => provider.id === providerId)?.name ||
    'Selected Provider'
  );
}

interface StreamingProvidersProps {
  selectedProviderId: number;
  selectedProviderName: string;
  onSelectProvider: (providerId: number) => void;
}

export function StreamingProviders({
  selectedProviderId,
  selectedProviderName,
  onSelectProvider,
}: StreamingProvidersProps) {
  return (
    <section className="relative z-20 bg-black px-6 pb-16 pt-8 md:px-12 lg:px-14">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
          {selectedProviderName} Movies
        </h2>
      </div>

      <div className="flex flex-nowrap items-stretch gap-4 overflow-x-auto pb-2">
        {STREAMING_PROVIDER_LOGOS.map((provider) => {
          const Icon = provider.icon;
          const isSelected = selectedProviderId === provider.id;

          return (
            <button
              type="button"
              key={provider.slug}
              className={`flex h-28 min-w-42.5 flex-1 items-center justify-center rounded-3xl border px-5 transition md:h-32 ${
                isSelected
                  ? 'border-[#f0cb65] bg-[#261b0f] shadow-[0_0_0_1px_rgba(240,203,101,0.45)]'
                  : 'border-[#231819] bg-[#130c0d] hover:border-[#3b2729]'
              }`}
              title={provider.name}
              aria-label={provider.name}
              aria-pressed={isSelected}
              onClick={() => onSelectProvider(provider.id)}
            >
              <Icon className="h-12 w-auto text-white md:h-14" />
            </button>
          );
        })}
      </div>
    </section>
  );
}
