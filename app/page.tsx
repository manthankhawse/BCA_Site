"use client";
import NextImage from "next/image";
import logo from "@/assets/BCA Logo (Transparent).png";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from "framer-motion";
import {
  ArrowRight, BookOpen, Brain,
  Crown, Flag, Globe, GraduationCap, Home, Image as ImageIcon, Info, LogIn,
  Mail, PlayCircle, Sparkles, Star, Trophy, MapPin,
  Phone, Send, CheckCircle, Facebook, Twitter, Instagram, Linkedin,
  ChevronLeft, ChevronRight, Quote, BellRing, Clock, AlertCircle,
  Menu, X
} from "lucide-react";

// --- Static Data ---
const galleryImages = [
  "IMG-20240617-WA0017.jpg", "IMG-20240617-WA0018.jpg", "IMG-20240617-WA0022.jpg",
  "IMG-20240617-WA0023.jpg", "IMG-20240617-WA0024.jpg", "IMG-20240617-WA0025.jpg",
  "IMG-20240617-WA0026.jpg", "IMG-20240617-WA0027.jpg", "IMG-20240617-WA0028.jpg",
  "IMG-20240617-WA0029.jpg", "IMG-20240617-WA0030.jpg", 
];

const reviews = [
  {
    name: "Krupal Wanjari",
    comment: "My son joined this Academy in 2014 and has achieved a lot—from Unrated to Rated and many tournament wins. He is a champion in Under 07, 09, and 11 age groups and won an Asian Gold medal in Under-09.",
  },
  // {
  //   name: "Rudraksh Borkar",
  //   comment: "The best academy to learn chess. BCA helps students improve step by step from beginner to advanced level.",
  // },
  {
    name: "Hiranmay Ingale",
    comment: "One of the best coaching centers for chess in Nagpur. Supportive coaches and a disciplined, friendly environment.",
  },
  {
    name: "Bhakti Titarmare",
    comment: "From a beginner to a 1558-rated player, Nilesh Sir's mentorship helped me win many championships. Eternally grateful!",
  },
  {
    name: "Shruti Nakhate",
    comment: "The academy is excellent. Very good environment—safe, friendly, and highly effective coaching. Highly recommend a visit!",
  },
];

const programs = [
  {
    level: "Level 01",
    title: "Beginner Training",
    desc: "Master the fundamentals, rules, and opening principles of chess.",
    img: "https://images.unsplash.com/photo-1529699211952-734e80c4d42b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600",
    color: "text-[oklch(0.696_0.17_162.48)]",
    bg: "bg-[oklch(0.696_0.17_162.48/0.2)]",
    border: "border-[oklch(0.696_0.17_162.48/0.5)]"
  },
  {
    level: "Level 02",
    title: "Intermediate Training",
    desc: "Sharpen tactics, middlegame strategy, and positional play.",
    img: "https://images.unsplash.com/photo-1528819622765-d6bcf132f793?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600",
    color: "text-[oklch(0.7_0.18_264)]",
    bg: "bg-[oklch(0.488_0.243_264.376/0.2)]",
    border: "border-[oklch(0.488_0.243_264.376/0.5)]"
  },
  {
    level: "Level 03",
    title: "Advanced Training",
    desc: "Deep endgame mastery, calculation, and tournament preparation.",
    img: "https://images.unsplash.com/photo-1625750331870-624de6fd3452?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600",
    color: "text-[oklch(0.75_0.2_16)]",
    bg: "bg-[oklch(0.645_0.246_16.439/0.2)]",
    border: "border-[oklch(0.645_0.246_16.439/0.5)]"
  },
  {
    level: "Remote",
    title: "Online Training",
    desc: "Learn from anywhere with live interactive coaching sessions.",
    img: "/assets/online-learning.png",
    color: "text-[oklch(0.769_0.188_70.08)]",
    bg: "bg-[oklch(0.769_0.188_70.08/0.2)]",
    border: "border-[oklch(0.769_0.188_70.08/0.5)]"
  }
];

// --- Animation Variants ---
const fadeInUp = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as any } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12 } }
} as any;

