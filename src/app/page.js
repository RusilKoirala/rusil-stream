import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-[#141414] flex flex-col">
      <header className="flex items-center justify-between px-8 py-6 bg-gradient-to-r from-black/90 via-gray-900/90 to-[#141414]/90">
        <div
          className=" rounded-xl p-1 md:p-2 flex items-center justify-center"
          style={{  minWidth: 90, minHeight: 28 }}
        >
          <Image
            src="/logo/logo.png"
            alt="Rusil Stream Logo"
            width={90}
            height={28}
            className="block w-[90px] h-[28px] md:w-[120px] md:h-[38px] object-contain"
            priority
          />
        </div>
        <a
          href="/login"
          className="bg-[#E50914] text-white px-6 py-2 rounded-lg font-bold text-lg shadow-lg hover:bg-[#b0060f] transition"
        >
          Sign In
        </a>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 drop-shadow-lg">
          Unlimited Movies, TV Shows, and More.
        </h1>
        <p className="text-xl md:text-2xl text-gray-200 mb-8">
          Watch anywhere. Cancel anytime.
        </p>
        <a
          href="/home"
          className="inline-block bg-[#E50914] text-white text-2xl font-semibold px-10 py-4 rounded-lg shadow-lg hover:bg-[#b0060f] transition"
        >
          Get Started
        </a>
      </main>
      <footer className="text-gray-400 text-center py-6 text-sm bg-black/60 mt-auto">
        &copy; 2025 Rusil Stream. Educational Project.
      </footer>
    </div>
  );
}
