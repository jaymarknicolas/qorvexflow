"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X, Sparkles, ArrowRight } from "lucide-react";
import { useOnboarding } from "@/lib/contexts/onboarding-context";
import { useTheme } from "@/lib/contexts/theme-context";

interface SpotlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export default function OnboardingOverlay() {
  const { isActive, currentStep, steps, nextStep, prevStep, skipTour } =
    useOnboarding();
  const { theme } = useTheme();
  const [spotlightRect, setSpotlightRect] = useState<SpotlightRect | null>(null);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
  const tooltipRef = useRef<HTMLDivElement>(null);

  const step = steps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;
  const isCenterStep = step?.placement === "center";

  // Theme-aware accent colors
  const getAccent = () => {
    if (theme === "ghibli")
      return {
        gradient: "from-green-500 to-amber-500",
        bg: "bg-green-500",
        text: "text-green-400",
        ring: "ring-green-500/30",
        progressBg: "bg-green-500",
        dotActive: "bg-green-400",
        dotInactive: "bg-green-400/30",
      };
    if (theme === "coffeeshop")
      return {
        gradient: "from-amber-500 to-orange-600",
        bg: "bg-amber-500",
        text: "text-amber-400",
        ring: "ring-amber-500/30",
        progressBg: "bg-amber-500",
        dotActive: "bg-amber-400",
        dotInactive: "bg-amber-400/30",
      };
    if (theme === "timebased")
      return {
        gradient: "from-sky-500 to-violet-500",
        bg: "bg-sky-500",
        text: "text-sky-400",
        ring: "ring-sky-500/30",
        progressBg: "bg-sky-500",
        dotActive: "bg-sky-400",
        dotInactive: "bg-sky-400/30",
      };
    if (theme === "weather")
      return {
        gradient: "from-slate-500 to-blue-500",
        bg: "bg-slate-500",
        text: "text-slate-400",
        ring: "ring-slate-500/30",
        progressBg: "bg-slate-500",
        dotActive: "bg-slate-400",
        dotInactive: "bg-slate-400/30",
      };
    return {
      gradient: "from-violet-500 to-pink-500",
      bg: "bg-violet-500",
      text: "text-violet-400",
      ring: "ring-violet-500/30",
      progressBg: "bg-violet-500",
      dotActive: "bg-violet-400",
      dotInactive: "bg-violet-400/30",
    };
  };

  const accent = getAccent();

  // Calculate spotlight position based on target element
  const updateSpotlight = useCallback(() => {
    if (!step || isCenterStep) {
      setSpotlightRect(null);
      return;
    }

    const target = document.querySelector(
      `[data-onboarding="${step.target}"]`
    ) as HTMLElement | null;

    if (!target) {
      setSpotlightRect(null);
      return;
    }

    const rect = target.getBoundingClientRect();
    const padding = 8;

    setSpotlightRect({
      top: rect.top - padding,
      left: rect.left - padding,
      width: rect.width + padding * 2,
      height: rect.height + padding * 2,
    });
  }, [step, isCenterStep]);

  // Update spotlight on step change and on scroll/resize
  useEffect(() => {
    if (!isActive) return;

    updateSpotlight();

    window.addEventListener("resize", updateSpotlight);
    window.addEventListener("scroll", updateSpotlight, true);

    return () => {
      window.removeEventListener("resize", updateSpotlight);
      window.removeEventListener("scroll", updateSpotlight, true);
    };
  }, [isActive, currentStep, updateSpotlight]);

  // Position tooltip relative to spotlight
  useEffect(() => {
    if (!isActive || !step) return;

    // Wait for render
    const raf = requestAnimationFrame(() => {
      if (isCenterStep) {
        setTooltipStyle({
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        });
        return;
      }

      if (!spotlightRect) return;

      const tooltipEl = tooltipRef.current;
      const tooltipWidth = tooltipEl?.offsetWidth || 380;
      const tooltipHeight = tooltipEl?.offsetHeight || 200;
      const gap = 16;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let top = 0;
      let left = 0;

      switch (step.placement) {
        case "bottom":
          top = spotlightRect.top + spotlightRect.height + gap;
          left = spotlightRect.left + spotlightRect.width / 2 - tooltipWidth / 2;
          break;
        case "top":
          top = spotlightRect.top - tooltipHeight - gap;
          left = spotlightRect.left + spotlightRect.width / 2 - tooltipWidth / 2;
          break;
        case "right":
          top = spotlightRect.top + spotlightRect.height / 2 - tooltipHeight / 2;
          left = spotlightRect.left + spotlightRect.width + gap;
          break;
        case "left":
          top = spotlightRect.top + spotlightRect.height / 2 - tooltipHeight / 2;
          left = spotlightRect.left - tooltipWidth - gap;
          break;
      }

      // Clamp within viewport
      left = Math.max(16, Math.min(left, viewportWidth - tooltipWidth - 16));
      top = Math.max(16, Math.min(top, viewportHeight - tooltipHeight - 16));

      setTooltipStyle({
        position: "fixed",
        top: `${top}px`,
        left: `${left}px`,
      });
    });

    return () => cancelAnimationFrame(raf);
  }, [isActive, step, isCenterStep, spotlightRect, currentStep]);

