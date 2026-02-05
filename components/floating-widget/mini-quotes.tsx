"use client";

import { useState, useEffect, useCallback } from "react";
import { Quote, RefreshCw, Copy, Check } from "lucide-react";
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
  const [quote, setQuote] = useState<QuoteData | null>(() => persistedQuote);
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
        FALLBACK_QUOTES[Math.floor(Math.random() * FALLBACK_QUOTES.length)],
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
    await navigator.clipboard.writeText(`"${quote.content}" — ${quote.author}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`flex flex-col h-full p-3 gap-2 bg-gradient-to-br ${colors.gradient} backdrop-blur-xl border ${colors.border}   overflow-hidden`}
    >
      {/* Header */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className={`p-1 rounded-lg ${colors.accentBg}`}>
          <Quote className={`w-3.5 h-3.5 ${colors.iconColor}`} />
        </div>
        <h2 className={`text-sm font-bold ${colors.textPrimary}`}>
          Daily Quote
        </h2>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center text-center min-h-0 overflow-hidden relative">
        {/* Decorative background quote */}
        <Quote
          className={`absolute top-0 left-0 w-8 h-8 ${colors.textMuted} opacity-10 -rotate-12`}
        />

        {loading ? (
          <RefreshCw className={`w-5 h-5 ${colors.textMuted} animate-spin`} />
        ) : quote ? (
          <>
            <blockquote
              className={`text-sm font-medium ${colors.textPrimary} leading-relaxed px-2 overflow-y-auto`}
            >
              &ldquo;{quote.content}&rdquo;
            </blockquote>
            <cite
              className={`text-[11px] ${colors.accent} not-italic font-semibold mt-2 flex-shrink-0`}
            >
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
          className={`p-1.5 rounded-lg ${colors.buttonBg} ${colors.textMuted} transition-colors disabled:opacity-30`}
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
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium text-xs shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-50"
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
