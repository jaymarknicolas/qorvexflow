"use client";

import {
  User2,
  Layout,
  Check,
  Grid3x3,
  Grid2x2,
  Maximize,
  Rows,
  Menu,
  X,
  Sparkles,
  Keyboard,
  Download,
  Target,
  Palette,
  Plug,
  Users,
  Smartphone,
  BarChart3,
  ChevronRight,
  ExternalLink,
  Zap,
  Bell,
  Settings,
  HelpCircle,
  LogOut,
  MessageSquarePlus,
} from "lucide-react";
import { useState, useEffect } from "react";
import FeedbackModal from "@/components/feedback-modal";
import SettingsModal from "@/components/settings-modal";
import clsx from "clsx";
import { useTheme } from "@/lib/contexts/theme-context";
import { useLayout } from "@/lib/contexts/layout-context";
import type { LayoutType } from "@/lib/contexts/layout-context";
import { useResponsive } from "@/lib/hooks/useResponsive";
import { useAppSettings } from "@/lib/contexts/app-settings-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
// PiP imports removed — PiP is auto-triggered on tab switch or pinned per-widget

interface NavItem {
  label: string;
  icon: React.ReactNode;
  href?: string;
  badge?: string;
  subItems?: {
    label: string;
    description: string;
    icon: React.ReactNode;
    badge?: string;
  }[];
}

interface HeaderProps {
  onLayoutClick?: () => void;
}

