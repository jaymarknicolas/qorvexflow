"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { useEffect, useState, useCallback } from "react";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  FileText,
} from "lucide-react";
import { useTheme } from "@/lib/contexts/theme-context";
import { useAppSettings } from "@/lib/contexts/app-settings-context";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Persist notes content in memory across re-mounts
let persistedNotesContent: string | null = null;

export default function NotesWidgetWYSIWYG() {
  const { theme } = useTheme();
  const { effectiveColorScheme } = useAppSettings();
  const isLightMode = effectiveColorScheme === "light";

  // Theme colors
  const getThemeColors = useCallback(() => {
    switch (theme) {
      case "ghibli":
        return {
          gradient: isLightMode
            ? "from-green-50/95 via-emerald-50/90 to-teal-50/95"
            : "from-green-900/95 via-emerald-900/90 to-teal-900/95",
          accent: isLightMode ? "text-green-700" : "text-emerald-400",
          accentBg: isLightMode ? "bg-green-200/50" : "bg-emerald-500/25",
          border: isLightMode ? "border-green-300/50" : "border-emerald-400/30",
          activeBtn: isLightMode
            ? "bg-green-200/70 text-green-800"
            : "bg-emerald-500/25 text-emerald-400",
          iconColor: isLightMode ? "text-green-700" : "text-emerald-400",
          textPrimary: isLightMode ? "text-green-900" : "text-white",
          textMuted: isLightMode ? "text-green-700/70" : "text-white/60",
          inactiveBtn: isLightMode
            ? "text-green-700/60 hover:text-green-900 hover:bg-green-200/50"
            : "text-white/60 hover:text-white hover:bg-white/10",
          toolbarBg: isLightMode ? "bg-green-100/60" : "bg-black/20",
          toolbarBorder: isLightMode ? "border-green-300/30" : "border-white/10",
          divider: isLightMode ? "bg-green-300/30" : "bg-white/10",
        };
      case "horizon":
        return {
          gradient: isLightMode
            ? "from-sky-50/95 via-orange-50/90 to-violet-50/95"
            : "from-slate-900/95 via-sky-950/90 to-violet-950/95",
          accent: isLightMode ? "text-sky-700" : "text-sky-400",
          accentBg: isLightMode ? "bg-sky-200/50" : "bg-sky-500/20",
          border: isLightMode ? "border-sky-300/50" : "border-sky-500/20",
          activeBtn: isLightMode
            ? "bg-sky-200/70 text-sky-800"
            : "bg-sky-500/20 text-sky-400",
          iconColor: isLightMode ? "text-sky-700" : "text-sky-400",
          textPrimary: isLightMode ? "text-slate-900" : "text-white",
          textMuted: isLightMode ? "text-slate-600/70" : "text-white/60",
          inactiveBtn: isLightMode
            ? "text-sky-700/60 hover:text-sky-900 hover:bg-sky-200/50"
            : "text-white/60 hover:text-white hover:bg-white/10",
          toolbarBg: isLightMode ? "bg-sky-100/60" : "bg-black/20",
          toolbarBorder: isLightMode ? "border-sky-300/30" : "border-white/10",
          divider: isLightMode ? "bg-sky-300/30" : "bg-white/10",
        };
      case "coffeeshop":
        return {
          gradient: isLightMode
            ? "from-amber-50/95 via-orange-50/90 to-yellow-50/95"
            : "from-stone-900/90 to-amber-950/90",
          accent: isLightMode ? "text-amber-800" : "text-amber-400",
          accentBg: isLightMode ? "bg-amber-200/50" : "bg-amber-500/20",
          border: isLightMode ? "border-amber-300/50" : "border-amber-500/20",
          activeBtn: isLightMode
            ? "bg-amber-200/70 text-amber-800"
            : "bg-amber-500/20 text-amber-400",
          iconColor: isLightMode ? "text-amber-800" : "text-amber-400",
          textPrimary: isLightMode ? "text-amber-950" : "text-white",
          textMuted: isLightMode ? "text-amber-800/70" : "text-white/60",
          inactiveBtn: isLightMode
            ? "text-amber-700/60 hover:text-amber-900 hover:bg-amber-200/50"
            : "text-white/60 hover:text-white hover:bg-white/10",
          toolbarBg: isLightMode ? "bg-amber-100/60" : "bg-black/20",
          toolbarBorder: isLightMode ? "border-amber-300/30" : "border-white/10",
          divider: isLightMode ? "bg-amber-300/30" : "bg-white/10",
        };
      default: // lofi
        return {
          gradient: isLightMode
            ? "from-violet-50/95 via-purple-50/90 to-indigo-50/95"
            : "from-indigo-900/90 to-purple-900/90",
          accent: isLightMode ? "text-violet-700" : "text-violet-400",
          accentBg: isLightMode ? "bg-violet-200/50" : "bg-violet-500/20",
          border: isLightMode ? "border-violet-300/50" : "border-violet-500/20",
          activeBtn: isLightMode
            ? "bg-violet-200/70 text-violet-800"
            : "bg-violet-500/20 text-violet-400",
          iconColor: isLightMode ? "text-violet-700" : "text-violet-400",
          textPrimary: isLightMode ? "text-violet-950" : "text-white",
          textMuted: isLightMode ? "text-violet-700/70" : "text-white/60",
          inactiveBtn: isLightMode
            ? "text-violet-700/60 hover:text-violet-900 hover:bg-violet-200/50"
            : "text-white/60 hover:text-white hover:bg-white/10",
          toolbarBg: isLightMode ? "bg-violet-100/60" : "bg-black/20",
          toolbarBorder: isLightMode ? "border-violet-300/30" : "border-white/10",
          divider: isLightMode ? "bg-violet-300/30" : "bg-white/10",
        };
    }
  }, [theme, isLightMode]);

  const colors = getThemeColors();

  // Initialize from memory first, then localStorage
  const [content, setContent] = useState(() => {
    if (persistedNotesContent !== null) {
      return persistedNotesContent;
    }
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("qorvexflow_notes_wysiwyg");
      if (saved) {
        persistedNotesContent = saved;
        return saved;
      }
    }
    return "";
  });

  // Keep memory state in sync
  useEffect(() => {
    persistedNotesContent = content;
  }, [content]);

  const editorProseClass = isLightMode
    ? "prose max-w-none focus:outline-none min-h-[200px] px-4 py-3"
    : "prose prose-invert max-w-none focus:outline-none min-h-[200px] px-4 py-3";

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [StarterKit, Underline],
    content: content,
    editorProps: {
      attributes: {
        class: editorProseClass,
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setContent(html);
      localStorage.setItem("qorvexflow_notes_wysiwyg", html);
    },
  });

  useEffect(() => {
    if (editor && content && !editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [editor, content]);

  if (!editor) {
    return (
      <div className={`h-full flex items-center justify-center bg-gradient-to-br ${colors.gradient} backdrop-blur-xl rounded-2xl border ${colors.border}`}>
        <div className={colors.textMuted}>Loading editor...</div>
      </div>
    );
  }

  const handleClear = () => {
    editor.commands.setContent("");
    localStorage.removeItem("qorvexflow_notes_wysiwyg");
  };

  const ToolbarButton = ({ onClick, isActive, title, children }: {
    onClick: () => void;
    isActive: boolean;
    title: string;
    children: React.ReactNode;
  }) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={onClick}
          className={`p-2 rounded transition-colors ${
            isActive
              ? colors.activeBtn
              : colors.inactiveBtn
          }`}
        >
          {children}
        </button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{title}</p>
      </TooltipContent>
    </Tooltip>
  );

  return (
    <div className={`h-full flex flex-col bg-gradient-to-br ${colors.gradient} backdrop-blur-xl rounded-2xl border ${colors.border} shadow-2xl overflow-hidden`}>
      {/* Toolbar */}
      <TooltipProvider delayDuration={300}>
      <div className={`flex-shrink-0 border-b ${colors.toolbarBorder} ${colors.toolbarBg} p-2`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className={`p-1.5 rounded-lg ${colors.accentBg} mr-2`}>
                  <FileText className={`w-4 h-4 ${colors.iconColor}`} />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Notes</p>
              </TooltipContent>
            </Tooltip>

            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBold().run()}
              isActive={editor.isActive("bold")}
              title="Bold"
            >
              <Bold className="w-4 h-4" />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().toggleItalic().run()}
              isActive={editor.isActive("italic")}
              title="Italic"
            >
              <Italic className="w-4 h-4" />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              isActive={editor.isActive("underline")}
              title="Underline"
            >
              <UnderlineIcon className="w-4 h-4" />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().toggleStrike().run()}
              isActive={editor.isActive("strike")}
              title="Strikethrough"
            >
              <Strikethrough className="w-4 h-4" />
            </ToolbarButton>

            <div className={`w-px h-6 ${colors.divider} mx-1`} />

            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              isActive={editor.isActive("heading", { level: 1 })}
              title="Heading 1"
            >
              <Heading1 className="w-4 h-4" />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              isActive={editor.isActive("heading", { level: 2 })}
              title="Heading 2"
            >
              <Heading2 className="w-4 h-4" />
            </ToolbarButton>

            <div className={`w-px h-6 ${colors.divider} mx-1`} />

            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              isActive={editor.isActive("bulletList")}
              title="Bullet List"
            >
              <List className="w-4 h-4" />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              isActive={editor.isActive("orderedList")}
              title="Numbered List"
            >
              <ListOrdered className="w-4 h-4" />
            </ToolbarButton>
          </div>
        </div>
      </div>
      </TooltipProvider>

      {/* Editor */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <EditorContent editor={editor} />
      </div>

      {/* Footer */}
      <div className={`shrink-0 border-t ${colors.toolbarBorder} ${colors.toolbarBg} px-4 py-2`}>
        <div className="flex w-full px-2 justify-between">
          <div className={`text-xs ${colors.textMuted}`}>
            WYSIWYG Editor • Auto-saves
          </div>
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className="text-xs cursor-pointer text-red-400 rounded hover:text-red-300 transition-colors"
                  onClick={handleClear}
                >
                  Clear all
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Clear all notes</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
}
