import Link from "next/link";
import Logo from "../components/Logo";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* Logo */}
        <div className="mb-8">
          <Logo className="text-5xl mb-4" />
        </div>

        {/* 404 */}
        <div className="mb-8">
          <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black text-white mb-4 leading-none">
            404
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-cyan-500 mx-auto mb-6"></div>
        </div>

        {/* Message */}
        <div className="mb-8">
          <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-white mb-4">
            Page Not Found
          </h2>
          <p className="text-gray-400 text-lg leading-relaxed">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/home"
            className="px-8 py-4 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-all duration-200 hover:scale-105"
          >
            Go Home
          </Link>
          <Link
            href="/movies"
            className="px-8 py-4 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-all duration-200 border border-white/20 hover:border-white/40"
          >
            Browse Movies
          </Link>
        </div>

        {/* Help */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <p className="text-gray-500 text-sm">
            Need help? Go back to{" "}
            <Link href="/" className="text-blue-500 hover:text-blue-400 transition-colors">
              homepage
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}