"use client";

import type React from "react";
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  Plus,
  Trash2,
  ListTodo,
  Circle,
  Loader2,
  CheckCircle2,
  GripVertical,
  Flag,
  AlertTriangle,
  Minus,
  Filter,
  ChevronDown,
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverEvent,
  DragOverlay,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
// CSS import removed - no longer applying transforms to prevent slide animations
import { useTasks } from "@/lib/hooks";
import { validateTaskTitle } from "@/lib/utils/validation";
import { useTheme } from "@/lib/contexts/theme-context";
import { useAppSettings } from "@/lib/contexts/app-settings-context";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Task, TaskStatus } from "@/types";

type Priority = "high" | "medium" | "low";
type PriorityFilter = "all" | Priority;

interface ThemeColors {
  gradient: string;
  accent: string;
  accentBg: string;
  border: string;
  button: string;
  buttonShadow: string;
  inputBg: string;
  inputFocus: string;
  progress: string;
  textPrimary: string;
  textMuted: string;
  cardBg: string;
  cardHover: string;
  columnBg: string;
  columnHeader: string;
  tabActive: string;
  tabInactive: string;
  menuBg: string;
}

const COLUMNS: {
  id: TaskStatus;
  label: string;
  shortLabel: string;
  icon: React.ElementType;
}[] = [
  { id: "todo", label: "To Do", shortLabel: "To Do", icon: Circle },
  {
    id: "in_progress",
    label: "In Progress",
    shortLabel: "Progress",
    icon: Loader2,
  },
  { id: "done", label: "Done", shortLabel: "Done", icon: CheckCircle2 },
];

const PRIORITY_CONFIG = {
  high: {
    label: "High",
    shortLabel: "!",
    color: "text-red-400",
    bg: "bg-red-500/20",
    border: "border-red-500/30",
    icon: AlertTriangle,
  },
  medium: {
    label: "Medium",
    shortLabel: "↑",
    color: "text-orange-400",
    bg: "bg-orange-500/20",
    border: "border-orange-500/30",
    icon: Flag,
  },
  low: {
    label: "Low",
    shortLabel: "—",
    color: "text-slate-400",
    bg: "bg-slate-500/20",
    border: "border-slate-500/30",
    icon: Minus,
  },
};

