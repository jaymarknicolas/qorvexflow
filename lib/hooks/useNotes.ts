"use client";

import { useState, useEffect, useCallback } from "react";
import { STORAGE_KEYS } from "@/lib/constants";

interface Note {
  id: string;
  content: string;
  updatedAt: number;
  createdAt: number;
}

interface UseNotesReturn {
  content: string;
  updateContent: (newContent: string) => void;
  clearContent: () => void;
  exportAsMarkdown: () => string;
  exportAsPlainText: () => string;
  characterCount: number;
  wordCount: number;
}

export function useNotes(): UseNotesReturn {
  const [content, setContent] = useState<string>("");
  const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null);

  // Load note from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedNote = localStorage.getItem(STORAGE_KEYS.NOTES);
    if (savedNote) {
      try {
        const note: Note = JSON.parse(savedNote);
        setContent(note.content || "");
      } catch (error) {
        console.error("Failed to load note:", error);
      }
    }
  }, []);

  // Save to localStorage with debounce (2 seconds)
  const saveToStorage = useCallback((contentToSave: string) => {
    if (typeof window === "undefined") return;

    const existingNote = localStorage.getItem(STORAGE_KEYS.NOTES);
    let noteData: Note;

    try {
      const parsed = existingNote ? JSON.parse(existingNote) : null;
      noteData = {
        id: parsed?.id || crypto.randomUUID(),
        content: contentToSave,
        updatedAt: Date.now(),
        createdAt: parsed?.createdAt || Date.now(),
      };
    } catch {
      noteData = {
        id: crypto.randomUUID(),
        content: contentToSave,
        updatedAt: Date.now(),
        createdAt: Date.now(),
      };
    }

    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(noteData));
  }, []);

  // Update content with auto-save
  const updateContent = useCallback(
    (newContent: string) => {
      setContent(newContent);

      // Clear existing timeout
      if (saveTimeout) {
        clearTimeout(saveTimeout);
      }

      // Set new timeout for auto-save (2 seconds)
      const timeout = setTimeout(() => {
        saveToStorage(newContent);
      }, 2000);

      setSaveTimeout(timeout);
    },
    [saveTimeout, saveToStorage]
  );

  // Clear content
  const clearContent = useCallback(() => {
    setContent("");
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEYS.NOTES);
    }
  }, []);

  // Export as markdown (strip HTML tags, keep structure)
  const exportAsMarkdown = useCallback((): string => {
    let markdown = content;

    // Convert headings
    markdown = markdown.replace(/<h1>(.*?)<\/h1>/g, "# $1\n");
    markdown = markdown.replace(/<h2>(.*?)<\/h2>/g, "## $1\n");
    markdown = markdown.replace(/<h3>(.*?)<\/h3>/g, "### $1\n");

    // Convert bold, italic, underline
    markdown = markdown.replace(/<strong>(.*?)<\/strong>/g, "**$1**");
    markdown = markdown.replace(/<em>(.*?)<\/em>/g, "*$1*");
    markdown = markdown.replace(/<u>(.*?)<\/u>/g, "__$1__");

    // Convert lists
    markdown = markdown.replace(/<ul>[\s\S]*?<\/ul>/g, (match) => {
      return match.replace(/<\/?ul>/g, "");
    });
    markdown = markdown.replace(/<ol>[\s\S]*?<\/ol>/g, (match) => {
      return match.replace(/<\/?ol>/g, "");
    });
    markdown = markdown.replace(/<li>(.*?)<\/li>/g, "- $1\n");

    // Convert paragraphs
    markdown = markdown.replace(/<p>(.*?)<\/p>/g, "$1\n\n");

    // Remove remaining HTML tags
    markdown = markdown.replace(/<[^>]*>/g, "");

    return markdown.trim();
  }, [content]);

  // Export as plain text (strip all HTML)
  const exportAsPlainText = useCallback((): string => {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = content;
    return tempDiv.textContent || tempDiv.innerText || "";
  }, [content]);

  // Calculate character count (excluding HTML tags)
  const characterCount = exportAsPlainText().length;

  // Calculate word count
  const wordCount = exportAsPlainText()
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length;

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeout) {
        clearTimeout(saveTimeout);
      }
    };
  }, [saveTimeout]);

  return {
    content,
    updateContent,
    clearContent,
    exportAsMarkdown,
    exportAsPlainText,
    characterCount,
    wordCount,
  };
}
