'use client';

import { FiPlay, FiInfo, FiPlus } from 'react-icons/fi';
import Image from 'next/image';

interface HeroSectionProps {
  title: string;
  backdrop: string;
  logo?: string;
  overview?: string;
}

export function HeroSection({ title, backdrop, logo, overview }: HeroSectionProps) {
  return (
    <section className="relative h-[90vh] w-full overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src={backdrop.replace('original', 'w1280')}
          alt={title}
          fill
          className="object-cover"
          priority
          quality={90}
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative h-full flex items-end px-12 pb-24">
        <div className="max-w-2xl">
          {/* Logo or Title */}
          {logo ? (
            <div className="mb-4">
              <Image src={logo} alt={title} width={350} height={140} className="object-contain" />
            </div>
          ) : (
            <h1 className="text-5xl font-bold text-white mb-4 drop-shadow-2xl">
              {title}
            </h1>
          )}

          {/* Description */}
          {overview && (
            <p className="text-base text-white/90 mb-6 line-clamp-3 drop-shadow-lg leading-relaxed">
              {overview}
            </p>
          )}

          {/* Buttons */}
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-6 py-2.5 bg-white text-black rounded-md font-semibold hover:bg-white/90 transition-all text-sm">
              <FiPlay size={18} />
              <span>Watch now</span>
            </button>

            <button className="flex items-center gap-2 px-6 py-2.5 bg-white/10 backdrop-blur-md text-white rounded-md font-semibold hover:bg-white/20 transition-all border border-white/20 text-sm">
              <FiInfo size={18} />
              <span>Info</span>
            </button>

            <button 
              className="p-2.5 bg-white/10 backdrop-blur-md text-white rounded-md hover:bg-white/20 transition-all border border-white/20"
              aria-label="Add to watchlist"
            >
              <FiPlus size={18} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
