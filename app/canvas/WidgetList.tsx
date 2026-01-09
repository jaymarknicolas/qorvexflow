"use client";

import React from "react";
import { CheckSquare, StickyNote, Clock } from "lucide-react";

interface Widget {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

interface WidgetListProps {
  isMinimized: boolean;
  onWidgetDragStart: (widgetId: string) => void;
}

const WidgetList: React.FC<WidgetListProps> = ({
  isMinimized,
  onWidgetDragStart,
}) => {
  const widgets: Widget[] = [
    {
      id: "todoapp",
      label: "Todo App",
      icon: <CheckSquare size={24} />,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      id: "notes",
      label: "Notes",
      icon: <StickyNote size={24} />,
      color: "from-amber-500 to-amber-600",
      bgColor: "bg-amber-50",
    },
    {
      id: "pomodoro",
      label: "Pomodoro",
      icon: <Clock size={24} />,
      color: "from-red-500 to-red-600",
      bgColor: "bg-red-50",
    },
  ];

  if (isMinimized) {
    return (
      <div className="grid grid-cols-1 gap-2">
        {widgets.map((widget) => (
          <button
            key={widget.id}
            draggable
            onDragStart={() => onWidgetDragStart(widget.id)}
            className={`${widget.bgColor} rounded-lg p-3 cursor-move flex items-center justify-center transition-all duration-200 hover:shadow-md active:scale-95 border border-gray-200`}
            title={widget.label}
          >
            <span
              className={`bg-gradient-to-r ${widget.color} bg-clip-text text-transparent`}
            >
              {widget.icon}
            </span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {widgets.map((widget) => (
        <button
          key={widget.id}
          draggable
          onDragStart={() => onWidgetDragStart(widget.id)}
          className={`${widget.bgColor} rounded-lg p-4 cursor-move flex flex-col items-center gap-2 text-[#1a1a1a] text-xs font-medium transition-all duration-200 hover:shadow-lg active:scale-95 border border-gray-200 hover:border-gray-300`}
        >
          <div
            className={`bg-gradient-to-r ${widget.color} p-2.5 rounded-lg text-white`}
          >
            {widget.icon}
          </div>
          <span className="text-center text-gray-700 font-semibold">
            {widget.label}
          </span>
        </button>
      ))}
    </div>
  );
};

export default WidgetList;
