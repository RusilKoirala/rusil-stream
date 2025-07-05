// src/components/Loading.js
export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px]">
      <div className="w-16 h-16 border-4 border-[#E50914] border-t-transparent rounded-full animate-spin mb-4"></div>
      <span className="text-white text-lg font-semibold">Loading...</span>
    </div>
  );
}
