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
  Pin,
  PinOff,
} from "lucide-react";
import { useState, useEffect } from "react";
import {
  useFloatingWidget,
  hasDocumentPipSupport,
} from "@/components/floating-widget/floating-widget-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
  const { pinWidget, unpinWidget, isWidgetPinned } = useFloatingWidget();
  const [canPip, setCanPip] = useState(false);
  const pinned = isWidgetPinned(widgetType);

  useEffect(() => {
    setCanPip(hasDocumentPipSupport());
  }, []);

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
      <TooltipProvider delayDuration={300}>
        <div
          className={`flex items-center gap-1 transition-all duration-300 ${
            isInfoHovered
              ? "opacity-100 translate-x-0 w-auto"
              : "opacity-0 translate-x-2 pointer-events-none w-0"
          }`}
        >
          {/* Drag Handle */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                {...dragHandleProps}
                data-drag-handle={slotId}
                data-widget-type={widgetType}
                className="h-7 w-7 rounded-lg bg-slate-700/80 backdrop-blur-sm border border-white/10 text-white/70 hover:text-green-400 hover:border-green-400/50 hover:bg-slate-700 transition-all duration-200 flex items-center justify-center cursor-move group/btn"
                aria-label="Drag to move widget"
              >
                <GripVertical className="w-3.5 h-3.5 group-hover/btn:scale-110 transition-transform" />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Drag to move</p>
            </TooltipContent>
          </Tooltip>

          {/* Pin/Unpin for PiP */}
          {canPip && !["youtube", "music"].includes(widgetType) && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() =>
                    pinned ? unpinWidget(widgetType) : pinWidget(widgetType)
                  }
                  className={`h-7 w-7 rounded-lg bg-slate-700/80 backdrop-blur-sm border transition-all duration-200 flex items-center justify-center group/btn ${
                    pinned
                      ? "border-cyan-400/50 text-cyan-400 hover:text-cyan-300"
                      : "border-white/10 text-white/70 hover:text-cyan-400 hover:border-cyan-400/50"
                  } hover:bg-slate-700`}
                  aria-label={pinned ? "Unpin from PiP" : "Pin to PiP"}
                >
                  {pinned ? (
                    <PinOff className="w-3.5 h-3.5 group-hover/btn:scale-110 transition-transform" />
                  ) : (
                    <Pin className="w-3.5 h-3.5 group-hover/btn:scale-110 transition-transform" />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{pinned ? "Unpin from PiP" : "Pin to PiP"}</p>
              </TooltipContent>
            </Tooltip>
          )}

          {/* Remove Widget */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onRemove}
                className="h-7 w-7 rounded-lg bg-slate-700/80 backdrop-blur-sm border border-white/10 text-white/70 hover:text-red-400 hover:border-red-400/50 hover:bg-slate-700 transition-all duration-200 flex items-center justify-center group/btn"
                aria-label="Remove widget"
              >
                <X className="w-3.5 h-3.5 group-hover/btn:scale-110 transition-transform" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Remove widget</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>

      {/* Info Icon - Always visible, triggers actions on hover */}
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={`h-7 w-7 rounded-lg bg-slate-700/80 backdrop-blur-sm border border-white/10 text-white/70 hover:text-cyan-400 hover:border-cyan-400/50 flex items-center justify-center transition-all duration-300 cursor-pointer ${
                showOnCanvasHover
                  ? "group-hover:opacity-100 opacity-0"
                  : "opacity-100"
              }`}
            >
              <Info className="w-3.5 h-3.5" />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Widget actions</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
