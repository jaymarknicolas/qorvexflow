"use client";

import { StickyNote } from "lucide-react";
import { useNotes } from "@/lib/hooks/useNotes";
import { useWidgetTheme } from "@/lib/hooks/useWidgetTheme";

export default function MiniNotes() {
  const { content, updateContent, characterCount } = useNotes();
  const colors = useWidgetTheme();

  return (
    <div
      className={`flex flex-col h-full p-3 gap-2 bg-gradient-to-br ${colors.gradient} backdrop-blur-xl border ${colors.border} rounded-2xl overflow-hidden`}
    >
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className={`p-1 rounded-lg ${colors.accentBg}`}>
            <StickyNote className={`w-3.5 h-3.5 ${colors.iconColor}`} />
          </div>
          <h2 className={`text-sm font-bold ${colors.textPrimary}`}>
            Quick Notes
          </h2>
        </div>
        <span className={`text-[10px] ${colors.textMuted}`}>
          {characterCount} chars
        </span>
      </div>

      {/* Textarea */}
      <textarea
        value={content}
        onChange={(e) => updateContent(e.target.value)}
        placeholder="Quick notes..."
        className={`flex-1 w-full rounded-lg p-2 ${
          colors.isLightMode
            ? "bg-black/5 text-black placeholder:text-black/30"
            : "bg-white/5 text-white/90 placeholder:text-white/30"
        } text-sm focus:outline-none resize-none leading-relaxed`}
        spellCheck={false}
      />
    </div>
  );
}
