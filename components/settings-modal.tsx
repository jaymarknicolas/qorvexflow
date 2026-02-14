"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Sun,
  Moon,
  Monitor,
  Zap,
  Video,
  VideoOff,
  Sparkles,
  Eye,
  Layers,
  Check,
  RotateCcw,
  Settings,
  Download,
  ExternalLink,
} from "lucide-react";
import {
  useAppSettings,
  type ColorScheme,
} from "@/lib/contexts/app-settings-context";
import { useTheme } from "@/lib/contexts/theme-context";
import { useOnboarding } from "@/lib/contexts/onboarding-context";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const {
    settings,
    updateSettings,
    isLowSpecMode,
    enableLowSpecMode,
    disableLowSpecMode,
    effectiveColorScheme,
  } = useAppSettings();
  const { theme, setTheme } = useTheme();
  const { startTour } = useOnboarding();

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
  };

  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const colorSchemeOptions: {
    id: ColorScheme;
    label: string;
    icon: React.ReactNode;
    description: string;
  }[] = [
    {
      id: "light",
      label: "Light",
      icon: <Sun className="w-4 h-4" />,
      description: "Light background, easy on RAM",
    },
    {
      id: "dark",
      label: "Dark",
      icon: <Moon className="w-4 h-4" />,
      description: "Dark background with effects",
    },
    {
      id: "system",
      label: "System",
      icon: <Monitor className="w-4 h-4" />,
      description: "Follow system preference",
    },
  ];

  const themeOptions = [
    {
      id: "lofi" as const,
      label: "Lo-Fi Night",
      emoji: "🎵",
      description: "Purple & pink vibes",
      gradient: "from-violet-500 to-pink-500",
    },
    {
      id: "ghibli" as const,
      label: "Studio Ghibli",
      emoji: "🌿",
      description: "Nature & warmth",
      gradient: "from-green-500 to-amber-500",
    },
    {
      id: "coffeeshop" as const,
      label: "Coffee Shop",
      emoji: "☕",
      description: "Warm & cozy",
      gradient: "from-amber-500 to-amber-800",
    },
  ];

  // Get theme-aware colors
  const getAccentColor = () => {
    if (theme === "ghibli") return "bg-green-500";
    if (theme === "coffeeshop") return "bg-amber-500";
    return "bg-violet-500";
  };

  const getAccentRing = () => {
    if (theme === "ghibli") return "ring-green-500/50";
    if (theme === "coffeeshop") return "ring-amber-500/50";
    return "ring-violet-500/50";
  };

  const getAccentText = () => {
    if (theme === "ghibli") return "text-green-400";
    if (theme === "coffeeshop") return "text-amber-400";
    return "text-violet-400";
  };

  const getGradientButton = () => {
    if (theme === "ghibli")
      return "from-green-500 to-amber-500 hover:from-green-400 hover:to-amber-400 shadow-green-500/20";
    if (theme === "coffeeshop")
      return "from-amber-500 to-amber-700 hover:from-amber-400 hover:to-amber-600 shadow-amber-500/20";
    return "from-violet-500 to-pink-500 hover:from-violet-400 hover:to-pink-400 shadow-violet-500/20";
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleBackdropClick}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            style={{ zIndex: 9998 }}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 flex items-center justify-center p-4 pointer-events-none"
            style={{ zIndex: 9999 }}
          >
            <div
              onClick={handleModalClick}
              className="pointer-events-auto bg-gradient-to-br from-slate-900 to-slate-800 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl w-full max-w-md max-h-[85vh] sm:max-h-[90vh] overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/10 flex-shrink-0">
                <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                  <Settings className={`w-5 h-5 ${getAccentText()}`} />
                  Settings
                </h2>
                <TooltipProvider delayDuration={300}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        aria-label="Close"
                      >
                        <X className="w-5 h-5 text-white/60 hover:text-white" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Close</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              {/* Content - Scrollable */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
                <div className="space-y-6">
                  {/* Low-Spec Mode Quick Toggle */}
                  <div
                    className={cn(
                      "p-4 rounded-xl border transition-all",
                      isLowSpecMode
                        ? "bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/30"
                        : "bg-white/5 border-white/10 hover:border-white/20",
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center",
                            isLowSpecMode ? "bg-green-500/30" : "bg-white/10",
                          )}
                        >
                          <Zap
                            className={cn(
                              "w-5 h-5",
                              isLowSpecMode
                                ? "text-green-400"
                                : "text-white/60",
                            )}
                          />
                        </div>
                        <div>
                          <p className="font-semibold text-white">
                            Low-Spec Mode
                          </p>
                          <p className="text-xs text-white/50">
                            Best for multitasking & low RAM
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          isLowSpecMode
                            ? disableLowSpecMode()
                            : enableLowSpecMode()
                        }
                        className={cn(
                          "relative w-12 h-7 rounded-full transition-all duration-200",
                          isLowSpecMode ? "bg-green-500" : "bg-white/20",
                        )}
                      >
                        <span
                          className={cn(
                            "absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-200",
                            isLowSpecMode ? "left-6" : "left-1",
                          )}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Appearance Section */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      Appearance
                    </h3>

                    {/* Color Mode */}
                    <div className="space-y-2">
                      <label className="text-sm text-white/70">
                        Color Mode
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {colorSchemeOptions.map((option) => (
                          <button
                            key={option.id}
                            onClick={() =>
                              updateSettings({ colorScheme: option.id })
                            }
                            className={cn(
                              "flex flex-col items-center gap-2 p-3 rounded-xl border transition-all",
                              settings.colorScheme === option.id
                                ? `bg-gradient-to-br from-white/15 to-white/5 border-white/30 ring-2 ${getAccentRing()}`
                                : "bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10",
                            )}
                          >
                            <div
                              className={cn(
                                "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                                settings.colorScheme === option.id
                                  ? getAccentColor()
                                  : "bg-white/10 text-white",
                              )}
                            >
                              {option.icon}
                            </div>
                            <span className="text-xs font-medium text-white">
                              {option.label}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Theme Selection */}
                    <div className="space-y-2">
                      <label className="text-sm text-white/70">
                        Color Theme
                      </label>
                      <div className="space-y-2">
                        {themeOptions.map((option) => (
                          <button
                            key={option.id}
                            onClick={() => setTheme(option.id)}
                            className={cn(
                              "flex items-center gap-3 w-full p-3 rounded-xl border transition-all",
                              theme === option.id
                                ? "bg-gradient-to-r from-white/15 to-white/5 border-white/30"
                                : "bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10",
                            )}
                          >
                            <div
                              className={`w-10 h-10 rounded-lg bg-gradient-to-br ${option.gradient} flex items-center justify-center text-lg`}
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
                              <Check className={`w-5 h-5 ${getAccentText()}`} />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Performance Section */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      Performance
                    </h3>

                    {/* Video Background Toggle */}
                    <label className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
                      <div className="flex items-center gap-3">
                        {settings.videoBackgroundEnabled ? (
                          <Video className="w-5 h-5 text-white/60" />
                        ) : (
                          <VideoOff className="w-5 h-5 text-white/60" />
                        )}
                        <div>
                          <p className="text-sm font-medium text-white">
                            Video Background
                          </p>
                          <p className="text-xs text-white/50">
                            Uses more RAM when enabled
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          updateSettings({
                            videoBackgroundEnabled:
                              !settings.videoBackgroundEnabled,
                          })
                        }
                        className={cn(
                          "relative w-12 h-7 rounded-full transition-all duration-200",
                          settings.videoBackgroundEnabled
                            ? getAccentColor()
                            : "bg-white/20",
                        )}
                      >
                        <span
                          className={cn(
                            "absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-200",
                            settings.videoBackgroundEnabled
                              ? "left-6"
                              : "left-1",
                          )}
                        />
                      </button>
                    </label>

                    {/* Reduced Motion Toggle */}
                    <label className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
                      <div className="flex items-center gap-3">
                        <Sparkles className="w-5 h-5 text-white/60" />
                        <div>
                          <p className="text-sm font-medium text-white">
                            Reduced Motion
                          </p>
                          <p className="text-xs text-white/50">
                            Disable animations
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          updateSettings({
                            reducedMotion: !settings.reducedMotion,
                          })
                        }
                        className={cn(
                          "relative w-12 h-7 rounded-full transition-all duration-200",
                          settings.reducedMotion
                            ? getAccentColor()
                            : "bg-white/20",
                        )}
                      >
                        <span
                          className={cn(
                            "absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-200",
                            settings.reducedMotion ? "left-6" : "left-1",
                          )}
                        />
                      </button>
                    </label>

                    {/* Reduced Transparency Toggle */}
                    <label className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
                      <div className="flex items-center gap-3">
                        <Layers className="w-5 h-5 text-white/60" />
                        <div>
                          <p className="text-sm font-medium text-white">
                            Reduced Transparency
                          </p>
                          <p className="text-xs text-white/50">
                            Disable blur effects
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          updateSettings({
                            reducedTransparency: !settings.reducedTransparency,
                          })
                        }
                        className={cn(
                          "relative w-12 h-7 rounded-full transition-all duration-200",
                          settings.reducedTransparency
                            ? getAccentColor()
                            : "bg-white/20",
                        )}
                      >
                        <span
                          className={cn(
                            "absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-200",
                            settings.reducedTransparency ? "left-6" : "left-1",
                          )}
                        />
                      </button>
                    </label>
                  </div>

                  {/* Picture-in-Picture Section */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider flex items-center gap-2">
                      <Monitor className="w-4 h-4" />
                      Picture-in-Picture
                    </h3>

                    <label className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
                      <div className="flex items-center gap-3">
                        <Monitor className="w-5 h-5 text-white/60" />
                        <div>
                          <p className="text-sm font-medium text-white">
                            Auto Picture-in-Picture
                          </p>
                          <p className="text-xs text-white/50">
                            Show floating widgets when you leave the tab
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          updateSettings({
                            pipEnabled: !settings.pipEnabled,
                          })
                        }
                        className={cn(
                          "relative w-12 h-7 rounded-full transition-all duration-200",
                          settings.pipEnabled
                            ? getAccentColor()
                            : "bg-white/20",
                        )}
                      >
                        <span
                          className={cn(
                            "absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-200",
                            settings.pipEnabled ? "left-6" : "left-1",
                          )}
                        />
                      </button>
                    </label>
                  </div>

                  {/* Extensions Section */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      Extensions
                    </h3>

                    {/* Chrome Extension */}
                    <div className="p-4 rounded-xl bg-gradient-to-r from-white/5 to-white/[0.02] border border-white/10">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center flex-shrink-0">
                          <svg
                            className="w-7 h-7 text-white"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.2" />
                            <circle cx="12" cy="12" r="4" fill="currentColor" />
                            <path
                              d="M21.17 8H14.5a2 2 0 0 0-2 2v0a2 2 0 0 0 2 2h.84"
                              stroke="currentColor"
                              strokeWidth="2"
                              fill="none"
                            />
                            <path
                              d="M8 21.17v-6.67a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v.84"
                              stroke="currentColor"
                              strokeWidth="2"
                              fill="none"
                            />
                            <path
                              d="M2.83 16h6.67a2 2 0 0 0 2-2v0a2 2 0 0 0-2-2H8.66"
                              stroke="currentColor"
                              strokeWidth="2"
                              fill="none"
                            />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-white mb-1">
                            Chrome New Tab Extension
                          </h4>
                          <p className="text-xs text-white/50 mb-3">
                            Replace your new tab page with QorvexFlow for quick access to your productivity feed.
                          </p>
                          <div className="flex flex-wrap gap-2">
                            <a
                              href="/chrome-extension.zip"
                              download="qorvexflow-chrome-extension.zip"
                              className={cn(
                                "inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg transition-all shadow-lg",
                                `bg-gradient-to-r ${getGradientButton()}`
                              )}
                            >
                              <Download className="w-4 h-4" />
                              Download
                            </a>
                            <a
                              href="https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world#load-unpacked"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white/70 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-all border border-white/10"
                            >
                              <ExternalLink className="w-4 h-4" />
                              How to Install
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Onboarding Tour */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      Guide
                    </h3>
                    <button
                      onClick={() => {
                        onClose();
                        setTimeout(() => startTour(), 300);
                      }}
                      className={cn(
                        "flex items-center gap-3 w-full p-3 rounded-xl border transition-all",
                        "bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10",
                      )}
                    >
                      <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", `bg-gradient-to-br ${getGradientButton().split(" ")[0]} ${getGradientButton().split(" ")[1]}`)}>
                        <Sparkles className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-medium text-white">Restart Tour</div>
                        <div className="text-xs text-white/50">
                          Replay the onboarding walkthrough
                        </div>
                      </div>
                    </button>
                  </div>

                  {/* Current Configuration */}
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-xs text-white/40 mb-2">
                      Current configuration
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span
                        className={cn(
                          "px-2 py-1 text-xs rounded-full",
                          effectiveColorScheme === "light"
                            ? "bg-yellow-500/20 text-yellow-400"
                            : "bg-indigo-500/20 text-indigo-400",
                        )}
                      >
                        {effectiveColorScheme === "light"
                          ? "☀️ Light"
                          : "🌙 Dark"}
                      </span>
                      <span className="px-2 py-1 text-xs rounded-full bg-white/10 text-white/70">
                        {themeOptions.find((t) => t.id === theme)?.emoji}{" "}
                        {themeOptions.find((t) => t.id === theme)?.label}
                      </span>
                      {!settings.videoBackgroundEnabled && (
                        <span className="px-2 py-1 text-xs rounded-full bg-orange-500/20 text-orange-400">
                          No Video
                        </span>
                      )}
                      {settings.reducedMotion && (
                        <span className="px-2 py-1 text-xs rounded-full bg-blue-500/20 text-blue-400">
                          No Animation
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 sm:p-6 border-t border-white/10 flex-shrink-0 bg-slate-900/50">
                <TooltipProvider delayDuration={300}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => {
                          updateSettings({
                            colorScheme: "dark",
                            videoBackgroundEnabled: true,
                            reducedMotion: false,
                            reducedTransparency: false,
                            performanceMode: "balanced",
                            pipEnabled: true,
                          });
                        }}
                        className="flex items-center justify-center gap-2 px-4 py-2 text-sm text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors order-2 sm:order-1"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Reset
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Reset to defaults</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <button
                  onClick={onClose}
                  className={cn(
                    "px-6 py-2 text-sm font-medium text-white rounded-lg transition-all shadow-lg order-1 sm:order-2",
                    `bg-gradient-to-r ${getGradientButton()}`,
                  )}
                >
                  Done
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
