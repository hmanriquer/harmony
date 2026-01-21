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

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Translate.toString(transform),
        backgroundColor: `color-mix(in srgb, ${team.color}, transparent 85%)`,
        borderLeft: `4px solid ${team.color}`,
      }}
      className={`group flex items-center gap-2 rounded-lg pl-3 pr-4 py-2.5 text-sm font-semibold transition-all cursor-grab active:cursor-grabbing border-y border-r border-transparent hover:border-border/50 ${
        isDragging
          ? 'shadow-fluent-lg opacity-90 z-50 scale-105'
          : 'shadow-sm hover:shadow-md'
      }`}
      {...listeners}
      {...attributes}
    >
      <GripVertical className="h-4 w-4 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors" />
      <span className="truncate">{team.name}</span>
    </div>
  );
}
