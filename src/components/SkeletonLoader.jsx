"use client";

export function SkeletonCard() {
  return (
    <div className="flex-shrink-0 w-[140px] sm:w-[160px] md:w-[200px] lg:w-[240px]">
      <div className="aspect-[2/3] rounded-md md:rounded-lg overflow-hidden bg-gray-800/60 animate-pulse" />
      <div className="mt-2 md:mt-3 px-1">
        <div className="h-3 bg-gray-800/60 rounded w-3/4 animate-pulse" />
      </div>
    </div>
  );
}

export function SkeletonCarousel({ title }) {
  return (
    <div className="mb-10 md:mb-14">
      <div className="px-4 md:px-12 mb-5">
        {title ? (
          <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-white">{title}</h2>
        ) : (
          <div className="h-8 bg-gray-800 rounded w-48 animate-pulse" />
        )}
      </div>
      <div className="flex gap-2 md:gap-3 lg:gap-4 overflow-x-hidden px-4 md:px-12">
        {[...Array(6)].map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}

export function SkeletonHero() {
  return (
    <div className="h-[70vh] w-full mb-8 bg-black">
      <div className="max-w-7xl mx-auto h-full flex items-center px-4 md:px-8">
        <div className="w-full max-w-2xl space-y-5">
          <div className="h-10 md:h-12 bg-gray-800/60 rounded animate-pulse" />
          <div className="h-4 bg-gray-800/60 rounded w-5/6 animate-pulse" />
          <div className="h-4 bg-gray-800/60 rounded w-4/6 animate-pulse" />
          <div className="flex gap-3 pt-2">
            <div className="h-10 w-28 bg-gray-800/60 rounded animate-pulse" />
            <div className="h-10 w-28 bg-gray-800/60 rounded animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 12 }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
      {[...Array(count)].map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
