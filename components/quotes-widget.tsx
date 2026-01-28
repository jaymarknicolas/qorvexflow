"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  RefreshCw,
  Quote,
  Heart,
  Copy,
  Check,
  Share2,
  Sparkles,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";
import { useTheme } from "@/lib/contexts/theme-context";

interface QuoteData {
  _id: string;
  content: string;
  author: string;
  tags: string[];
  authorSlug: string;
  length: number;
}

// Fallback quotes for offline/error states
const FALLBACK_QUOTES: QuoteData[] = [
  {
    _id: "fallback-1",
    content: "The only way to do great work is to love what you do.",
    author: "Steve Jobs",
    tags: ["Motivation", "Work"],
    authorSlug: "steve-jobs",
    length: 52,
  },
  {
    _id: "fallback-2",
    content: "Believe you can and you're halfway there.",
    author: "Theodore Roosevelt",
    tags: ["Belief", "Motivation"],
    authorSlug: "theodore-roosevelt",
    length: 42,
  },
  {
    _id: "fallback-3",
    content: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    author: "Winston Churchill",
    tags: ["Perseverance", "Success"],
    authorSlug: "winston-churchill",
    length: 85,
  },
  {
    _id: "fallback-4",
    content: "The future belongs to those who believe in the beauty of their dreams.",
    author: "Eleanor Roosevelt",
    tags: ["Dreams", "Future"],
    authorSlug: "eleanor-roosevelt",
    length: 70,
  },
  {
    _id: "fallback-5",
    content: "It does not matter how slowly you go as long as you do not stop.",
    author: "Confucius",
    tags: ["Persistence", "Progress"],
    authorSlug: "confucius",
    length: 64,
  },
];

const QUOTE_CATEGORIES = [
  { id: "all", label: "All", icon: Sparkles },
  { id: "inspirational", label: "Inspire", icon: Sparkles },
  { id: "wisdom", label: "Wisdom", icon: Sparkles },
  { id: "love", label: "Love", icon: Heart },
  { id: "life", label: "Life", icon: Sparkles },
  { id: "happiness", label: "Happy", icon: Sparkles },
];

// Persist state across re-mounts
let persistedState: {
  quote: QuoteData | null;
  favorites: string[];
  category: string;
  quoteHistory: QuoteData[];
  historyIndex: number;
} | null = null;

