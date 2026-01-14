"use client";

import { useState, useEffect } from "react";
import { RefreshCw, Quote, Heart, Copy, Check } from "lucide-react";

interface QuoteData {
  text: string;
  author: string;
  category: string;
}

const MOTIVATIONAL_QUOTES: QuoteData[] = [
  {
    text: "The only way to do great work is to love what you do.",
    author: "Steve Jobs",
    category: "Work",
  },
  {
    text: "Believe you can and you're halfway there.",
    author: "Theodore Roosevelt",
    category: "Belief",
  },
  {
    text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    author: "Winston Churchill",
    category: "Perseverance",
  },
  {
    text: "The future belongs to those who believe in the beauty of their dreams.",
    author: "Eleanor Roosevelt",
    category: "Dreams",
  },
  {
    text: "It does not matter how slowly you go as long as you do not stop.",
    author: "Confucius",
    category: "Persistence",
  },
  {
    text: "Everything you've ever wanted is on the other side of fear.",
    author: "George Addair",
    category: "Courage",
  },
  {
    text: "Believe in yourself. You are braver than you think, more talented than you know, and capable of more than you imagine.",
    author: "Roy T. Bennett",
    category: "Self-belief",
  },
  {
    text: "I learned that courage was not the absence of fear, but the triumph over it.",
    author: "Nelson Mandela",
    category: "Courage",
  },
  {
    text: "The only impossible journey is the one you never begin.",
    author: "Tony Robbins",
    category: "Action",
  },
  {
    text: "Your limitation—it's only your imagination.",
    author: "Unknown",
    category: "Mindset",
  },
  {
    text: "Great things never come from comfort zones.",
    author: "Unknown",
    category: "Growth",
  },
  {
    text: "Dream it. Wish it. Do it.",
    author: "Unknown",
    category: "Action",
  },
  {
    text: "Success doesn't just find you. You have to go out and get it.",
    author: "Unknown",
    category: "Success",
  },
  {
    text: "The harder you work for something, the greater you'll feel when you achieve it.",
    author: "Unknown",
    category: "Achievement",
  },
  {
    text: "Dream bigger. Do bigger.",
    author: "Unknown",
    category: "Ambition",
  },
  {
    text: "Don't stop when you're tired. Stop when you're done.",
    author: "Unknown",
    category: "Persistence",
  },
  {
    text: "Wake up with determination. Go to bed with satisfaction.",
    author: "Unknown",
    category: "Discipline",
  },
  {
    text: "Do something today that your future self will thank you for.",
    author: "Sean Patrick Flanery",
    category: "Future",
  },
  {
    text: "Little things make big days.",
    author: "Unknown",
    category: "Appreciation",
  },
  {
    text: "It's going to be hard, but hard does not mean impossible.",
    author: "Unknown",
    category: "Perseverance",
  },
  {
    text: "Don't wait for opportunity. Create it.",
    author: "Unknown",
    category: "Opportunity",
  },
  {
    text: "Sometimes we're tested not to show our weaknesses, but to discover our strengths.",
    author: "Unknown",
    category: "Strength",
  },
  {
    text: "The key to success is to focus on goals, not obstacles.",
    author: "Unknown",
    category: "Focus",
  },
  {
    text: "Dream it. Believe it. Build it.",
    author: "Unknown",
    category: "Creation",
  },
  {
    text: "You don't have to be great to start, but you have to start to be great.",
    author: "Zig Ziglar",
    category: "Beginning",
  },
  {
    text: "A journey of a thousand miles begins with a single step.",
    author: "Lao Tzu",
    category: "Journey",
  },
  {
    text: "The only person you are destined to become is the person you decide to be.",
    author: "Ralph Waldo Emerson",
    category: "Self",
  },
  {
    text: "What lies behind us and what lies before us are tiny matters compared to what lies within us.",
    author: "Ralph Waldo Emerson",
    category: "Inner Strength",
  },
  {
    text: "Hardships often prepare ordinary people for an extraordinary destiny.",
    author: "C.S. Lewis",
    category: "Destiny",
  },
  {
    text: "You are never too old to set another goal or to dream a new dream.",
    author: "C.S. Lewis",
    category: "Goals",
  },
];

// Persist quotes widget state in memory across re-mounts
let persistedQuotesState: {
  quote: QuoteData;
  isFavorite: boolean;
} | null = null;

