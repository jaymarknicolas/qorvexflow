"use client";

import { useState } from "react";
import { Layout, Grid, Columns, Rows, X, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export type LayoutType = "grid-5" | "grid-4" | "grid-6" | "asymmetric" | "focus" | "kanban";

interface LayoutOption {
  id: LayoutType;
  name: string;
  description: string;
  icon: React.ElementType;
  preview: string;
  slots: number;
  grid: string;
}

const LAYOUT_OPTIONS: LayoutOption[] = [
  {
    id: "grid-5",
    name: "Classic Grid",
    description: "2x2 top, 3 bottom - balanced layout",
    icon: Grid,
    preview: "2 large + 3 medium",
    slots: 5,
    grid: "2-2-3",
  },
  {
    id: "grid-4",
    name: "Quad Grid",
    description: "Perfect 2x2 symmetrical grid",
    icon: Layout,
    preview: "4 equal squares",
    slots: 4,
    grid: "2-2",
  },
  {
    id: "grid-6",
    name: "Hexagon",
    description: "3x3 grid with 6 active slots",
    icon: Grid,
    preview: "3 top + 3 bottom",
    slots: 6,
    grid: "3-3",
  },
  {
    id: "asymmetric",
    name: "Asymmetric",
    description: "1 large + 4 small for focused work",
    icon: Columns,
    preview: "1 hero + 4 widgets",
    slots: 5,
    grid: "1-4",
  },
  {
    id: "focus",
    name: "Focus Mode",
    description: "Single large widget + sidebar",
    icon: Layout,
    preview: "1 main + 2 side",
    slots: 3,
    grid: "1-2",
  },
  {
    id: "kanban",
    name: "Kanban Board",
    description: "3 vertical columns for workflow",
    icon: Rows,
    preview: "3 tall columns",
    slots: 3,
    grid: "1-1-1",
  },
];

interface LayoutSelectorProps {
  currentLayout: LayoutType;
  onLayoutChange: (layout: LayoutType) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function LayoutSelector({
  currentLayout,
  onLayoutChange,
  isOpen,
  onClose,
}: LayoutSelectorProps) {
  const [hoveredLayout, setHoveredLayout] = useState<LayoutType | null>(null);

  const handleSelectLayout = (layoutId: LayoutType) => {
    onLayoutChange(layoutId);
    // Close after a short delay to show selection
    setTimeout(() => onClose(), 300);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative bg-linear-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-xl border border-white/20 rounded-3xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">
                  Choose Your Layout
                </h2>
                <p className="text-white/60 text-sm">
                  Select a workspace layout that matches your workflow
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-white/60" />
              </button>
            </div>

            {/* Layout Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {LAYOUT_OPTIONS.map((layout) => {
                const Icon = layout.icon;
                const isSelected = currentLayout === layout.id;
                const isHovered = hoveredLayout === layout.id;

                return (
                  <motion.button
                    key={layout.id}
                    onClick={() => handleSelectLayout(layout.id)}
                    onMouseEnter={() => setHoveredLayout(layout.id)}
                    onMouseLeave={() => setHoveredLayout(null)}
                    whileHover={{ scale: 1.02, y: -4 }}
                    whileTap={{ scale: 0.98 }}
                    className={`relative p-6 rounded-2xl border-2 transition-all duration-300 text-left ${
                      isSelected
                        ? "border-cyan-400 bg-cyan-500/10"
                        : "border-white/10 bg-white/5 hover:border-white/30"
                    }`}
                  >
                    {/* Selection Indicator */}
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-3 right-3 w-6 h-6 bg-cyan-400 rounded-full flex items-center justify-center"
                      >
                        <Check className="w-4 h-4 text-slate-900" />
                      </motion.div>
                    )}

                    {/* Icon */}
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors ${
                        isSelected || isHovered
                          ? "bg-cyan-400/20"
                          : "bg-white/10"
                      }`}
                    >
                      <Icon
                        className={`w-6 h-6 transition-colors ${
                          isSelected || isHovered
                            ? "text-cyan-400"
                            : "text-white/60"
                        }`}
                      />
                    </div>

                    {/* Content */}
                    <h3 className="text-lg font-bold text-white mb-1">
                      {layout.name}
                    </h3>
                    <p className="text-sm text-white/60 mb-3">
                      {layout.description}
                    </p>

                    {/* Preview */}
                    <div className="flex items-center gap-2 text-xs text-white/50">
                      <span className="px-2 py-1 bg-white/10 rounded">
                        {layout.preview}
                      </span>
                      <span>•</span>
                      <span>{layout.slots} widgets</span>
                    </div>

                    {/* Hover Effect */}
                    {isHovered && !isSelected && (
                      <motion.div
                        layoutId="hover-effect"
                        className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-2xl"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      />
                    )}
                  </motion.button>
                );
              })}
            </div>

            {/* Footer Info */}
            <div className="mt-8 p-4 bg-white/5 rounded-xl border border-white/10">
              <p className="text-sm text-white/60 text-center">
                💡 <span className="font-semibold">Pro tip:</span> You can switch
                layouts anytime without losing your widgets
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
