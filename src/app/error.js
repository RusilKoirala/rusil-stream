"use client";
import { useEffect } from "react";
import Link from "next/link";
import Logo from "../components/Logo";

export default function Error({ error, reset }) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* Logo */}
        <div className="mb-8">
          <Logo className="text-5xl mb-4" />
        </div>

        {/* Error Icon */}
        <div className="mb-8">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
            <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        </div>

        {/* Message */}
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Something went wrong
          </h2>
          <p className="text-gray-400 text-lg leading-relaxed mb-4">
            We encountered an unexpected error. Please try again.
          </p>
          {process.env.NODE_ENV === 'development' && (
            <details className="text-left bg-red-500/10 border border-red-500/30 rounded-lg p-4 mt-4">
              <summary className="text-red-400 font-semibold cursor-pointer mb-2">
                Error Details (Development)
              </summary>
              <pre className="text-xs text-red-300 overflow-auto">
                {error?.message || 'Unknown error'}
              </pre>
            </details>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={reset}
            className="px-8 py-4 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-all duration-200 hover:scale-105"
          >
            Try Again
          </button>
          <Link
            href="/home"
            className="px-8 py-4 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-all duration-200 border border-white/20 hover:border-white/40"
          >
            Go Home
          </Link>
        </div>

        {/* Help */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <p className="text-gray-500 text-sm">
            If this problem persists, please{" "}
            <Link href="/" className="text-blue-500 hover:text-blue-400 transition-colors">
              contact support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}