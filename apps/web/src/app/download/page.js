"use client";
import Link from "next/link";
import Logo from "@/components/layout/Logo";

const ANDROID_APK_URL = "https://github.com/RusilKoirala/rusil-stream/releases/download/v1.0.1/rusil-stream-mobile.apk";
const ANDROID_TV_APK_URL = "https://github.com/RusilKoirala/rusil-stream/releases/download/v1.0.1/rusil-stream-tv.apk";

function AndroidIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10">
      <path d="M17.6 9.48l1.84-3.18c.16-.31.04-.69-.26-.85a.637.637 0 0 0-.83.22l-1.88 3.24a11.43 11.43 0 0 0-8.94 0L5.65 5.67a.643.643 0 0 0-.87-.2c-.28.18-.37.54-.22.83L6.4 9.48A10.81 10.81 0 0 0 1 18h22a10.81 10.81 0 0 0-5.4-8.52M7 15.25a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5m10 0a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5"/>
    </svg>
  );
}

function TvIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10">
      <rect x="2" y="7" width="20" height="15" rx="2" ry="2"/>
      <polyline points="17 2 12 7 7 2"/>
    </svg>
  );
}

function FeatureItem({ text }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
        <svg className="w-3 h-3 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      </div>
      <span className="text-gray-300 text-sm">{text}</span>
    </div>
  );
}

export default function DownloadPage() {
  return (
    <div className="min-h-screen bg-[#080808] text-white">
      {/* Navbar */}
      <nav className="border-b border-white/5 bg-black/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/home">
            <Logo />
          </Link>
          <Link
            href="/home"
            className="text-sm text-gray-400 hover:text-white transition flex items-center gap-2 group"
          >
            <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-6xl mx-auto px-6 pt-20 pb-16 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2 mb-8">
            <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            <span className="text-blue-400 text-sm font-medium">Now Available</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
            Watch on Any
            <span className="block bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Android Device
            </span>
          </h1>

          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed">
            Download the Rusil Stream app for your Android phone or Android TV.
            Same great content, optimized for every screen.
          </p>

          {/* Download cards */}
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Android Phone */}
            <div className="group relative bg-gradient-to-br from-white/5 to-white/0 border border-white/10 rounded-2xl p-8 hover:border-blue-500/40 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="relative">
                {/* Android icon */}
                <div className="w-16 h-16 bg-gradient-to-br from-green-400/20 to-green-600/20 border border-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/20 text-green-400 group-hover:scale-110 transition-transform duration-300">
                  <AndroidIcon />
                </div>

                <div className="text-xs font-bold text-green-400 uppercase tracking-widest mb-2">Android Phone</div>
                <h2 className="text-2xl font-bold mb-2">Rusil Stream</h2>
                <p className="text-gray-400 text-sm mb-6">For Android 7.0 and above</p>

                <div className="space-y-2 mb-8 text-left">
                  <FeatureItem text="Full HD streaming" />
                  <FeatureItem text="Save to watchlist" />
                  <FeatureItem text="Continue watching" />
                  <FeatureItem text="Multiple profiles" />
                </div>

                <a
                  href={ANDROID_APK_URL}
                  download="rusil-stream-mobile.apk"
                  className="group/btn flex items-center justify-center gap-3 w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white font-bold py-4 rounded-xl transition-all duration-200 shadow-lg shadow-green-500/30 hover:shadow-green-500/50 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <svg className="w-5 h-5 group-hover/btn:animate-bounce" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download APK
                </a>
                <p className="text-gray-600 text-xs mt-3">v1.0.0 · ~25 MB</p>
              </div>
            </div>

            {/* Android TV */}
            <div className="group relative bg-gradient-to-br from-white/5 to-white/0 border border-white/10 rounded-2xl p-8 hover:border-purple-500/40 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/10">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="relative">
                {/* TV icon */}
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-purple-700/20 border border-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-500/20 text-purple-400 group-hover:scale-110 transition-transform duration-300">
                  <TvIcon />
                </div>

                <div className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-2">Android TV</div>
                <h2 className="text-2xl font-bold mb-2">Rusil Stream TV</h2>
                <p className="text-gray-400 text-sm mb-6">For Android TV &amp; Fire TV</p>

                <div className="space-y-2 mb-8 text-left">
                  <FeatureItem text="4K ready interface" />
                  <FeatureItem text="Remote-friendly navigation" />
                  <FeatureItem text="Side drawer menu" />
                  <FeatureItem text="Big screen optimized" />
                </div>

                <a
                  href={ANDROID_TV_APK_URL}
                  download="rusil-stream-tv.apk"
                  className="group/btn flex items-center justify-center gap-3 w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-400 hover:to-purple-500 text-white font-bold py-4 rounded-xl transition-all duration-200 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <svg className="w-5 h-5 group-hover/btn:animate-bounce" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download APK
                </a>
                <p className="text-gray-600 text-xs mt-3">v1.0.0 · ~28 MB</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Install instructions */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          How to Install
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              step: "01",
              title: "Download the APK",
              desc: "Tap the download button above for your device type. The APK file will save to your Downloads folder.",
              color: "blue",
            },
            {
              step: "02",
              title: "Allow Unknown Sources",
              desc: 'Go to Settings → Security → enable "Install unknown apps" for your browser or file manager.',
              color: "purple",
            },
            {
              step: "03",
              title: "Install & Launch",
              desc: "Open the downloaded APK file, tap Install, then open Rusil Stream and sign in with your account.",
              color: "cyan",
            },
          ].map((item) => (
            <div key={item.step} className="relative bg-white/3 border border-white/8 rounded-2xl p-8 hover:border-white/15 transition-all">
              <div className={`text-6xl font-black mb-4 bg-gradient-to-br ${
                item.color === 'blue' ? 'from-blue-400 to-blue-600' :
                item.color === 'purple' ? 'from-purple-400 to-purple-600' :
                'from-cyan-400 to-cyan-600'
              } bg-clip-text text-transparent opacity-30`}>
                {item.step}
              </div>
              <h3 className="text-lg font-bold mb-3">{item.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Requirements */}
      <section className="max-w-6xl mx-auto px-6 pb-16">
        <div className="bg-white/3 border border-white/8 rounded-2xl p-8">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            System Requirements
          </h3>
          <div className="grid sm:grid-cols-2 gap-8">
            <div>
              <div className="text-green-400 font-semibold text-sm uppercase tracking-wider mb-3">Android Phone</div>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>Android 7.0 (Nougat) or higher</li>
                <li>100 MB free storage</li>
                <li>Active internet connection</li>
                <li>Rusil Stream account</li>
              </ul>
            </div>
            <div>
              <div className="text-purple-400 font-semibold text-sm uppercase tracking-wider mb-3">Android TV</div>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>Android TV 5.0 or higher</li>
                <li>100 MB free storage</li>
                <li>Active internet connection</li>
                <li>Rusil Stream account</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <Logo />
          <p className="text-gray-600 text-sm">© 2025 Rusil Stream. All rights reserved.</p>
          <Link href="/home" className="text-gray-500 hover:text-white text-sm transition">
            Back to streaming →
          </Link>
        </div>
      </footer>
    </div>
  );
}