// Drop line indicator - shows where the item will be placed
function DropIndicator({ colors }: { colors: ThemeColors }) {
  return (
    <div className="relative py-0.5">
      <div className={`h-0.5 rounded-full ${colors.progress} shadow-sm`} style={{ boxShadow: `0 0 6px currentColor` }} />
      <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full ${colors.progress}`} />
      <div className={`absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full ${colors.progress}`} />
    </div>
  );
}

// Sortable Task Card - defined outside main component
function SortableTaskCard({
  task,
  colors,
  isCompact,
  onRemove,
  onCyclePriority,
  showIndicatorBefore,
  showIndicatorAfter,
}: {
  task: Task;
  colors: ThemeColors;
  isCompact: boolean;
  onRemove: (id: string) => void;
  onCyclePriority: (id: string, priority?: string) => void;
  showIndicatorBefore?: boolean;
  showIndicatorAfter?: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    isDragging,
  } = useSortable({ id: task.id });

  const style: React.CSSProperties = {
    opacity: isDragging ? 0.3 : 1,
    zIndex: isDragging ? 50 : undefined,
    position: "relative" as const,
  };

  const priority = (task.priority as Priority) || "low";
  const priorityConfig = PRIORITY_CONFIG[priority];
  const PriorityIcon = priorityConfig.icon;

  return (
    <>
      {showIndicatorBefore && <DropIndicator colors={colors} />}
      <div
        ref={setNodeRef}
        style={style}
        className={`group flex items-center gap-2 rounded-lg ${colors.cardBg} ${colors.cardHover} border ${colors.border} ${
          isCompact ? "p-2" : "p-2.5"
        } ${isDragging ? "shadow-lg ring-2 ring-violet-500/30" : ""}`}
      >
        <div
          {...attributes}
          {...listeners}
          className={`flex-shrink-0 cursor-grab active:cursor-grabbing ${colors.textMuted} touch-none`}
          title="Drag to reorder"
        >
          <GripVertical className={isCompact ? "w-3.5 h-3.5" : "w-4 h-4"} />
        </div>

        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => onCyclePriority(task.id, task.priority)}
                className={`flex-shrink-0 p-1 rounded transition-all ${priorityConfig.bg} ${priorityConfig.color} hover:opacity-80`}
              >
                <PriorityIcon className={isCompact ? "w-3 h-3" : "w-3.5 h-3.5"} />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{priorityConfig.label} priority (click to change)</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <span
          className={`flex-1 font-medium truncate ${isCompact ? "text-xs" : "text-sm"} ${
            task.status === "done" || task.completed
              ? `${colors.textMuted} line-through`
              : colors.textPrimary
          }`}
        >
          {task.title}
        </span>

        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => onRemove(task.id)}
                className="flex-shrink-0 opacity-0 group-hover:opacity-100 p-1 rounded transition-all text-red-400/60 hover:text-red-400 hover:bg-red-500/10"
              >
                <Trash2 className={isCompact ? "w-3 h-3" : "w-3.5 h-3.5"} />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Delete</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      {showIndicatorAfter && <DropIndicator colors={colors} />}
    </>
  );
}

// Drag Overlay Card - defined outside main component
function DragOverlayCard({
  task,
  colors,
  isCompact,
}: {
  task: Task;
  colors: ThemeColors;
  isCompact: boolean;
}) {
  const priority = (task.priority as Priority) || "low";
  const priorityConfig = PRIORITY_CONFIG[priority];
  const PriorityIcon = priorityConfig.icon;

  return (
    <div
      className={`flex items-center gap-2 rounded-lg ${colors.cardBg} border ${colors.border} shadow-xl opacity-90 ${isCompact ? "p-2" : "p-2.5"}`}
    >
      <GripVertical
        className={`${isCompact ? "w-3.5 h-3.5" : "w-4 h-4"} ${colors.textMuted}`}
      />
      <div
        className={`p-1 rounded ${priorityConfig.bg} ${priorityConfig.color}`}
      >
        <PriorityIcon className={isCompact ? "w-3 h-3" : "w-3.5 h-3.5"} />
      </div>
      <span
        className={`${isCompact ? "text-xs" : "text-sm"} font-medium ${colors.textPrimary}`}
      >
        {task.title}
      </span>
    </div>
  );
}

// Droppable Column - defined outside main component
function DroppableColumn({
  column,
  tasks: columnTasks,
  colors,
  isCompact,
  onRemove,
  onCyclePriority,
  overInfo,
}: {
  column: (typeof COLUMNS)[0];
  tasks: Task[];
  colors: ThemeColors;
  isCompact: boolean;
  onRemove: (id: string) => void;
  onCyclePriority: (id: string, priority?: string) => void;
  overInfo: { overId: string; position: "before" | "after" } | null;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  const Icon = column.icon;
  const isInProgress = column.id === "in_progress";

  return (
    <div
      ref={setNodeRef}
      className={`flex-1 min-w-0 flex flex-col rounded-xl ${colors.columnBg} border ${colors.border} overflow-hidden transition-all ${
        isOver ? "ring-2 ring-violet-500/40" : ""
      }`}
    >
      <div
        className={`flex items-center gap-2 px-3 py-2 ${colors.columnHeader}`}
      >
        <Icon
          className={`w-3.5 h-3.5 ${colors.accent} ${isInProgress ? "animate-spin" : ""}`}
          style={isInProgress ? { animationDuration: "2s" } : undefined}
        />
        <span className={`text-xs font-semibold ${colors.textPrimary}`}>
          {column.shortLabel}
        </span>
        <span className={`text-[10px] ${colors.textMuted} ml-auto`}>
          {columnTasks.length}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1.5 min-h-[60px]">
        <SortableContext
          items={columnTasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {columnTasks.map((task) => (
            <SortableTaskCard
              key={task.id}
              task={task}
              colors={colors}
              isCompact={isCompact}
              onRemove={onRemove}
              onCyclePriority={onCyclePriority}
              showIndicatorBefore={overInfo?.overId === task.id && overInfo.position === "before"}
              showIndicatorAfter={overInfo?.overId === task.id && overInfo.position === "after"}
            />
          ))}
        </SortableContext>

        {columnTasks.length === 0 && (
          <div className={`text-center py-3 ${colors.textMuted} text-[10px]`}>
            {isOver ? "Drop here" : "No tasks"}
          </div>
        )}
      </div>
    </div>
  );
}

export default function TaskList() {
  const { theme } = useTheme();
  const { effectiveColorScheme } = useAppSettings();
  const isLightMode = effectiveColorScheme === "light";
  const containerRef = useRef<HTMLDivElement>(null);
  const [layoutMode, setLayoutMode] = useState<"tabs" | "columns">("tabs");
  const [isCompact, setIsCompact] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setLayoutMode(width >= 600 ? "columns" : "tabs");
        setIsCompact(width < 400 || height < 350);
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const {
    tasks,
    addTask,
    removeTask,
    updateTask,
    reorderTasks,
    moveTaskToColumn,
    clearCompleted,
    completedCount,
    activeCount,
    completionRate,
  } = useTasks();

  const [newTask, setNewTask] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [activeTab, setActiveTab] = useState<TaskStatus>("todo");
  const [selectedPriority, setSelectedPriority] = useState<Priority>("low");
  const [showPriorityMenu, setShowPriorityMenu] = useState(false);
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>("all");
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [overInfo, setOverInfo] = useState<{ overId: string; position: "before" | "after" } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const getThemeColors = useCallback((): ThemeColors => {
    switch (theme) {
      case "ghibli":
        return {
          gradient: isLightMode
            ? "from-green-50/95 via-emerald-50/90 to-teal-50/95"
            : "from-green-900/95 via-emerald-900/90 to-teal-900/95",
          accent: isLightMode ? "text-green-700" : "text-emerald-400",
          accentBg: isLightMode ? "bg-green-200/50" : "bg-emerald-500/20",
          border: isLightMode ? "border-green-300/50" : "border-emerald-500/20",
          button: isLightMode
            ? "from-green-600 to-teal-600 hover:from-green-500 hover:to-teal-500"
            : "from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400",
          buttonShadow: "shadow-emerald-500/25",
          inputBg: isLightMode ? "bg-white/70" : "bg-black/30",
          inputFocus: "focus:ring-emerald-500/30 focus:border-emerald-400/50",
          progress: "bg-emerald-500",
          textPrimary: isLightMode ? "text-green-900" : "text-white",
          textMuted: isLightMode ? "text-green-700/70" : "text-white/50",
          cardBg: isLightMode ? "bg-green-100/60" : "bg-black/20",
          cardHover: isLightMode
            ? "hover:bg-green-200/60"
            : "hover:bg-white/10",
          columnBg: isLightMode ? "bg-green-100/40" : "bg-black/10",
          columnHeader: isLightMode ? "bg-green-200/50" : "bg-black/30",
          tabActive: isLightMode
            ? "bg-green-200/70 text-green-800"
            : "bg-emerald-500/25 text-emerald-300",
          tabInactive: isLightMode
            ? "text-green-700/60 hover:text-green-900 hover:bg-green-200/40"
            : "text-white/50 hover:text-white hover:bg-white/10",
          menuBg: isLightMode ? "bg-white/95" : "bg-slate-900/95",
        };
      case "coffeeshop":
        return {
          gradient: isLightMode
            ? "from-amber-50/95 via-orange-50/90 to-yellow-50/95"
            : "from-stone-900/95 via-amber-950/90 to-orange-950/95",
          accent: isLightMode ? "text-amber-800" : "text-amber-400",
          accentBg: isLightMode ? "bg-amber-200/50" : "bg-amber-500/20",
          border: isLightMode ? "border-amber-300/50" : "border-amber-500/20",
          button: isLightMode
            ? "from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500"
            : "from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400",
          buttonShadow: "shadow-amber-500/25",
          inputBg: isLightMode ? "bg-white/70" : "bg-black/30",
          inputFocus: "focus:ring-amber-500/30 focus:border-amber-400/50",
          progress: "bg-amber-500",
          textPrimary: isLightMode ? "text-amber-950" : "text-white",
          textMuted: isLightMode ? "text-amber-800/70" : "text-white/50",
          cardBg: isLightMode ? "bg-amber-100/60" : "bg-black/20",
          cardHover: isLightMode
            ? "hover:bg-amber-200/60"
            : "hover:bg-white/10",
          columnBg: isLightMode ? "bg-amber-100/40" : "bg-black/10",
          columnHeader: isLightMode ? "bg-amber-200/50" : "bg-black/30",
          tabActive: isLightMode
            ? "bg-amber-200/70 text-amber-800"
            : "bg-amber-500/25 text-amber-300",
          tabInactive: isLightMode
            ? "text-amber-700/60 hover:text-amber-900 hover:bg-amber-200/40"
            : "text-white/50 hover:text-white hover:bg-white/10",
          menuBg: isLightMode ? "bg-white/95" : "bg-slate-900/95",
        };
      default:
        return {
          gradient: isLightMode
            ? "from-violet-50/95 via-purple-50/90 to-indigo-50/95"
            : "from-indigo-900/95 via-purple-900/90 to-violet-900/95",
          accent: isLightMode ? "text-violet-700" : "text-violet-400",
          accentBg: isLightMode ? "bg-violet-200/50" : "bg-violet-500/20",
          border: isLightMode ? "border-violet-300/50" : "border-violet-500/20",
          button: isLightMode
            ? "from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500"
            : "from-violet-500 to-purple-500 hover:from-violet-400 hover:to-purple-400",
          buttonShadow: "shadow-violet-500/25",
          inputBg: isLightMode ? "bg-white/70" : "bg-black/30",
          inputFocus: "focus:ring-violet-500/30 focus:border-violet-400/50",
          progress: "bg-violet-500",
          textPrimary: isLightMode ? "text-violet-950" : "text-white",
          textMuted: isLightMode ? "text-violet-800/70" : "text-white/50",
          cardBg: isLightMode ? "bg-violet-100/60" : "bg-black/20",
          cardHover: isLightMode
            ? "hover:bg-violet-200/60"
            : "hover:bg-white/10",
          columnBg: isLightMode ? "bg-violet-100/40" : "bg-black/10",
          columnHeader: isLightMode ? "bg-violet-200/50" : "bg-black/30",
          tabActive: isLightMode
            ? "bg-violet-200/70 text-violet-800"
            : "bg-violet-500/25 text-violet-300",
          tabInactive: isLightMode
            ? "text-violet-700/60 hover:text-violet-900 hover:bg-violet-200/40"
            : "text-white/50 hover:text-white hover:bg-white/10",
          menuBg: isLightMode ? "bg-white/95" : "bg-slate-900/95",
        };
    }
  }, [theme, isLightMode]);

  const colors = getThemeColors();

  const tasksByStatus = useMemo(() => {
    const grouped: Record<TaskStatus, Task[]> = {
      todo: [],
      in_progress: [],
      done: [],
    };

    tasks.forEach((task) => {
      if (priorityFilter !== "all") {
        const taskPriority = task.priority || "low";
        if (taskPriority !== priorityFilter) return;
      }

      const status = task.status || (task.completed ? "done" : "todo");
      grouped[status].push(task);
    });

    return grouped;
  }, [tasks, priorityFilter]);

  const priorityCounts = useMemo(() => {
    return {
      high: tasks.filter((t) => t.priority === "high" && !t.completed).length,
      medium: tasks.filter((t) => t.priority === "medium" && !t.completed)
        .length,
      low: tasks.filter(
        (t) => (!t.priority || t.priority === "low") && !t.completed,
      ).length,
    };
  }, [tasks]);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedTitle = newTask.trim();
    if (!trimmedTitle) {
      setError("Task cannot be empty");
      return;
    }

    const validation = validateTaskTitle(trimmedTitle);
    if (!validation.isValid) {
      setError(validation.errors[0]);
      return;
    }

    const targetStatus = layoutMode === "tabs" ? activeTab : "todo";
    const success = addTask(trimmedTitle, targetStatus, selectedPriority);
    if (success) {
      setNewTask("");
      setSelectedPriority("low");
    } else {
      setError("Failed to add task");
    }
  };

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const task = tasks.find((t) => t.id === event.active.id);
      if (task) {
        setActiveTask(task);
      }
      setOverInfo(null);
    },
    [tasks],
  );

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) {
        setOverInfo(null);
        return;
      }

      // Check if over target is a column droppable (not a task)
      const isColumn = COLUMNS.some((c) => c.id === over.id);
      if (isColumn) {
        setOverInfo(null);
        return;
      }

      const activeTask = tasks.find((t) => t.id === active.id);
      const overTask = tasks.find((t) => t.id === over.id);
      if (!activeTask || !overTask) {
        setOverInfo(null);
        return;
      }

      const activeStatus = activeTask.status || (activeTask.completed ? "done" : "todo");
      const overStatus = overTask.status || (overTask.completed ? "done" : "todo");

      // Get the column tasks for the over item's column
      const columnTasks = tasksByStatus[overStatus];
      const activeIdx = columnTasks.findIndex((t) => t.id === active.id);
      const overIdx = columnTasks.findIndex((t) => t.id === over.id);

      if (activeStatus !== overStatus) {
        // Cross-column: show indicator before the over item
        setOverInfo({ overId: over.id as string, position: "before" });
      } else if (activeIdx < overIdx) {
        // Dragging down: show indicator after over item
        setOverInfo({ overId: over.id as string, position: "after" });
      } else {
        // Dragging up: show indicator before over item
        setOverInfo({ overId: over.id as string, position: "before" });
      }
    },
    [tasks, tasksByStatus],
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveTask(null);
      setOverInfo(null);

      if (!over) return;

      const activeId = active.id as string;
      const overId = over.id as string;

      if (activeId === overId) return;

      // Dropped on a column droppable (empty area)
      const targetColumn = COLUMNS.find((col) => col.id === overId);
      if (targetColumn) {
        const task = tasks.find((t) => t.id === activeId);
        const currentStatus =
          task?.status || (task?.completed ? "done" : "todo");
        if (currentStatus !== targetColumn.id) {
          moveTaskToColumn(activeId, targetColumn.id);
        }
        return;
      }

      // Dropped on another task
      const overTask = tasks.find((t) => t.id === overId);
      if (overTask) {
        const activeTaskItem = tasks.find((t) => t.id === activeId);
        const activeStatus =
          activeTaskItem?.status ||
          (activeTaskItem?.completed ? "done" : "todo");
        const overStatus =
          overTask?.status || (overTask?.completed ? "done" : "todo");

        if (activeStatus === overStatus) {
          // Same column - simple reorder
          reorderTasks(activeId, overId);
        } else {
          // Cross-column move - place at the over task's position
          const overGlobalIndex = tasks.findIndex((t) => t.id === overId);
          moveTaskToColumn(activeId, overStatus, overGlobalIndex);
        }
      }
    },
    [tasks, reorderTasks, moveTaskToColumn],
  );

  const cyclePriority = useCallback(
    (taskId: string, currentPriority?: string) => {
      const priorities: Priority[] = ["low", "medium", "high"];
      const current = (currentPriority as Priority) || "low";
      const currentIndex = priorities.indexOf(current);
      const nextPriority = priorities[(currentIndex + 1) % priorities.length];
      updateTask(taskId, { priority: nextPriority });
    },
    [updateTask],
  );

  const currentTasks = tasksByStatus[activeTab];

  return (
    <div
      ref={containerRef}
      className={`h-full flex flex-col bg-gradient-to-br ${colors.gradient} backdrop-blur-xl rounded-2xl border ${colors.border} shadow-2xl overflow-hidden`}
    >
      {/* Header */}
      <div
        className={`flex-shrink-0 border-b ${colors.border} ${isCompact ? "p-2" : "p-3"}`}
      >
        <div
          className={`flex items-center gap-2 ${isCompact ? "mb-2" : "mb-3"}`}
        >
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className={`rounded-lg ${colors.accentBg} ${isCompact ? "p-1" : "p-1.5"}`}
                >
                  <ListTodo
                    className={`${colors.accent} ${isCompact ? "w-3.5 h-3.5" : "w-4 h-4"}`}
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Tasks</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <div className="flex-1 min-w-0">
            <h2
              className={`font-bold ${colors.textPrimary} ${isCompact ? "text-xs" : "text-sm"}`}
            >
              Tasks
            </h2>
            {!isCompact && (
              <p className={`text-[10px] ${colors.textMuted}`}>
                {activeCount} active · {completedCount} done
              </p>
            )}
          </div>

          <div
            className={`flex items-center gap-1.5 px-2 py-1 rounded-full ${colors.accentBg}`}
          >
            <div
              className={`${isCompact ? "w-8" : "w-10"} h-1.5 ${isLightMode ? "bg-black/10" : "bg-white/20"} rounded-full overflow-hidden`}
            >
              <div
                className={`h-full ${colors.progress} transition-all duration-300`}
                style={{ width: `${completionRate}%` }}
              />
            </div>
            <span
              className={`${isCompact ? "text-[9px]" : "text-[10px]"} ${colors.accent} font-medium`}
            >
              {completionRate.toFixed(0)}%
            </span>
          </div>

          {layoutMode === "columns" && (
            <div className="relative">
              <TooltipProvider delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setShowFilterMenu(!showFilterMenu)}
                      className={`flex items-center gap-1 rounded-lg transition-all ${
                        isCompact ? "p-1.5" : "px-2 py-1.5"
                      } ${
                        priorityFilter !== "all"
                          ? `${PRIORITY_CONFIG[priorityFilter].bg} ${PRIORITY_CONFIG[priorityFilter].color}`
                          : `${isLightMode ? "bg-black/10" : "bg-white/10"} ${colors.textMuted}`
                      }`}
                    >
                      <Filter
                        className={isCompact ? "w-3 h-3" : "w-3.5 h-3.5"}
                      />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Filter by priority</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {showFilterMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowFilterMenu(false)}
                  />
                  <div
                    className={`absolute right-0 top-full mt-1 z-50 ${colors.menuBg} backdrop-blur-xl border ${colors.border} rounded-xl shadow-xl overflow-hidden min-w-[120px]`}
                  >
                    <button
                      onClick={() => {
                        setPriorityFilter("all");
                        setShowFilterMenu(false);
                      }}
                      className={`w-full flex items-center gap-2 px-3 py-2 transition-colors text-xs ${
                        priorityFilter === "all"
                          ? `${colors.accentBg} ${colors.accent}`
                          : colors.textPrimary
                      }`}
                    >
                      All
                    </button>
                    {(Object.keys(PRIORITY_CONFIG) as Priority[]).map((p) => {
                      const config = PRIORITY_CONFIG[p];
                      const PIcon = config.icon;
                      return (
                        <button
                          key={p}
                          onClick={() => {
                            setPriorityFilter(p);
                            setShowFilterMenu(false);
                          }}
                          className={`w-full flex items-center gap-2 px-3 py-2 transition-colors text-xs ${
                            priorityFilter === p
                              ? `${config.bg} ${config.color}`
                              : colors.textPrimary
                          }`}
                        >
                          <PIcon className="w-3.5 h-3.5" />
                          <span>{config.label}</span>
                          {priorityCounts[p] > 0 && (
                            <span className={`ml-auto ${colors.textMuted}`}>
                              {priorityCounts[p]}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}

          {completedCount > 0 && (
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={clearCompleted}
                    className={`${isCompact ? "text-[9px]" : "text-[10px]"} text-red-400/70 hover:text-red-400 transition-colors`}
                  >
                    Clear
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Clear completed</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        <form onSubmit={handleAddTask} className="flex gap-2">
          <div className="relative">
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => setShowPriorityMenu(!showPriorityMenu)}
                    className={`flex items-center gap-1 rounded-lg border ${PRIORITY_CONFIG[selectedPriority].border} ${PRIORITY_CONFIG[selectedPriority].bg} ${PRIORITY_CONFIG[selectedPriority].color} transition-colors ${
                      isCompact ? "px-2 py-1.5" : "px-2.5 py-2"
                    }`}
                  >
                    {(() => {
                      const Icon = PRIORITY_CONFIG[selectedPriority].icon;
                      return (
                        <Icon
                          className={isCompact ? "w-3 h-3" : "w-3.5 h-3.5"}
                        />
                      );
                    })()}
                    <ChevronDown className="w-3 h-3 opacity-60" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Priority: {PRIORITY_CONFIG[selectedPriority].label}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {showPriorityMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowPriorityMenu(false)}
                />
                <div
                  className={`absolute top-full left-0 mt-1 z-50 ${colors.menuBg} backdrop-blur-xl border ${colors.border} rounded-xl shadow-xl overflow-hidden min-w-[110px]`}
                >
                  {(Object.keys(PRIORITY_CONFIG) as Priority[]).map((p) => {
                    const pConfig = PRIORITY_CONFIG[p];
                    const PIcon = pConfig.icon;
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => {
                          setSelectedPriority(p);
                          setShowPriorityMenu(false);
                        }}
                        className={`w-full flex items-center gap-2 px-3 py-2 transition-colors text-xs ${
                          selectedPriority === p
                            ? `${pConfig.bg} ${pConfig.color}`
                            : colors.textPrimary
                        }`}
                      >
                        <PIcon className="w-3.5 h-3.5" />
                        {pConfig.label}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          <input
            type="text"
            value={newTask}
            onChange={(e) => {
              setNewTask(e.target.value);
              setError(null);
            }}
            placeholder={
              layoutMode === "tabs"
                ? `Add to ${COLUMNS.find((c) => c.id === activeTab)?.shortLabel}...`
                : "Add a new task..."
            }
            maxLength={200}
            className={`flex-1 ${colors.inputBg} border ${colors.border} rounded-lg ${colors.textPrimary} placeholder-current/40 focus:outline-none focus:ring-2 ${colors.inputFocus} transition-colors ${
              isCompact ? "text-xs px-2.5 py-1.5" : "text-sm px-3 py-2"
            }`}
          />

          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="submit"
                  disabled={!newTask.trim()}
                  className={`bg-gradient-to-r ${colors.button} text-white rounded-lg font-medium transition-all shadow-lg ${colors.buttonShadow} disabled:opacity-40 disabled:cursor-not-allowed ${
                    isCompact ? "px-2.5 py-1.5" : "px-3 py-2"
                  }`}
                >
                  <Plus className={isCompact ? "w-4 h-4" : "w-5 h-5"} />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Add task</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </form>

        {error && (
          <p
            className={`mt-1.5 text-red-400 ${isCompact ? "text-[10px]" : "text-xs"}`}
          >
            {error}
          </p>
        )}
      </div>

      {/* Content - Tabs or Columns */}
      {layoutMode === "tabs" ? (
        <>
          <div
            className={`flex items-center gap-1 ${isCompact ? "px-2 py-1.5" : "px-3 py-2"} border-b ${colors.border}`}
          >
            <div className="flex-1 flex gap-1">
              {COLUMNS.map((column) => {
                const Icon = column.icon;
                const isActive = activeTab === column.id;
                const count = tasksByStatus[column.id].length;
                const isInProgress = column.id === "in_progress";

                return (
                  <button
                    key={column.id}
                    onClick={() => setActiveTab(column.id)}
                    className={`flex-1 flex items-center justify-center gap-1 rounded-lg font-medium transition-all ${
                      isCompact ? "py-1.5 text-[10px]" : "py-2 text-xs"
                    } ${isActive ? colors.tabActive : colors.tabInactive}`}
                  >
                    <Icon
                      className={`${isCompact ? "w-3 h-3" : "w-3.5 h-3.5"} ${isInProgress && isActive ? "animate-spin" : ""}`}
                      style={
                        isInProgress && isActive
                          ? { animationDuration: "2s" }
                          : undefined
                      }
                    />
                    <span className="hidden sm:inline">
                      {column.shortLabel}
                    </span>
                    {count > 0 && (
                      <span
                        className={`${isCompact ? "text-[9px]" : "text-[10px]"} opacity-70`}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="relative">
              <TooltipProvider delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setShowFilterMenu(!showFilterMenu)}
                      className={`flex items-center gap-1 rounded-lg transition-all ${
                        isCompact ? "p-1.5" : "px-2 py-1.5"
                      } ${
                        priorityFilter !== "all"
                          ? `${PRIORITY_CONFIG[priorityFilter].bg} ${PRIORITY_CONFIG[priorityFilter].color}`
                          : `${isLightMode ? "bg-black/10" : "bg-white/10"} ${colors.textMuted}`
                      }`}
                    >
                      <Filter
                        className={isCompact ? "w-3 h-3" : "w-3.5 h-3.5"}
                      />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Filter by priority</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {showFilterMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowFilterMenu(false)}
                  />
                  <div
                    className={`absolute right-0 top-full mt-1 z-50 ${colors.menuBg} backdrop-blur-xl border ${colors.border} rounded-xl shadow-xl overflow-hidden min-w-[120px]`}
                  >
                    <button
                      onClick={() => {
                        setPriorityFilter("all");
                        setShowFilterMenu(false);
                      }}
                      className={`w-full flex items-center gap-2 px-3 py-2 transition-colors text-xs ${
                        priorityFilter === "all"
                          ? `${colors.accentBg} ${colors.accent}`
                          : colors.textPrimary
                      }`}
                    >
                      All
                    </button>
                    {(Object.keys(PRIORITY_CONFIG) as Priority[]).map((p) => {
                      const config = PRIORITY_CONFIG[p];
                      const PIcon = config.icon;
                      return (
                        <button
                          key={p}
                          onClick={() => {
                            setPriorityFilter(p);
                            setShowFilterMenu(false);
                          }}
                          className={`w-full flex items-center gap-2 px-3 py-2 transition-colors text-xs ${
                            priorityFilter === p
                              ? `${config.bg} ${config.color}`
                              : colors.textPrimary
                          }`}
                        >
                          <PIcon className="w-3.5 h-3.5" />
                          <span>{config.label}</span>
                          {priorityCounts[p] > 0 && (
                            <span className={`ml-auto ${colors.textMuted}`}>
                              {priorityCounts[p]}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>

          <div
            className={`flex-1 overflow-y-auto ${isCompact ? "p-2" : "p-3"} space-y-1.5`}
          >
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={currentTasks.map((t) => t.id)}
                strategy={verticalListSortingStrategy}
              >
                {currentTasks.length === 0 ? (
                  <div
                    className={`flex flex-col items-center justify-center h-full min-h-[80px] ${colors.textMuted}`}
                  >
                    {priorityFilter !== "all" ? (
                      <>
                        {(() => {
                          const Icon = PRIORITY_CONFIG[priorityFilter].icon;
                          return (
                            <Icon
                              className={`${isCompact ? "w-6 h-6" : "w-8 h-8"} mb-2 opacity-30`}
                            />
                          );
                        })()}
                        <p className={isCompact ? "text-[10px]" : "text-xs"}>
                          No{" "}
                          {PRIORITY_CONFIG[priorityFilter].label.toLowerCase()}{" "}
                          priority tasks
                        </p>
                      </>
                    ) : activeTab === "todo" ? (
                      <>
                        <Circle
                          className={`${isCompact ? "w-6 h-6" : "w-8 h-8"} mb-2 opacity-30`}
                        />
                        <p className={isCompact ? "text-[10px]" : "text-xs"}>
                          No tasks to do
                        </p>
                      </>
                    ) : activeTab === "in_progress" ? (
                      <>
                        <Loader2
                          className={`${isCompact ? "w-6 h-6" : "w-8 h-8"} mb-2 opacity-30`}
                        />
                        <p className={isCompact ? "text-[10px]" : "text-xs"}>
                          Nothing in progress
                        </p>
                      </>
                    ) : (
                      <>
                        <CheckCircle2
                          className={`${isCompact ? "w-6 h-6" : "w-8 h-8"} mb-2 opacity-30`}
                        />
                        <p className={isCompact ? "text-[10px]" : "text-xs"}>
                          No completed tasks
                        </p>
                      </>
                    )}
                  </div>
                ) : (
                  currentTasks.map((task) => (
                    <SortableTaskCard
                      key={task.id}
                      task={task}
                      colors={colors}
                      isCompact={isCompact}
                      onRemove={removeTask}
                      onCyclePriority={cyclePriority}
                      showIndicatorBefore={overInfo?.overId === task.id && overInfo.position === "before"}
                      showIndicatorAfter={overInfo?.overId === task.id && overInfo.position === "after"}
                    />
                  ))
                )}
              </SortableContext>

              <DragOverlay>
                {activeTask ? (
                  <DragOverlayCard
                    task={activeTask}
                    colors={colors}
                    isCompact={isCompact}
                  />
                ) : null}
              </DragOverlay>
            </DndContext>
          </div>
        </>
      ) : (
        <div className="flex-1 overflow-hidden p-3">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <div className="flex gap-2 h-full">
              {COLUMNS.map((column) => (
                <DroppableColumn
                  key={column.id}
                  column={column}
                  tasks={tasksByStatus[column.id]}
                  colors={colors}
                  isCompact={isCompact}
                  onRemove={removeTask}
                  onCyclePriority={cyclePriority}
                  overInfo={overInfo}
                />
              ))}
            </div>

            <DragOverlay>
              {activeTask ? (
                <DragOverlayCard
                  task={activeTask}
                  colors={colors}
                  isCompact={isCompact}
                />
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>
      )}
    </div>
  );
}