export default function QuotesWidget() {
  // Initialize from memory first, then localStorage
  const [currentQuote, setCurrentQuote] = useState<QuoteData>(() => {
    if (persistedQuotesState !== null) {
      return persistedQuotesState.quote;
    }
    // Try to load from localStorage
    if (typeof window !== "undefined") {
      const savedQuoteIndex = localStorage.getItem("qorvexflow_quote_index");
      if (savedQuoteIndex) {
        const index = parseInt(savedQuoteIndex, 10);
        if (index >= 0 && index < MOTIVATIONAL_QUOTES.length) {
          return MOTIVATIONAL_QUOTES[index];
        }
      }
    }
    return MOTIVATIONAL_QUOTES[0];
  });

  const [isFavorite, setIsFavorite] = useState(() => {
    if (persistedQuotesState !== null) {
      return persistedQuotesState.isFavorite;
    }
    return false;
  });

  const [copied, setCopied] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Keep memory state in sync
  useEffect(() => {
    persistedQuotesState = { quote: currentQuote, isFavorite };
  }, [currentQuote, isFavorite]);

  // Only run localStorage initialization on first mount when no persisted state
  useEffect(() => {
    if (persistedQuotesState !== null && persistedQuotesState.quote !== MOTIVATIONAL_QUOTES[0]) {
      // Already initialized from memory
      return;
    }

    const today = new Date().toDateString();
    const savedDate = localStorage.getItem("qorvexflow_quote_date");
    const savedQuoteIndex = localStorage.getItem("qorvexflow_quote_index");

    if (savedDate === today && savedQuoteIndex) {
      const index = parseInt(savedQuoteIndex, 10);
      if (index >= 0 && index < MOTIVATIONAL_QUOTES.length) {
        setCurrentQuote(MOTIVATIONAL_QUOTES[index]);
      }
    } else {
      // New day, pick a random quote
      const randomIndex = Math.floor(
        Math.random() * MOTIVATIONAL_QUOTES.length
      );
      setCurrentQuote(MOTIVATIONAL_QUOTES[randomIndex]);
      localStorage.setItem("qorvexflow_quote_date", today);
      localStorage.setItem("qorvexflow_quote_index", randomIndex.toString());
    }

    // Load favorites
    const favorites = localStorage.getItem("qorvexflow_quote_favorites");
    if (favorites) {
      const favList = JSON.parse(favorites);
      setIsFavorite(favList.includes(currentQuote.text));
    }
  }, []);

  const handleRandomize = () => {
    setIsAnimating(true);
    const randomIndex = Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length);
    const newQuote = MOTIVATIONAL_QUOTES[randomIndex];

    setTimeout(() => {
      setCurrentQuote(newQuote);
      localStorage.setItem("qorvexflow_quote_index", randomIndex.toString());

      // Check if new quote is favorite
      const favorites = localStorage.getItem("qorvexflow_quote_favorites");
      if (favorites) {
        const favList = JSON.parse(favorites);
        setIsFavorite(favList.includes(newQuote.text));
      } else {
        setIsFavorite(false);
      }

      setIsAnimating(false);
    }, 300);
  };

  const handleToggleFavorite = () => {
    const favorites = localStorage.getItem("qorvexflow_quote_favorites");
    let favList: string[] = favorites ? JSON.parse(favorites) : [];

    if (isFavorite) {
      favList = favList.filter((text) => text !== currentQuote.text);
    } else {
      favList.push(currentQuote.text);
    }

    localStorage.setItem("qorvexflow_quote_favorites", JSON.stringify(favList));
    setIsFavorite(!isFavorite);
  };

  const handleCopy = () => {
    const text = `"${currentQuote.text}" — ${currentQuote.author}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-indigo-900/90 to-purple-900/90 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-white/10 bg-black/20 p-4 px-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Quote className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white">Daily Motivation</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleFavorite}
              className={`p-2 rounded-lg transition-all duration-200 ${
                isFavorite
                  ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                  : "bg-white/10 text-white/60 hover:bg-white/20 hover:text-white"
              }`}
              aria-label={
                isFavorite ? "Remove from favorites" : "Add to favorites"
              }
            >
              <Heart
                className={`w-4 h-4 ${isFavorite ? "fill-current" : ""}`}
              />
            </button>
            <button
              onClick={handleCopy}
              className="p-2 bg-white/10 hover:bg-white/20 text-white/60 hover:text-white rounded-lg transition-all duration-200"
              aria-label="Copy quote"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Quote Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute inset-0 opacity-10">
          <Quote className="absolute top-4 left-4 w-20 h-20 text-white transform rotate-12" />
          <Quote className="absolute bottom-4 right-4 w-20 h-20 text-white transform -rotate-12" />
        </div>

        {/* Quote Text */}
        <div
          className={`relative z-10 text-center transition-all duration-300 ${
            isAnimating ? "opacity-0 scale-95" : "opacity-100 scale-100"
          }`}
        >
          <Quote className="w-8 h-8 text-indigo-400 mx-auto mb-4" />
          <blockquote className="text-xl md:text-2xl font-medium text-white leading-relaxed mb-6 px-4">
            "{currentQuote.text}"
          </blockquote>
          <div className="flex flex-col items-center gap-2">
            <cite className="text-base text-indigo-300 not-italic font-semibold">
              — {currentQuote.author}
            </cite>
            <span className="text-xs text-white/40 px-3 py-1 bg-white/10 rounded-full">
              {currentQuote.category}
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 border-t border-white/10 bg-black/20 p-4">
        <button
          onClick={handleRandomize}
          disabled={isAnimating}
          className="w-full px-4 py-3 bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 disabled:opacity-50"
        >
          <RefreshCw
            className={`w-4 h-4 ${isAnimating ? "animate-spin" : ""}`}
          />
          Get New Quote
        </button>
        <p className="text-xs text-white/40 text-center mt-2">
          {MOTIVATIONAL_QUOTES.length} quotes available
        </p>
      </div>
    </div>
  );
}