export default function QuotesWidget() {
  const { theme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isCompact, setIsCompact] = useState(false);
  const [isVeryCompact, setIsVeryCompact] = useState(false);

  // Detect compact mode based on container size
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { height, width } = entry.contentRect;
        setIsVeryCompact(height < 280 || width < 280);
        setIsCompact(height < 360 || width < 320);
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // State
  const [currentQuote, setCurrentQuote] = useState<QuoteData | null>(
    () => persistedState?.quote ?? null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>(
    () => persistedState?.favorites ?? []
  );
  const [copied, setCopied] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(
    () => persistedState?.category ?? "all"
  );
  const [showCategories, setShowCategories] = useState(false);
  const [quoteHistory, setQuoteHistory] = useState<QuoteData[]>(
    () => persistedState?.quoteHistory ?? []
  );
  const [historyIndex, setHistoryIndex] = useState(
    () => persistedState?.historyIndex ?? -1
  );

  // Theme colors - consistent with other widgets
  const getThemeColors = useCallback(() => {
    switch (theme) {
      case "ghibli":
        return {
          gradient: "from-green-900/95 via-emerald-900/90 to-teal-900/95",
          glowFrom: "from-green-500/30",
          glowTo: "to-amber-500/20",
          accent: "text-emerald-400",
          accentBg: "bg-emerald-500/20",
          button: "from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400",
          buttonShadow: "shadow-emerald-500/30",
          border: "border-emerald-400/30",
          tagBg: "bg-emerald-500/20 text-emerald-300",
          skeleton: "bg-emerald-500/20",
          iconColor: "text-emerald-400",
          hoverBg: "hover:bg-emerald-500/20",
        };
      case "coffeeshop":
        return {
          gradient: "from-stone-900/95 via-amber-950/90 to-orange-950/95",
          glowFrom: "from-amber-500/20",
          glowTo: "to-orange-500/20",
          accent: "text-amber-400",
          accentBg: "bg-amber-500/20",
          button: "from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400",
          buttonShadow: "shadow-amber-500/30",
          border: "border-amber-500/20",
          tagBg: "bg-amber-500/20 text-amber-300",
          skeleton: "bg-amber-500/20",
          iconColor: "text-amber-400",
          hoverBg: "hover:bg-amber-500/20",
        };
      default: // lofi
        return {
          gradient: "from-indigo-900/95 via-purple-900/90 to-violet-900/95",
          glowFrom: "from-violet-500/20",
          glowTo: "to-pink-500/20",
          accent: "text-violet-400",
          accentBg: "bg-violet-500/20",
          button: "from-violet-500 to-purple-500 hover:from-violet-400 hover:to-purple-400",
          buttonShadow: "shadow-violet-500/30",
          border: "border-violet-500/20",
          tagBg: "bg-violet-500/20 text-violet-300",
          skeleton: "bg-violet-500/20",
          iconColor: "text-violet-400",
          hoverBg: "hover:bg-violet-500/20",
        };
    }
  }, [theme]);

  const colors = getThemeColors();

  // Persist state
  useEffect(() => {
    persistedState = {
      quote: currentQuote,
      favorites,
      category: selectedCategory,
      quoteHistory,
      historyIndex,
    };
  }, [currentQuote, favorites, selectedCategory, quoteHistory, historyIndex]);

  // Load favorites from localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem("qorvexflow_quote_favorites_v2");
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  // Fetch quote from API
  const fetchQuote = useCallback(async (category?: string) => {
    setIsLoading(true);
    setError(null);
    setIsAnimating(true);

    try {
      const tag = category && category !== "all" ? `&tags=${category}` : "";
      const response = await fetch(
        `https://api.quotable.io/random?maxLength=150${tag}`,
        { cache: "no-store" }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch quote");
      }

      const data: QuoteData = await response.json();

      setTimeout(() => {
        setCurrentQuote(data);
        setQuoteHistory((prev) => {
          const newHistory = [...prev.slice(0, historyIndex + 1), data];
          return newHistory.slice(-20); // Keep last 20 quotes
        });
        setHistoryIndex((prev) => Math.min(prev + 1, 19));
        setIsAnimating(false);
        setIsLoading(false);
      }, 300);
    } catch (err) {
      // Use fallback quotes on error
      const fallback = FALLBACK_QUOTES[Math.floor(Math.random() * FALLBACK_QUOTES.length)];
      setTimeout(() => {
        setCurrentQuote(fallback);
        setError("Using offline quotes");
        setIsAnimating(false);
        setIsLoading(false);
      }, 300);
    }
  }, [historyIndex]);

  // Initial load
  useEffect(() => {
    if (!currentQuote && !isLoading) {
      // Check if we should load a daily quote
      const today = new Date().toDateString();
      const savedDate = localStorage.getItem("qorvexflow_quote_date_v2");
      const savedQuote = localStorage.getItem("qorvexflow_daily_quote_v2");

      if (savedDate === today && savedQuote) {
        try {
          const parsed = JSON.parse(savedQuote);
          setCurrentQuote(parsed);
          setQuoteHistory([parsed]);
          setHistoryIndex(0);
        } catch {
          fetchQuote(selectedCategory);
        }
      } else {
        fetchQuote(selectedCategory);
      }
    }
  }, []);

  // Save daily quote
  useEffect(() => {
    if (currentQuote && !currentQuote._id.startsWith("fallback")) {
      localStorage.setItem("qorvexflow_quote_date_v2", new Date().toDateString());
      localStorage.setItem("qorvexflow_daily_quote_v2", JSON.stringify(currentQuote));
    }
  }, [currentQuote]);

  // Navigation through history
  const goBack = () => {
    if (historyIndex > 0) {
      setIsAnimating(true);
      setTimeout(() => {
        setHistoryIndex((prev) => prev - 1);
        setCurrentQuote(quoteHistory[historyIndex - 1]);
        setIsAnimating(false);
      }, 200);
    }
  };

  const goForward = () => {
    if (historyIndex < quoteHistory.length - 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setHistoryIndex((prev) => prev + 1);
        setCurrentQuote(quoteHistory[historyIndex + 1]);
        setIsAnimating(false);
      }, 200);
    }
  };

  // Actions
  const handleNewQuote = () => {
    fetchQuote(selectedCategory);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setShowCategories(false);
    fetchQuote(category);
  };

  const handleToggleFavorite = () => {
    if (!currentQuote) return;

    const newFavorites = favorites.includes(currentQuote._id)
      ? favorites.filter((id) => id !== currentQuote._id)
      : [...favorites, currentQuote._id];

    setFavorites(newFavorites);
    localStorage.setItem("qorvexflow_quote_favorites_v2", JSON.stringify(newFavorites));
  };

  const handleCopy = async () => {
    if (!currentQuote) return;

    const text = `"${currentQuote.content}" — ${currentQuote.author}`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (!currentQuote) return;

    const text = `"${currentQuote.content}" — ${currentQuote.author}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Inspirational Quote",
          text: text,
        });
      } catch {
        // User cancelled or share failed, fall back to copy
        handleCopy();
      }
    } else {
      handleCopy();
    }
  };

  const isFavorite = currentQuote ? favorites.includes(currentQuote._id) : false;

  // Dynamic font size based on quote length
  const getQuoteFontSize = () => {
    if (!currentQuote) return "text-lg sm:text-xl md:text-2xl";
    const length = currentQuote.content.length;
    if (length < 50) return "text-xl sm:text-2xl md:text-3xl";
    if (length < 100) return "text-lg sm:text-xl md:text-2xl";
    return "text-base sm:text-lg md:text-xl";
  };

  return (
    <div className={`h-full flex flex-col bg-gradient-to-br ${colors.gradient} backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden`}>
      {/* Header */}
      <div className="flex-shrink-0 border-b border-white/10 bg-black/20 px-3 py-2.5 sm:px-4 sm:py-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className={`p-1.5 sm:p-2 rounded-lg ${colors.accentBg}`}>
              <Quote className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${colors.accent}`} />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-white truncate">Daily Quote</h2>
              <p className="text-[10px] sm:text-xs text-white/50 truncate">
                {error || "Powered by Quotable"}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
            {/* Category filter */}
            <div className="relative">
              <button
                onClick={() => setShowCategories(!showCategories)}
                className={`p-1.5 sm:p-2 rounded-lg transition-all duration-200 ${
                  showCategories
                    ? `${colors.accentBg} ${colors.accent}`
                    : "bg-white/10 text-white/60 hover:bg-white/20 hover:text-white"
                }`}
                aria-label="Filter by category"
              >
                <Filter className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>

              {showCategories && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowCategories(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 z-50 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-xl p-2 min-w-[140px]">
                    {QUOTE_CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => handleCategoryChange(cat.id)}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                          selectedCategory === cat.id
                            ? `${colors.accentBg} ${colors.accent}`
                            : "text-white/70 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        <cat.icon className="w-3.5 h-3.5" />
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            <button
              onClick={handleToggleFavorite}
              disabled={!currentQuote}
              className={`p-1.5 sm:p-2 rounded-lg transition-all duration-200 ${
                isFavorite
                  ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                  : "bg-white/10 text-white/60 hover:bg-white/20 hover:text-white"
              } disabled:opacity-50`}
              aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isFavorite ? "fill-current" : ""}`} />
            </button>

            <button
              onClick={handleCopy}
              disabled={!currentQuote}
              className="p-1.5 sm:p-2 bg-white/10 hover:bg-white/20 text-white/60 hover:text-white rounded-lg transition-all duration-200 disabled:opacity-50"
              aria-label="Copy quote"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-400" />
              ) : (
                <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              )}
            </button>

            <button
              onClick={handleShare}
              disabled={!currentQuote}
              className="p-1.5 sm:p-2 bg-white/10 hover:bg-white/20 text-white/60 hover:text-white rounded-lg transition-all duration-200 disabled:opacity-50 hidden sm:flex"
              aria-label="Share quote"
            >
              <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Quote Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden min-h-0">
        {/* Decorative background */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <Quote className="absolute top-2 left-2 sm:top-4 sm:left-4 w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 text-white transform rotate-12" />
          <Quote className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 text-white transform -rotate-12" />
        </div>

        {/* Loading skeleton */}
        {isLoading && !currentQuote && (
          <div className="relative z-10 w-full max-w-md space-y-4 animate-pulse">
            <div className={`h-6 ${colors.skeleton} rounded-lg w-3/4 mx-auto`} />
            <div className={`h-6 ${colors.skeleton} rounded-lg w-full`} />
            <div className={`h-6 ${colors.skeleton} rounded-lg w-2/3 mx-auto`} />
            <div className={`h-4 ${colors.skeleton} rounded-lg w-1/3 mx-auto mt-6`} />
          </div>
        )}

        {/* Error state */}
        {error && !currentQuote && (
          <div className="relative z-10 text-center">
            <AlertCircle className="w-12 h-12 text-red-400/50 mx-auto mb-4" />
            <p className="text-white/60 mb-4">{error}</p>
            <button
              onClick={handleNewQuote}
              className={`px-4 py-2 bg-gradient-to-r ${colors.button} text-white rounded-lg text-sm font-medium`}
            >
              Try Again
            </button>
          </div>
        )}

        {/* Quote */}
        {currentQuote && (
          <div
            className={`relative z-10 text-center w-full max-w-lg transition-all duration-300 ${
              isAnimating ? "opacity-0 scale-95 translate-y-2" : "opacity-100 scale-100 translate-y-0"
            }`}
          >
            <Quote className={`w-6 h-6 sm:w-8 sm:h-8 ${colors.accent} mx-auto mb-3 sm:mb-4`} />

            <blockquote className={`${getQuoteFontSize()} font-medium text-white leading-relaxed mb-4 sm:mb-6 px-2`}>
              "{currentQuote.content}"
            </blockquote>

            <div className="flex flex-col items-center gap-2">
              <cite className={`text-sm sm:text-base ${colors.accent} not-italic font-semibold`}>
                — {currentQuote.author}
              </cite>

              {currentQuote.tags && currentQuote.tags.length > 0 && (
                <div className="flex flex-wrap justify-center gap-1.5 mt-1">
                  {currentQuote.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className={`text-[10px] sm:text-xs px-2 py-0.5 sm:py-1 rounded-full ${colors.tagBg}`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 border-t border-white/10 bg-black/20 p-3 sm:p-4">
        {/* Navigation and New Quote */}
        <div className="flex items-center gap-2">
          {/* History navigation */}
          <button
            onClick={goBack}
            disabled={historyIndex <= 0 || isLoading}
            className="p-2 sm:p-2.5 bg-white/10 hover:bg-white/20 text-white/60 hover:text-white rounded-lg transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Previous quote"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* New Quote button */}
          <button
            onClick={handleNewQuote}
            disabled={isLoading}
            className={`flex-1 px-3 py-2.5 sm:px-4 sm:py-3 bg-gradient-to-r ${colors.button} text-white rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-lg ${colors.buttonShadow} disabled:opacity-50 text-sm sm:text-base`}
          >
            <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isLoading ? "animate-spin" : ""}`} />
            <span className="hidden xs:inline">New Quote</span>
            <span className="xs:hidden">New</span>
          </button>

          <button
            onClick={goForward}
            disabled={historyIndex >= quoteHistory.length - 1 || isLoading}
            className="p-2 sm:p-2.5 bg-white/10 hover:bg-white/20 text-white/60 hover:text-white rounded-lg transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Next quote"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* History indicator */}
        {quoteHistory.length > 1 && (
          <div className="flex items-center justify-center gap-1 mt-2">
            {quoteHistory.slice(-7).map((_, idx) => {
              const actualIdx = Math.max(0, quoteHistory.length - 7) + idx;
              return (
                <div
                  key={idx}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    actualIdx === historyIndex
                      ? `${colors.accent} w-3`
                      : "bg-white/20"
                  }`}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