export default function Header({ onLayoutClick }: HeaderProps = {}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const { layout, setLayout } = useLayout();
  const { isSmallMobile, isMobile, isTablet, isDesktop, width } = useResponsive();
  const { effectiveColorScheme } = useAppSettings();
  const isLight = effectiveColorScheme === "light";
  const showMobileLayouts = !isDesktop; // tablet and below get mobile layouts

  // Track scroll position for header styling
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  // Theme-aware colors (responds to both theme AND color mode)
  const getThemeColors = () => {
    if (theme === "ghibli") {
      if (isLight) {
        return {
          logoGradient: "from-green-500 via-emerald-600 to-amber-500",
          logoShadow: "shadow-green-500/25 group-hover:shadow-green-500/40",
          logoGlow: "from-green-500 to-amber-500",
          textGradient: "from-green-600 via-emerald-600 to-amber-600",
          primaryAccent: "text-green-700",
          secondaryAccent: "text-amber-700",
          buttonGradient: "from-green-600 to-amber-500",
          buttonHover: "hover:from-green-500 hover:to-amber-400",
          badgeBg: "from-green-500/20 to-amber-500/20",
          badgeText: "text-green-700",
          badgeBorder: "border-green-500/30",
          headerBg: "bg-green-50/90",
          surfaceBg: "bg-green-100/60",
          surfaceHover: "hover:bg-green-200/60",
          surfaceBorder: "border-green-300/40",
          mobileMenuBg: "bg-green-50",
          menuSurfaceBg: "bg-green-100/80",
          menuSurfaceHover: "hover:bg-green-200/80",
          menuSurfaceBorder: "border-green-300/50",
          menuActiveBg: "bg-gradient-to-r from-green-200/80 to-amber-200/60",
          menuActiveBorder: "border-green-500/50",
          menuDivider: "border-green-200/60",
          // Light-mode text tokens
          menuText: "text-green-900",
          menuTextSecondary: "text-green-800",
          menuTextMuted: "text-green-700/70",
          menuIconColor: "text-green-600",
        };
      }
      return {
        logoGradient: "from-green-400 via-emerald-500 to-amber-400",
        logoShadow: "shadow-green-500/25 group-hover:shadow-green-500/40",
        logoGlow: "from-green-400 to-amber-400",
        textGradient: "from-green-400 via-emerald-400 to-amber-400",
        primaryAccent: "text-green-400",
        secondaryAccent: "text-amber-400",
        buttonGradient: "from-green-600 to-amber-500",
        buttonHover: "hover:from-green-500 hover:to-amber-400",
        badgeBg: "from-green-500/20 to-amber-500/20",
        badgeText: "text-green-400",
        badgeBorder: "border-green-500/30",
        headerBg: "bg-green-950/80",
        surfaceBg: "bg-green-900/30",
        surfaceHover: "hover:bg-green-900/50",
        surfaceBorder: "border-green-500/20",
        mobileMenuBg: "bg-green-950",
        menuSurfaceBg: "bg-green-900/60",
        menuSurfaceHover: "hover:bg-green-800/70",
        menuSurfaceBorder: "border-green-400/25",
        menuActiveBg: "bg-gradient-to-r from-green-500/30 to-amber-500/25",
        menuActiveBorder: "border-green-400/50",
        menuDivider: "border-green-400/15",
        menuText: "text-white",
        menuTextSecondary: "text-white/90",
        menuTextMuted: "text-white/50",
        menuIconColor: "text-white/70",
      };
    }
    if (theme === "coffeeshop") {
      if (isLight) {
        return {
          logoGradient: "from-amber-500 via-orange-600 to-amber-700",
          logoShadow: "shadow-amber-500/25 group-hover:shadow-amber-500/40",
          logoGlow: "from-amber-500 to-orange-600",
          textGradient: "from-amber-600 via-orange-600 to-amber-700",
          primaryAccent: "text-amber-700",
          secondaryAccent: "text-orange-700",
          buttonGradient: "from-amber-600 to-amber-800",
          buttonHover: "hover:from-amber-500 hover:to-amber-700",
          badgeBg: "from-amber-500/20 to-orange-500/20",
          badgeText: "text-amber-700",
          badgeBorder: "border-amber-500/30",
          headerBg: "bg-amber-50/90",
          surfaceBg: "bg-amber-100/60",
          surfaceHover: "hover:bg-amber-200/60",
          surfaceBorder: "border-amber-300/40",
          mobileMenuBg: "bg-amber-50",
          menuSurfaceBg: "bg-amber-100/80",
          menuSurfaceHover: "hover:bg-amber-200/80",
          menuSurfaceBorder: "border-amber-300/50",
          menuActiveBg: "bg-gradient-to-r from-amber-200/80 to-orange-200/60",
          menuActiveBorder: "border-amber-500/50",
          menuDivider: "border-amber-200/60",
          menuText: "text-amber-950",
          menuTextSecondary: "text-amber-900",
          menuTextMuted: "text-amber-800/70",
          menuIconColor: "text-amber-700",
        };
      }
      return {
        logoGradient: "from-amber-400 via-orange-500 to-amber-600",
        logoShadow: "shadow-amber-500/25 group-hover:shadow-amber-500/40",
        logoGlow: "from-amber-400 to-orange-500",
        textGradient: "from-amber-400 via-orange-400 to-amber-600",
        primaryAccent: "text-amber-400",
        secondaryAccent: "text-orange-400",
        buttonGradient: "from-amber-600 to-amber-800",
        buttonHover: "hover:from-amber-500 hover:to-amber-700",
        badgeBg: "from-amber-500/20 to-orange-500/20",
        badgeText: "text-amber-400",
        badgeBorder: "border-amber-500/30",
        headerBg: "bg-stone-800/80",
        surfaceBg: "bg-stone-700/30",
        surfaceHover: "hover:bg-stone-700/50",
        surfaceBorder: "border-amber-500/20",
        mobileMenuBg: "bg-stone-900",
        menuSurfaceBg: "bg-stone-800/80",
        menuSurfaceHover: "hover:bg-stone-700/70",
        menuSurfaceBorder: "border-amber-400/25",
        menuActiveBg: "bg-gradient-to-r from-amber-500/30 to-orange-500/25",
        menuActiveBorder: "border-amber-400/50",
        menuDivider: "border-amber-400/15",
        menuText: "text-white",
        menuTextSecondary: "text-white/90",
        menuTextMuted: "text-white/50",
        menuIconColor: "text-white/70",
      };
    }
    if (theme === "timebased") {
      if (isLight) {
        return {
          logoGradient: "from-sky-500 via-blue-600 to-violet-500",
          logoShadow: "shadow-sky-500/25 group-hover:shadow-sky-500/40",
          logoGlow: "from-sky-500 to-violet-500",
          textGradient: "from-sky-600 via-blue-600 to-violet-600",
          primaryAccent: "text-sky-700",
          secondaryAccent: "text-violet-600",
          buttonGradient: "from-sky-600 to-violet-600",
          buttonHover: "hover:from-sky-500 hover:to-violet-500",
          badgeBg: "from-sky-500/20 to-violet-500/20",
          badgeText: "text-sky-700",
          badgeBorder: "border-sky-500/30",
          headerBg: "bg-sky-50/90",
          surfaceBg: "bg-sky-100/60",
          surfaceHover: "hover:bg-sky-200/60",
          surfaceBorder: "border-sky-300/40",
          mobileMenuBg: "bg-sky-50",
          menuSurfaceBg: "bg-sky-100/80",
          menuSurfaceHover: "hover:bg-sky-200/80",
          menuSurfaceBorder: "border-sky-300/50",
          menuActiveBg: "bg-gradient-to-r from-sky-200/80 to-violet-200/60",
          menuActiveBorder: "border-sky-500/50",
          menuDivider: "border-sky-200/60",
          menuText: "text-sky-950",
          menuTextSecondary: "text-sky-900",
          menuTextMuted: "text-sky-800/70",
          menuIconColor: "text-sky-600",
        };
      }
      return {
        logoGradient: "from-sky-400 via-blue-500 to-violet-400",
        logoShadow: "shadow-sky-500/25 group-hover:shadow-sky-500/40",
        logoGlow: "from-sky-400 to-violet-400",
        textGradient: "from-sky-400 via-blue-400 to-violet-400",
        primaryAccent: "text-sky-400",
        secondaryAccent: "text-violet-400",
        buttonGradient: "from-sky-600 to-violet-600",
        buttonHover: "hover:from-sky-500 hover:to-violet-500",
        badgeBg: "from-sky-500/20 to-violet-500/20",
        badgeText: "text-sky-400",
        badgeBorder: "border-sky-500/30",
        headerBg: "bg-slate-900/80",
        surfaceBg: "bg-slate-800/30",
        surfaceHover: "hover:bg-slate-800/50",
        surfaceBorder: "border-sky-500/20",
        mobileMenuBg: "bg-slate-900",
        menuSurfaceBg: "bg-slate-800/80",
        menuSurfaceHover: "hover:bg-slate-700/70",
        menuSurfaceBorder: "border-sky-400/25",
        menuActiveBg: "bg-gradient-to-r from-sky-500/30 to-violet-500/25",
        menuActiveBorder: "border-sky-400/50",
        menuDivider: "border-sky-400/15",
        menuText: "text-white",
        menuTextSecondary: "text-white/90",
        menuTextMuted: "text-white/50",
        menuIconColor: "text-white/70",
      };
    }
    if (theme === "weather") {
      if (isLight) {
        return {
          logoGradient: "from-slate-500 via-blue-500 to-slate-600",
          logoShadow: "shadow-slate-500/25 group-hover:shadow-slate-500/40",
          logoGlow: "from-slate-500 to-blue-500",
          textGradient: "from-slate-600 via-blue-600 to-slate-700",
          primaryAccent: "text-slate-700",
          secondaryAccent: "text-blue-600",
          buttonGradient: "from-slate-600 to-blue-600",
          buttonHover: "hover:from-slate-500 hover:to-blue-500",
          badgeBg: "from-slate-500/20 to-blue-500/20",
          badgeText: "text-slate-700",
          badgeBorder: "border-slate-500/30",
          headerBg: "bg-slate-50/90",
          surfaceBg: "bg-slate-100/60",
          surfaceHover: "hover:bg-slate-200/60",
          surfaceBorder: "border-slate-300/40",
          mobileMenuBg: "bg-slate-50",
          menuSurfaceBg: "bg-slate-100/80",
          menuSurfaceHover: "hover:bg-slate-200/80",
          menuSurfaceBorder: "border-slate-300/50",
          menuActiveBg: "bg-gradient-to-r from-slate-200/80 to-blue-200/60",
          menuActiveBorder: "border-slate-500/50",
          menuDivider: "border-slate-200/60",
          menuText: "text-slate-950",
          menuTextSecondary: "text-slate-900",
          menuTextMuted: "text-slate-800/70",
          menuIconColor: "text-slate-600",
        };
      }
      return {
        logoGradient: "from-slate-400 via-blue-400 to-slate-500",
        logoShadow: "shadow-slate-500/25 group-hover:shadow-slate-500/40",
        logoGlow: "from-slate-400 to-blue-400",
        textGradient: "from-slate-400 via-blue-400 to-slate-500",
        primaryAccent: "text-slate-400",
        secondaryAccent: "text-blue-400",
        buttonGradient: "from-slate-600 to-blue-600",
        buttonHover: "hover:from-slate-500 hover:to-blue-500",
        badgeBg: "from-slate-500/20 to-blue-500/20",
        badgeText: "text-slate-400",
        badgeBorder: "border-slate-500/30",
        headerBg: "bg-slate-800/80",
        surfaceBg: "bg-slate-700/30",
        surfaceHover: "hover:bg-slate-700/50",
        surfaceBorder: "border-slate-500/20",
        mobileMenuBg: "bg-slate-900",
        menuSurfaceBg: "bg-slate-800/80",
        menuSurfaceHover: "hover:bg-slate-700/70",
        menuSurfaceBorder: "border-slate-400/25",
        menuActiveBg: "bg-gradient-to-r from-slate-500/30 to-blue-500/25",
        menuActiveBorder: "border-slate-400/50",
        menuDivider: "border-slate-400/15",
        menuText: "text-white",
        menuTextSecondary: "text-white/90",
        menuTextMuted: "text-white/50",
        menuIconColor: "text-white/70",
      };
    }
    // Lo-Fi theme (default)
    if (isLight) {
      return {
        logoGradient: "from-violet-500 via-purple-600 to-pink-500",
        logoShadow: "shadow-violet-500/25 group-hover:shadow-violet-500/40",
        logoGlow: "from-violet-500 to-pink-500",
        textGradient: "from-violet-600 via-purple-600 to-pink-600",
        primaryAccent: "text-violet-600",
        secondaryAccent: "text-pink-600",
        buttonGradient: "from-violet-600 to-pink-600",
        buttonHover: "hover:from-violet-500 hover:to-pink-500",
        badgeBg: "from-violet-500/20 to-pink-500/20",
        badgeText: "text-violet-600",
        badgeBorder: "border-violet-500/30",
        headerBg: "bg-violet-50/90",
        surfaceBg: "bg-violet-100/60",
        surfaceHover: "hover:bg-violet-200/60",
        surfaceBorder: "border-violet-300/40",
        mobileMenuBg: "bg-violet-50",
        menuSurfaceBg: "bg-violet-100/80",
        menuSurfaceHover: "hover:bg-violet-200/80",
        menuSurfaceBorder: "border-violet-300/50",
        menuActiveBg: "bg-gradient-to-r from-violet-200/80 to-pink-200/60",
        menuActiveBorder: "border-violet-500/50",
        menuDivider: "border-violet-200/60",
        menuText: "text-indigo-950",
        menuTextSecondary: "text-indigo-900",
        menuTextMuted: "text-indigo-800/70",
        menuIconColor: "text-violet-600",
      };
    }
    return {
      logoGradient: "from-violet-400 via-purple-500 to-pink-400",
      logoShadow: "shadow-violet-500/25 group-hover:shadow-violet-500/40",
      logoGlow: "from-violet-400 to-pink-400",
      textGradient: "from-violet-400 via-purple-400 to-pink-400",
      primaryAccent: "text-violet-400",
      secondaryAccent: "text-pink-400",
      buttonGradient: "from-violet-600 to-pink-600",
      buttonHover: "hover:from-violet-500 hover:to-pink-500",
      badgeBg: "from-violet-500/20 to-pink-500/20",
      badgeText: "text-violet-400",
      badgeBorder: "border-violet-500/30",
      headerBg: "bg-indigo-950/80",
      surfaceBg: "bg-indigo-900/30",
      surfaceHover: "hover:bg-indigo-900/50",
      surfaceBorder: "border-violet-500/20",
      mobileMenuBg: "bg-indigo-950",
      menuSurfaceBg: "bg-indigo-900/60",
      menuSurfaceHover: "hover:bg-indigo-800/60",
      menuSurfaceBorder: "border-violet-400/25",
      menuActiveBg: "bg-gradient-to-r from-violet-500/30 to-pink-500/25",
      menuActiveBorder: "border-violet-400/50",
      menuDivider: "border-violet-400/15",
      menuText: "text-white",
      menuTextSecondary: "text-white/90",
      menuTextMuted: "text-white/50",
      menuIconColor: "text-white/70",
    };
  };

  const colors = getThemeColors();

  const upcomingFeatures: NavItem[] = [
    {
      label: "Features",
      icon: <Sparkles className="w-4 h-4" />,
      subItems: [
        {
          label: "Widget Library",
          description: "Browse & install widgets",
          icon: <Grid3x3 className={`w-4 h-4 ${colors.primaryAccent}`} />,
          badge: "Soon",
        },
        {
          label: "Keyboard Shortcuts",
          description: "Navigate faster",
          icon: <Keyboard className={`w-4 h-4 ${colors.secondaryAccent}`} />,
          badge: "Q1",
        },
        {
          label: "Data Export",
          description: "Backup your data",
          icon: <Download className="w-4 h-4 text-emerald-400" />,
          badge: "Q1",
        },
        {
          label: "Focus Modes",
          description: "Minimize distractions",
          icon: <Target className="w-4 h-4 text-orange-400" />,
          badge: "Q1",
        },
      ],
    },
    {
      label: "Integrations",
      icon: <Plug className="w-4 h-4" />,
      subItems: [
        {
          label: "Notion",
          description: "Sync your notes",
          icon: <ExternalLink className="w-4 h-4 text-white/60" />,
          badge: "Q2",
        },
        {
          label: "Spotify",
          description: "Music integration",
          icon: <ExternalLink className="w-4 h-4 text-green-400" />,
          badge: "Q1",
        },
        {
          label: "Google Calendar",
          description: "Calendar sync",
          icon: <ExternalLink className="w-4 h-4 text-blue-400" />,
          badge: "Q2",
        },
        {
          label: "GitHub",
          description: "Track activity",
          icon: (
            <ExternalLink className={`w-4 h-4 ${colors.secondaryAccent}`} />
          ),
          badge: "Q2",
        },
      ],
    },
    {
      label: "Roadmap",
      icon: <BarChart3 className="w-4 h-4" />,
      subItems: [
        {
          label: "Mobile App",
          description: "iOS & Android",
          icon: <Smartphone className={`w-4 h-4 ${colors.primaryAccent}`} />,
          badge: "Q2",
        },
        {
          label: "Team Workspaces",
          description: "Collaborate together",
          icon: <Users className="w-4 h-4 text-pink-400" />,
          badge: "Q3",
        },
        {
          label: "AI Assistant",
          description: "Smart productivity",
          icon: <Zap className="w-4 h-4 text-yellow-400" />,
          badge: "Q4",
        },
        {
          label: "Analytics",
          description: "Track productivity",
          icon: <BarChart3 className="w-4 h-4 text-emerald-400" />,
          badge: "Q2",
        },
      ],
    },
  ];

  // Desktop layout options
  const desktopLayoutOptions = [
    {
      id: "grid-5" as LayoutType,
      label: "Classic Grid",
      desc: "2 + 3 layout",
      icon: Grid2x2,
    },
    { id: "grid-4" as LayoutType, label: "Quad Grid", desc: "2 × 2 layout", icon: Grid2x2 },
    { id: "grid-6" as LayoutType, label: "Hexagon", desc: "3 × 2 layout", icon: Grid3x3 },
    {
      id: "asymmetric" as LayoutType,
      label: "Asymmetric",
      desc: "1 + 4 layout",
      icon: Maximize,
    },
    { id: "focus" as LayoutType, label: "Focus Mode", desc: "1 + 2 layout", icon: Target },
    { id: "kanban" as LayoutType, label: "Kanban", desc: "3 columns", icon: Rows },
  ];

  // Mobile layout options (visual preview based)
  const mobileLayoutOptions: { id: LayoutType; label: string; desc: string; preview: React.ReactNode }[] = [
    {
      id: "mobile-1",
      label: "Single",
      desc: "1 canvas",
      preview: (
        <div className="w-10 h-10 flex items-center justify-center">
          <div className="w-6 h-6 rounded-sm border-2 border-current opacity-80" />
        </div>
      ),
    },
    {
      id: "mobile-2",
      label: "Dual",
      desc: "2 stacked",
      preview: (
        <div className="w-10 h-10 flex flex-col items-center justify-center gap-0.5">
          <div className="w-6 h-[11px] rounded-sm border-2 border-current opacity-80" />
          <div className="w-6 h-[11px] rounded-sm border-2 border-current opacity-80" />
        </div>
      ),
    },
    {
      id: "mobile-3",
      label: "Trio",
      desc: "1 + 2 layout",
      preview: (
        <div className="w-10 h-10 flex flex-col items-center justify-center gap-0.5">
          <div className="w-6 h-[11px] rounded-sm border-2 border-current opacity-80" />
          <div className="flex gap-0.5">
            <div className="w-[11px] h-[11px] rounded-sm border-2 border-current opacity-80" />
            <div className="w-[11px] h-[11px] rounded-sm border-2 border-current opacity-80" />
          </div>
        </div>
      ),
    },
    // 4-grid only for tablet (>= 475px)
    ...(!isSmallMobile
      ? [
          {
            id: "mobile-4" as LayoutType,
            label: "Quad",
            desc: "2 × 2 grid",
            preview: (
              <div className="w-10 h-10 grid grid-cols-2 gap-0.5 place-items-center p-1">
                <div className="w-[11px] h-[11px] rounded-sm border-2 border-current opacity-80" />
                <div className="w-[11px] h-[11px] rounded-sm border-2 border-current opacity-80" />
                <div className="w-[11px] h-[11px] rounded-sm border-2 border-current opacity-80" />
                <div className="w-[11px] h-[11px] rounded-sm border-2 border-current opacity-80" />
              </div>
            ),
          },
        ]
      : []),
  ];

  // Pick layout options based on screen size
  const layoutOptions = showMobileLayouts ? mobileLayoutOptions : desktopLayoutOptions;

  const themeOptions = [
    {
      id: "lofi",
      label: "Lo-Fi Night",
      emoji: "🎵",
      description: "Purple & pink vibes",
      gradient: "from-violet-500 to-pink-500",
    },
    {
      id: "ghibli",
      label: "Studio Ghibli",
      emoji: "🌿",
      description: "Nature & warmth",
      gradient: "from-green-500 to-amber-500",
    },
    {
      id: "coffeeshop",
      label: "Coffee Shop",
      emoji: "☕",
      description: "Warm & cozy vibes",
      gradient: "from-amber-500 to-amber-800",
    },
    {
      id: "timebased",
      label: "Time-Based",
      emoji: "🌅",
      description: "Shifts with time of day",
      gradient: "from-orange-500 via-sky-500 to-indigo-600",
    },
    {
      id: "weather",
      label: "Weather",
      emoji: "🌦️",
      description: "Reacts to real weather",
      gradient: "from-blue-500 via-slate-400 to-amber-500",
    },
  ];

  return (
    <>
      <header
        className={clsx(
          "border-b backdrop-blur-xl sticky top-0 z-40 transition-all duration-300",
          scrolled
            ? `${colors.headerBg} shadow-lg ${isLight ? "shadow-black/10 border-black/10" : "shadow-black/20 border-white/10"}`
            : `${isLight ? "bg-white/50 border-black/5" : "bg-slate-950/50 border-white/5"}`,
        )}
      >
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-18">
            {/* Left Section: Logo & Navigation */}
            <div className="flex items-center gap-4 lg:gap-8">
              {/* Logo */}
              <div className="flex items-center gap-2.5 group cursor-pointer">
                <div className="relative">
                  <Image
                    src="/images/logo.png"
                    alt="Qorvex Logo"
                    width={36}
                    height={36}
                  />
                </div>
                <div className="hidden sm:flex flex-col">
                  <span
                    className={`text-xl font-bold bg-gradient-to-r ${colors.textGradient} bg-clip-text text-transparent leading-tight`}
                  >
                    QORVEX
                  </span>
                  <span className={`text-[10px] font-medium tracking-wider ${colors.menuTextMuted}`}>
                    PRODUCTIVITY FLOW
                  </span>
                </div>
              </div>

              {/* Desktop Navigation */}
              <nav className="hidden lg:flex items-center gap-1">
                {upcomingFeatures.map((item) => (
                  <DropdownMenu key={item.label}>
                    <DropdownMenuTrigger asChild>
                      <button className={`flex items-center gap-1.5 px-3 py-2 rounded-lg ${colors.menuTextMuted} ${isLight ? "hover:bg-black/5" : "hover:bg-white/5"} transition-all text-sm font-medium group`}>
                        {item.icon}
                        <span>{item.label}</span>
                        <ChevronRight className="w-3 h-3 opacity-50 group-hover:opacity-100 transition-opacity rotate-90" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-72 z-[999]">
                      <DropdownMenuLabel className="flex items-center gap-2 normal-case text-sm font-medium text-white/70">
                        {item.icon}
                        {item.label}
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {item.subItems?.map((subItem) => (
                        <DropdownMenuItem
                          key={subItem.label}
                          className="cursor-pointer py-3"
                        >
                          <div className="flex items-start gap-3 w-full">
                            <div className="mt-0.5">{subItem.icon}</div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-white">
                                  {subItem.label}
                                </span>
                                {subItem.badge && (
                                  <span
                                    className={`px-2 py-0.5 text-[10px] font-semibold bg-gradient-to-r ${colors.badgeBg} ${colors.badgeText} rounded-full border ${colors.badgeBorder}`}
                                  >
                                    {subItem.badge}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-white/50 mt-0.5">
                                {subItem.description}
                              </p>
                            </div>
                          </div>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ))}
              </nav>
            </div>

            {/* Right Section: Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Layout Selector - Desktop (hidden on mobile, use burger menu) */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    data-onboarding="layout-selector"
                    className={`hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg ${colors.surfaceBg} border ${colors.surfaceBorder} ${colors.menuText} ${colors.surfaceHover} transition-all`}
                  >
                    <Layout className={`w-4 h-4`} />
                    <span className="text-sm font-medium hidden md:inline">
                      {layoutOptions.find((l) => l.id === layout)?.label ||
                        "Layout"}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 z-[999]">
                  <DropdownMenuLabel>Select Layout</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {desktopLayoutOptions.map((option) => (
                    <DropdownMenuItem
                      key={option.id}
                      onClick={() => setLayout(option.id as LayoutType)}
                      className="cursor-pointer py-2.5"
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2.5">
                          <option.icon className="w-4 h-4 text-white/60" />
                          <div>
                            <div className="text-sm font-medium">
                              {option.label}
                            </div>
                            <div className="text-xs text-white/40">
                              {option.desc}
                            </div>
                          </div>
                        </div>
                        {layout === option.id && (
                          <Check
                            className={`w-4 h-4 ${colors.primaryAccent}`}
                          />
                        )}
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Theme Selector - Desktop */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    data-onboarding="theme-selector"
                    className={`hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg ${colors.surfaceBg} border ${colors.surfaceBorder} ${colors.menuText} ${colors.surfaceHover} transition-all`}
                  >
                    <span className="text-sm font-medium hidden md:inline">
                      {themeOptions.find((t) => t.id === theme)?.emoji}{" "}
                      <span className="hidden lg:inline">
                        {themeOptions.find((t) => t.id === theme)?.label}
                      </span>
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 z-[999]">
                  <DropdownMenuLabel>Select Theme</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {themeOptions.map((option) => (
                    <DropdownMenuItem
                      key={option.id}
                      onClick={() => setTheme(option.id as any)}
                      className="cursor-pointer py-3"
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-lg bg-gradient-to-br ${option.gradient} flex items-center justify-center text-lg`}
                          >
                            {option.emoji}
                          </div>
                          <div>
                            <div className="font-medium text-white">
                              {option.label}
                            </div>
                            <div className="text-xs text-white/50">
                              {option.description}
                            </div>
                          </div>
                        </div>
                        {theme === option.id && (
                          <Check
                            className={`w-4 h-4 ${colors.primaryAccent}`}
                          />
                        )}
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Feedback Button - Desktop */}
              <TooltipProvider delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setFeedbackModalOpen(true)}
                      className={`hidden lg:flex items-center justify-center gap-2 px-3 py-2 rounded-lg ${colors.surfaceBg} border ${colors.surfaceBorder} ${colors.menuIconColor} ${colors.surfaceHover} transition-all`}
                    >
                      <MessageSquarePlus className="w-4 h-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Send feedback</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Notifications - Desktop */}
              <TooltipProvider delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      className={`hidden lg:flex items-center justify-center w-10 h-10 rounded-lg ${colors.surfaceBg} border ${colors.surfaceBorder} ${colors.menuIconColor} ${colors.surfaceHover} transition-all relative`}
                    >
                      <Bell className="w-4 h-4" />
                      <span
                        className={`absolute top-2 right-2 w-2 h-2 rounded-full animate-pulse bg-gradient-to-r ${colors.buttonGradient}`}
                      />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Notifications</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* User Profile */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    data-onboarding="settings"
                    className="relative w-10 h-10 rounded-full p-0 overflow-hidden group"
                  >
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${colors.logoGradient} opacity-90 group-hover:opacity-100 transition-opacity`}
                    />
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${colors.logoGradient} blur-lg opacity-0 group-hover:opacity-50 transition-opacity`}
                    />
                    <User2 className="relative w-5 h-5 text-white keep-white" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 z-[999]" align="end">
                  <div className="px-3 py-3 border-b border-white/10">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full bg-gradient-to-br ${colors.logoGradient} flex items-center justify-center`}
                      >
                        <User2 className="w-5 h-5 text-white keep-white" />
                      </div>
                      <div>
                        <p className="font-medium text-white">Guest User</p>
                        <p className="text-xs text-white/50">Free Plan</p>
                      </div>
                    </div>
                  </div>
                  <DropdownMenuGroup className="py-1">
                    <DropdownMenuItem className="cursor-pointer">
                      <User2 className="w-4 h-4 mr-2 text-white/60" />
                      Profile
                      <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() => setSettingsModalOpen(true)}
                    >
                      <Settings className="w-4 h-4 mr-2 text-white/60" />
                      Settings
                      <DropdownMenuShortcut>⌘,</DropdownMenuShortcut>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer">
                      <Keyboard className="w-4 h-4 mr-2 text-white/60" />
                      Shortcuts
                      <DropdownMenuShortcut>⌘K</DropdownMenuShortcut>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup className="py-1">
                    <DropdownMenuItem className="cursor-pointer">
                      <HelpCircle className="w-4 h-4 mr-2 text-white/60" />
                      Help & Support
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer">
                      <Download className="w-4 h-4 mr-2 text-white/60" />
                      Export Data
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer text-red-400 focus:text-red-400">
                    <LogOut className="w-4 h-4 mr-2" />
                    Log out
                    <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Mobile Menu Button */}
              <TooltipProvider delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                      className={`lg:hidden flex items-center justify-center w-10 h-10 rounded-lg ${colors.surfaceBg} border ${colors.surfaceBorder} ${colors.menuText} ${colors.surfaceHover} transition-all`}
                      aria-label="Toggle menu"
                    >
                      {mobileMenuOpen ? (
                        <X className="w-5 h-5" />
                      ) : (
                        <Menu className="w-5 h-5" />
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{mobileMenuOpen ? "Close menu" : "Open menu"}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={`fixed inset-0 ${isLight ? "bg-black/30" : "bg-black/60"} backdrop-blur-sm z-[100] lg:hidden`}
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className={`fixed top-0 right-0 bottom-0 w-full max-w-sm ${colors.mobileMenuBg} backdrop-blur-xl border-l ${colors.menuSurfaceBorder} z-[101] lg:hidden overflow-y-auto`}
            >
              {/* Mobile Menu Header */}
              <div className={`flex items-center justify-between p-4 border-b ${colors.menuDivider}`}>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-lg bg-gradient-to-br ${colors.logoGradient} flex items-center justify-center`}
                  >
                    <span className="text-white keep-white font-bold text-sm">Q</span>
                  </div>
                  <span
                    className={`text-lg font-bold bg-gradient-to-r ${colors.textGradient} bg-clip-text text-transparent`}
                  >
                    QORVEX
                  </span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className={`p-2 rounded-lg ${colors.menuSurfaceBg} border ${colors.menuSurfaceBorder} ${colors.menuText} ${colors.menuSurfaceHover} transition-all`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Menu Content */}
              <div className="p-4 space-y-6">
                {/* Layout Selection — responsive presets */}
                <div>
                  <h3 className={`text-xs font-semibold uppercase tracking-wider mb-3 px-2 ${colors.primaryAccent}`}>
                    Layout
                  </h3>
                  <div className={`grid gap-2 ${mobileLayoutOptions.length >= 4 ? "grid-cols-4" : "grid-cols-3"}`}>
                    {mobileLayoutOptions.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => {
                          setLayout(option.id as LayoutType);
                          setMobileMenuOpen(false);
                        }}
                        className={clsx(
                          "flex flex-col items-center gap-1.5 p-2.5 rounded-xl border transition-all",
                          layout === option.id
                            ? `${colors.menuActiveBg} border-2 ${colors.menuActiveBorder} ${colors.primaryAccent}`
                            : `${colors.menuSurfaceBg} ${colors.menuSurfaceBorder} ${colors.menuTextMuted} ${colors.menuSurfaceHover}`,
                        )}
                      >
                        {option.preview}
                        <span className="text-[10px] font-semibold tracking-wide">
                          {option.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Theme Selection */}
                <div>
                  <h3 className={`text-xs font-semibold uppercase tracking-wider mb-3 px-2 ${colors.primaryAccent}`}>
                    Theme
                  </h3>
                  <div className="space-y-2">
                    {themeOptions.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => {
                          setTheme(option.id as any);
                          setMobileMenuOpen(false);
                        }}
                        className={clsx(
                          "flex items-center gap-3 w-full p-3 rounded-xl border transition-all",
                          theme === option.id
                            ? `${colors.menuActiveBg} border-2 ${colors.menuActiveBorder}`
                            : `${colors.menuSurfaceBg} ${colors.menuSurfaceBorder} ${colors.menuSurfaceHover}`,
                        )}
                      >
                        <div
                          className={`w-10 h-10 rounded-lg bg-gradient-to-br ${option.gradient} flex items-center justify-center text-xl shrink-0`}
                        >
                          {option.emoji}
                        </div>
                        <div className="flex-1 text-left">
                          <div className={`font-medium ${theme === option.id ? colors.menuText : colors.menuTextSecondary}`}>
                            {option.label}
                          </div>
                          <div className={`text-xs ${theme === option.id ? colors.menuTextSecondary : colors.menuTextMuted}`}>
                            {option.description}
                          </div>
                        </div>
                        {theme === option.id && (
                          <Check
                            className={`w-5 h-5 ${colors.primaryAccent}`}
                          />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Upcoming Features */}
                <div>
                  <h3 className={`text-xs font-semibold uppercase tracking-wider mb-3 px-2 ${colors.secondaryAccent}`}>
                    Coming Soon
                  </h3>
                  <div className="space-y-1">
                    {upcomingFeatures.map((category) => (
                      <div key={category.label} className="mb-4">
                        <div className={`flex items-center gap-2 px-2 mb-2 ${colors.primaryAccent}`}>
                          {category.icon}
                          <span className="text-sm font-medium">
                            {category.label}
                          </span>
                        </div>
                        <div className="space-y-1.5">
                          {category.subItems?.map((item) => (
                            <div
                              key={item.label}
                              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg ${colors.menuSurfaceBg} border ${colors.menuSurfaceBorder}`}
                            >
                              {item.icon}
                              <div className="flex-1">
                                <div className={`text-sm font-medium ${colors.menuText}`}>
                                  {item.label}
                                </div>
                                <div className={`text-xs ${colors.menuTextMuted}`}>
                                  {item.description}
                                </div>
                              </div>
                              <span
                                className={`px-2 py-0.5 text-[10px] font-semibold bg-gradient-to-r ${colors.badgeBg} ${colors.badgeText} rounded-full border ${colors.badgeBorder}`}
                              >
                                {item.badge}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className={`border-t ${colors.menuDivider} pt-4`}>
                  <div className="space-y-1">
                    <button
                      className={`flex items-center gap-3 w-full p-3 rounded-xl ${colors.menuTextSecondary} ${colors.menuSurfaceHover} transition-all`}
                    >
                      <User2 className="w-5 h-5" />
                      <span className="font-medium">Profile</span>
                    </button>
                    <button
                      onClick={() => {
                        setSettingsModalOpen(true);
                        setMobileMenuOpen(false);
                      }}
                      className={`flex items-center gap-3 w-full p-3 rounded-xl ${colors.menuTextSecondary} ${colors.menuSurfaceHover} transition-all`}
                    >
                      <Settings className="w-5 h-5" />
                      <span className="font-medium">Settings</span>
                    </button>
                    <button
                      onClick={() => {
                        setFeedbackModalOpen(true);
                        setMobileMenuOpen(false);
                      }}
                      className={`flex items-center gap-3 w-full p-3 rounded-xl ${colors.menuTextSecondary} ${colors.menuSurfaceHover} transition-all`}
                    >
                      <MessageSquarePlus className="w-5 h-5" />
                      <span className="font-medium">Send Feedback</span>
                    </button>
                    <button
                      className={`flex items-center gap-3 w-full p-3 rounded-xl ${colors.menuTextSecondary} ${colors.menuSurfaceHover} transition-all`}
                    >
                      <HelpCircle className="w-5 h-5" />
                      <span className="font-medium">Help & Support</span>
                    </button>
                    <button className={`flex items-center gap-3 w-full p-3 rounded-xl ${isLight ? "text-red-600 hover:bg-red-100/60" : "text-red-400 hover:bg-red-500/15"} transition-all`}>
                      <LogOut className="w-5 h-5" />
                      <span className="font-medium">Log out</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={feedbackModalOpen}
        onClose={() => setFeedbackModalOpen(false)}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
      />
    </>
  );
}
