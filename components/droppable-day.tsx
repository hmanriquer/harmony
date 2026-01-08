'use client';

import { useDroppable } from '@dnd-kit/core';
import { ReactNode } from 'react';

interface DroppableDayProps {
  dayIndex: number;
  children: ReactNode;
  isOver?: boolean;
}

export function DroppableDay({
  dayIndex,
  children,
  isOver,
}: DroppableDayProps) {
  const { setNodeRef, isOver: isDragOver } = useDroppable({
    id: `day-${dayIndex}`,
    data: { dayIndex },
  });

  const showDropIndicator = isOver || isDragOver;

  return (
    <div
      ref={setNodeRef}
      className={`border-r last:border-r-0 p-3 space-y-2 min-h-[180px] transition-colors ${
        showDropIndicator ? 'bg-accent/50' : ''
      }`}
    >
      {children}
      {showDropIndicator && (
        <div className="border-2 border-dashed border-primary/30 rounded-md p-2 text-center">
          <span className="text-xs text-primary/70">Drop here</span>
        </div>
      )}
    </div>
  );
}
