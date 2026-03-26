"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  CheckCircle2,
  Clapperboard,
  Clock3,
  Download,
  Heart,
  Sparkles,
  Tv2,
} from "lucide-react";
import Logo from "@/components/layout/Logo";
import Loading from "@/components/ui/Loading";

const HERO_SLIDES = [
  {
    image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1920&q=80",
    title: "Stream Without Limits",
    subtitle: "Thousands of movies and TV shows at your fingertips",
  },
  {
    image: "https://images.unsplash.com/photo-1574267432644-f610f5b7e4d1?w=1920&q=80",
    title: "Watch Anywhere",
    subtitle: "On your TV, phone, tablet, and more",
  },
  {
    image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1920&q=80",
    title: "Endless Entertainment",
    subtitle: "New movies and shows added regularly",
  },
];

const FEATURE_SPOTLIGHTS = [
  {
    title: "Watch on any device",
    desc: "Stream on your TV, laptop, phone, and tablet. Pick up where you left off on any screen.",
    image: "https://images.unsplash.com/photo-1593784991095-a205069470b6?w=800&q=80",
    alt: "Devices",
  },
  {
    title: "Create profiles for everyone",
    desc: "Up to 5 profiles with personalized recommendations and watch history for each family member.",
    image: "https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=800&q=80",
    alt: "Profiles",
    reverse: true,
  },
  {
    title: "Download and watch offline",
    desc: "Save your favorites and always have something to watch, even without an internet connection.",
    image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80",
    alt: "Offline",
  },
];

const FEATURES = [
  { icon: Clapperboard, title: "Unlimited Movies", desc: "Watch as many movies as you want" },
  { icon: Tv2, title: "TV Shows", desc: "Binge-watch entire seasons" },
  { icon: Sparkles, title: "Top Rated", desc: "Discover critically acclaimed content" },
  { icon: CheckCircle2, title: "Trending", desc: "See what everyone's watching" },
  { icon: Heart, title: "My List", desc: "Save your favorites" },
  { icon: Clock3, title: "Continue Watching", desc: "Pick up where you left off" },
];

