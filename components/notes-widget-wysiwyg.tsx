"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { useEffect, useState } from "react";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  Heading1,
  Heading2,
} from "lucide-react";

// Persist notes content in memory across re-mounts
let persistedNotesContent: string | null = null;

export default function NotesWidgetWYSIWYG() {
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
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl rounded-2xl border border-white/10">
        <div className="text-white/40">Loading editor...</div>
      </div>
    );
  }

  const handleClear = () => {
    editor.commands.setContent("");
    localStorage.removeItem("qorvexflow_notes_wysiwyg");
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
      {/* Toolbar */}
      <div className="flex-shrink-0 border-b border-white/10 bg-black/20 p-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <button
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`p-2 rounded transition-colors ${
                editor.isActive("bold")
                  ? "bg-cyan-500/20 text-cyan-400"
                  : "text-white/60 hover:text-white hover:bg-white/10"
              }`}
              title="Bold"
            >
              <Bold className="w-4 h-4" />
            </button>

            <button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`p-2 rounded transition-colors ${
                editor.isActive("italic")
                  ? "bg-cyan-500/20 text-cyan-400"
                  : "text-white/60 hover:text-white hover:bg-white/10"
              }`}
              title="Italic"
            >
              <Italic className="w-4 h-4" />
            </button>

            <button
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              className={`p-2 rounded transition-colors ${
                editor.isActive("underline")
                  ? "bg-cyan-500/20 text-cyan-400"
                  : "text-white/60 hover:text-white hover:bg-white/10"
              }`}
              title="Underline"
            >
              <UnderlineIcon className="w-4 h-4" />
            </button>

            <button
              onClick={() => editor.chain().focus().toggleStrike().run()}
              className={`p-2 rounded transition-colors ${
                editor.isActive("strike")
                  ? "bg-cyan-500/20 text-cyan-400"
                  : "text-white/60 hover:text-white hover:bg-white/10"
              }`}
              title="Strikethrough"
            >
              <Strikethrough className="w-4 h-4" />
            </button>

            <div className="w-px h-6 bg-white/10 mx-1" />

            <button
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 1 }).run()
              }
              className={`p-2 rounded transition-colors ${
                editor.isActive("heading", { level: 1 })
                  ? "bg-cyan-500/20 text-cyan-400"
                  : "text-white/60 hover:text-white hover:bg-white/10"
              }`}
              title="Heading 1"
            >
              <Heading1 className="w-4 h-4" />
            </button>

            <button
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 2 }).run()
              }
              className={`p-2 rounded transition-colors ${
                editor.isActive("heading", { level: 2 })
                  ? "bg-cyan-500/20 text-cyan-400"
                  : "text-white/60 hover:text-white hover:bg-white/10"
              }`}
              title="Heading 2"
            >
              <Heading2 className="w-4 h-4" />
            </button>

            <div className="w-px h-6 bg-white/10 mx-1" />

            <button
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={`p-2 rounded transition-colors ${
                editor.isActive("bulletList")
                  ? "bg-cyan-500/20 text-cyan-400"
                  : "text-white/60 hover:text-white hover:bg-white/10"
              }`}
              title="Bullet List"
            >
              <List className="w-4 h-4" />
            </button>

            <button
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={`p-2 rounded transition-colors ${
                editor.isActive("orderedList")
                  ? "bg-cyan-500/20 text-cyan-400"
                  : "text-white/60 hover:text-white hover:bg-white/10"
              }`}
              title="Numbered List"
            >
              <ListOrdered className="w-4 h-4" />
            </button>
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
            className="text-xs cursor-pointer text-red-400  rounded  hover:text-red-300 transition-colors"
            onClick={handleClear}
          >
            Clear all
          </div>
        </div>
      </div>
    </div>
  );
}
