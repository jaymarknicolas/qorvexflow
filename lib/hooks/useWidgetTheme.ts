"use client";

import { useCallback } from "react";
import { useTheme } from "@/lib/contexts/theme-context";
import { useAppSettings } from "@/lib/contexts/app-settings-context";

export interface WidgetThemeColors {
  // Background gradients
  gradient: string;
  glowFrom: string;
  glowTo: string;

  // Text
  accent: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;

  // Backgrounds
  accentBg: string;
  border: string;
  iconColor: string;
  buttonBg: string;
  buttonHoverText: string;
  hoverBg: string;
  surfaceBg: string;
  bgOverlay: string;

  // Chart/graph colors (unchanged - always vibrant)
  lineStart: string;
  lineEnd: string;
  dotColor: string;
  barColor: string;
  areaFill: string;
  progressBg: string;

  // Raw values
  isLightMode: boolean;
  theme: string;
}

/**
 * Shared hook for widget theme colors with light/dark mode support.
 * Use this instead of duplicating getThemeColors in every widget.
 */
export function useWidgetTheme(): WidgetThemeColors {
  const { theme } = useTheme();
  const { effectiveColorScheme } = useAppSettings();
  const isLightMode = effectiveColorScheme === "light";

  const colors = useCallback((): WidgetThemeColors => {
    switch (theme) {
      case "ghibli":
        return {
          gradient: isLightMode
            ? "from-green-50/95 via-emerald-50/90 to-teal-50/95"
            : "from-green-900/95 via-emerald-900/90 to-teal-900/95",
          glowFrom: "from-green-500/30",
          glowTo: "to-amber-500/20",
          accent: isLightMode ? "text-green-700" : "text-emerald-400",
          textPrimary: isLightMode ? "text-green-900" : "text-white",
          textSecondary: isLightMode ? "text-green-800" : "text-white/80",
          textMuted: isLightMode ? "text-green-700/70" : "text-white/50",
          accentBg: isLightMode ? "bg-green-200/50" : "bg-emerald-500/20",
          border: isLightMode ? "border-green-300/50" : "border-emerald-400/30",
          iconColor: isLightMode ? "text-green-700" : "text-emerald-400",
          buttonBg: isLightMode
            ? "bg-green-200/50 hover:bg-green-300/50"
            : "bg-emerald-500/15 hover:bg-emerald-500/25",
          buttonHoverText: isLightMode ? "hover:text-green-900" : "hover:text-emerald-300",
          hoverBg: isLightMode ? "hover:bg-green-200/50" : "hover:bg-white/10",
          surfaceBg: isLightMode ? "bg-green-100/80" : "bg-slate-900/95",
          bgOverlay: isLightMode ? "bg-green-100/50" : "bg-black/20",
          lineStart: "rgb(16, 185, 129)",
          lineEnd: "rgb(20, 184, 166)",
          dotColor: "#10b981",
          barColor: "#10b981",
          areaFill: "rgba(16, 185, 129, 0.3)",
          progressBg: "bg-emerald-500",
          isLightMode,
          theme,
        };

      case "coffeeshop":
        return {
          gradient: isLightMode
            ? "from-amber-50/95 via-orange-50/90 to-yellow-50/95"
            : "from-stone-900/95 via-amber-950/90 to-orange-950/95",
          glowFrom: "from-amber-500/20",
          glowTo: "to-orange-500/20",
          accent: isLightMode ? "text-amber-800" : "text-amber-400",
          textPrimary: isLightMode ? "text-amber-950" : "text-white",
          textSecondary: isLightMode ? "text-amber-900" : "text-white/80",
          textMuted: isLightMode ? "text-amber-800/70" : "text-white/50",
          accentBg: isLightMode ? "bg-amber-200/50" : "bg-amber-500/20",
          border: isLightMode ? "border-amber-300/50" : "border-amber-500/20",
          iconColor: isLightMode ? "text-amber-700" : "text-amber-400",
          buttonBg: isLightMode
            ? "bg-amber-200/50 hover:bg-amber-300/50"
            : "bg-amber-500/15 hover:bg-amber-500/25",
          buttonHoverText: isLightMode ? "hover:text-amber-900" : "hover:text-amber-300",
          hoverBg: isLightMode ? "hover:bg-amber-200/50" : "hover:bg-white/10",
          surfaceBg: isLightMode ? "bg-amber-100/80" : "bg-slate-900/95",
          bgOverlay: isLightMode ? "bg-amber-100/50" : "bg-black/20",
          lineStart: "rgb(245, 158, 11)",
          lineEnd: "rgb(249, 115, 22)",
          dotColor: "#f59e0b",
          barColor: "#f59e0b",
          areaFill: "rgba(245, 158, 11, 0.3)",
          progressBg: "bg-amber-500",
          isLightMode,
          theme,
        };

      default: // lofi
        return {
          gradient: isLightMode
            ? "from-violet-50/95 via-purple-50/90 to-indigo-50/95"
            : "from-indigo-900/95 via-purple-900/90 to-violet-900/95",
          glowFrom: "from-violet-500/20",
          glowTo: "to-pink-500/20",
          accent: isLightMode ? "text-violet-700" : "text-violet-400",
          textPrimary: isLightMode ? "text-violet-950" : "text-white",
          textSecondary: isLightMode ? "text-violet-900" : "text-white/80",
          textMuted: isLightMode ? "text-violet-800/70" : "text-white/50",
          accentBg: isLightMode ? "bg-violet-200/50" : "bg-violet-500/20",
          border: isLightMode ? "border-violet-300/50" : "border-violet-500/20",
          iconColor: isLightMode ? "text-violet-700" : "text-violet-400",
          buttonBg: isLightMode
            ? "bg-violet-200/50 hover:bg-violet-300/50"
            : "bg-violet-500/15 hover:bg-violet-500/25",
          buttonHoverText: isLightMode ? "hover:text-violet-900" : "hover:text-violet-300",
          hoverBg: isLightMode ? "hover:bg-violet-200/50" : "hover:bg-white/10",
          surfaceBg: isLightMode ? "bg-violet-100/80" : "bg-slate-900/95",
          bgOverlay: isLightMode ? "bg-violet-100/50" : "bg-black/20",
          lineStart: "rgb(139, 92, 246)",
          lineEnd: "rgb(236, 72, 153)",
          dotColor: "#8b5cf6",
          barColor: "#8b5cf6",
          areaFill: "rgba(139, 92, 246, 0.3)",
          progressBg: "bg-violet-500",
          isLightMode,
          theme,
        };
    }
  }, [theme, isLightMode]);

  return colors();
}
