"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";

const ONBOARDING_STORAGE_KEY = "qorvexflow-onboarding-completed";

interface OnboardingStep {
  id: string;
  target: string; // data-onboarding attribute value
  title: string;
  description: string;
  placement: "top" | "bottom" | "left" | "right" | "center";
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: "welcome",
    target: "welcome",
    title: "Welcome to Qorvexflow!",
    description:
      "Your personal productivity dashboard. Let's take a quick tour to get you started.",
    placement: "center",
  },
  {
    id: "widget-sidebar",
    target: "widget-sidebar",
    title: "Your Widget Toolbox",
    description:
      "Click this button to browse all available widgets — timers, tasks, music, notes, and more. Drag any widget onto your workspace.",
    placement: "right",
  },
  {
    id: "workspace",
    target: "workspace",
    title: "Your Workspace",
    description:
      "This is your canvas. Drop widgets into empty slots and drag them around to rearrange. Each slot holds one widget.",
    placement: "top",
  },
  {
    id: "layout-selector",
    target: "layout-selector",
    title: "Choose Your Layout",
    description:
      "Switch between different grid layouts — classic, quad, focus mode, kanban, and more. Find the arrangement that works best for you.",
    placement: "bottom",
  },
  {
    id: "theme-selector",
    target: "theme-selector",
    title: "Personalize Your Theme",
    description:
      "Pick from Lo-Fi Night, Studio Ghibli, or Coffee Shop themes. Each comes with unique colors and vibes.",
    placement: "bottom",
  },
  {
    id: "widget-actions",
    target: "widget-actions",
    title: "Widget Controls",
    description:
      "Hover over any widget to reveal controls — settings, maximize, copy, drag, or remove. Right where you need them.",
    placement: "top",
  },
  {
    id: "settings",
    target: "settings",
    title: "Fine-tune Everything",
    description:
      "Adjust color mode, performance, accessibility, and Picture-in-Picture settings. You can also restart this tour from here anytime.",
    placement: "bottom",
  },
];

interface OnboardingContextType {
  isActive: boolean;
  currentStep: number;
  steps: OnboardingStep[];
  startTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  skipTour: () => void;
  hasCompleted: boolean;
}

const OnboardingContext = createContext<OnboardingContextType | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasCompleted, setHasCompleted] = useState(true); // default true to prevent flash
  const [hasMounted, setHasMounted] = useState(false);

  // Check localStorage on mount
  useEffect(() => {
    setHasMounted(true);
    const completed = localStorage.getItem(ONBOARDING_STORAGE_KEY);
    if (completed === "true") {
      setHasCompleted(true);
    } else {
      setHasCompleted(false);
      // Auto-start for first-time users after a short delay
      const timer = setTimeout(() => {
        setIsActive(true);
        setCurrentStep(0);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const markCompleted = useCallback(() => {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, "true");
    setHasCompleted(true);
  }, []);

  const startTour = useCallback(() => {
    setCurrentStep(0);
    setIsActive(true);
  }, []);

  const nextStep = useCallback(() => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      // Tour finished
      setIsActive(false);
      markCompleted();
    }
  }, [currentStep, markCompleted]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  const skipTour = useCallback(() => {
    setIsActive(false);
    markCompleted();
  }, [markCompleted]);

  return (
    <OnboardingContext.Provider
      value={{
        isActive,
        currentStep,
        steps: ONBOARDING_STEPS,
        startTour,
        nextStep,
        prevStep,
        skipTour,
        hasCompleted,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error("useOnboarding must be used within an OnboardingProvider");
  }
  return context;
}
