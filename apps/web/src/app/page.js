"use client";
import { useEffect, useState, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { motion, useScroll, useTransform, useInView, AnimatePresence } from "framer-motion";
import { ArrowRight, Play, Star, Tv2, Smartphone, Monitor, Download, Shield, Zap, ChevronDown } from "lucide-react";
import Logo from "@/components/layout/Logo";
import Loading from "@/components/ui/Loading";

// ─── Aurora Background (react-bits inspired) ───────────────────────────────
function Aurora({ colorStops = ["#3A29FF", "#FF94B4", "#FF3232"], blend = 0.5, amplitude = 1.0, speed = 0.5 }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl");
    if (!gl) return;

    const vert = `attribute vec2 a_pos; void main(){ gl_Position = vec4(a_pos,0,1); }`;
    const frag = `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_res;
      uniform vec3 u_c1;
      uniform vec3 u_c2;
      uniform vec3 u_c3;
      uniform float u_blend;
      uniform float u_amp;

      float hash(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
      float noise(vec2 p){
        vec2 i=floor(p); vec2 f=fract(p);
        vec2 u=f*f*(3.0-2.0*f);
        return mix(mix(hash(i),hash(i+vec2(1,0)),u.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),u.x),u.y);
      }

      void main(){
        vec2 uv = gl_FragCoord.xy / u_res;
        float t = u_time * 0.3;
        float n1 = noise(uv * 2.0 + vec2(t * 0.4, t * 0.2)) * u_amp;
        float n2 = noise(uv * 3.0 - vec2(t * 0.3, t * 0.5)) * u_amp;
        float n3 = noise(uv * 1.5 + vec2(t * 0.2, -t * 0.3)) * u_amp;
        float wave1 = smoothstep(0.2, 0.8, uv.y + n1 * 0.4 - 0.1);
        float wave2 = smoothstep(0.3, 0.9, uv.y + n2 * 0.3 + 0.1);
        float wave3 = smoothstep(0.1, 0.7, uv.y + n3 * 0.5 - 0.2);
        vec3 col = mix(u_c1, u_c2, wave1 * u_blend);
        col = mix(col, u_c3, wave2 * u_blend * 0.7);
        col = mix(col, u_c1 * 0.5, wave3 * u_blend * 0.4);
        col *= 0.35;
        gl_FragColor = vec4(col, 1.0);
      }
    `;

    function compile(type, src) {
      const s = gl.createShader(type);
      gl.shaderSource(s, src); gl.compileShader(s); return s;
    }
    const prog = gl.createProgram();
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, vert));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, frag));
    gl.linkProgram(prog); gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "a_pos");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    function hexToRgb(hex) {
      const r = parseInt(hex.slice(1,3),16)/255;
      const g = parseInt(hex.slice(3,5),16)/255;
      const b = parseInt(hex.slice(5,7),16)/255;
      return [r,g,b];
    }

    const uTime = gl.getUniformLocation(prog, "u_time");
    const uRes = gl.getUniformLocation(prog, "u_res");
    const uC1 = gl.getUniformLocation(prog, "u_c1");
    const uC2 = gl.getUniformLocation(prog, "u_c2");
    const uC3 = gl.getUniformLocation(prog, "u_c3");
    const uBlend = gl.getUniformLocation(prog, "u_blend");
    const uAmp = gl.getUniformLocation(prog, "u_amp");

    const c1 = hexToRgb(colorStops[0] || "#3A29FF");
    const c2 = hexToRgb(colorStops[1] || "#FF94B4");
    const c3 = hexToRgb(colorStops[2] || "#FF3232");
    gl.uniform3fv(uC1, c1); gl.uniform3fv(uC2, c2); gl.uniform3fv(uC3, c3);
    gl.uniform1f(uBlend, blend); gl.uniform1f(uAmp, amplitude);

    let raf;
    function resize() {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uRes, canvas.width, canvas.height);
    }
    resize();
    window.addEventListener("resize", resize);

    let start = null;
    function draw(ts) {
      if (!start) start = ts;
      gl.uniform1f(uTime, ((ts - start) / 1000) * speed);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, [colorStops, blend, amplitude, speed]);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
}

