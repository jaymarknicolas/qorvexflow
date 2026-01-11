"use client";

import { useDroppable } from "@dnd-kit/core";
import clsx from "clsx";

type Props = {
  id: string;
  children?: React.ReactNode;
  className?: string;
};

export default function WorkspaceCanvas({ id, children, className }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={clsx(
        "relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm flex items-center justify-center",
        isOver && "ring-2 ring-cyan-400/40",
        className
      )}
    >
      {children ?? (
        <span className="text-white/20 text-sm">Drop widget here</span>
      )}
    </div>
  );
}
