"use client";

import { X, Maximize2, Settings, Copy, Info } from "lucide-react";
import { useState } from "react";

interface WidgetActionsProps {
  onRemove: () => void;
  onDuplicate?: () => void;
  onMaximize?: () => void;
  onSettings?: () => void;
  showOnCanvasHover?: boolean;
}

export default function WidgetActions({
  onRemove,
  onDuplicate,
  onMaximize,
  onSettings,
  showOnCanvasHover = false,
}: WidgetActionsProps) {
  const [isInfoHovered, setIsInfoHovered] = useState(false);

  return (
    <div
      className="absolute top-2 right-2 z-20 flex items-center gap-1"
      onMouseEnter={() => setIsInfoHovered(true)}
      onMouseLeave={() => setIsInfoHovered(false)}
    >
      {/* Action Buttons - Fade in when info icon is hovered */}
      <div
        className={`flex items-center gap-1 transition-all duration-300 ${
          isInfoHovered
            ? "opacity-100 translate-x-0"
            : "opacity-0 translate-x-2 pointer-events-none"
        }`}
      >
        {/* Duplicate Widget */}
        {onDuplicate && (
          <button
            onClick={onDuplicate}
            className="h-7 w-7 rounded-lg bg-slate-700/80 backdrop-blur-sm border border-white/10 text-white/70 hover:text-cyan-400 hover:border-cyan-400/50 hover:bg-slate-700 transition-all duration-200 flex items-center justify-center group/btn"
            aria-label="Duplicate widget"
          >
            <Copy className="w-3.5 h-3.5 group-hover/btn:scale-110 transition-transform" />
          </button>
        )}

        {/* Maximize Widget */}
        {onMaximize && (
          <button
            onClick={onMaximize}
            className="h-7 w-7 rounded-lg bg-slate-700/80 backdrop-blur-sm border border-white/10 text-white/70 hover:text-blue-400 hover:border-blue-400/50 hover:bg-slate-700 transition-all duration-200 flex items-center justify-center group/btn"
            aria-label="Maximize widget"
          >
            <Maximize2 className="w-3.5 h-3.5 group-hover/btn:scale-110 transition-transform" />
          </button>
        )}

        {/* Settings */}
        {onSettings && (
          <button
            onClick={onSettings}
            className="h-7 w-7 rounded-lg bg-slate-700/80 backdrop-blur-sm border border-white/10 text-white/70 hover:text-purple-400 hover:border-purple-400/50 hover:bg-slate-700 transition-all duration-200 flex items-center justify-center group/btn"
            aria-label="Widget settings"
          >
            <Settings className="w-3.5 h-3.5 group-hover/btn:scale-110 transition-transform" />
          </button>
        )}

        {/* Remove Widget */}
        <button
          onClick={onRemove}
          className="h-7 w-7 rounded-lg bg-slate-700/80 backdrop-blur-sm border border-white/10 text-white/70 hover:text-red-400 hover:border-red-400/50 hover:bg-slate-700 transition-all duration-200 flex items-center justify-center group/btn"
          aria-label="Remove widget"
        >
          <X className="w-3.5 h-3.5 group-hover/btn:scale-110 transition-transform" />
        </button>
      </div>

      {/* Info Icon - Always visible, triggers actions on hover */}
      <div
        className={`h-7 w-7 rounded-lg bg-slate-700/80 backdrop-blur-sm border border-white/10 text-white/70 hover:text-cyan-400 hover:border-cyan-400/50 flex items-center justify-center transition-all duration-300 cursor-pointer ${
          showOnCanvasHover ? "group-hover:opacity-100 opacity-0" : "opacity-100"
        }`}
      >
        <Info className="w-3.5 h-3.5" />
      </div>
    </div>
  );
}