// --- Reusable Button ---
const Button = ({ children, className = "", variant = "default", type = "button", ...props }: {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "outline";
  type?: "button" | "submit" | "reset";
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  [key: string]: any;
}) => {
  const baseStyle = "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all duration-300 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2 cursor-pointer";
  const variants = {
    default: "bg-gradient-to-r from-[oklch(0.769_0.188_70.08)] to-[oklch(0.6_0.15_70)] text-[oklch(0.205_0_0)] shadow-[0_0_24px_oklch(0.769_0.188_70.08/0.35)] hover:shadow-[0_0_40px_oklch(0.769_0.188_70.08/0.6)] hover:-translate-y-1 rounded-full",
    outline: "border border-white/20 bg-neutral-900/40 hover:bg-white/10 text-neutral-50 rounded-full backdrop-blur-md hover:-translate-y-1",
  };
  return (
    <button type={type} className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

// --- Tournament Card (used for single + carousel) ---
function TournamentCard({ tournament }: { tournament: any }) {
  // Memoize the date string so the Date object is stable and doesn't cause infinite re-renders
  const startDateStr: string | null = tournament.startDate || null;
  const countdown = useTournamentCountdown(startDateStr);
  return (
    <div className="relative backdrop-blur-xl rounded-3xl bg-neutral-900/40 border border-white/10 overflow-hidden shadow-2xl">
      <div className="bg-[radial-gradient(circle_at_50%_40%,oklch(0.769_0.188_70.08/0.15),transparent_60%)] absolute inset-0 pointer-events-none" />
      <div className="bg-[repeating-conic-gradient(oklch(0.985_0_0)_0deg_90deg,transparent_90deg_180deg)] opacity-[0.03] absolute inset-0 pointer-events-none" />
      <div className="relative text-center flex p-6 sm:p-12 md:p-20 flex-col items-center gap-8">
        <div className="relative">
          <div className="bg-[oklch(0.769_0.188_70.08/0.3)] blur-3xl rounded-full absolute inset-0 size-32 mx-auto animate-pulse" />
          <div className="relative size-28 border border-[oklch(0.769_0.188_70.08/0.4)] rounded-full bg-neutral-950/80 backdrop-blur-md shadow-[0_0_40px_oklch(0.769_0.188_70.08/0.3)] flex justify-center items-center">
            <Trophy className="size-12 text-[oklch(0.769_0.188_70.08)]" />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <h3 className="font-serif font-medium text-3xl md:text-4xl">{tournament.name}</h3>
          {tournament.description && <p className="text-[#a1a1a1] text-base md:text-lg max-w-lg mx-auto">{tournament.description}</p>}
          <div className="flex flex-wrap justify-center gap-3 mt-2">
            {tournament.format && <span className="text-xs uppercase tracking-widest bg-neutral-800 border border-white/10 px-3 py-1 rounded-full text-neutral-300">{tournament.format}</span>}
            {tournament.locationType && <span className="text-xs uppercase tracking-widest bg-neutral-800 border border-white/10 px-3 py-1 rounded-full text-neutral-300">{tournament.locationType}</span>}
            {tournament.venue && <span className="text-xs uppercase tracking-widest bg-neutral-800 border border-white/10 px-3 py-1 rounded-full text-neutral-300">📍 {tournament.venue}</span>}
          </div>
        </div>
        {startDateStr && (
          <div className="flex items-center gap-1.5 sm:gap-3">
            {[
              { v: String(countdown.days).padStart(2, '0'), l: 'Days' },
              { v: String(countdown.hours).padStart(2, '0'), l: 'Hours' },
              { v: String(countdown.mins).padStart(2, '0'), l: 'Mins' },
              { v: String(countdown.secs).padStart(2, '0'), l: 'Secs' },
            ].map((t, i) => (
              <div key={i} className="flex items-center gap-1.5 sm:gap-3">
                <div className="rounded-2xl bg-neutral-950/80 border border-white/10 flex px-3 py-2 sm:px-5 sm:py-4 flex-col items-center shadow-inner min-w-[55px] sm:min-w-[70px]">
                  <span className="tabular-nums font-serif font-semibold text-xl sm:text-3xl text-white">{t.v}</span>
                  <span className="uppercase text-[oklch(0.769_0.188_70.08)] text-[8px] sm:text-[10px] tracking-widest font-bold mt-1">{t.l}</span>
                </div>
                {i < 3 && <span className="font-serif text-[#a1a1a1] text-xl sm:text-3xl animate-pulse">:</span>}
              </div>
            ))}
          </div>
        )}
        {(tournament.registrationLink || tournament.link) && (
          <a href={tournament.registrationLink || tournament.link} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto px-10 h-14 text-base"><BellRing className="size-5" /> Register Now</Button>
          </a>
        )}
      </div>
    </div>
  );
}

// --- Countdown Timer Hook ---
// Takes a date string to keep the dependency stable across renders
function useTournamentCountdown(targetDateStr: string | null) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });
  useEffect(() => {
    if (!targetDateStr) return;
    const targetTime = new Date(targetDateStr).getTime();
    const tick = () => {
      const diff = targetTime - Date.now();
      if (diff <= 0) { setTimeLeft({ days: 0, hours: 0, mins: 0, secs: 0 }); return; }
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        mins: Math.floor((diff % 3600000) / 60000),
        secs: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetDateStr]);
  return timeLeft;
}

