"use client";

import { useState, useCallback } from "react";
import {
  X,
  Send,
  Bug,
  Lightbulb,
  MessageSquare,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  ChevronDown,
} from "lucide-react";
import { useTheme } from "@/lib/contexts/theme-context";
import { motion, AnimatePresence } from "framer-motion";

type FeedbackType = "bug" | "feature" | "general";
type Priority = "low" | "medium" | "high" | "critical";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const feedbackTypes = [
  {
    id: "bug" as FeedbackType,
    label: "Bug Report",
    description: "Something isn't working",
    icon: Bug,
    color: "text-red-400",
    bg: "bg-red-500/20",
    border: "border-red-500/30",
  },
  {
    id: "feature" as FeedbackType,
    label: "Feature Request",
    description: "Suggest an improvement",
    icon: Lightbulb,
    color: "text-amber-400",
    bg: "bg-amber-500/20",
    border: "border-amber-500/30",
  },
  {
    id: "general" as FeedbackType,
    label: "General Feedback",
    description: "Share your thoughts",
    icon: MessageSquare,
    color: "text-blue-400",
    bg: "bg-blue-500/20",
    border: "border-blue-500/30",
  },
];

const priorities = [
  { id: "low" as Priority, label: "Low", color: "text-green-400", bg: "bg-green-500/20" },
  { id: "medium" as Priority, label: "Medium", color: "text-yellow-400", bg: "bg-yellow-500/20" },
  { id: "high" as Priority, label: "High", color: "text-orange-400", bg: "bg-orange-500/20" },
  { id: "critical" as Priority, label: "Critical", color: "text-red-400", bg: "bg-red-500/20" },
];