  // Keyboard navigation
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") skipTour();
      if (e.key === "ArrowRight" || e.key === "Enter") nextStep();
      if (e.key === "ArrowLeft") prevStep();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isActive, nextStep, prevStep, skipTour]);

  if (!isActive || !step) return null;

  // SVG mask for spotlight cutout
  const renderBackdrop = () => {
    if (isCenterStep) {
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm"
          style={{ zIndex: 10000 }}
        />
      );
    }

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0"
        style={{ zIndex: 10000 }}
      >
        <svg
          className="absolute inset-0 w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <mask id="spotlight-mask">
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              {spotlightRect && (
                <rect
                  x={spotlightRect.left}
                  y={spotlightRect.top}
                  width={spotlightRect.width}
                  height={spotlightRect.height}
                  rx="12"
                  fill="black"
                />
              )}
            </mask>
          </defs>
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="rgba(0,0,0,0.7)"
            mask="url(#spotlight-mask)"
          />
        </svg>

        {/* Spotlight border glow */}
        {spotlightRect && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`absolute rounded-xl ring-2 ${accent.ring} pointer-events-none`}
            style={{
              top: spotlightRect.top,
              left: spotlightRect.left,
              width: spotlightRect.width,
              height: spotlightRect.height,
            }}
          />
        )}
      </motion.div>
    );
  };

  return (
    <AnimatePresence mode="wait">
      {isActive && (
        <>
          {/* Backdrop with spotlight cutout */}
          {renderBackdrop()}

          {/* Tooltip card */}
          <motion.div
            ref={tooltipRef}
            key={step.id}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            style={{
              ...tooltipStyle,
              zIndex: 10001,
              width: isCenterStep ? "min(420px, 90vw)" : "min(380px, 85vw)",
            }}
            className="pointer-events-auto"
          >
            <div className="bg-slate-900/95 backdrop-blur-xl border border-white/15 rounded-2xl shadow-2xl overflow-hidden">
              {/* Decorative gradient bar */}
              <div
                className={`h-1 w-full bg-gradient-to-r ${accent.gradient}`}
              />

              <div className="p-5">
                {/* Welcome icon for first step */}
                {isCenterStep && (
                  <div className="flex justify-center mb-4">
                    <div
                      className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${accent.gradient} flex items-center justify-center shadow-lg`}
                    >
                      <Sparkles className="w-8 h-8 text-white" />
                    </div>
                  </div>
                )}

                {/* Step counter */}
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-xs font-medium ${accent.text}`}>
                    Step {currentStep + 1} of {steps.length}
                  </span>
                  <button
                    onClick={skipTour}
                    className="text-xs text-white/40 hover:text-white/70 transition-colors flex items-center gap-1"
                    aria-label="Skip tour"
                  >
                    Skip
                    <X className="w-3 h-3" />
                  </button>
                </div>

                {/* Title */}
                <h3
                  className={`text-lg font-bold text-white mb-2 ${
                    isCenterStep ? "text-center" : ""
                  }`}
                >
                  {step.title}
                </h3>

                {/* Description */}
                <p
                  className={`text-sm text-white/60 leading-relaxed mb-4 ${
                    isCenterStep ? "text-center" : ""
                  }`}
                >
                  {step.description}
                </p>

                {/* Progress dots */}
                <div className="flex items-center justify-center gap-1.5 mb-4">
                  {steps.map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        idx === currentStep
                          ? `w-6 ${accent.dotActive}`
                          : idx < currentStep
                            ? `w-1.5 ${accent.dotActive}`
                            : `w-1.5 ${accent.dotInactive}`
                      }`}
                    />
                  ))}
                </div>

                {/* Navigation buttons */}
                <div className="flex items-center gap-2">
                  {!isFirstStep && (
                    <button
                      onClick={prevStep}
                      className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Back
                    </button>
                  )}

                  <div className="flex-1" />

                  <button
                    onClick={nextStep}
                    className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white rounded-xl bg-gradient-to-r ${accent.gradient} hover:opacity-90 transition-opacity shadow-lg`}
                  >
                    {isFirstStep ? (
                      <>
                        Get Started
                        <ArrowRight className="w-4 h-4" />
                      </>
                    ) : isLastStep ? (
                      <>
                        Finish
                        <Sparkles className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        Next
                        <ChevronRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