const FAQS = [
  {
    question: "What is Rusil Stream?",
    answer:
      "Rusil Stream is an educational streaming platform built to demonstrate modern web development practices using Next.js, MongoDB, and the TMDB API.",
  },
  {
    question: "How many profiles can I create?",
    answer:
      "You can create up to 5 profiles per account. Each profile has its own personalized watch history, saved list, and recommendations.",
  },
  {
    question: "Can I watch on multiple devices?",
    answer:
      "Yes! Rusil Stream works seamlessly across all your devices. Your watch progress syncs automatically.",
  },
  {
    question: "Is this a real streaming service?",
    answer:
      "No, this is an educational project created for learning purposes. It demonstrates full-stack development, authentication, and API integration.",
  },
  {
    question: "What technology stack is used?",
    answer:
      "Built with Next.js 13+ (App Router), React 18, MongoDB, JWT authentication, TMDB API, and Tailwind CSS.",
  },
];

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
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
    let isTicking = false;
    const handleScroll = () => {
      if (isTicking) {
        return;
      }
      isTicking = true;
      window.requestAnimationFrame(() => {
        setScrolled(window.scrollY > 20);
        isTicking = false;
      });
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  if (isCheckingAuth) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navbar */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 border-b transition-all duration-300 ${
          scrolled
            ? "border-white/10 bg-black/80 shadow-[0_8px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl"
            : "border-transparent bg-transparent"
        }`}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 md:px-6 py-3 md:py-4">
          <Logo className="text-xl md:text-2xl" />
          <Link
            href="/login"
            className="px-4 md:px-6 py-1.5 md:py-2 bg-white text-black font-semibold rounded-full hover:bg-gray-100 transition-colors duration-200 text-sm"
          >
            Sign In
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-screen w-full overflow-hidden">
        {HERO_SLIDES.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            } will-change-[opacity] motion-reduce:transition-none`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent z-10" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40 z-10" />
            <Image
              src={slide.image}
              alt={slide.title}
              fill
                sizes="100vw"
                priority={index === 0}
                loading={index === 0 ? "eager" : "lazy"}
                className="object-cover scale-[1.01]"
              />
            </div>
        ))}

        <div className="relative z-20 h-full flex items-center">
          <div className="max-w-6xl mx-auto px-4 md:px-6 w-full">
            <div className="max-w-2xl">
              <div className="mb-3 md:mb-4 inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                <span className="text-xs font-medium text-gray-300">Educational Project</span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 md:mb-4 leading-tight tracking-tight">
                {HERO_SLIDES[currentSlide].title}
              </h1>
              
              <p className="text-base sm:text-lg md:text-xl text-gray-400 mb-6 md:mb-8 font-normal">
                {HERO_SLIDES[currentSlide].subtitle}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/login"
                  className="group px-6 md:px-8 py-2.5 md:py-3 bg-white text-black font-semibold text-sm rounded-full hover:bg-gray-100 transition-all duration-200 flex items-center justify-center gap-2 hover:-translate-y-0.5"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
                
                <Link
                  href="#learn-more"
                  className="px-6 md:px-8 py-2.5 md:py-3 bg-white/5 backdrop-blur-sm text-white font-semibold text-sm rounded-full hover:bg-white/10 transition-all duration-200 border border-white/10"
                >
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Slide Indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-2">
          {HERO_SLIDES.map((_, index) => (
            <button
              key={index}
              aria-label={`Go to slide ${index + 1}`}
              onClick={() => setCurrentSlide(index)}
              className={`h-0.5 rounded-full transition-all duration-300 ${
                index === currentSlide ? "w-8 bg-white" : "w-4 bg-white/30"
              }`}
            />
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section id="learn-more" className="py-16 md:py-24 bg-gradient-to-b from-black to-neutral-950">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          {FEATURE_SPOTLIGHTS.map((feature, index) => (
            <div
              key={feature.title}
              className={`grid md:grid-cols-2 gap-10 items-center ${
                index < FEATURE_SPOTLIGHTS.length - 1 ? "mb-16 md:mb-20" : ""
              }`}
            >
              <div className={feature.reverse ? "order-1 md:order-2" : ""}>
                <h2 className="text-2xl md:text-3xl font-semibold mb-3 tracking-tight">{feature.title}</h2>
                <p className="text-sm md:text-base text-gray-400 leading-relaxed">{feature.desc}</p>
              </div>
              <div
                className={`relative aspect-video rounded-2xl overflow-hidden border border-white/10 bg-white/[0.02] ${
                  feature.reverse ? "order-2 md:order-1" : ""
                }`}
              >
                <Image
                  src={feature.image}
                  alt={feature.alt}
                  fill
                  sizes="(min-width: 768px) 50vw, 100vw"
                  loading="lazy"
                  className="object-cover"
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 md:py-24 bg-neutral-950">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <h2 className="text-2xl md:text-3xl font-semibold mb-10 text-center tracking-tight">Everything you need</h2>
          
          <div className="grid md:grid-cols-3 gap-4">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="group p-5 bg-white/[0.02] rounded-xl border border-white/8 hover:border-white/20 transition-all duration-200 hover:-translate-y-0.5"
                >
                  <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-gray-300 group-hover:text-white">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-medium mb-1">{feature.title}</h3>
                  <p className="text-xs text-gray-500">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-neutral-950 to-black">
        <div className="max-w-2xl mx-auto px-4 md:px-6">
          <h2 className="text-2xl md:text-3xl font-semibold mb-8 text-center tracking-tight">
            Frequently Asked Questions
          </h2>

          <div className="space-y-2">
            {FAQS.map((faq) => (
              <details
                key={faq.question}
                className="group bg-white/[0.02] rounded-lg border border-white/5 overflow-hidden"
              >
                <summary className="cursor-pointer p-4 flex items-center justify-between text-sm font-medium">
                  <span>{faq.question}</span>
                  <svg
                    className="w-4 h-4 flex-shrink-0 ml-4 text-gray-500 transition-transform group-open:rotate-45"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                </summary>
                <div className="px-4 pb-4 text-gray-500 text-xs leading-relaxed">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 md:py-20 bg-black">
        <div className="max-w-2xl mx-auto px-4 md:px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-semibold mb-3 tracking-tight">
            Ready to watch?
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Start streaming today
          </p>
          <Link
            href="/login"
            className="group inline-flex items-center gap-2 px-8 py-2.5 bg-white text-black font-semibold text-sm rounded-full hover:bg-gray-100 transition-all duration-200 hover:-translate-y-0.5"
          >
            Get Started
            <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </section>

      {/* Made By Section */}
      <section className="py-12 bg-neutral-950/50 border-t border-white/5">
        <div className="max-w-2xl mx-auto px-4 md:px-6 text-center">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 mb-4">
            <Download className="w-5 h-5 text-white" />
          </div>

          <p className="text-xs text-gray-500 mb-3">
            Designed and developed by
          </p>

          <a
            href="https://rusilkoirala.com.np"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 text-sm font-medium text-white hover:text-gray-300 transition-colors"
          >
            <span>Rusil Koirala</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </a>

          <div className="mt-6 flex items-center justify-center gap-4 text-gray-600 text-xs">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Open Source</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Educational</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 bg-black border-t border-white/5">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-3">
            <Logo className="text-lg" />
            <p className="text-gray-600 text-xs">
              © 2024 Rusil Stream • Educational purposes only
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
