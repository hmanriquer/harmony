'use client';

import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { Team } from '@/@types/teams';

interface DraggableTeamChipProps {
  team: Team;
  dayIndex: number;
}

export function DraggableTeamChip({ team, dayIndex }: DraggableTeamChipProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `${team.id}-${dayIndex}`,
      data: { team, fromDay: dayIndex },
    });

  const style = {
    transform: CSS.Translate.toString(transform),
    backgroundColor: `${team.color}15`,
    borderLeft: `3px solid ${team.color}`,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-shadow cursor-grab active:cursor-grabbing ${
        isDragging
          ? 'shadow-fluent-lg opacity-90 z-50'
          : 'hover:shadow-fluent-md'
      }`}
      {...listeners}
      {...attributes}
    >
      <GripVertical className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      <span className="truncate">{team.name}</span>
    </div>
  );
}