export default function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const { theme } = useTheme();

  // Form state
  const [feedbackType, setFeedbackType] = useState<FeedbackType>("general");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  // Theme colors
  const getThemeColors = useCallback(() => {
    switch (theme) {
      case "ghibli":
        return {
          gradient: "from-emerald-900/95 to-teal-900/95",
          accent: "text-emerald-400",
          accentBg: "bg-emerald-500/20",
          button: "from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500",
          buttonShadow: "shadow-emerald-500/25",
          border: "border-emerald-500/20",
          input: "bg-emerald-950/50 border-emerald-500/20 focus:border-emerald-400/50",
          ring: "focus:ring-emerald-500/30",
        };
      case "coffeeshop":
        return {
          gradient: "from-stone-900/95 to-amber-950/95",
          accent: "text-amber-400",
          accentBg: "bg-amber-500/20",
          button: "from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500",
          buttonShadow: "shadow-amber-500/25",
          border: "border-amber-500/20",
          input: "bg-stone-950/50 border-amber-500/20 focus:border-amber-400/50",
          ring: "focus:ring-amber-500/30",
        };
      default:
        return {
          gradient: "from-indigo-900/95 to-purple-900/95",
          accent: "text-violet-400",
          accentBg: "bg-violet-500/20",
          button: "from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500",
          buttonShadow: "shadow-violet-500/25",
          border: "border-violet-500/20",
          input: "bg-indigo-950/50 border-violet-500/20 focus:border-violet-400/50",
          ring: "focus:ring-violet-500/30",
        };
    }
  }, [theme]);

  const colors = getThemeColors();

  const resetForm = () => {
    setFeedbackType("general");
    setTitle("");
    setDescription("");
    setEmail("");
    setPriority("medium");
    setSubmitStatus("idle");
    setErrorMessage("");
  };

  const handleClose = () => {
    if (!isSubmitting) {
      resetForm();
      onClose();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !description.trim()) {
      setErrorMessage("Please fill in the title and description");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: feedbackType,
          title: title.trim(),
          description: description.trim(),
          email: email.trim() || undefined,
          priority: feedbackType === "bug" ? priority : undefined,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send feedback");
      }

      setSubmitStatus("success");

      // Auto close after success
      setTimeout(() => {
        handleClose();
      }, 3500);
    } catch (error) {
      setSubmitStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedType = feedbackTypes.find((t) => t.id === feedbackType)!;
  const selectedPriority = priorities.find((p) => p.id === priority)!;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200]"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-4 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-lg z-[201] flex items-center justify-center"
          >
            <div
              className={`theme-modal w-full max-h-[90vh] overflow-hidden backdrop-blur-xl rounded-2xl border shadow-2xl flex flex-col`}
            >
              {/* Header */}
              <div className="flex-shrink-0 flex items-center justify-between p-4 sm:p-5 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${selectedType.bg}`}>
                    <selectedType.icon className={`w-5 h-5 ${selectedType.color}`} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">Send Feedback</h2>
                    <p className="text-xs text-white/50">Help us improve Qorvex</p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Success State */}
              {submitStatus === "success" ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", damping: 15 }}
                    className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-4"
                  >
                    <CheckCircle2 className="w-8 h-8 text-green-400" />
                  </motion.div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    Feedback Sent!
                  </h3>
                  <p className="text-white/60 text-sm max-w-xs">
                    Your message has been received. We read every piece of feedback and it directly shapes how Qorvex evolves. Thank you for helping us improve.
                  </p>
                </div>
              ) : (
                /* Form */
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
                  {/* Feedback Type Selection */}
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      Feedback Type
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {feedbackTypes.map((type) => (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => setFeedbackType(type.id)}
                          className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all ${
                            feedbackType === type.id
                              ? `${type.bg} ${type.border} ${type.color}`
                              : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white"
                          }`}
                        >
                          <type.icon className="w-5 h-5" />
                          <span className="text-xs font-medium">{type.label.split(" ")[0]}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Priority (Bug only) */}
                  {feedbackType === "bug" && (
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-2">
                        Priority
                      </label>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setShowPriorityDropdown(!showPriorityDropdown)}
                          className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl ${colors.input} border text-white transition-all`}
                        >
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${selectedPriority.bg}`} />
                            <span>{selectedPriority.label}</span>
                          </div>
                          <ChevronDown
                            className={`w-4 h-4 text-white/50 transition-transform ${
                              showPriorityDropdown ? "rotate-180" : ""
                            }`}
                          />
                        </button>

                        {showPriorityDropdown && (
                          <>
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() => setShowPriorityDropdown(false)}
                            />
                            <div className="absolute top-full left-0 right-0 mt-1 z-20 dropdown-menu-content backdrop-blur-xl border rounded-xl overflow-hidden shadow-xl">
                              {priorities.map((p) => (
                                <button
                                  key={p.id}
                                  type="button"
                                  onClick={() => {
                                    setPriority(p.id);
                                    setShowPriorityDropdown(false);
                                  }}
                                  className={`w-full flex items-center gap-2 px-4 py-2.5 text-left hover:bg-white/10 transition-colors ${
                                    priority === p.id ? p.color : "text-white/70"
                                  }`}
                                >
                                  <span className={`w-2 h-2 rounded-full ${p.bg}`} />
                                  {p.label}
                                </button>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      Title <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder={
                        feedbackType === "bug"
                          ? "e.g., Widget not loading correctly"
                          : feedbackType === "feature"
                            ? "e.g., Add dark mode support"
                            : "Brief summary of your feedback"
                      }
                      className={`w-full px-4 py-2.5 rounded-xl ${colors.input} border text-white placeholder-white/30 transition-all focus:outline-none focus:ring-2 ${colors.ring}`}
                      maxLength={100}
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      Description <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder={
                        feedbackType === "bug"
                          ? "Please describe the issue in detail. What were you doing when it happened? What did you expect to happen?"
                          : feedbackType === "feature"
                            ? "Describe the feature you'd like to see. How would it help you?"
                            : "Share your thoughts, suggestions, or anything else you'd like us to know."
                      }
                      rows={4}
                      className={`w-full px-4 py-2.5 rounded-xl ${colors.input} border text-white placeholder-white/30 transition-all focus:outline-none focus:ring-2 ${colors.ring} resize-none`}
                      maxLength={1000}
                    />
                    <p className="text-xs text-white/40 mt-1 text-right">
                      {description.length}/1000
                    </p>
                  </div>

                  {/* Email (Optional) */}
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      Email <span className="text-white/40">(optional)</span>
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com - for follow-up"
                      className={`w-full px-4 py-2.5 rounded-xl ${colors.input} border text-white placeholder-white/30 transition-all focus:outline-none focus:ring-2 ${colors.ring}`}
                    />
                  </div>

                  {/* Error Message */}
                  {errorMessage && (
                    <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                      <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}
                </form>
              )}

              {/* Footer */}
              {submitStatus !== "success" && (
                <div className="flex-shrink-0 flex items-center justify-between gap-3 p-4 sm:p-5 border-t border-white/10 bg-black/20">
                  <p className="text-xs text-white/40 hidden sm:block">
                    Your feedback helps us improve
                  </p>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={handleClose}
                      disabled={isSubmitting}
                      className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white font-medium transition-all disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={isSubmitting || !title.trim() || !description.trim()}
                      className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r ${colors.button} text-white rounded-xl font-medium transition-all shadow-lg ${colors.buttonShadow} disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Sending...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Send Feedback</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
