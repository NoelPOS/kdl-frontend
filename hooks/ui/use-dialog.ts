"use client";

import { useState, useCallback } from "react";

/**
 * Manages open/close state for a dialog, with an optional selected entity
 * to support both "create" mode (no item) and "edit" mode (item provided).
 *
 * Usage:
 *   const dialog = useDialog<Student>();
 *   dialog.open()           // opens create dialog
 *   dialog.open(student)    // opens edit dialog pre-filled with student
 *   dialog.close()          // closes and clears selectedItem
 *
 *   <MyDialog
 *     isOpen={dialog.isOpen}
 *     onClose={dialog.close}
 *     item={dialog.selectedItem}  // undefined = create mode
 *   />
 */
export function useDialog<T = undefined>() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<T | undefined>(undefined);

  const open = useCallback((item?: T) => {
    setSelectedItem(item);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    // Delay clearing the item so closing animations finish before form resets
    setTimeout(() => setSelectedItem(undefined), 200);
  }, []);

  return { isOpen, open, close, selectedItem };
}