// ─── Blur Text (react-bits inspired) ────────────────────────────────────────
function BlurText({ text, className = "", delay = 0, once = true }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once });
  const words = text.split(" ");
  return (
    <span ref={ref} className={className} aria-label={text}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, filter: "blur(12px)", y: 20 }}
          animate={inView ? { opacity: 1, filter: "blur(0px)", y: 0 } : {}}
          transition={{ duration: 0.6, delay: delay + i * 0.08, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="inline-block mr-[0.25em]"
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
}

// ─── Shiny Text (react-bits inspired) ───────────────────────────────────────
function ShinyText({ text, className = "" }) {
  return (
    <span className={`relative inline-block overflow-hidden ${className}`}>
      <span className="relative z-10">{text}</span>
      <motion.span
        className="absolute inset-0 z-20 bg-gradient-to-r from-transparent via-white/60 to-transparent skew-x-[-20deg]"
        initial={{ x: "-150%" }}
        animate={{ x: "150%" }}
        transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 3, ease: "easeInOut" }}
      />
    </span>
  );
}

// ─── Star Border (react-bits inspired) ──────────────────────────────────────
function StarBorder({ children, className = "", color = "#60a5fa" }) {
  return (
    <div className={`relative inline-flex overflow-hidden rounded-full p-[1px] ${className}`}>
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: `conic-gradient(from 0deg, transparent 0%, transparent 60%, ${color} 80%, transparent 100%)`,
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
      />
      <div className="relative z-10 rounded-full bg-black/90 backdrop-blur-sm px-4 py-1.5">
        {children}
      </div>
    </div>
  );
}

