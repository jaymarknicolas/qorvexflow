"use client";

import React, { useState, useRef } from "react";
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  X,
  Lock,
  LockOpen,
} from "lucide-react";

interface NotesAppProps {
  id: string;
  onClose: () => void;
  position?: { x: number; y: number };
  scale?: number;
  onPositionChange?: (x: number, y: number) => void;
  onClickWidget?: () => void;
}

const NotesApp: React.FC<NotesAppProps> = ({
  id,
  onClose,
  position,
  scale = 1,
  onPositionChange,
  onClickWidget,
}) => {
  const [content, setContent] = useState("");
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [pos, setPos] = useState(position || { x: 20, y: 20 });

  const editorRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const applyStyle = (style: string) => {
    document.execCommand(style, false, undefined);
    editorRef.current?.focus();
  };

  const toggleBold = () => {
    applyStyle("bold");
    setIsBold(!isBold);
  };

  const toggleItalic = () => {
    applyStyle("italic");
    setIsItalic(!isItalic);
  };

  const toggleUnderline = () => {
    applyStyle("underline");
    setIsUnderline(!isUnderline);
  };

  const toggleBulletList = () => {
    applyStyle("insertUnorderedList");
  };

  const toggleNumberedList = () => {
    applyStyle("insertOrderedList");
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isLocked) return;

    // Check if click is on header area
    if ((e.target as HTMLElement).closest(".notes-header")) {
      setIsDragging(true);
      setDragOffset({
        x: e.clientX - pos.x,
        y: e.clientY - pos.y,
      });
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || isLocked || !containerRef.current) return;

    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;

    setPos({ x: newX, y: newY });
    if (onPositionChange) {
      onPositionChange(newX, newY);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, dragOffset, pos, isLocked]);

  const baseWidth = 400;
  const baseHeight = 500;
  const scaledWidth = baseWidth * scale;
  const scaledHeight = baseHeight * scale;

  return (
    <div
      ref={containerRef}
      className={`absolute bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col ${
        !isLocked && isDragging
          ? "cursor-grabbing"
          : !isLocked
          ? "cursor-grab"
          : ""
      }`}
      onMouseDown={handleMouseDown}
      onClick={onClickWidget}
      style={{
        width: `${scaledWidth}px`,
        height: `${scaledHeight}px`,
        left: `${pos.x}px`,
        top: `${pos.y}px`,
        transform: `scale(${scale})`,
        transformOrigin: "top left",
        zIndex: isDragging ? 1000 : 10,
      }}
    >
      {/* Header */}
      <div className="notes-header flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-transparent cursor-grab hover:bg-blue-100 transition-colors">
        <h2 className="text-lg font-semibold text-gray-800">Notes</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsLocked(!isLocked);
            }}
            className={`p-1 rounded transition-colors ${
              isLocked
                ? "bg-red-100 text-red-600 hover:bg-red-200"
                : "text-gray-500 hover:bg-gray-100"
            }`}
            title={isLocked ? "Unlock to drag" : "Lock position"}
          >
            {isLocked ? <Lock size={18} /> : <LockOpen size={18} />}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-1 p-3 border-b border-gray-200 bg-gray-50 flex-wrap">
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleBold();
          }}
          className={`p-2 rounded transition-colors ${
            isBold ? "bg-gray-300" : "hover:bg-gray-200"
          }`}
          title="Bold"
        >
          <Bold size={18} className="text-gray-700" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleItalic();
          }}
          className={`p-2 rounded transition-colors ${
            isItalic ? "bg-gray-300" : "hover:bg-gray-200"
          }`}
          title="Italic"
        >
          <Italic size={18} className="text-gray-700" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleUnderline();
          }}
          className={`p-2 rounded transition-colors ${
            isUnderline ? "bg-gray-300" : "hover:bg-gray-200"
          }`}
          title="Underline"
        >
          <Underline size={18} className="text-gray-700" />
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleBulletList();
          }}
          className="p-2 rounded hover:bg-gray-200 transition-colors"
          title="Bullet List"
        >
          <List size={18} className="text-gray-700" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleNumberedList();
          }}
          className="p-2 rounded hover:bg-gray-200 transition-colors"
          title="Numbered List"
        >
          <ListOrdered size={18} className="text-gray-700" />
        </button>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={(e) => setContent(e.currentTarget.innerHTML)}
        onClick={(e) => e.stopPropagation()}
        className="flex-1 p-4 overflow-y-auto focus:outline-none text-gray-800 text-sm leading-relaxed"
        style={{ wordWrap: "break-word" }}
      />

      {/* Footer */}
      <div className="p-3 border-t border-gray-200 bg-gray-50 text-xs text-gray-500">
        {content.length} characters
        {isLocked && " • Locked"}
      </div>
    </div>
  );
};

export default NotesApp;
