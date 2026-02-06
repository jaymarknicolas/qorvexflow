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
import { useAppSettings } from "@/lib/contexts/app-settings-context";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
    content:
      "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    author: "Winston Churchill",
    tags: ["Perseverance", "Success"],
    authorSlug: "winston-churchill",
    length: 85,
  },
  {
    _id: "fallback-4",
    content:
      "The future belongs to those who believe in the beauty of their dreams.",
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
  const { effectiveColorScheme } = useAppSettings();
  const isLightMode = effectiveColorScheme === "light";
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
    () => persistedState?.quote ?? null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>(
    () => persistedState?.favorites ?? [],
  );
  const [copied, setCopied] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(
    () => persistedState?.category ?? "all",
  );
  const [showCategories, setShowCategories] = useState(false);
  const [quoteHistory, setQuoteHistory] = useState<QuoteData[]>(
    () => persistedState?.quoteHistory ?? [],
  );
  const [historyIndex, setHistoryIndex] = useState(
    () => persistedState?.historyIndex ?? -1,
  );

  // Theme colors - light mode aware
  const getThemeColors = useCallback(() => {
    switch (theme) {
      case "ghibli":
        return {
          gradient: isLightMode
            ? "from-green-50/90 to-emerald-50/90"
            : "from-emerald-900/90 to-teal-900/90",
          accent: isLightMode ? "text-green-700" : "text-emerald-400",
          accentBg: isLightMode ? "bg-green-200/50" : "bg-emerald-500/20",
          button:
            "from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500",
          buttonShadow: "shadow-emerald-500/20",
          border: isLightMode ? "border-green-300/50" : "border-emerald-500/20",
          tagBg: isLightMode ? "bg-green-200/50 text-green-700" : "bg-emerald-500/20 text-emerald-300",
          skeleton: isLightMode ? "bg-green-200/50" : "bg-emerald-500/20",
          textPrimary: isLightMode ? "text-green-900" : "text-white",
          textSecondary: isLightMode ? "text-green-800" : "text-white/80",
          textMuted: isLightMode ? "text-green-700/70" : "text-white/50",
          bgOverlay: isLightMode ? "bg-green-100/50" : "bg-black/20",
          hoverBg: isLightMode ? "bg-green-200/50 hover:bg-green-300/50" : "bg-white/10 hover:bg-white/20",
        };
      case "coffeeshop":
        return {
          gradient: isLightMode
            ? "from-amber-50/90 to-orange-50/90"
            : "from-amber-900/90 to-stone-900/90",
          accent: isLightMode ? "text-amber-800" : "text-amber-400",
          accentBg: isLightMode ? "bg-amber-200/50" : "bg-amber-500/20",
          button:
            "from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500",
          buttonShadow: "shadow-amber-500/20",
          border: isLightMode ? "border-amber-300/50" : "border-amber-500/20",
          tagBg: isLightMode ? "bg-amber-200/50 text-amber-800" : "bg-amber-500/20 text-amber-300",
          skeleton: isLightMode ? "bg-amber-200/50" : "bg-amber-500/20",
          textPrimary: isLightMode ? "text-amber-950" : "text-white",
          textSecondary: isLightMode ? "text-amber-900" : "text-white/80",
          textMuted: isLightMode ? "text-amber-800/70" : "text-white/50",
          bgOverlay: isLightMode ? "bg-amber-100/50" : "bg-black/20",
          hoverBg: isLightMode ? "bg-amber-200/50 hover:bg-amber-300/50" : "bg-white/10 hover:bg-white/20",
        };
      default: // lofi
        return {
          gradient: isLightMode
            ? "from-violet-50/90 to-purple-50/90"
            : "from-indigo-900/90 to-purple-900/90",
          accent: isLightMode ? "text-violet-700" : "text-indigo-400",
          accentBg: isLightMode ? "bg-violet-200/50" : "bg-indigo-500/20",
          button:
            "from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500",
          buttonShadow: "shadow-indigo-500/20",
          border: isLightMode ? "border-violet-300/50" : "border-indigo-500/20",
          tagBg: isLightMode ? "bg-violet-200/50 text-violet-700" : "bg-indigo-500/20 text-indigo-300",
          skeleton: isLightMode ? "bg-violet-200/50" : "bg-indigo-500/20",
          textPrimary: isLightMode ? "text-violet-950" : "text-white",
          textSecondary: isLightMode ? "text-violet-900" : "text-white/80",
          textMuted: isLightMode ? "text-violet-800/70" : "text-white/50",
          bgOverlay: isLightMode ? "bg-violet-100/50" : "bg-black/20",
          hoverBg: isLightMode ? "bg-violet-200/50 hover:bg-violet-300/50" : "bg-white/10 hover:bg-white/20",
        };
    }
  }, [theme, isLightMode]);

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
    const savedFavorites = localStorage.getItem(
      "qorvexflow_quote_favorites_v2",
    );
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  const fetchQuote = useCallback(
    async (category?: string) => {
      setIsLoading(true);
      setError(null);
      setIsAnimating(true);

      try {
        const response = await fetch(
          `/api/quotes?category=${category ?? selectedCategory}`,
          { cache: "no-store" },
        );

        if (!response.ok) {
          throw new Error("Failed to fetch quote");
        }

        const data: QuoteData = await response.json();

        console.log("fucking data", data);

        setTimeout(() => {
          setCurrentQuote(data);
          setQuoteHistory((prev) => {
            const newHistory = [...prev.slice(0, historyIndex + 1), data];
            return newHistory.slice(-20);
          });
          setHistoryIndex((prev) => Math.min(prev + 1, 19));
          setIsAnimating(false);
          setIsLoading(false);
        }, 300);
      } catch {
        const fallback =
          FALLBACK_QUOTES[Math.floor(Math.random() * FALLBACK_QUOTES.length)];

        setTimeout(() => {
          setCurrentQuote(fallback);
          setError("Using offline quotes");
          setIsAnimating(false);
          setIsLoading(false);
        }, 300);
      }
    },
    [historyIndex, selectedCategory],
  );

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
      localStorage.setItem(
        "qorvexflow_quote_date_v2",
        new Date().toDateString(),
      );
      localStorage.setItem(
        "qorvexflow_daily_quote_v2",
        JSON.stringify(currentQuote),
      );
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
    localStorage.setItem(
      "qorvexflow_quote_favorites_v2",
      JSON.stringify(newFavorites),
    );
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

  const isFavorite = currentQuote
    ? favorites.includes(currentQuote._id)
    : false;

  // Dynamic font size based on quote length and container size
  const getQuoteFontSize = () => {
    if (!currentQuote)
      return isVeryCompact ? "text-base" : isCompact ? "text-lg" : "text-xl";
    const length = currentQuote.content.length;

    if (isVeryCompact) {
      if (length < 50) return "text-sm";
      if (length < 100) return "text-xs";
      return "text-xs";
    }

    if (isCompact) {
      if (length < 50) return "text-lg";
      if (length < 100) return "text-base";
      return "text-sm";
    }

    if (length < 50) return "text-xl";
    if (length < 100) return "text-lg";
    return "text-base";
  };

  return (
    <div
      ref={containerRef}
      className={`h-full flex flex-col bg-gradient-to-br ${colors.gradient} backdrop-blur-xl rounded-2xl border ${colors.border} shadow-2xl overflow-hidden`}
    >
      {/* Header */}
      <div
        className={`flex-shrink-0 border-b ${colors.border} ${colors.bgOverlay} ${
          isVeryCompact ? "px-2 py-1.5" : isCompact ? "px-3 py-2" : "px-4 py-3"
        }`}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div
              className={`rounded-lg ${colors.accentBg} ${isVeryCompact ? "p-1" : "p-1.5"}`}
            >
              <Quote
                className={`${isVeryCompact ? "w-3 h-3" : "w-4 h-4"} ${colors.accent}`}
              />
            </div>
            <div className="min-w-0">
              <h2
                className={`font-bold ${colors.textPrimary} truncate ${
                  isVeryCompact
                    ? "text-xs"
                    : isCompact
                      ? "text-sm"
                      : "text-base"
                }`}
              >
                {isVeryCompact ? "Quote" : "Daily Quote"}
              </h2>
              {!isVeryCompact && (
                <p
                  className={`${colors.textMuted} truncate ${isCompact ? "text-[9px]" : "text-xs"}`}
                >
                  {error || "Powered by Quotable"}
                </p>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <TooltipProvider delayDuration={300}>
          <div
            className={`flex items-center flex-shrink-0 ${isVeryCompact ? "gap-0.5" : "gap-1"}`}
          >
            {/* Category filter */}
            <div className="relative">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setShowCategories(!showCategories)}
                    className={`rounded-lg transition-all duration-200 ${
                      isVeryCompact ? "p-1" : "p-1.5"
                    } ${
                      showCategories
                        ? `${colors.accentBg} ${colors.accent}`
                        : `${colors.hoverBg} ${colors.textMuted}`
                    }`}
                    aria-label="Filter by category"
                  >
                    <Filter className={isVeryCompact ? "w-3 h-3" : "w-3.5 h-3.5"} />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Filter by category</p>
                </TooltipContent>
              </Tooltip>

              {showCategories && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowCategories(false)}
                  />
                  <div className={`absolute right-0 top-full mt-2 z-50 ${isLightMode ? 'bg-white/95' : 'bg-slate-900/95'} backdrop-blur-xl border ${colors.border} rounded-xl shadow-xl p-2 min-w-[140px]`}>
                    {QUOTE_CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => handleCategoryChange(cat.id)}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                          selectedCategory === cat.id
                            ? `${colors.accentBg} ${colors.accent}`
                            : `${colors.textSecondary} ${colors.hoverBg}`
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

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleToggleFavorite}
                  disabled={!currentQuote}
                  className={`rounded-lg transition-all duration-200 ${
                    isVeryCompact ? "p-1" : "p-1.5"
                  } ${
                    isFavorite
                      ? "bg-red-500/20 text-red-500 hover:bg-red-500/30"
                      : `${colors.hoverBg} ${colors.textMuted}`
                  } disabled:opacity-50`}
                  aria-label={
                    isFavorite ? "Remove from favorites" : "Add to favorites"
                  }
                >
                  <Heart
                    className={`${isVeryCompact ? "w-3 h-3" : "w-3.5 h-3.5"} ${isFavorite ? "fill-current" : ""}`}
                  />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isFavorite ? "Remove from favorites" : "Add to favorites"}</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleCopy}
                  disabled={!currentQuote}
                  className={`${colors.hoverBg} ${colors.textMuted} rounded-lg transition-all duration-200 disabled:opacity-50 ${
                    isVeryCompact ? "p-1" : "p-1.5"
                  }`}
                  aria-label="Copy quote"
                >
                  {copied ? (
                    <Check
                      className={`${isVeryCompact ? "w-3 h-3" : "w-3.5 h-3.5"} text-green-500`}
                    />
                  ) : (
                    <Copy className={isVeryCompact ? "w-3 h-3" : "w-3.5 h-3.5"} />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{copied ? "Copied!" : "Copy quote"}</p>
              </TooltipContent>
            </Tooltip>

            {!isCompact && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={handleShare}
                    disabled={!currentQuote}
                    className={`p-1.5 ${colors.hoverBg} ${colors.textMuted} rounded-lg transition-all duration-200 disabled:opacity-50`}
                    aria-label="Share quote"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Share quote</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
          </TooltipProvider>
        </div>
      </div>

      {/* Quote Content */}
      <div
        className={`flex-1 flex flex-col items-center justify-center relative overflow-hidden min-h-0 ${
          isVeryCompact ? "p-2" : isCompact ? "p-3" : "p-4"
        }`}
      >
        {/* Decorative background */}
        {!isVeryCompact && (
          <div className="absolute inset-0 opacity-5 pointer-events-none">
            <Quote
              className={`absolute top-2 left-2 ${colors.textPrimary} transform rotate-12 ${
                isCompact ? "w-10 h-10" : "w-16 h-16"
              }`}
            />
            <Quote
              className={`absolute bottom-2 right-2 ${colors.textPrimary} transform -rotate-12 ${
                isCompact ? "w-10 h-10" : "w-16 h-16"
              }`}
            />
          </div>
        )}

        {/* Loading skeleton */}
        {isLoading && (
          <div
            className={`relative z-10 w-full max-w-md animate-pulse ${
              isVeryCompact ? "space-y-2" : "space-y-4"
            }`}
          >
            <div
              className={`${colors.skeleton} rounded-lg w-3/4 mx-auto ${isVeryCompact ? "h-4" : "h-6"}`}
            />
            <div
              className={`${colors.skeleton} rounded-lg w-full ${isVeryCompact ? "h-4" : "h-6"}`}
            />
            <div
              className={`${colors.skeleton} rounded-lg w-2/3 mx-auto ${isVeryCompact ? "h-4" : "h-6"}`}
            />
            <div
              className={`${colors.skeleton} rounded-lg w-1/3 mx-auto mt-6 ${isVeryCompact ? "h-3" : "h-4"}`}
            />
          </div>
        )}

        {/* Error state */}
        {error && !currentQuote && (
          <div className="relative z-10 text-center">
            <AlertCircle
              className={`text-red-400/50 mx-auto ${
                isVeryCompact ? "w-8 h-8 mb-2" : "w-12 h-12 mb-4"
              }`}
            />
            <p
              className={`${colors.textMuted} ${isVeryCompact ? "text-xs mb-2" : "mb-4"}`}
            >
              {error}
            </p>
            <button
              onClick={handleNewQuote}
              className={`bg-gradient-to-r ${colors.button} text-white rounded-lg font-medium ${
                isVeryCompact ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm"
              }`}
            >
              Try Again
            </button>
          </div>
        )}

        {/* Quote */}
        {!isLoading && currentQuote && (
          <div
            className={`relative z-10 text-center w-full max-w-lg transition-all duration-300 ${
              isAnimating
                ? "opacity-0 scale-95 translate-y-2"
                : "opacity-100 scale-100 translate-y-0"
            }`}
          >
            {!isVeryCompact && (
              <Quote
                className={`${colors.accent} mx-auto ${
                  isCompact ? "w-5 h-5 mb-2" : "w-8 h-8 mb-4"
                }`}
              />
            )}

            <blockquote
              className={`${getQuoteFontSize()} font-medium ${colors.textPrimary} leading-relaxed px-2 ${
                isVeryCompact ? "mb-2" : isCompact ? "mb-3" : "mb-6"
              }`}
            >
              "{currentQuote.content}"
            </blockquote>

            <div
              className={`flex flex-col items-center ${isVeryCompact ? "gap-1" : "gap-2"}`}
            >
              <cite
                className={`${colors.accent} not-italic font-semibold ${
                  isVeryCompact
                    ? "text-xs"
                    : isCompact
                      ? "text-sm"
                      : "text-base"
                }`}
              >
                — {currentQuote.author}
              </cite>

              {currentQuote.tags &&
                currentQuote.tags.length > 0 &&
                !isVeryCompact && (
                  <div className="flex flex-wrap justify-center gap-1.5 mt-1">
                    {currentQuote.tags
                      .slice(0, isCompact ? 2 : 3)
                      .map((tag) => (
                        <span
                          key={tag}
                          className={`rounded-full ${colors.tagBg} ${
                            isCompact
                              ? "text-[9px] px-1.5 py-0.5"
                              : "text-[10px] px-2 py-1"
                          }`}
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
      <div
        className={`flex-shrink-0 border-t ${colors.border} ${colors.bgOverlay} ${
          isVeryCompact ? "p-1.5" : isCompact ? "p-2" : "p-3"
        }`}
      >
        {/* Navigation and New Quote */}
        <TooltipProvider delayDuration={300}>
        <div
          className={`flex items-center ${isVeryCompact ? "gap-1" : "gap-2"}`}
        >
          {/* History navigation */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={goBack}
                disabled={historyIndex <= 0 || isLoading}
                className={`${colors.hoverBg} ${colors.textMuted} rounded-lg transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed ${
                  isVeryCompact ? "p-1.5" : "p-2"
                }`}
                aria-label="Previous quote"
              >
                <ChevronLeft
                  className={
                    isVeryCompact
                      ? "w-3.5 h-3.5"
                      : isCompact
                        ? "w-4 h-4"
                        : "w-5 h-5"
                  }
                />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Previous quote</p>
            </TooltipContent>
          </Tooltip>

          {/* New Quote button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleNewQuote}
                disabled={isLoading}
                className={`flex-1 bg-gradient-to-r ${colors.button} text-white rounded-lg font-medium transition-all duration-200 flex items-center justify-center shadow-lg ${colors.buttonShadow} disabled:opacity-50 ${
                  isVeryCompact
                    ? "px-2 py-1.5 gap-1.5 text-xs"
                    : isCompact
                      ? "px-3 py-2 gap-2 text-sm"
                      : "px-4 py-3 gap-2 text-base"
                }`}
              >
                <RefreshCw
                  className={`${isLoading ? "animate-spin" : ""} ${
                    isVeryCompact ? "w-3 h-3" : "w-4 h-4"
                  }`}
                />
                <span>{isVeryCompact ? "New" : "New Quote"}</span>
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Get new quote</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={goForward}
                disabled={historyIndex >= quoteHistory.length - 1 || isLoading}
                className={`${colors.hoverBg} ${colors.textMuted} rounded-lg transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed ${
                  isVeryCompact ? "p-1.5" : "p-2"
                }`}
                aria-label="Next quote"
              >
                <ChevronRight
                  className={
                    isVeryCompact
                      ? "w-3.5 h-3.5"
                      : isCompact
                        ? "w-4 h-4"
                        : "w-5 h-5"
                  }
                />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Next quote</p>
            </TooltipContent>
          </Tooltip>
        </div>
        </TooltipProvider>

        {/* History indicator */}
        {quoteHistory.length > 1 && !isVeryCompact && (
          <div
            className={`flex items-center justify-center gap-1 ${isCompact ? "mt-1.5" : "mt-2"}`}
          >
            {quoteHistory.slice(isCompact ? -5 : -7).map((_, idx) => {
              const sliceStart = Math.max(
                0,
                quoteHistory.length - (isCompact ? 5 : 7),
              );
              const actualIdx = sliceStart + idx;
              return (
                <div
                  key={idx}
                  className={`rounded-full transition-all ${
                    actualIdx === historyIndex
                      ? `${colors.accent} ${isCompact ? "w-2.5 h-1" : "w-3 h-1.5"}`
                      : `${isLightMode ? 'bg-black/20' : 'bg-white/20'} ${isCompact ? "w-1 h-1" : "w-1.5 h-1.5"}`
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
