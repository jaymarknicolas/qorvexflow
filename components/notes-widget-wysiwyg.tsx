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

// Persist notes content in memory across re-mounts
let persistedNotesContent: string | null = null;

export default function NotesWidgetWYSIWYG() {
  const { theme } = useTheme();

  // Theme colors
  const getThemeColors = useCallback(() => {
    switch (theme) {
      case "ghibli":
        return {
          gradient: "from-green-900/95 via-emerald-900/90 to-teal-900/95",
          accent: "text-emerald-400",
          accentBg: "bg-emerald-500/25",
          border: "border-emerald-400/30",
          activeBtn: "bg-emerald-500/25 text-emerald-400",
          iconColor: "text-emerald-400",
        };
      case "coffeeshop":
        return {
          gradient: "from-stone-900/90 to-amber-950/90",
          accent: "text-amber-400",
          accentBg: "bg-amber-500/20",
          border: "border-amber-500/20",
          activeBtn: "bg-amber-500/20 text-amber-400",
          iconColor: "text-amber-400",
        };
      default: // lofi
        return {
          gradient: "from-indigo-900/90 to-purple-900/90",
          accent: "text-violet-400",
          accentBg: "bg-violet-500/20",
          border: "border-violet-500/20",
          activeBtn: "bg-violet-500/20 text-violet-400",
          iconColor: "text-violet-400",
        };
    }
  }, [theme]);

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

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [StarterKit, Underline],
    content: content,
    editorProps: {
      attributes: {
        class:
          "prose prose-invert max-w-none focus:outline-none min-h-[200px] px-4 py-3 text-white",
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
        <div className="text-white/40">Loading editor...</div>
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
    <button
      onClick={onClick}
      className={`p-2 rounded transition-colors ${
        isActive
          ? colors.activeBtn
          : "text-white/60 hover:text-white hover:bg-white/10"
      }`}
      title={title}
    >
      {children}
    </button>
  );

  return (
    <div className={`h-full flex flex-col bg-gradient-to-br ${colors.gradient} backdrop-blur-xl rounded-2xl border ${colors.border} shadow-2xl overflow-hidden`}>
      {/* Toolbar */}
      <div className="flex-shrink-0 border-b border-white/10 bg-black/20 p-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <div className={`p-1.5 rounded-lg ${colors.accentBg} mr-2`}>
              <FileText className={`w-4 h-4 ${colors.iconColor}`} />
            </div>

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

            <div className="w-px h-6 bg-white/10 mx-1" />

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

            <div className="w-px h-6 bg-white/10 mx-1" />

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

      {/* Editor */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <EditorContent editor={editor} />
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 border-t border-white/10 bg-black/20 px-4 py-2">
        <div className="flex w-full px-2 justify-between">
          <div className="text-xs text-white/40">
            WYSIWYG Editor • Auto-saves
          </div>
          <div
            className="text-xs cursor-pointer text-red-400 rounded hover:text-red-300 transition-colors"
            onClick={handleClear}
          >
            Clear all
          </div>
        </div>
      </div>
    </div>
  );
}
