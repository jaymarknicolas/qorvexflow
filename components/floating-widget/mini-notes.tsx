"use client";

import { useNotes } from "@/lib/hooks/useNotes";
import { useWidgetTheme } from "@/lib/hooks/useWidgetTheme";

export default function MiniNotes() {
  const { content, updateContent, characterCount } = useNotes();

  return (
    <div className="flex flex-col h-full p-3">
      <textarea
        value={content}
        onChange={(e) => updateContent(e.target.value)}
        placeholder="Quick notes..."
        className="flex-1 w-full bg-transparent text-white/80 text-sm placeholder:text-white/30 focus:outline-none resize-none leading-relaxed"
        spellCheck={false}
      />
      <div className="flex-shrink-0 text-[10px] text-white/30 text-right pt-1 border-t border-white/5">
        {characterCount} chars
      </div>
    </div>
  );
}