// ─── Floating Particles ──────────────────────────────────────────────────────
function Particles({ count = 40 }) {
  const particles = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2 + 0.5,
        duration: Math.random() * 15 + 10,
        delay: Math.random() * 10,
        opacity: Math.random() * 0.5 + 0.1,
      })),
    [count]
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-white"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size, opacity: p.opacity }}
          animate={{ y: [0, -80, 0], opacity: [p.opacity, p.opacity * 2, p.opacity] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

// ─── Scroll Reveal ───────────────────────────────────────────────────────────
function Reveal({ children, delay = 0, direction = "up" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const variants = {
    hidden: { opacity: 0, y: direction === "up" ? 40 : direction === "down" ? -40 : 0, x: direction === "left" ? 40 : direction === "right" ? -40 : 0 },
    visible: { opacity: 1, y: 0, x: 0 },
  };
  return (
    <motion.div ref={ref} variants={variants} initial="hidden" animate={inView ? "visible" : "hidden"}
      transition={{ duration: 0.7, delay, ease: [0.25, 0.46, 0.45, 0.94] }}>
      {children}
    </motion.div>
  );
}

// ─── Tilt Card ───────────────────────────────────────────────────────────────
function TiltCard({ children, className = "" }) {
  const ref = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);

  function handleMove(e) {
    const rect = ref.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 16;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -16;
    setTilt({ x, y });
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      onMouseMove={handleMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setTilt({ x: 0, y: 0 }); }}
      animate={{ rotateX: tilt.y, rotateY: tilt.x, scale: hovered ? 1.02 : 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      style={{ transformStyle: "preserve-3d" }}
    >
      {children}
    </motion.div>
  );
}

// ─── Gradient Text ───────────────────────────────────────────────────────────
function GradientText({ children, className = "" }) {
  return (
    <span className={`bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500 bg-clip-text text-transparent ${className}`}>
      {children}
    </span>
  );
}

// ─── Number Counter ──────────────────────────────────────────────────────────
function Counter({ to, suffix = "", duration = 2 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = to / (duration * 60);
    const timer = setInterval(() => {
      start += step;
      if (start >= to) { setCount(to); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [inView, to, duration]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

// ─── Data ────────────────────────────────────────────────────────────────────
const STATS = [
  { value: 10000, suffix: "+", label: "Movies & Shows" },
  { value: 4, suffix: "K", label: "Ultra HD Quality" },
  { value: 5, suffix: " Screens", label: "Simultaneous" },
  { value: 99, suffix: "%", label: "Uptime" },
];

const FEATURES = [
  {
    icon: Monitor,
    title: "Watch on Any Screen",
    desc: "Seamlessly switch between your TV, laptop, tablet, and phone. Your progress syncs everywhere.",
    gradient: "from-blue-500/20 to-cyan-500/20",
    border: "border-blue-500/20",
    glow: "shadow-blue-500/10",
  },
  {
    icon: Download,
    title: "Download & Go Offline",
    desc: "Save content for your commute or travel. Watch without internet, anytime, anywhere.",
    gradient: "from-purple-500/20 to-pink-500/20",
    border: "border-purple-500/20",
    glow: "shadow-purple-500/10",
  },
  {
    icon: Zap,
    title: "Instant Streaming",
    desc: "Zero buffering with adaptive bitrate technology. Starts playing in under a second.",
    gradient: "from-amber-500/20 to-orange-500/20",
    border: "border-amber-500/20",
    glow: "shadow-amber-500/10",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    desc: "Your data stays yours. End-to-end encryption and zero third-party data sharing.",
    gradient: "from-emerald-500/20 to-teal-500/20",
    border: "border-emerald-500/20",
    glow: "shadow-emerald-500/10",
  },
  {
    icon: Star,
    title: "Curated Collections",
    desc: "Hand-picked lists, trending charts, and personalized recommendations just for you.",
    gradient: "from-rose-500/20 to-pink-500/20",
    border: "border-rose-500/20",
    glow: "shadow-rose-500/10",
  },
  {
    icon: Tv2,
    title: "Live TV & Sports",
    desc: "Never miss a game or live event. Stream live channels alongside your on-demand library.",
    gradient: "from-indigo-500/20 to-blue-500/20",
    border: "border-indigo-500/20",
    glow: "shadow-indigo-500/10",
  },
];

const DEVICES = [
  { icon: Monitor, label: "Smart TV" },
  { icon: Monitor, label: "Web" },
  { icon: Smartphone, label: "Mobile" },
  { icon: Tv2, label: "Apple TV" },
];

const FAQS = [
  { q: "What is Rusil Stream?", a: "An educational streaming platform built to showcase modern full-stack development with Next.js, MongoDB, and the TMDB API." },
  { q: "Can I watch on multiple devices?", a: "Yes — stream on up to 5 screens simultaneously. Your watch history and saved list sync across all devices automatically." },
  { q: "Is this a real streaming service?", a: "This is an educational project demonstrating full-stack development, authentication flows, and API integration at scale." },
  { q: "What tech stack powers this?", a: "Next.js 15 App Router, React 19, MongoDB, JWT auth, TMDB API, Tailwind CSS v4, and a React Native mobile app." },
  { q: "Is it free to use?", a: "Completely free. Sign up, explore the codebase, and learn from a production-grade streaming architecture." },
];

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function LandingPage() {
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const router = useRouter();
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -80]);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me", { redirect: "manual" });
        if (res.ok && res.type !== "opaqueredirect") {
          router.replace("/home");
          return;
        }
      } catch {}
      setIsCheckingAuth(false);
    }
    checkAuth();
  }, [router]);

  useEffect(() => {
    const handle = () => setScrolled(window.scrollY > 20);
    handle();
    window.addEventListener("scroll", handle, { passive: true });
    return () => window.removeEventListener("scroll", handle);
  }, []);

  if (isCheckingAuth) return <Loading />;

  return (
    <div className="min-h-screen bg-[#050508] text-white overflow-x-hidden">

      {/* ── Navbar ── */}
      <motion.nav
        className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-500 ${
          scrolled ? "bg-black/70 backdrop-blur-2xl shadow-[0_1px_0_rgba(255,255,255,0.06)]" : "bg-transparent"
        }`}
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <Logo />
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#devices" className="hover:text-white transition-colors">Devices</a>
            <a href="#download" className="hover:text-white transition-colors">Download</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </div>
          {/* Desktop: Sign In */}
          <Link
            href="/login"
            className="hidden md:flex group items-center gap-2 px-5 py-2 rounded-full bg-white text-black text-sm font-semibold hover:bg-gray-100 transition-all duration-200"
          >
            Sign In
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>

          {/* Mobile: Download */}
          <a
            href="/download"
            className="flex md:hidden items-center gap-1.5 px-4 py-2 rounded-full border border-white/15 bg-white/[0.06] backdrop-blur-sm text-white text-sm font-semibold hover:bg-white/10 transition-all duration-200"
          >
            <Download className="w-3.5 h-3.5" />
            Download
          </a>
        </div>
      </motion.nav>

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Aurora background */}
        <div className="absolute inset-0">
          <Aurora colorStops={["#1a0533", "#0a1628", "#001a2e"]} blend={1.2} amplitude={1.4} speed={0.4} />
        </div>

        {/* Radial overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(59,130,246,0.15),transparent)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#050508]" />

        {/* Particles */}
        <Particles count={50} />

        {/* Grid lines */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)", backgroundSize: "80px 80px" }} />

        <motion.div style={{ y: heroY }} className="relative z-10 text-center px-6 max-w-5xl mx-auto pt-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-6 flex justify-center"
          >
            <StarBorder color="#60a5fa">
              <span className="text-xs font-medium text-blue-300 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
                Open Source Educational Project
              </span>
            </StarBorder>
          </motion.div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[0.95] mb-6">
            <BlurText text="Stream Without" className="block" delay={0.3} />
            <span className="block mt-1">
              <BlurText text="Limits" className="inline" delay={0.5} />
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.9 }}
                className="inline-block ml-4"
              >
                <GradientText>.</GradientText>
              </motion.span>
            </span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Thousands of movies and TV shows. Watch on any device, anytime.
            Built with cutting-edge technology to deliver the perfect streaming experience.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link
              href="/login"
              className="group relative overflow-hidden px-8 py-3.5 rounded-full bg-white text-black font-bold text-sm flex items-center gap-2 hover:scale-105 transition-transform duration-200 shadow-[0_0_40px_rgba(255,255,255,0.15)]"
            >
              <motion.span
                className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-cyan-400/20"
                initial={{ x: "-100%" }}
                whileHover={{ x: "100%" }}
                transition={{ duration: 0.5 }}
              />
              <Play className="w-4 h-4 fill-black" />
              <span className="relative">Start Watching Free</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform relative" />
            </Link>

            <a
              href="#features"
              className="px-8 py-3.5 rounded-full border border-white/10 bg-white/[0.04] backdrop-blur-sm text-sm font-medium text-gray-300 hover:border-white/20 hover:bg-white/[0.08] transition-all duration-200 flex items-center gap-2"
            >
              Explore Features
              <ChevronDown className="w-4 h-4" />
            </a>
          </motion.div>

          {/* Hero preview mockup */}
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1, delay: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="mt-20 relative mx-auto max-w-4xl"
          >
            <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_80px_rgba(59,130,246,0.15)] bg-black/40 backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-white/[0.02]">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/60" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                  <div className="w-3 h-3 rounded-full bg-green-500/60" />
                </div>
                <div className="flex-1 mx-4 h-5 rounded-full bg-white/5 flex items-center px-3">
                  <span className="text-[10px] text-gray-600">rusilstream.com/home</span>
                </div>
              </div>
              <Image
                src="https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1200&q=80"
                alt="Rusil Stream interface preview"
                width={1200} height={600}
                className="w-full object-cover opacity-70"
                priority
              />
              <div className="absolute bottom-6 left-6 z-20 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
                  <Play className="w-4 h-4 fill-white" />
                </div>
                <div>
                  <p className="text-xs font-semibold">Now Playing</p>
                  <p className="text-[10px] text-gray-400">Trending · 4K Ultra HD</p>
                </div>
              </div>
            </div>
            {/* Glow under mockup */}
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-3/4 h-20 bg-blue-500/10 blur-3xl rounded-full" />
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-5 h-8 rounded-full border border-white/20 flex items-start justify-center pt-1.5"
          >
            <div className="w-1 h-2 bg-white/40 rounded-full" />
          </motion.div>
        </motion.div>
      </section>

      {/* ── Stats ── */}
      <section className="py-20 border-y border-white/[0.04] bg-white/[0.01]">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.1}>
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-black text-white mb-1">
                  <Counter to={s.value} suffix={s.suffix} />
                </p>
                <p className="text-xs text-gray-500 uppercase tracking-widest">{s.label}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-28 px-6">
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <div className="text-center mb-16 mx-auto">
              <p className="text-xs text-blue-400 uppercase tracking-[0.3em] mb-4 font-medium">Why Rusil Stream</p>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
                <BlurText text="Everything you need" once />
              </h2>
              <p className="text-gray-500 max-w-xl mx-auto text-center">
                A complete streaming experience built for the modern viewer.
              </p>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mx-auto">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <Reveal key={f.title} delay={i * 0.08}>
                  <TiltCard className={`h-full p-6 rounded-2xl border ${f.border} bg-gradient-to-br ${f.gradient} backdrop-blur-sm shadow-xl ${f.glow} hover:shadow-2xl transition-shadow duration-300 cursor-default`}>
                    <div className="mb-4 inline-flex w-11 h-11 items-center justify-center rounded-xl bg-white/5 border border-white/10">
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-base font-bold mb-2">{f.title}</h3>
                    <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
                  </TiltCard>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Spotlight Feature ── */}
      <section id="devices" className="py-28 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <Reveal direction="right">
              <div>
                <p className="text-xs text-blue-400 uppercase tracking-[0.3em] mb-4 font-medium">Multi-Device</p>
                <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6 leading-tight">
                  Your content,<br /><GradientText>everywhere.</GradientText>
                </h2>
                <p className="text-gray-400 leading-relaxed mb-8">
                  Start a movie on your TV, pause it, and pick up exactly where you left off on your phone.
                  Rusil Stream syncs your entire watch history across every device in real time.
                </p>
                <div className="flex flex-wrap gap-3 mb-8">
                  {["Smart TV", "Mobile", "Tablet", "Laptop"].map((d) => (
                    <span key={d} className="px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.04] text-xs text-gray-400">{d}</span>
                  ))}
                </div>
                <Link href="/login" className="group inline-flex items-center gap-2 text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors">
                  Get started free
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </Reveal>

            <Reveal direction="left" delay={0.2}>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Smart TV", img: "https://images.unsplash.com/photo-1593784991095-a205069470b6?w=600&q=80" },
                  { label: "Mobile", img: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=600&q=80" },
                  { label: "Tablet", img: "https://images.unsplash.com/photo-1574267432644-f610f5b7e4d1?w=600&q=80" },
                  { label: "Laptop", img: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&q=80" },
                ].map((d) => (
                  <TiltCard key={d.label} className="relative aspect-video rounded-xl overflow-hidden border border-white/10 group">
                    <Image src={d.img} alt={d.label} fill className="object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-300" sizes="300px" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <span className="absolute bottom-2 left-3 text-xs font-semibold text-white/80">{d.label}</span>
                  </TiltCard>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="py-28 px-6">
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <div className="relative rounded-3xl overflow-hidden border border-white/10 p-12 md:p-16 text-center">
              {/* Aurora inside CTA */}
              <div className="absolute inset-0">
                <Aurora colorStops={["#1e3a5f", "#0d2137", "#0a0f1e"]} blend={1.5} amplitude={1.2} speed={0.3} />
              </div>
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(59,130,246,0.12),transparent)]" />
              <Particles count={20} />

              <div className="relative z-10">
                <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
                  Ready to watch?
                </h2>
                <p className="text-gray-400 mb-8 max-w-md mx-auto">
                  Join thousands of viewers. No credit card required.
                </p>
                <Link
                  href="/login"
                  className="group inline-flex items-center gap-2 px-10 py-4 rounded-full bg-white text-black font-bold text-sm hover:scale-105 transition-transform duration-200 shadow-[0_0_60px_rgba(255,255,255,0.2)]"
                >
                  <ShinyText text="Start Streaming Free" />
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Download Apps ── */}
      <section id="download" className="py-20 px-6 border-t border-white/[0.04]">
        <div className="max-w-5xl mx-auto text-center">
          <Reveal>
            <p className="text-xs text-blue-400 uppercase tracking-[0.3em] mb-4 font-medium">Get the App</p>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-3">Watch on your phone or TV</h2>
            <p className="text-gray-500 mb-10 max-w-md mx-auto">Download the native app for Android phone or Android TV for the best experience.</p>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="grid sm:grid-cols-2 gap-4 max-w-xl mx-auto">
              {/* Android Phone */}
              <a
                href="/download"
                className="group flex items-center gap-4 p-5 rounded-2xl border border-white/10 bg-white/[0.03] hover:border-green-500/30 hover:bg-green-500/[0.05] transition-all duration-200"
              >
                <div className="w-12 h-12 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center flex-shrink-0">
                  <Smartphone className="w-6 h-6 text-green-400" />
                </div>
                <div className="text-left">
                  <p className="text-xs text-green-400 font-semibold uppercase tracking-wider mb-0.5">Android Phone</p>
                  <p className="text-sm font-bold text-white">Download APK</p>
                  <p className="text-xs text-gray-500">Android 7.0+ · ~25 MB</p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-green-400 group-hover:translate-x-0.5 transition-all ml-auto" />
              </a>

              {/* Android TV */}
              <a
                href="/download"
                className="group flex items-center gap-4 p-5 rounded-2xl border border-white/10 bg-white/[0.03] hover:border-purple-500/30 hover:bg-purple-500/[0.05] transition-all duration-200"
              >
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <Tv2 className="w-6 h-6 text-purple-400" />
                </div>
                <div className="text-left">
                  <p className="text-xs text-purple-400 font-semibold uppercase tracking-wider mb-0.5">Android TV</p>
                  <p className="text-sm font-bold text-white">Download APK</p>
                  <p className="text-xs text-gray-500">Android TV 5.0+ · ~28 MB</p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-purple-400 group-hover:translate-x-0.5 transition-all ml-auto" />
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="py-20 px-6">
        <div className="max-w-2xl mx-auto">
          <Reveal>
            <div className="text-center mb-12 mx-auto">
              <p className="text-xs text-blue-400 uppercase tracking-[0.3em] mb-4 font-medium">FAQ</p>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight">Common questions</h2>
            </div>
          </Reveal>

          <div className="space-y-2">
            {FAQS.map((faq, i) => (
              <Reveal key={faq.q} delay={i * 0.06}>
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between px-5 py-4 text-left text-sm font-medium hover:bg-white/[0.03] transition-colors"
                  >
                    <span>{faq.q}</span>
                    <motion.span
                      animate={{ rotate: openFaq === i ? 45 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-gray-500 flex-shrink-0 ml-4 text-lg leading-none"
                    >
                      +
                    </motion.span>
                  </button>
                  <AnimatePresence>
                    {openFaq === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <p className="px-5 pb-4 text-sm text-gray-500 leading-relaxed">{faq.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/[0.04] py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <Logo />
          <p className="text-xs text-gray-600 text-center">
            © 2025 Rusil Stream · Educational purposes only ·{" "}
            <a href="https://rusilkoirala.com.np" target="_blank" rel="noopener noreferrer" className="hover:text-gray-400 transition-colors">
              Made by Rusil Koirala
            </a>
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-600">
            <Link href="/login" className="hover:text-gray-400 transition-colors">Sign In</Link>
            <a href="https://github.com/rusilkoirala" target="_blank" rel="noopener noreferrer" className="hover:text-gray-400 transition-colors">GitHub</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
