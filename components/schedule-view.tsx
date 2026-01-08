'use client';

import { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  pointerWithin,
} from '@dnd-kit/core';
import { RefreshCw, Calendar } from 'lucide-react';
import { Team } from '@/@types/teams';
import {
  AttendanceSchedule,
  WEEKDAYS_SHORT,
  WEEKDAYS,
} from '@/@types/attendance';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { DraggableTeamChip } from './draggable-team-chip';
import { DroppableDay } from './droppable-day';

interface ScheduleViewProps {
  teams: Team[];
  schedule: AttendanceSchedule[];
  includeFriday: boolean;
  onToggleFriday: () => void;
  onGenerate: () => void;
  onClear: () => void;
  onUpdateSchedule: (
    teamId: number,
    newDays: number[],
    maxDays: number
  ) => void;
}

export function ScheduleView({
  teams,
  schedule,
  includeFriday,
  onToggleFriday,
  onGenerate,
  onClear,
  onUpdateSchedule,
}: ScheduleViewProps) {
  const [activeTeam, setActiveTeam] = useState<Team | null>(null);
  const [activeDayIndex, setActiveDayIndex] = useState<number | null>(null);

  const maxDays = includeFriday ? 5 : 4;
  const days = WEEKDAYS.slice(0, maxDays);
  const daysShort = WEEKDAYS_SHORT.slice(0, maxDays);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const getTeamsForDay = (dayIndex: number): Team[] => {
    const teamIds = schedule
      .filter(s => s.days.includes(dayIndex))
      .map(s => s.teamId);
    return teams.filter(t => teamIds.includes(t.id));
  };

  const getTeamSchedule = (teamId: number): number[] => {
    return schedule.find(s => s.teamId === teamId)?.days || [];
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { team, fromDay } = event.active.data.current as {
      team: Team;
      fromDay: number;
    };
    setActiveTeam(team);
    setActiveDayIndex(fromDay);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTeam(null);
    setActiveDayIndex(null);

    if (!over) return;

    const { team } = active.data.current as { team: Team; fromDay: number };
    const toDay = over.data.current?.dayIndex as number;

    if (toDay === undefined) return;

    // Calculate new consecutive days based on drop position
    let newDays: number[];
    if (toDay + 1 < maxDays) {
      newDays = [toDay, toDay + 1];
    } else {
      newDays = [toDay - 1, toDay];
    }

    onUpdateSchedule(team.id, newDays, maxDays);
  };

  return (
    <div className="space-y-6">
      {/* Header controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold">Weekly Schedule</h2>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch
              id="friday-toggle"
              checked={includeFriday}
              onCheckedChange={onToggleFriday}
            />
            <Label htmlFor="friday-toggle" className="text-sm cursor-pointer">
              Include Friday
            </Label>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onClear}
              disabled={schedule.length === 0}
            >
              Clear
            </Button>
            <Button
              size="sm"
              onClick={onGenerate}
              disabled={teams.length === 0}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Generate
            </Button>
          </div>
        </div>
      </div>

      {/* Info badge */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg px-4 py-2">
        <span className="font-medium text-foreground">Rule:</span>
        Each team attends exactly 2 consecutive days per week
      </div>

      {/* Calendar grid with DnD */}
      <DndContext
        sensors={sensors}
        collisionDetection={pointerWithin}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="rounded-lg border bg-card shadow-fluent-sm overflow-hidden">
          {/* Day headers */}
          <div
            className="grid border-b bg-muted/30"
            style={{ gridTemplateColumns: `repeat(${maxDays}, 1fr)` }}
          >
            {days.map((day, i) => (
              <div
                key={day}
                className="border-r last:border-r-0 px-3 py-3 text-center"
              >
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {daysShort[i]}
                </p>
                <p className="text-sm font-medium mt-0.5">{day}</p>
              </div>
            ))}
          </div>

          {/* Schedule cells */}
          <div
            className="grid"
            style={{ gridTemplateColumns: `repeat(${maxDays}, 1fr)` }}
          >
            {days.map((_, dayIndex) => {
              const dayTeams = getTeamsForDay(dayIndex);
              return (
                <DroppableDay key={dayIndex} dayIndex={dayIndex}>
                  {dayTeams.length === 0 ? (
                    <div className="flex h-full items-center justify-center min-h-[60px]">
                      <span className="text-xs text-muted-foreground">
                        No teams
                      </span>
                    </div>
                  ) : (
                    dayTeams.map(team => (
                      <DraggableTeamChip
                        key={`${team.id}-${dayIndex}`}
                        team={team}
                        dayIndex={dayIndex}
                      />
                    ))
                  )}
                </DroppableDay>
              );
            })}
          </div>
        </div>

        {/* Drag overlay */}
        <DragOverlay>
          {activeTeam && activeDayIndex !== null && (
            <div
              className="rounded-md px-3 py-2 text-sm font-medium shadow-fluent-lg"
              style={{
                backgroundColor: `${activeTeam.color}20`,
                borderLeft: `3px solid ${activeTeam.color}`,
              }}
            >
              {activeTeam.name}
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {/* Team schedule summary */}
      {schedule.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">
            Team Assignments (2 days each)
          </h3>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {teams.map(team => {
              const teamDays = getTeamSchedule(team.id);
              return (
                <div
                  key={team.id}
                  className="flex items-center gap-3 rounded-lg border bg-card p-3"
                >
                  <div
                    className="h-3 w-3 rounded-full shrink-0"
                    style={{ backgroundColor: team.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{team.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {teamDays.length > 0
                        ? teamDays.map(d => daysShort[d]).join(' → ')
                        : 'Not scheduled'}
                    </p>
                  </div>
                  <span className="text-sm font-medium text-primary">
                    {teamDays.length}d
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty state */}
      {teams.length === 0 && (
        <div className="rounded-lg border border-dashed bg-muted/30 p-8 text-center">
          <Calendar className="mx-auto h-8 w-8 text-muted-foreground/50" />
          <p className="mt-3 text-sm text-muted-foreground">
            Add teams first, then generate a schedule
          </p>
        </div>
      )}

      {teams.length > 0 && schedule.length === 0 && (
        <div className="rounded-lg border border-dashed bg-muted/30 p-8 text-center">
          <RefreshCw className="mx-auto h-8 w-8 text-muted-foreground/50" />
          <p className="mt-3 text-sm text-muted-foreground">
            Click &quot;Generate&quot; to create the attendance schedule
          </p>
        </div>
      )}

      {/* Instructions */}
      {schedule.length > 0 && (
        <p className="text-xs text-muted-foreground text-center">
          💡 Drag a team to move its 2-day block to a different position
        </p>
      )}
    </div>
  );
}
