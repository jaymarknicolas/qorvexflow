"use client";

import { useState, useEffect, useCallback } from "react";
import { Quote, RefreshCw, Heart, Copy, Check } from "lucide-react";
import { useWidgetTheme } from "@/lib/hooks/useWidgetTheme";

interface QuoteData {
  _id: string;
  content: string;
  author: string;
  tags: string[];
}

const FALLBACK_QUOTES: QuoteData[] = [
  {
    _id: "f1",
    content: "The only way to do great work is to love what you do.",
    author: "Steve Jobs",
    tags: ["Motivation"],
  },
  {
    _id: "f2",
    content: "Believe you can and you're halfway there.",
    author: "Theodore Roosevelt",
    tags: ["Belief"],
  },
  {
    _id: "f3",
    content: "It does not matter how slowly you go as long as you do not stop.",
    author: "Confucius",
    tags: ["Persistence"],
  },
];

// Module-level persisted state
let persistedQuote: QuoteData | null = null;

export default function MiniQuotes() {
  const colors = useWidgetTheme();
  const [quote, setQuote] = useState<QuoteData | null>(
    () => persistedQuote
  );
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    persistedQuote = quote;
  }, [quote]);

  const fetchQuote = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/quotes?category=all", {
        cache: "no-store",
      });
      if (!res.ok) throw new Error();
      const data: QuoteData = await res.json();
      setQuote(data);
    } catch {
      setQuote(
        FALLBACK_QUOTES[Math.floor(Math.random() * FALLBACK_QUOTES.length)]
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Load initial quote
  useEffect(() => {
    if (!quote) {
      const saved = localStorage.getItem("qorvexflow_daily_quote_v2");
      if (saved) {
        try {
          setQuote(JSON.parse(saved));
          return;
        } catch {
          // fall through
        }
      }
      fetchQuote();
    }
  }, []);

  const handleCopy = async () => {
    if (!quote) return;
    await navigator.clipboard.writeText(
      `"${quote.content}" — ${quote.author}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full p-3 gap-2">
      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center text-center min-h-0 overflow-hidden">
        {loading ? (
          <RefreshCw className={`w-5 h-5 ${colors.textMuted} animate-spin`} />
        ) : quote ? (
          <>
            <Quote className={`w-4 h-4 ${colors.accent} mb-2 flex-shrink-0`} />
            <blockquote className={`text-sm font-medium ${colors.textPrimary} leading-relaxed px-1 overflow-y-auto`}>
              &ldquo;{quote.content}&rdquo;
            </blockquote>
            <cite className={`text-[11px] ${colors.accent} not-italic font-semibold mt-2 flex-shrink-0`}>
              — {quote.author}
            </cite>
          </>
        ) : null}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-center gap-2 flex-shrink-0">
        <button
          onClick={handleCopy}
          disabled={!quote}
          className={`p-1.5 rounded-lg ${colors.isLightMode ? "bg-black/5 text-black/40 hover:bg-black/10 hover:text-black/60" : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/70"} transition-colors disabled:opacity-30`}
        >
          {copied ? (
            <Check className="w-3.5 h-3.5 text-green-400" />
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
        </button>
        <button
          onClick={fetchQuote}
          disabled={loading}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg ${colors.accentBg} ${colors.accent} ${colors.isLightMode ? "hover:bg-black/10" : "hover:bg-white/15"} transition-colors text-xs font-medium disabled:opacity-50`}
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
          />
          New Quote
        </button>
      </div>
    </div>
  );
}
