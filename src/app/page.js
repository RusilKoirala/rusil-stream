"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Logo from "../components/Logo";
import Loading from "../components/Loading";

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const router = useRouter();

  const heroSlides = [
    {
      image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1920&q=80",
      title: "Stream Without Limits",
      subtitle: "Thousands of movies and TV shows at your fingertips"
    },
    {
      image: "https://images.unsplash.com/photo-1574267432644-f610f5b7e4d1?w=1920&q=80",
      title: "Watch Anywhere",
      subtitle: "On your TV, phone, tablet, and more"
    },
    {
      image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1920&q=80",
      title: "Endless Entertainment",
      subtitle: "New movies and shows added regularly"
    }
  ];

  // Auto-redirect if authenticated
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          // User is authenticated, redirect to home
          router.replace("/home");
          return;
        }
      } catch (error) {
        // User not authenticated, stay on landing page
      }
      setIsCheckingAuth(false);
    }
    checkAuth();
  }, [router]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Show loading while checking authentication
  if (isCheckingAuth) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Premium Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? "bg-black/98 backdrop-blur-2xl" : "bg-transparent"}`}>
        <div className="max-w-[1800px] mx-auto flex items-center justify-between px-4 md:px-8 lg:px-16 py-4 md:py-6">
          <Logo className="text-2xl md:text-3xl" />
          <Link
            href="/login"
            className="px-4 md:px-8 py-2 md:py-3 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-all duration-300 hover:scale-105 text-sm md:text-base"
          >
            Sign In
          </Link>
        </div>
      </nav>

      {/* HBO Max / Disney+ Style Hero */}
      <section className="relative h-screen w-full overflow-hidden">
        {/* Background Slides */}
        {heroSlides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent z-10" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/50 z-10" />
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover scale-110"
            />
          </div>
        ))}

        {/* Content */}
        <div className="relative z-20 h-full flex items-center">
          <div className="max-w-[1800px] mx-auto px-4 md:px-8 lg:px-16 w-full">
            <div className="max-w-4xl">
              <div className="mb-4 md:mb-6 inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 md:px-4 py-2 rounded-full border border-white/20">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs md:text-sm font-medium">Educational Project</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-black mb-4 md:mb-6 leading-tight">
                {heroSlides[currentSlide].title}
              </h1>
              
              <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-gray-300 mb-8 md:mb-12 font-light">
                {heroSlides[currentSlide].subtitle}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                <Link
                  href="/login"
                  className="group px-6 md:px-12 py-3 md:py-5 bg-white text-black font-bold text-base md:text-lg rounded-full hover:bg-gray-200 transition-all duration-300 flex items-center justify-center gap-3"
                >
                  <span>Get Started</span>
                  <svg className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </Link>
                
                <Link
                  href="#learn-more"
                  className="px-6 md:px-12 py-3 md:py-5 bg-white/10 backdrop-blur-md text-white font-bold text-base md:text-lg rounded-full hover:bg-white/20 transition-all duration-300 border border-white/20"
                >
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Slide Indicators */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-30 flex gap-3">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-1 rounded-full transition-all duration-300 ${
                index === currentSlide ? "w-12 bg-white" : "w-8 bg-white/40"
              }`}
            />
          ))}
        </div>
      </section>

      {/* Premium Content Grid */}
      <section id="learn-more" className="py-32 bg-gradient-to-b from-black to-gray-950">
        <div className="max-w-[1800px] mx-auto px-8 md:px-16">
          <div className="grid md:grid-cols-2 gap-16 items-center mb-32">
            <div>
              <h2 className="text-5xl md:text-6xl font-black mb-6">Watch on any device</h2>
              <p className="text-xl text-gray-400 leading-relaxed">
                Stream on your TV, laptop, phone, and tablet. Pick up where you left off on any screen.
              </p>
            </div>
            <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1593784991095-a205069470b6?w=800&q=80"
                alt="Devices"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-16 items-center mb-32">
            <div className="order-2 md:order-1 relative aspect-video rounded-3xl overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=800&q=80"
                alt="Profiles"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="order-1 md:order-2">
              <h2 className="text-5xl md:text-6xl font-black mb-6">Create profiles for everyone</h2>
              <p className="text-xl text-gray-400 leading-relaxed">
                Up to 5 profiles with personalized recommendations and watch history for each family member.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-5xl md:text-6xl font-black mb-6">Download and watch offline</h2>
              <p className="text-xl text-gray-400 leading-relaxed">
                Save your favorites and always have something to watch, even without an internet connection.
              </p>
            </div>
            <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80"
                alt="Offline"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-32 bg-gray-950">
        <div className="max-w-[1800px] mx-auto px-8 md:px-16">
          <h2 className="text-5xl md:text-6xl font-black mb-16 text-center">Everything you need</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                icon: <svg className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" /></svg>,
                title: "Unlimited Movies", 
                desc: "Watch as many movies as you want" 
              },
              { 
                icon: <svg className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
                title: "TV Shows", 
                desc: "Binge-watch entire seasons" 
              },
              { 
                icon: <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>,
                title: "Top Rated", 
                desc: "Discover critically acclaimed content" 
              },
              { 
                icon: <svg className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" /><path strokeLinecap="round" strokeLinejoin="round" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" /></svg>,
                title: "Trending", 
                desc: "See what everyone's watching" 
              },
              { 
                icon: <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>,
                title: "My List", 
                desc: "Save your favorites" 
              },
              { 
                icon: <svg className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
                title: "Continue Watching", 
                desc: "Pick up where you left off" 
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="p-8 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-white/30 transition-all duration-300 hover:scale-105"
              >
                <div className="text-blue-500 mb-4">{feature.icon}</div>
                <h3 className="text-2xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-32 bg-gradient-to-b from-gray-950 to-black">
        <div className="max-w-4xl mx-auto px-8">
          <h2 className="text-5xl md:text-6xl font-black mb-16 text-center">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-4">
            {[
              {
                question: "What is Rusil Stream?",
                answer: "Rusil Stream is an educational streaming platform built to demonstrate modern web development practices using Next.js, MongoDB, and the TMDB API. It showcases a Netflix-like interface with movie and TV show streaming capabilities."
              },
              {
                question: "How many profiles can I create?",
                answer: "You can create up to 5 profiles per account. Each profile has its own personalized watch history, saved list, and recommendations."
              },
              {
                question: "Can I watch on multiple devices?",
                answer: "Yes! Rusil Stream works seamlessly across all your devices - TV, laptop, tablet, and mobile phone. Your watch progress syncs automatically."
              },
              {
                question: "Is this a real streaming service?",
                answer: "No, this is an educational project created for learning purposes. It demonstrates full-stack development, authentication, database management, and API integration."
              },
              {
                question: "What technology stack is used?",
                answer: "Built with Next.js 13+ (App Router), React 18, MongoDB with Mongoose, JWT authentication, TMDB API for metadata, and Tailwind CSS for styling."
              },
              {
                question: "Can I use this code for my own project?",
                answer: "This is an educational project. Feel free to learn from it, but please respect content licensing and API terms of service if you build something similar."
              }
            ].map((faq, index) => (
              <details
                key={index}
                className="group bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-white/20 transition-all overflow-hidden"
              >
                <summary className="cursor-pointer p-6 md:p-8 flex items-center justify-between text-xl md:text-2xl font-bold">
                  <span>{faq.question}</span>
                  <svg className="w-6 h-6 flex-shrink-0 ml-4 transition-transform group-open:rotate-45" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                </summary>
                <div className="px-6 md:px-8 pb-6 md:pb-8 text-gray-400 text-lg leading-relaxed">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 bg-black">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <h2 className="text-5xl md:text-7xl font-black mb-8">
            Ready to watch?
          </h2>
          <p className="text-2xl text-gray-400 mb-12">
            Start streaming today
          </p>
          <Link
            href="/login"
            className="inline-block px-16 py-6 bg-white text-black font-bold text-xl rounded-full hover:bg-gray-200 transition-all duration-300 hover:scale-105"
          >
            Get Started
          </Link>
        </div>
      </section>

      {/* Made By Section */}
      <section className="py-20 bg-gradient-to-b from-black to-gray-950 border-t border-white/10">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 mb-6 shadow-2xl shadow-blue-500/30">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          </div>
          
          <h3 className="text-3xl md:text-4xl font-black mb-4">
            Crafted with passion
          </h3>
          
          <p className="text-xl text-gray-400 mb-8">
            Designed and developed by
          </p>
          
          <a
            href="https://rusilkoirala.com.np"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-3 px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-bold text-lg rounded-full transition-all duration-300 border border-white/20 hover:border-white/40 hover:scale-105"
          >
            <span className="text-2xl">Rusil Koirala</span>
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
          
          <div className="mt-8 flex items-center justify-center gap-6 text-gray-500 text-sm">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              <span>Open Source</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span>Educational</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
              <span>Made with Love</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-950 border-t border-white/10">
        <div className="max-w-[1800px] mx-auto px-8 md:px-16">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <Logo className="text-3xl mb-2" />
              
            </div>
            <div className="text-center md:text-right">
             
              <p className="text-gray-600 text-xs mt-1">
                © 2024 Rusil Stream • Made for educational purposes only
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
