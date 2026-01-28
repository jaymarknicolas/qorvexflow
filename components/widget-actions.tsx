"use client";

import {
  X,
  Maximize2,
  // Settings,
  Copy,
  Info,
  RotateCcw,
  HelpCircle,
  Check,
  GripVertical,
} from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { WidgetType } from "@/types";

interface WidgetActionsProps {
  widgetType: WidgetType;
  slotId?: string;
  onRemove: () => void;
  onCopy: () => void;
  onMaximize: () => void;
  onResetSettings?: () => void;
  showOnCanvasHover?: boolean;
  dragHandleProps?: any;
}

export default function WidgetActions({
  widgetType,
  slotId,
  onRemove,
  onCopy,
  onMaximize,
  onResetSettings,
  showOnCanvasHover = false,
  dragHandleProps,
}: WidgetActionsProps) {
  const [isInfoHovered, setIsInfoHovered] = useState(false);
  const [showCopyFeedback, setShowCopyFeedback] = useState(false);

  const handleCopy = () => {
    onCopy();
    setShowCopyFeedback(true);
    setTimeout(() => setShowCopyFeedback(false), 1500);
  };

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
            ? "opacity-100 translate-x-0 w-auto"
            : "opacity-0 translate-x-2 pointer-events-none w-0"
        }`}
      >
        {/* Drag Handle */}
        <div
          {...dragHandleProps}
          data-drag-handle={slotId}
          data-widget-type={widgetType}
          className="h-7 w-7 rounded-lg bg-slate-700/80 backdrop-blur-sm border border-white/10 text-white/70 hover:text-green-400 hover:border-green-400/50 hover:bg-slate-700 transition-all duration-200 flex items-center justify-center cursor-move group/btn"
          aria-label="Drag to move widget"
        >
          <GripVertical className="w-3.5 h-3.5 group-hover/btn:scale-110 transition-transform" />
        </div>

        {/* Copy Widget */}
        {/* <button
          onClick={handleCopy}
          className="h-7 w-7 rounded-lg bg-slate-700/80 backdrop-blur-sm border border-white/10 text-white/70 hover:text-cyan-400 hover:border-cyan-400/50 hover:bg-slate-700 transition-all duration-200 flex items-center justify-center group/btn"
          aria-label="Copy widget"
        >
          {showCopyFeedback ? (
            <Check className="w-3.5 h-3.5 text-cyan-400" />
          ) : (
            <Copy className="w-3.5 h-3.5 group-hover/btn:scale-110 transition-transform" />
          )}
        </button> */}

        {/* Maximize Widget */}
        {/* <button
          onClick={onMaximize}
          className="h-7 w-7 rounded-lg bg-slate-700/80 backdrop-blur-sm border border-white/10 text-white/70 hover:text-blue-400 hover:border-blue-400/50 hover:bg-slate-700 transition-all duration-200 flex items-center justify-center group/btn"
          aria-label="Maximize widget"
        >
          <Maximize2 className="w-3.5 h-3.5 group-hover/btn:scale-110 transition-transform" />
        </button> */}

        {/* Settings Dropdown */}
        {/* <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="h-7 w-7 rounded-lg bg-slate-700/80 backdrop-blur-sm border border-white/10 text-white/70 hover:text-purple-400 hover:border-purple-400/50 hover:bg-slate-700 transition-all duration-200 flex items-center justify-center group/btn"
              aria-label="Widget settings"
            >
              <Settings className="w-3.5 h-3.5 group-hover/btn:scale-110 transition-transform" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="bg-slate-800/95 backdrop-blur-xl border-white/20"
          >
            <DropdownMenuLabel className="text-white">
              {widgetType
                ? `${widgetType.charAt(0).toUpperCase()}${widgetType.slice(
                    1
                  )} Settings`
                : "Widget Settings"}
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-white/10" />
            {onResetSettings && (
              <DropdownMenuItem
                onClick={onResetSettings}
                className="text-white/80 hover:text-white focus:text-white cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset to Defaults
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={() => {
                // Open help documentation (can be implemented later)
                console.log(`Help for ${widgetType} widget`);
              }}
              className="text-white/80 hover:text-white focus:text-white cursor-pointer"
            >
              <HelpCircle className="w-4 h-4 mr-2" />
              Help
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu> */}

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
          showOnCanvasHover
            ? "group-hover:opacity-100 opacity-0"
            : "opacity-100"
        }`}
      >
        <Info className="w-3.5 h-3.5" />
      </div>
    </div>
  );
}
