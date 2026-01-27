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
import clsx from "clsx";
import { useTheme } from "@/lib/contexts/theme-context";
import { useLayout } from "@/lib/contexts/layout-context";
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
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

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
  const { theme, setTheme } = useTheme();
  const { layout, setLayout } = useLayout();

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

  // Theme-aware colors
  const getThemeColors = () => {
    if (theme === "ghibli") {
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
        mobileMenuBg: "bg-green-950/95",
      };
    }
    if (theme === "coffeeshop") {
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
        mobileMenuBg: "bg-stone-800/95",
      };
    }
    // Lo-Fi theme (default)
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
      mobileMenuBg: "bg-indigo-950/95",
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

  const layoutOptions = [
    {
      id: "grid-5",
      label: "Classic Grid",
      desc: "2 + 3 layout",
      icon: Grid2x2,
    },
    { id: "grid-4", label: "Quad Grid", desc: "2 × 2 layout", icon: Grid2x2 },
    { id: "grid-6", label: "Hexagon", desc: "3 × 2 layout", icon: Grid3x3 },
    {
      id: "asymmetric",
      label: "Asymmetric",
      desc: "1 + 4 layout",
      icon: Maximize,
    },
    { id: "focus", label: "Focus Mode", desc: "1 + 2 layout", icon: Target },
    { id: "kanban", label: "Kanban", desc: "3 columns", icon: Rows },
  ];

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
  ];

  return (
    <>
      <header
        className={clsx(
          "border-b backdrop-blur-xl sticky top-0 z-40 transition-all duration-300",
          scrolled
            ? `${colors.headerBg} shadow-lg shadow-black/20 border-white/10`
            : "bg-slate-950/50 border-white/5",
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
                  <span className="text-[10px] text-white/40 font-medium tracking-wider">
                    PRODUCTIVITY FLOW
                  </span>
                </div>
              </div>

              {/* Desktop Navigation */}
              <nav className="hidden lg:flex items-center gap-1">
                {upcomingFeatures.map((item) => (
                  <DropdownMenu key={item.label}>
                    <DropdownMenuTrigger asChild>
                      <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-white/70 hover:text-white hover:bg-white/5 transition-all text-sm font-medium group">
                        {item.icon}
                        <span>{item.label}</span>
                        <ChevronRight className="w-3 h-3 opacity-50 group-hover:opacity-100 transition-opacity rotate-90" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="start"
                      className="w-72 z-[999] fuck"
                    >
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
              {/* Layout Selector - Desktop */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className={`hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg ${colors.surfaceBg} border ${colors.surfaceBorder} text-white ${colors.surfaceHover} transition-all`}
                  >
                    <Layout className={`w-4 h-4 ${colors.primaryAccent}`} />
                    <span className="text-sm font-medium hidden md:inline">
                      {layoutOptions.find((l) => l.id === layout)?.label ||
                        "Layout"}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 z-[999]">
                  <DropdownMenuLabel>Select Layout</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {layoutOptions.map((option) => (
                    <DropdownMenuItem
                      key={option.id}
                      onClick={() => setLayout(option.id as any)}
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
                    className={`hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg ${colors.surfaceBg} border ${colors.surfaceBorder} text-white ${colors.surfaceHover} transition-all`}
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
              <button
                onClick={() => setFeedbackModalOpen(true)}
                className={`hidden lg:flex items-center justify-center gap-2 px-3 py-2 rounded-lg ${colors.surfaceBg} border ${colors.surfaceBorder} text-white/60 hover:text-white ${colors.surfaceHover} transition-all`}
                title="Send Feedback"
              >
                <MessageSquarePlus className="w-4 h-4" />
              </button>

              {/* Notifications - Desktop */}
              <button
                className={`hidden lg:flex items-center justify-center w-10 h-10 rounded-lg ${colors.surfaceBg} border ${colors.surfaceBorder} text-white/60 hover:text-white ${colors.surfaceHover} transition-all relative`}
              >
                <Bell className="w-4 h-4" />
                <span
                  className={`absolute top-2 right-2 w-2 h-2 rounded-full animate-pulse bg-gradient-to-r ${colors.buttonGradient}`}
                />
              </button>

              {/* User Profile */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative w-10 h-10 rounded-full p-0 overflow-hidden group"
                  >
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${colors.logoGradient} opacity-90 group-hover:opacity-100 transition-opacity`}
                    />
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${colors.logoGradient} blur-lg opacity-0 group-hover:opacity-50 transition-opacity`}
                    />
                    <User2 className="relative w-5 h-5 text-white" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 z-[999]" align="end">
                  <div className="px-3 py-3 border-b border-white/10">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full bg-gradient-to-br ${colors.logoGradient} flex items-center justify-center`}
                      >
                        <User2 className="w-5 h-5 text-white" />
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
                    <DropdownMenuItem className="cursor-pointer">
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
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`lg:hidden flex items-center justify-center w-10 h-10 rounded-lg ${colors.surfaceBg} border ${colors.surfaceBorder} text-white ${colors.surfaceHover} transition-all`}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
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
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className={`fixed top-0 right-0 bottom-0 w-full max-w-sm ${colors.mobileMenuBg} backdrop-blur-xl border-l border-white/10 z-[101] lg:hidden overflow-y-auto`}
            >
              {/* Mobile Menu Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-lg bg-gradient-to-br ${colors.logoGradient} flex items-center justify-center`}
                  >
                    <span className="text-white font-bold text-sm">Q</span>
                  </div>
                  <span
                    className={`text-lg font-bold bg-gradient-to-r ${colors.textGradient} bg-clip-text text-transparent`}
                  >
                    QORVEX
                  </span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className={`p-2 rounded-lg ${colors.surfaceBg} text-white/60 hover:text-white ${colors.surfaceHover} transition-all`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Menu Content */}
              <div className="p-4 space-y-6">
                {/* Layout Selection */}
                <div>
                  <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3 px-2">
                    Layout
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {layoutOptions.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => {
                          setLayout(option.id as any);
                          setMobileMenuOpen(false);
                        }}
                        className={clsx(
                          "flex flex-col items-center gap-2 p-3 rounded-xl border transition-all",
                          layout === option.id
                            ? `bg-gradient-to-br ${colors.badgeBg} ${colors.badgeBorder} text-white`
                            : `${colors.surfaceBg} ${colors.surfaceBorder} text-white/60 ${colors.surfaceHover} hover:text-white`,
                        )}
                      >
                        <option.icon className="w-5 h-5" />
                        <span className="text-xs font-medium">
                          {option.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Theme Selection */}
                <div>
                  <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3 px-2">
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
                            ? `bg-gradient-to-r ${colors.badgeBg} ${colors.badgeBorder}`
                            : `${colors.surfaceBg} ${colors.surfaceBorder} ${colors.surfaceHover}`,
                        )}
                      >
                        <div
                          className={`w-10 h-10 rounded-lg bg-gradient-to-br ${option.gradient} flex items-center justify-center text-xl`}
                        >
                          {option.emoji}
                        </div>
                        <div className="flex-1 text-left">
                          <div className="font-medium text-white">
                            {option.label}
                          </div>
                          <div className="text-xs text-white/50">
                            {option.description}
                          </div>
                        </div>
                        {theme === option.id && (
                          <Check
                            className={`w-4 h-4 ${colors.primaryAccent}`}
                          />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Upcoming Features */}
                <div>
                  <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3 px-2">
                    Coming Soon
                  </h3>
                  <div className="space-y-1">
                    {upcomingFeatures.map((category) => (
                      <div key={category.label} className="mb-4">
                        <div className="flex items-center gap-2 px-2 mb-2 text-white/60">
                          {category.icon}
                          <span className="text-sm font-medium">
                            {category.label}
                          </span>
                        </div>
                        <div className="space-y-1">
                          {category.subItems?.map((item) => (
                            <div
                              key={item.label}
                              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg ${colors.surfaceBg} border ${colors.surfaceBorder}`}
                            >
                              {item.icon}
                              <div className="flex-1">
                                <div className="text-sm font-medium text-white">
                                  {item.label}
                                </div>
                                <div className="text-xs text-white/40">
                                  {item.description}
                                </div>
                              </div>
                              <span
                                className={`px-2 py-0.5 text-[10px] font-semibold bg-gradient-to-r ${colors.badgeBg} ${colors.badgeText} rounded-full`}
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
                <div className="border-t border-white/10 pt-4">
                  <div className="space-y-1">
                    <button
                      className={`flex items-center gap-3 w-full p-3 rounded-xl text-white/60 hover:text-white ${colors.surfaceHover} transition-all`}
                    >
                      <User2 className="w-5 h-5" />
                      <span className="font-medium">Profile</span>
                    </button>
                    <button
                      className={`flex items-center gap-3 w-full p-3 rounded-xl text-white/60 hover:text-white ${colors.surfaceHover} transition-all`}
                    >
                      <Settings className="w-5 h-5" />
                      <span className="font-medium">Settings</span>
                    </button>
                    <button
                      onClick={() => {
                        setFeedbackModalOpen(true);
                        setMobileMenuOpen(false);
                      }}
                      className={`flex items-center gap-3 w-full p-3 rounded-xl text-white/60 hover:text-white ${colors.surfaceHover} transition-all`}
                    >
                      <MessageSquarePlus className="w-5 h-5" />
                      <span className="font-medium">Send Feedback</span>
                    </button>
                    <button
                      className={`flex items-center gap-3 w-full p-3 rounded-xl text-white/60 hover:text-white ${colors.surfaceHover} transition-all`}
                    >
                      <HelpCircle className="w-5 h-5" />
                      <span className="font-medium">Help & Support</span>
                    </button>
                    <button className="flex items-center gap-3 w-full p-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all">
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
    </>
  );
}
