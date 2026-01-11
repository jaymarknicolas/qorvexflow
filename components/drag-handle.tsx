"use client";

import { useDraggable } from "@dnd-kit/core";

type Props = {
  id: string;
};

export default function DragHandle({ id }: Props) {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id,
    data: { from: "slot" },
  });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className="absolute top-2 right-10 h-6 w-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition z-10 cursor-grab"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-4 w-4 text-white"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 8h16M4 16h16"
        />
      </svg>
    </div>
  );
}
