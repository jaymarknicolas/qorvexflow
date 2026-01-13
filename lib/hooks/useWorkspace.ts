/**
 * useWorkspace Hook
 * Manages workspace layout and widget placement
 */

import { useState, useEffect, useCallback } from "react";
import type { WidgetType } from "@/types";
import { workspaceStorage } from "@/lib/services/storage";
import { SLOT_IDS } from "@/lib/constants";

export interface UseWorkspaceReturn {
  slotWidgets: Record<string, WidgetType | null>;
  placeWidget: (slotId: string, widgetType: WidgetType) => boolean;
  removeWidget: (slotId: string) => void;
  moveWidget: (fromSlotId: string, toSlotId: string) => boolean;
  clearWorkspace: () => void;
  isSlotEmpty: (slotId: string) => boolean;
  getWidgetInSlot: (slotId: string) => WidgetType | null;
}

export function useWorkspace(): UseWorkspaceReturn {
  const [slotWidgets, setSlotWidgets] = useState<Record<string, WidgetType | null>>(() => {
    const initialState: Record<string, WidgetType | null> = {};
    SLOT_IDS.forEach((id) => {
      initialState[id] = null;
    });
    return initialState;
  });

  // Load workspace from localStorage on mount
  useEffect(() => {
    const saved = workspaceStorage.load();
    if (saved && saved.slotWidgets) {
      setSlotWidgets((prev) => ({ ...prev, ...saved.slotWidgets }));
    }
  }, []);

  // Save workspace to localStorage whenever it changes
  useEffect(() => {
    workspaceStorage.save({ slotWidgets });
  }, [slotWidgets]);

  const placeWidget = useCallback(
    (slotId: string, widgetType: WidgetType): boolean => {
      // Validate slot ID
      if (!SLOT_IDS.includes(slotId as any)) {
        console.warn(`Invalid slot ID: ${slotId}`);
        return false;
      }

      // Check if slot is already occupied
      if (slotWidgets[slotId] !== null) {
        console.warn(`Slot ${slotId} is already occupied`);
        return false;
      }

      setSlotWidgets((prev) => ({
        ...prev,
        [slotId]: widgetType,
      }));

      return true;
    },
    [slotWidgets]
  );

  const removeWidget = useCallback((slotId: string) => {
    setSlotWidgets((prev) => ({
      ...prev,
      [slotId]: null,
    }));
  }, []);

  const moveWidget = useCallback(
    (fromSlotId: string, toSlotId: string): boolean => {
      // Validate slot IDs
      if (!SLOT_IDS.includes(fromSlotId as any) || !SLOT_IDS.includes(toSlotId as any)) {
        console.warn("Invalid slot ID");
        return false;
      }

      // Check if source has a widget
      const widgetType = slotWidgets[fromSlotId];
      if (!widgetType) {
        console.warn(`No widget in slot ${fromSlotId}`);
        return false;
      }

      // Move widget
      setSlotWidgets((prev) => ({
        ...prev,
        [fromSlotId]: null,
        [toSlotId]: widgetType,
      }));

      return true;
    },
    [slotWidgets]
  );

  const clearWorkspace = useCallback(() => {
    const emptyState: Record<string, WidgetType | null> = {};
    SLOT_IDS.forEach((id) => {
      emptyState[id] = null;
    });
    setSlotWidgets(emptyState);
  }, []);

  const isSlotEmpty = useCallback(
    (slotId: string): boolean => {
      return slotWidgets[slotId] === null;
    },
    [slotWidgets]
  );

  const getWidgetInSlot = useCallback(
    (slotId: string): WidgetType | null => {
      return slotWidgets[slotId] || null;
    },
    [slotWidgets]
  );

  return {
    slotWidgets,
    placeWidget,
    removeWidget,
    moveWidget,
    clearWorkspace,
    isSlotEmpty,
    getWidgetInSlot,
  };
}
