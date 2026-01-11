"use client";

import { useDraggable } from "@dnd-kit/core";

type Props = {
  id: string;
  x: number;
  y: number;
  onDragEnd: (id: string, x: number, y: number) => void;
  onRemove?: (id: string) => void;
  children: React.ReactNode;
};

export default function DraggableWidget({
  id,
  x,
  y,
  onDragEnd,
  onRemove,
  children,
}: Props) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id });

  const style: React.CSSProperties = {
    position: "absolute",
    transform: `translate(${x + (transform?.x || 0)}px, ${
      y + (transform?.y || 0)
    }px)`,
  };

  return (
    <div ref={setNodeRef} {...listeners} {...attributes} style={style}>
      <div className="relative">
        {children}
        {onRemove && (
          <button
            onClick={() => onRemove(id)}
            className="absolute -top-2 -right-2 h-6 w-6 bg-red-500 rounded-full text-white flex items-center justify-center hover:bg-red-600"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}
