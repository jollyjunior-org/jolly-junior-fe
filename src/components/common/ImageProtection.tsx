'use client';

import { useEffect } from 'react';

/**
 * Global Image Privacy Protection Component
 * Prevents:
 * 1. Right-clicking images ("Save image as...", "Copy image", "Open image in new tab").
 * 2. Dragging images off the webpage to desktop or other windows.
 * 3. Keyboard shortcuts for saving web media (Cmd/Ctrl + S, Cmd/Ctrl + U).
 */
export const ImageProtection: React.FC = () => {
  useEffect(() => {
    // 1. Prevent Right-Click Context Menu on Images and Image Containers
    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const isImage =
        target.tagName === 'IMG' ||
        target.tagName === 'PICTURE' ||
        target.tagName === 'CANVAS' ||
        target.tagName === 'VIDEO' ||
        target.closest('img') !== null ||
        target.closest('[data-protected-image="true"]') !== null;

      if (isImage) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    // 2. Prevent Image Dragging
    const handleDragStart = (e: DragEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const isImage =
        target.tagName === 'IMG' ||
        target.tagName === 'PICTURE' ||
        target.closest('img') !== null ||
        target.closest('[data-protected-image="true"]') !== null;

      if (isImage) {
        e.preventDefault();
      }
    };

    // 3. Prevent Save Page / View Source Key Combinations
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;
      const key = e.key.toLowerCase();

      // Block Ctrl+S / Cmd+S (Save) and Ctrl+U / Cmd+U (View Source)
      if (isCmdOrCtrl && (key === 's' || key === 'u')) {
        e.preventDefault();
      }
    };

    window.addEventListener('contextmenu', handleContextMenu, true);
    window.addEventListener('dragstart', handleDragStart, true);
    window.addEventListener('keydown', handleKeyDown, true);

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu, true);
      window.removeEventListener('dragstart', handleDragStart, true);
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, []);

  return null;
};

export default ImageProtection;