export default function BrilliantChessAcademy() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [reviewIndex, setReviewIndex] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // JSON-LD schema markup for LocalBusiness SEO
  const schemaMarkup = {
    "@context": "https://schema.org",
    "@type": "SportsActivityLocation",
    "name": "Brilliant Chess Academy",
    "image": "https://brilliantchessacademy.com/assets/BCA%20Logo%20(Transparent).png",
    "@id": "https://brilliantchessacademy.com/#academy",
    "url": "https://brilliantchessacademy.com",
    "telephone": "+91 98765 43210",
    "priceRange": "$$",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Nagpur, Maharashtra",
      "addressLocality": "Nagpur",
      "postalCode": "440001",
      "addressRegion": "Maharashtra",
      "addressCountry": "IN"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 21.1458,
      "longitude": 79.0882
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
      ],
      "opens": "10:00",
      "closes": "20:00"
    },
    "sameAs": [
      "https://www.facebook.com/brilliantchessacademy",
      "https://www.instagram.com/brilliantchessacademy"
    ]
  };

  const [liveReviews, setLiveReviews] = useState<typeof reviews | null>(null);
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [tourIndex, setTourIndex] = useState(0);
  const [tourLoading, setTourLoading] = useState(true);
  const [authUser, setAuthUser] = useState<{ name: string; role: string } | null>(null);
  // Contact form state
  const [contactForm, setContactForm] = useState({ name: "", email: "", phone: "", program: "", message: "" });
  const [contactStatus, setContactStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [contactError, setContactError] = useState("");

  const displayReviews = liveReviews && liveReviews.length > 0 ? liveReviews : reviews;

  // --- Physics-based Parallax Setup ---
  const { scrollY } = useScroll();
  const smoothScroll = useSpring(scrollY, { stiffness: 50, damping: 20, restDelta: 0.001 });
  const heroY = useTransform(smoothScroll, [0, 1000], ["0%", "30%"]);
  const floatY = useTransform(smoothScroll, [0, 1000], ["0%", "-40%"]);
  const subtleParallax = useTransform(smoothScroll, [0, 2000], ["0%", "15%"]);

  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth";
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Check if user is already logged in
  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.user) setAuthUser(d.user); })
      .catch(() => {});
  }, []);

  // Fetch live reviews
  useEffect(() => {
    fetch("/api/reviews")
      .then(r => r.json())
      .then(d => { if (d.reviews?.length) setLiveReviews(d.reviews); })
      .catch(() => {});
  }, []);

  // Fetch upcoming tournaments (public)
  useEffect(() => {
    fetch("/api/public/tournaments")
      .then(r => r.json())
      .then(d => { setTournaments(d.tournaments || []); setTourLoading(false); })
      .catch(() => setTourLoading(false));
  }, []);

  // Review Carousel Auto-play
  useEffect(() => {
    const timer = setInterval(() => {
      setReviewIndex((prev) => (prev + 1) % displayReviews.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [displayReviews.length]);

  const nextReview = () => setReviewIndex((prev) => (prev + 1) % displayReviews.length);
  const prevReview = () => setReviewIndex((prev) => (prev - 1 + displayReviews.length) % displayReviews.length);

  // Handle Start Your Journey
  const handleStartJourney = async () => {
    try {
      const res = await fetch("/api/auth/me").catch(() => null);
      if (res && res.ok) {
        const data = await res.json();
        router.push(data.user?.role === "admin" ? "/admin" : "/student");
      } else {
        router.push("/auth/login");
      }
    } catch {
      router.push("/auth/login");
    }
  };

  // Handle contact form submit
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      setContactError("Name, email and message are required.");
      return;
    }
    setContactStatus("sending");
    setContactError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contactForm),
      });
      if (res.ok) {
        setContactStatus("success");
        setContactForm({ name: "", email: "", phone: "", program: "", message: "" });
      } else {
        const d = await res.json();
        setContactError(d.error || "Failed to send.");
        setContactStatus("error");
      }
    } catch {
      setContactError("Network error. Please try again.");
      setContactStatus("error");
    }
  };

  return (
    <div className="relative font-sans bg-neutral-950 text-neutral-50 w-full min-h-screen overflow-x-hidden selection:bg-[oklch(0.769_0.188_70.08/0.3)] selection:text-white">
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
      />
      
      {/* Top Progress / Glow Bars */}
      <div className="pointer-events-none fixed z-[60] bg-gradient-to-r from-[oklch(0.769_0.188_70.08)] via-[oklch(0.85_0.16_80)] to-[oklch(0.696_0.17_162.48)] w-full top-0 h-1 opacity-80" />
      <div className="pointer-events-none fixed bg-[repeating-conic-gradient(oklch(0.985_0_0)_0deg_90deg,transparent_90deg_180deg)] opacity-[0.02] inset-0 z-0" />

      {/* Navigation */}
      <header className={`fixed z-50 transition-all duration-500 w-full ${scrolled ? "bg-neutral-950/80 backdrop-blur-xl border-b border-white/10 py-4 shadow-2xl" : "bg-transparent py-6"}`}>
        <div className="max-w-[1140px] flex mx-auto px-6 md:px-8 justify-between items-center relative">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3 group cursor-pointer">
            <div className="size-10 shrink-0 relative flex justify-center items-center">
              <NextImage src={logo} alt="Brilliant Chess Academy Logo" width={40} height={40} className="object-contain" />
            </div>
            <div className="leading-tight flex flex-col">
              <span className="font-semibold text-neutral-50 text-sm leading-5 tracking-[3.2px]">BRILLIANT</span>
              <span className="text-[oklch(0.769_0.188_70.08)] text-[10px] tracking-[5.6px]">CHESS ACADEMY</span>
            </div>
          </motion.div>

          <nav className="hidden md:flex justify-center items-center gap-8">
            {["Home", "Programs", "About us", "Gallery", "Contact"].map((item, i) => (
              <motion.a key={item} href={`#${item.toLowerCase().replace(' ', '-')}`} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className="relative group transition-colors font-medium text-[#a1a1a1] hover:text-white text-sm leading-5 flex items-center gap-1.5 cursor-pointer">
                {item === "Home" && <Home className="size-4" />}
                {item === "Programs" && <BookOpen className="size-4" />}
                {item === "About us" && <Info className="size-4" />}
                {item === "Gallery" && <ImageIcon className="size-4" />}
                {item === "Contact" && <Mail className="size-4" />}
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[oklch(0.769_0.188_70.08)] transition-all duration-300 group-hover:w-full" />
              </motion.a>
            ))}
          </nav>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="hidden md:block">
            {authUser ? (
              <a href={authUser.role === 'admin' ? '/admin' : '/student'}
                className="flex items-center gap-2.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-full px-4 py-2 transition-all group">
                <div className="size-8 bg-gradient-to-br from-[oklch(0.769_0.188_70.08)] to-[oklch(0.55_0.14_70)] rounded-full flex items-center justify-center text-black font-bold text-sm">
                  {authUser.name[0].toUpperCase()}
                </div>
                <span className="text-sm font-medium text-neutral-200 group-hover:text-white transition-colors">{authUser.name.split(' ')[0]}</span>
                <ChevronRight className="size-3.5 text-neutral-500 group-hover:text-white transition-colors" />
              </a>
            ) : (
              <a href="/auth/login">
                <Button className="px-6 font-semibold flex">
                  <LogIn className="size-4" /> Login
                </Button>
              </a>
            )}
          </motion.div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 border border-white/10 rounded-xl bg-neutral-900/50 hover:bg-white/10 transition-colors focus:outline-none"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="size-6 text-white" /> : <Menu className="size-6 text-white" />}
            </button>
          </div>
          
          {/* Mobile Menu Dropdown */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="absolute top-full left-0 w-full bg-neutral-950/95 backdrop-blur-2xl border-b border-white/10 md:hidden overflow-hidden shadow-2xl z-50"
              >
                <div className="flex flex-col px-6 py-6 gap-5">
                  {["Home", "Programs", "About us", "Gallery", "Contact"].map((item) => (
                    <a
                      key={item}
                      href={`#${item.toLowerCase().replace(' ', '-')}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 font-medium text-neutral-300 hover:text-white text-base py-2 transition-colors border-b border-white/5"
                    >
                      {item === "Home" && <Home className="size-4 text-[oklch(0.769_0.188_70.08)]" />}
                      {item === "Programs" && <BookOpen className="size-4 text-[oklch(0.769_0.188_70.08)]" />}
                      {item === "About us" && <Info className="size-4 text-[oklch(0.769_0.188_70.08)]" />}
                      {item === "Gallery" && <ImageIcon className="size-4 text-[oklch(0.769_0.188_70.08)]" />}
                      {item === "Contact" && <Mail className="size-4 text-[oklch(0.769_0.188_70.08)]" />}
                      {item}
                    </a>
                  ))}
                  <div className="pt-2">
                    {authUser ? (
                      <a
                        href={authUser.role === 'admin' ? '/admin' : '/student'}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-between bg-white/5 border border-white/10 rounded-2xl px-5 py-3 w-full"
                      >
                        <div className="flex items-center gap-3">
                          <div className="size-8 bg-gradient-to-br from-[oklch(0.769_0.188_70.08)] to-[oklch(0.55_0.14_70)] rounded-full flex items-center justify-center text-black font-bold text-sm">
                            {authUser.name[0].toUpperCase()}
                          </div>
                          <span className="text-sm font-medium text-neutral-200">{authUser.name}</span>
                        </div>
                        <ChevronRight className="size-4 text-neutral-500" />
                      </a>
                    ) : (
                      <a href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                        <Button className="w-full h-12 text-base font-semibold">
                          <LogIn className="size-5" /> Login
                        </Button>
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Hero Section */}
      <section id="home" className="relative flex items-center w-full min-h-screen overflow-hidden pt-20">
        <motion.div style={{ y: heroY }} className="absolute inset-0 w-full h-[120%]">
          <img
            src="https://images.unsplash.com/photo-1580541832626-2a7131ee809f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600"
            alt="Luxury chess board"
            className="object-cover w-full h-full opacity-50 scale-110" // Scaled slightly more to prevent edge clipping during parallax
          />
        </motion.div>
        
        <div className="bg-gradient-to-r from-neutral-950 via-neutral-950/80 to-neutral-950/40 absolute inset-0" />
        <div className="bg-[radial-gradient(circle_at_70%_30%,oklch(0.769_0.188_70.08/0.15),transparent_60%)] absolute inset-0" />
        
        {/* Floating Ambient Particles with Scroll Parallax */}
        <motion.div style={{ y: floatY }} className="absolute right-32 top-1/3">
            <motion.div animate={{ y: [0, -30, 0], x: [0, 10, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} className="size-4 bg-[oklch(0.769_0.188_70.08)] blur-[3px] opacity-60 rounded-full" />
        </motion.div>
        <motion.div style={{ y: floatY }} className="absolute right-1/4 top-1/2">
            <motion.div animate={{ y: [0, 40, 0], x: [0, -15, 0] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} className="size-3 bg-[oklch(0.696_0.17_162.48)] blur-[2px] opacity-50 rounded-full" />
        </motion.div>

        <div className="relative z-10 max-w-[1140px] mx-auto px-8 w-full">
          <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="max-w-2xl flex flex-col gap-8">
            <motion.div variants={fadeInUp} className="inline-flex border-[oklch(0.769_0.188_70.08/0.4)] bg-[oklch(0.769_0.188_70.08/0.08)] backdrop-blur-md rounded-full border px-4 py-1.5 items-center gap-2 w-fit">
              <Sparkles className="size-3.5 text-[oklch(0.769_0.188_70.08)]" />
              <span className="text-[oklch(0.769_0.188_70.08)] uppercase text-xs tracking-[4px]">Where Strategic Brilliance Begins</span>
            </motion.div>
            
            <motion.h1 variants={fadeInUp} className="font-serif font-medium text-5xl sm:text-6xl md:text-7xl lg:text-8xl leading-tight tracking-tight">
              Brilliant <br className="hidden md:block" />
              <span className="bg-gradient-to-r from-[oklch(0.769_0.188_70.08)] via-[oklch(0.88_0.14_85)] to-[oklch(0.6_0.13_70)] bg-clip-text text-transparent">Chess</span> Academy
            </motion.h1>
            
            <motion.p variants={fadeInUp} className="leading-relaxed max-w-xl text-[#a1a1a1] text-lg">
              Welcome to Brilliant Chess Academy, where strategic brilliance begins. Join our community and elevate your chess skills with expert guidance. Let every move be a step toward unlocking your full potential.
            </motion.p>
            
            <motion.div variants={fadeInUp} className="flex flex-wrap items-center gap-4">
              <Button onClick={handleStartJourney} className="px-8 h-14 text-base shadow-[0_0_30px_oklch(0.769_0.188_70.08/0.4)]">
                <GraduationCap className="size-5" /> Start Your Journey
              </Button>
              <Button variant="outline" onClick={() => document.getElementById('programs')?.scrollIntoView({ behavior: 'smooth' })} className="px-8 h-14 text-base">
                <PlayCircle className="size-5" /> Explore Programs
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Section Divider */}
      <div className="bg-[repeating-linear-gradient(90deg,oklch(0.205_0_0)_0_30px,oklch(0.145_0_0)_30px_60px)] opacity-60 w-full h-6" />

      {/* Programs Section */}
      {/* <section id="programs" className="relative py-32 w-full overflow-hidden">
        <motion.div style={{ y: subtleParallax }} className="bg-[radial-gradient(circle_at_50%_0%,oklch(0.205_0_0),oklch(0.145_0_0))] absolute inset-0 h-[120%]" />
        
        <div className="relative max-w-[1140px] mx-auto px-8 z-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp} className="text-center flex mb-16 flex-col items-center gap-4">
            <span className="text-[oklch(0.769_0.188_70.08)] uppercase text-xs tracking-[4.8px] font-semibold">Our Programs</span>
            <h2 className="font-serif font-medium text-5xl leading-tight">BCA Courses</h2>
            <div className="bg-gradient-to-r from-transparent via-[oklch(0.769_0.188_70.08)] to-transparent rounded-full w-24 h-0.5" />
            <p className="max-w-xl text-[#a1a1a1] text-lg">Customized chess training tailored to every level, guiding you from your first move to mastery.</p>
          </motion.div>

          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {programs.map((prog, idx) => (
              <motion.div key={idx} variants={fadeInUp} className="group relative backdrop-blur-xl transition-all duration-500 rounded-2xl bg-neutral-900/50 border border-white/10 hover:border-white/30 overflow-hidden cursor-pointer hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.7)] flex flex-col">
                <div className="relative h-48 overflow-hidden">
                  <img src={prog.img} alt={prog.title} className="object-cover transition-transform duration-700 group-hover:scale-110 w-full h-full" />
                  <div className="bg-gradient-to-t from-neutral-900 via-neutral-900/40 to-transparent absolute inset-0" />
                  <span className={`${prog.bg} ${prog.border} ${prog.color} uppercase rounded-full text-[10px] font-bold tracking-widest border absolute left-4 top-4 px-3 py-1 backdrop-blur-md`}>
                    {prog.level}
                  </span>
                </div>
                <div className="flex p-6 flex-col gap-3 flex-grow bg-neutral-900/80">
                  <h3 className="font-serif font-medium text-xl">{prog.title}</h3>
                  <p className="text-[#a1a1a1] text-sm leading-relaxed flex-grow">{prog.desc}</p>
                  <span className="text-[oklch(0.769_0.188_70.08)] font-medium text-sm flex mt-2 items-center gap-2 group-hover:gap-3 transition-all">
                    Learn more <ArrowRight className="size-4" />
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section> */}

      {/* Programs Section */}
      <section id="programs" className="relative py-32 w-full overflow-hidden">
        <motion.div style={{ y: subtleParallax }} className="bg-[radial-gradient(circle_at_50%_0%,oklch(0.205_0_0),oklch(0.145_0_0))] absolute inset-0 h-[120%]" />
        
        <div className="relative max-w-[1140px] mx-auto px-8 z-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp} className="text-center flex mb-16 flex-col items-center gap-4">
            <span className="text-[oklch(0.769_0.188_70.08)] uppercase text-xs tracking-[4.8px] font-semibold">Our Programs</span>
            <h2 className="font-serif font-medium text-5xl leading-tight">BCA Courses</h2>
            <div className="bg-gradient-to-r from-transparent via-[oklch(0.769_0.188_70.08)] to-transparent rounded-full w-24 h-0.5" />
            <p className="max-w-xl text-[#a1a1a1] text-lg">Customized chess training tailored to every level, guiding you from your first move to mastery.</p>
          </motion.div>

          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {programs.map((prog, idx) => (
              <motion.div 
                key={idx} 
                variants={fadeInUp} 
                className="group relative backdrop-blur-xl transition-all duration-500 rounded-3xl bg-neutral-900/60 border border-white/10 hover:border-[oklch(0.769_0.188_70.08/0.5)] border-solid overflow-hidden cursor-pointer hover:-translate-y-2 shadow-lg hover:shadow-[0_20px_40px_-15px_rgba(201,168,76,0.15)] flex flex-col"
              >
                {/* Image Header */}
                <div className="relative h-56 overflow-hidden">
                  <img 
                    src={prog.img} 
                    alt={prog.title} 
                    className="object-cover transition-transform duration-700 group-hover:scale-110 w-full h-full opacity-90 group-hover:opacity-100" 
                  />
                  {/* Seamless blend gradient */}
                  <div className="bg-gradient-to-t from-neutral-900/95 via-neutral-900/40 to-transparent absolute inset-0" />
                  
                  {/* Badge */}
                  <span className={`${prog.bg} ${prog.border} ${prog.color} uppercase rounded-full text-[10px] font-bold tracking-widest border border-solid absolute left-5 top-5 px-3 py-1 backdrop-blur-md`}>
                    {prog.level}
                  </span>
                </div>

                {/* Card Body */}
                <div className="flex p-6 pt-2 flex-col gap-3 flex-grow bg-neutral-900/95 relative">
                  <h3 className="font-serif font-medium text-2xl text-white group-hover:text-[oklch(0.769_0.188_70.08)] transition-colors duration-300">
                    {prog.title}
                  </h3>
                  <p className="text-[#a1a1a1] text-sm leading-relaxed flex-grow">
                    {prog.desc}
                  </p>
                  
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* About Us Section */}
      <section id="about-us" className="relative py-32 w-full bg-neutral-950 overflow-hidden">
        <div className="max-w-[1140px] mx-auto px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-16 lg:gap-20">
            
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp} className="relative order-2 lg:order-1">
              <div className="size-32 border-[oklch(0.769_0.188_70.08/0.3)] rounded-3xl border absolute -left-6 -top-6 animate-[pulse_4s_ease-in-out_infinite]" />
              <img
                src="/assets/about/about-us-img.jpeg"
                alt="Brilliant Chess Academy Coaching"
                className="relative object-cover shadow-[0_30px_60px_-20px_oklch(0_0_0/0.8)] rounded-2xl border border-white/10 w-full h-[300px] sm:h-[400px] lg:h-[500px]"
              />
            </motion.div>

            <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} className="flex flex-col gap-6 order-1 lg:order-2">
              <motion.span variants={fadeInUp} className="text-[oklch(0.769_0.188_70.08)] uppercase text-xs tracking-[4.8px] font-semibold">About Us</motion.span>
              <motion.h2 variants={fadeInUp} className="leading-tight font-serif font-medium text-4xl md:text-5xl">
                Hello and welcome to the Brilliant Chess Academy
              </motion.h2>
              <motion.p variants={fadeInUp} className="leading-relaxed text-[#a1a1a1] text-lg">
                We're delighted to have you as a part of our chess classes. Whether you're a beginner, intermediate, or advanced player, we're committed to providing you with top-notch chess instruction in a supportive and engaging environment.
              </motion.p>
              
              <motion.div variants={fadeInUp} className="border-l-2 border-[oklch(0.769_0.188_70.08/0.4)] flex mt-6 pl-6 flex-col gap-8">
                {[
                  { icon: Flag, title: "Foundation & Vision", desc: "Built on a passion to nurture strategic thinkers." },
                  { icon: Brain, title: "Coaching Philosophy", desc: "Personalized mentorship for every level of player." },
                  { icon: Globe, title: "National & International Reach", desc: "Preparing students for competitive tournaments worldwide." }
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4 group">
                    <div className="size-12 shrink-0 bg-[oklch(0.769_0.188_70.08/0.15)] rounded-full flex justify-center items-center group-hover:scale-110 transition-transform duration-300">
                      <item.icon className="size-5 text-[oklch(0.769_0.188_70.08)]" />
                    </div>
                    <div className="flex flex-col gap-1 mt-1">
                      <h4 className="font-semibold text-lg text-white">{item.title}</h4>
                      <p className="text-[#a1a1a1]">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Achievements Gallery Section */}
      <section id="gallery" className="relative py-32 w-full bg-neutral-950 overflow-hidden border-y border-white/5">
        <motion.div style={{ y: subtleParallax }} className="bg-[radial-gradient(circle_at_80%_50%,oklch(0.769_0.188_70.08/0.05),transparent_50%)] absolute inset-0 pointer-events-none h-[120%]" />
        
        <div className="relative max-w-[1140px] mx-auto px-8 z-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp} className="text-center flex mb-16 flex-col items-center gap-4">
            <span className="text-[oklch(0.769_0.188_70.08)] uppercase text-xs tracking-[4.8px] font-semibold">Success Stories</span>
            <h2 className="font-serif font-medium text-5xl leading-tight">Achievements</h2>
            <div className="bg-gradient-to-r from-transparent via-[oklch(0.769_0.188_70.08)] to-transparent rounded-full w-24 h-0.5" />
            <p className="max-w-xl text-[#a1a1a1] text-lg">Glimpses of our champions making their mark on the board.</p>
          </motion.div>

          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[240px]">
            {galleryImages.map((img, index) => {
              const isLarge = index === 0;
              const isTall = index === 3 || index === 7;
              const spanClass = isLarge ? "md:col-span-2 md:row-span-2" : isTall ? "md:row-span-2" : "";
              
              return (
                <motion.a
                  variants={fadeInUp}
                  key={index}
                  href={`/assets/gallery/${img}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group relative block overflow-hidden rounded-2xl bg-neutral-900 border border-white/10 ${spanClass}`}
                >
                  <img
                    src={`/assets/gallery/${img}`}
                    alt={`Achievement ${index + 1}`}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                    style={{ backgroundColor: '#1a1a1a' }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6">
                    <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                      <div className="inline-flex items-center gap-2 bg-[oklch(0.769_0.188_70.08)] text-black px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
                        <Trophy className="size-3" /> Winner
                      </div>
                      <p className="text-white font-medium">Tournament Highlight {index + 1}</p>
                    </div>
                  </div>
                </motion.a>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Tournaments Section */}
      <section id="tournaments" className="relative py-32 w-full overflow-hidden">
        <div className="max-w-[1140px] mx-auto px-8 relative z-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="text-center flex mb-16 flex-col items-center gap-4">
            <span className="text-[oklch(0.769_0.188_70.08)] uppercase text-xs tracking-[4.8px] font-semibold">Compete</span>
            <h2 className="font-serif font-medium text-5xl leading-tight">Upcoming Tournaments</h2>
            <div className="bg-gradient-to-r from-transparent via-[oklch(0.769_0.188_70.08)] to-transparent rounded-full w-24 h-0.5" />
            <p className="max-w-xl text-[#a1a1a1] text-lg">Test your skills and compete against players of all levels. Join the battle!</p>
          </motion.div>

          {tourLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-10 h-10 border-2 border-[oklch(0.769_0.188_70.08)] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : tournaments.length === 0 ? (
            /* No tournaments — no timer, no notify */
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
              className="relative backdrop-blur-xl rounded-3xl bg-neutral-900/40 border border-white/10 overflow-hidden shadow-2xl">
              <div className="bg-[radial-gradient(circle_at_50%_40%,oklch(0.769_0.188_70.08/0.1),transparent_60%)] absolute inset-0 pointer-events-none" />
              <div className="relative text-center flex p-16 md:p-24 flex-col items-center gap-6">
                <div className="relative">
                  <div className="bg-[oklch(0.769_0.188_70.08/0.2)] blur-3xl rounded-full absolute inset-0 size-32 mx-auto" />
                  <div className="relative size-28 border border-[oklch(0.769_0.188_70.08/0.3)] rounded-full bg-neutral-950/80 backdrop-blur-md flex justify-center items-center">
                    <Trophy className="size-12 text-[oklch(0.769_0.188_70.08)]" />
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <h3 className="font-serif font-medium text-3xl">No Upcoming Tournaments</h3>
                  <p className="text-[#a1a1a1] text-lg max-w-md mx-auto">Check back later — the next battle is being prepared behind the scenes.</p>
                </div>
              </div>
            </motion.div>
          ) : tournaments.length === 1 ? (
            /* Single tournament — full card with countdown */
            <TournamentCard tournament={tournaments[0]} />
          ) : (
            /* Multiple tournaments — carousel */
            <div className="relative">
              <AnimatePresence mode="wait">
                <motion.div key={tourIndex} initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -60 }} transition={{ duration: 0.4 }}>
                  <TournamentCard tournament={tournaments[tourIndex]} />
                </motion.div>
              </AnimatePresence>
              {/* Carousel nav */}
              <button onClick={() => setTourIndex(p => (p - 1 + tournaments.length) % tournaments.length)}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-6 bg-neutral-950/80 border border-white/20 text-white hover:bg-[oklch(0.769_0.188_70.08)] hover:text-black p-3 md:p-4 rounded-full shadow-xl transition-all duration-300 z-20">
                <ChevronLeft className="size-6" />
              </button>
              <button onClick={() => setTourIndex(p => (p + 1) % tournaments.length)}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-6 bg-neutral-950/80 border border-white/20 text-white hover:bg-[oklch(0.769_0.188_70.08)] hover:text-black p-3 md:p-4 rounded-full shadow-xl transition-all duration-300 z-20">
                <ChevronRight className="size-6" />
              </button>
              <div className="flex justify-center mt-6 gap-2">
                {tournaments.map((_, i) => (
                  <button key={i} onClick={() => setTourIndex(i)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      i === tourIndex ? 'bg-[oklch(0.769_0.188_70.08)] w-8' : 'bg-white/20 w-2 hover:bg-white/40'
                    }`} />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Reviews Section (Testimonials Carousel) */}
      <section id="reviews" className="relative py-32 w-full bg-neutral-950 overflow-hidden">
        <motion.div style={{ y: subtleParallax }} className="bg-[radial-gradient(ellipse_at_center,oklch(0.205_0_0),oklch(0.145_0_0))] absolute inset-0 pointer-events-none h-[120%]" />
        
        <div className="relative max-w-[1140px] mx-auto px-8 z-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="text-center flex mb-16 flex-col items-center gap-4">
            <span className="text-[oklch(0.769_0.188_70.08)] uppercase text-xs tracking-[4.8px] font-semibold">Testimonials</span>
            <h2 className="font-serif font-medium text-5xl leading-tight">What Our Students Say</h2>
            <div className="bg-gradient-to-r from-transparent via-[oklch(0.769_0.188_70.08)] to-transparent rounded-full w-24 h-0.5" />
          </motion.div>

          <div className="max-w-4xl mx-auto relative">
            <div className="bg-neutral-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 md:p-16 shadow-2xl relative overflow-hidden min-h-[300px] md:min-h-[350px] flex flex-col justify-center">
              
              <Quote className="absolute top-8 left-8 size-24 text-white/5 -rotate-12" />

              <div className="flex justify-center mb-8 gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="size-5 fill-[oklch(0.769_0.188_70.08)] text-[oklch(0.769_0.188_70.08)] drop-shadow-[0_0_8px_rgba(255,215,0,0.5)]" />
                ))}
              </div>

              <div className="relative h-[200px] sm:h-[150px] md:h-[120px] flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={reviewIndex}
                    initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -20, filter: "blur(4px)" }}
                    transition={{ duration: 0.5 }}
                    className="text-lg md:text-2xl text-white text-center leading-relaxed font-serif italic absolute w-full"
                  >
                    "{displayReviews[reviewIndex]?.comment}"
                  </motion.p>
                </AnimatePresence>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={`name-${reviewIndex}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="text-center mt-10"
                >
                  <h3 className="text-lg font-bold text-[oklch(0.769_0.188_70.08)] tracking-wide uppercase">
                    {displayReviews[reviewIndex]?.name}
                  </h3>
                  <span className="text-[#a1a1a1] text-xs uppercase tracking-[2px] mt-1 block">{(displayReviews[reviewIndex] as any)?.role || 'BCA Student / Parent'}</span>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navigation Buttons */}
            <button onClick={prevReview} className="absolute left-2 md:left-0 top-1/2 -translate-y-1/2 md:-translate-x-6 bg-neutral-950/80 border border-white/20 text-white hover:bg-[oklch(0.769_0.188_70.08)] hover:text-black hover:border-[oklch(0.769_0.188_70.08)] p-3 md:p-4 rounded-full shadow-xl transition-all duration-300 z-20" aria-label="Previous Review">
              <ChevronLeft className="size-6" />
            </button>
            <button onClick={nextReview} className="absolute right-2 md:right-0 top-1/2 -translate-y-1/2 md:translate-x-6 bg-neutral-950/80 border border-white/20 text-white hover:bg-[oklch(0.769_0.188_70.08)] hover:text-black hover:border-[oklch(0.769_0.188_70.08)] p-3 md:p-4 rounded-full shadow-xl transition-all duration-300 z-20" aria-label="Next Review">
              <ChevronRight className="size-6" />
            </button>

            {/* Dots */}
            <div className="flex justify-center mt-10 gap-3">
              {displayReviews.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setReviewIndex(i)}
                  className={`h-2 rounded-full transition-all duration-500 ${
                    i === reviewIndex ? 'bg-[oklch(0.769_0.188_70.08)] w-10 shadow-[0_0_10px_oklch(0.769_0.188_70.08)]' : 'bg-white/20 w-2 hover:bg-white/40'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="relative py-32 w-full bg-neutral-950 border-t border-white/5">
        <div className="bg-[radial-gradient(circle_at_50%_0%,oklch(0.769_0.188_70.08/0.03),transparent_70%)] absolute inset-0 pointer-events-none" />
        
        <div className="relative max-w-[1140px] mx-auto px-8 z-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp} className="text-center flex mb-16 flex-col items-center gap-4">
            <div className="inline-flex border-[oklch(0.769_0.188_70.08/0.4)] bg-[oklch(0.769_0.188_70.08/0.08)] rounded-full border px-4 py-1.5 items-center gap-2 w-fit">
              <Sparkles className="size-3.5 text-[oklch(0.769_0.188_70.08)]" />
              <span className="text-[oklch(0.769_0.188_70.08)] uppercase text-xs tracking-[4px]">Get In Touch</span>
            </div>
            <h2 className="font-serif font-medium text-5xl leading-tight">Contact Us</h2>
            <div className="bg-gradient-to-r from-transparent via-[oklch(0.769_0.188_70.08)] to-transparent rounded-full w-24 h-0.5" />
            <p className="max-w-xl text-[#a1a1a1] text-lg">We would love to hear from you. Reach out to us and let us help you begin your chess journey.</p>
          </motion.div>

          <div className="grid lg:grid-cols-5 gap-8 items-stretch">
            {/* Contact Info (Left) */}
            <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }} className="lg:col-span-2 flex flex-col gap-4">
              {[
                { icon: MapPin, title: "Our Location", text: "B-73, near J.P English School, Ramana Maruti Nagar, Nandanvan, Nagpur, Maharashtra 440024", color: "text-[oklch(0.769_0.188_70.08)]" },
                { icon: Phone, title: "Phone Number", text: "+91 90284 56007", color: "text-[oklch(0.696_0.17_162.48)]" },
                { icon: Mail, title: "Email Address", text: "brilliantchessacademy007@gmail.com", color: "text-blue-400" }
              ].map((item, idx) => (
                <motion.div key={idx} variants={fadeInUp} className="group bg-neutral-900/50 border border-white/10 rounded-2xl p-6 flex gap-5 items-start hover:bg-neutral-800/80 hover:border-white/20 transition-all duration-300">
                  <div className="bg-neutral-950 border border-white/10 p-3 rounded-xl group-hover:border-[oklch(0.769_0.188_70.08/0.5)] transition-colors">
                    <item.icon className={`size-6 ${item.color}`} />
                  </div>
                  <div className="flex flex-col gap-1 w-full">
                    <h4 className="text-white font-medium text-lg">{item.title}</h4>
                    <p className="text-[#a1a1a1] text-sm leading-relaxed whitespace-pre-line hover:text-white transition-colors">{item.text}</p>
                  </div>
                </motion.div>
              ))}

              <motion.div variants={fadeInUp} className="mt-4">
                <span className="text-[oklch(0.769_0.188_70.08)] uppercase text-xs tracking-[4px] font-semibold mb-4 block">Follow Us</span>
                <div className="flex gap-3">
                  {[Facebook, Twitter, Instagram, Linkedin].map((Icon, idx) => (
                    <a key={idx} href="#" className="bg-neutral-900/80 border border-white/10 p-3 rounded-xl hover:bg-[oklch(0.769_0.188_70.08)] hover:text-neutral-950 transition-all duration-300">
                      <Icon className="size-5" />
                    </a>
                  ))}
                </div>
              </motion.div>
 
            </motion.div>

            {/* Form (Right) */}
            <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }} className="lg:col-span-3">
              <div className="bg-neutral-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 lg:p-10 relative overflow-hidden h-full flex flex-col shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[oklch(0.769_0.188_70.08/0.05)] rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                
                <div className="flex items-center gap-4 mb-8">
                  <div className="bg-gradient-to-br from-[oklch(0.769_0.188_70.08/0.2)] to-transparent p-3 rounded-xl border border-[oklch(0.769_0.188_70.08/0.3)]">
                    <Send className="size-6 text-[oklch(0.769_0.188_70.08)]" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-serif text-white mb-1">Send Us a Message</h3>
                    <p className="text-[#a1a1a1] text-sm">We typically respond within 24 hours</p>
                  </div>
                </div>

                <form className="flex flex-col gap-6 flex-grow" onSubmit={handleContactSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-semibold uppercase tracking-wider text-[#a1a1a1]">Full Name</label>
                      <input type="text" placeholder="Your full name" value={contactForm.name} onChange={e => setContactForm(p => ({...p, name: e.target.value}))} className="bg-neutral-950/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-neutral-600 focus:outline-none focus:border-[oklch(0.769_0.188_70.08)] focus:ring-1 focus:ring-[oklch(0.769_0.188_70.08)] transition-all" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-semibold uppercase tracking-wider text-[#a1a1a1]">Email Address</label>
                      <input type="email" placeholder="your@email.com" value={contactForm.email} onChange={e => setContactForm(p => ({...p, email: e.target.value}))} className="bg-neutral-950/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-neutral-600 focus:outline-none focus:border-[oklch(0.769_0.188_70.08)] focus:ring-1 focus:ring-[oklch(0.769_0.188_70.08)] transition-all" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-semibold uppercase tracking-wider text-[#a1a1a1]">Phone Number</label>
                      <input type="tel" placeholder="+91 00000 00000" value={contactForm.phone} onChange={e => setContactForm(p => ({...p, phone: e.target.value}))} className="bg-neutral-950/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-neutral-600 focus:outline-none focus:border-[oklch(0.769_0.188_70.08)] focus:ring-1 focus:ring-[oklch(0.769_0.188_70.08)] transition-all" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-semibold uppercase tracking-wider text-[#a1a1a1]">Select Program</label>
                      <select value={contactForm.program} onChange={e => setContactForm(p => ({...p, program: e.target.value}))} className="bg-neutral-950/50 border border-white/10 rounded-xl px-4 py-3 text-white appearance-none focus:outline-none focus:border-[oklch(0.769_0.188_70.08)] focus:ring-1 focus:ring-[oklch(0.769_0.188_70.08)] transition-all">
                        <option value="">Choose a program</option>
                        <option value="beginner">Beginner Training</option>
                        <option value="intermediate">Intermediate Training</option>
                        <option value="advanced">Advanced Training</option>
                        <option value="online">Online Training</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 flex-grow">
                    <label className="text-xs font-semibold uppercase tracking-wider text-[#a1a1a1]">Message</label>
                    <textarea placeholder="Tell us about your chess experience and goals..." value={contactForm.message} onChange={e => setContactForm(p => ({...p, message: e.target.value}))} className="bg-neutral-950/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-neutral-600 focus:outline-none focus:border-[oklch(0.769_0.188_70.08)] focus:ring-1 focus:ring-[oklch(0.769_0.188_70.08)] transition-all resize-none min-h-[120px] flex-grow" />
                  </div>

                  {contactError && (
                    <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl">
                      <AlertCircle className="size-4 shrink-0" /> {contactError}
                    </div>
                  )}

                  {contactStatus === 'success' ? (
                    <div className="flex items-center gap-3 bg-green-500/10 border border-green-500/30 text-green-400 px-5 py-4 rounded-xl">
                      <CheckCircle className="size-5 shrink-0" />
                      <div>
                        <p className="font-semibold">Message sent!</p>
                        <p className="text-sm opacity-80">We'll get back to you within 24 hours.</p>
                      </div>
                    </div>
                  ) : (
                    <Button type="submit" disabled={contactStatus === 'sending'} className="w-full h-14 text-base font-bold mt-auto group tracking-wide disabled:opacity-60">
                      {contactStatus === 'sending' ? (
                        <><div className="size-5 border-2 border-current/30 border-t-current rounded-full animate-spin" /> Sending...</>
                      ) : (
                        <><Send className="size-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /> Send Message</>
                      )}
                    </Button>
                  )}
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-950 border-t border-white/10 pt-20 pb-8 relative overflow-hidden z-20">
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-[oklch(0.769_0.188_70.08/0.03)] to-transparent pointer-events-none" />
        
        <div className="max-w-[1140px] mx-auto px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-8 mb-16 border-b border-white/10 pb-16">
            
            <div className="md:col-span-5 flex flex-col gap-6">
              <div className="flex items-center gap-3">
                <div className="size-12 shrink-0 relative flex justify-center items-center">
                  <NextImage src={logo} alt="Brilliant Chess Academy Logo" width={48} height={48} className="object-contain" />
                </div>
                <div className="leading-tight flex flex-col">
                  <span className="font-semibold text-neutral-50 text-xl tracking-[4px]">BRILLIANT</span>
                  <span className="text-[oklch(0.769_0.188_70.08)] text-xs tracking-[5.6px]">CHESS ACADEMY</span>
                </div>
              </div>
              <p className="text-[#a1a1a1] max-w-sm leading-relaxed">
                Where strategic brilliance begins.
              </p>
            </div>

            <div className="md:col-span-3">
              <h4 className="text-[oklch(0.769_0.188_70.08)] uppercase text-xs tracking-[4px] font-semibold mb-6">Navigation</h4>
              <ul className="flex flex-col gap-4">
                {["Home", "Programs", "About us", "Gallery", "Contact"].map((item) => (
                  <li key={item}>
                    <a href={`#${item.toLowerCase().replace(' ', '-')}`} className="text-[#a1a1a1] hover:text-white transition-colors flex items-center gap-2 group w-fit">
                      <span className="h-px w-0 bg-[oklch(0.769_0.188_70.08)] group-hover:w-4 transition-all duration-300" />
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="md:col-span-4 flex flex-col items-start md:items-end text-left md:text-right">
              <div className="flex gap-3 mb-8">
                {[Facebook, Twitter, Instagram].map((Icon, idx) => (
                  <a key={idx} href="#" className="bg-neutral-900 border border-white/10 p-3 rounded-lg hover:bg-white/10 hover:border-white/30 transition-all duration-300 group">
                    <Icon className="size-5 text-white group-hover:text-[oklch(0.769_0.188_70.08)] transition-colors" />
                  </a>
                ))}
              </div>
              <div className="flex flex-col items-start md:items-end gap-2">
                <p className="text-[#a1a1a1] text-sm md:text-right">© 2024 Brilliant Chess Academy<br/>All rights reserved.</p>
 
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-[#a1a1a1] text-xs">
            <div className="flex items-center gap-2">
              <Crown className="size-3 text-[oklch(0.769_0.188_70.08)]" />
              <span>Brilliant Chess Academy — Nurturing Strategic Brilliance Since 2014</span>
            </div>
            <div className="flex gap-6">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Sitemap</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}