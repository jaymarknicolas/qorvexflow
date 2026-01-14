"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { WidgetType } from "@/types";
import PomodoroWidget from "./pomodoro-widget";
import TaskList from "./task-list";
import MusicPlayer from "./music-player";
import FocusStats from "./focus-stats";
import CalendarWidget from "./calendar-widget";

interface WidgetMaximizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  widgetType: WidgetType | null;
}

const getWidgetTitle = (type: WidgetType | null): string => {
  switch (type) {
    case "pomodoro":
      return "Pomodoro Timer";
    case "tasks":
      return "Task List";
    case "music":
      return "Music Player";
    case "stats":
      return "Focus Statistics";
    case "calendar":
      return "Calendar";
    case "notes":
      return "Notes";
    case "youtube":
      return "YouTube Player";
    default:
      return "Widget";
  }
};

const renderMaximizedWidget = (type: WidgetType | null) => {
  switch (type) {
    case "pomodoro":
      return <PomodoroWidget />;
    case "tasks":
      return <TaskList />;
    case "music":
      return <MusicPlayer />;
    case "stats":
      return <FocusStats />;
    case "calendar":
      return <CalendarWidget />;
    case "notes":
      // Will be implemented
      return <div className="text-white/60 p-8 text-center">Notes widget coming soon...</div>;
    case "youtube":
      // Will be implemented
      return <div className="text-white/60 p-8 text-center">YouTube widget coming soon...</div>;
    default:
      return null;
  }
};

export default function WidgetMaximizeModal({
  isOpen,
  onClose,
  widgetType,
}: WidgetMaximizeModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent size="xl" className="p-0 overflow-hidden">
        <DialogHeader className="px-8 pt-8 pb-4">
          <DialogTitle>{getWidgetTitle(widgetType)}</DialogTitle>
        </DialogHeader>
        <div className="px-8 pb-8 max-h-[calc(90vh-120px)] overflow-y-auto">
          <div className="min-h-[500px]">
            {renderMaximizedWidget(widgetType)}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
