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
import { Eraser, Plus } from 'lucide-react';
import { RefreshCw, Calendar, Settings, AlertCircle } from 'lucide-react';
import { Team } from '@/@types/teams';
import {
  AttendanceSchedule,
  WEEKDAYS_SHORT,
  WEEKDAYS,
} from '@/@types/attendance';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { DraggableTeamChip } from './draggable-team-chip';
import { DroppableDay } from './droppable-day';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Input } from './ui/input';

interface ScheduleViewProps {
  teams: Team[];
  schedule: AttendanceSchedule[];
  includeFriday: boolean;
  totalChairs: number;
  dailySettings: { dayIndex: number; occupancyPercentage: number }[];
  onToggleFriday: () => void;
  onGenerate: () => void;
  onClear: () => void;
  onUpdateSchedule: (
    teamId: number,
    newDays: number[],
    maxDays: number
  ) => void;
  onUpdateTotalChairs: (totalChairs: number) => void;
  onUpdateDailyOccupancy: (dayIndex: number, percentage: number) => void;
}

export function ScheduleView({
  teams,
  schedule,
  includeFriday,
  totalChairs,
  dailySettings,
  onToggleFriday,
  onGenerate,
  onClear,
  onUpdateSchedule,
  onUpdateTotalChairs,
  onUpdateDailyOccupancy,
}: ScheduleViewProps) {
  const [activeTeam, setActiveTeam] = useState<Team | null>(null);
  const [activeDayIndex, setActiveDayIndex] = useState<number | null>(null);
  const [chairsInput, setChairsInput] = useState(totalChairs.toString());

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

  const handleChairsUpdate = () => {
    const value = parseInt(chairsInput);
    if (!isNaN(value) && value > 0) onUpdateTotalChairs(value);
  };

  const getDayOccupancy = (dayIndex: number) => {
    const dayTeams = getTeamsForDay(dayIndex);
    const totalMembers = dayTeams.reduce(
      (sum, team) => sum + (team.capacity || 0),
      0
    );
    const target =
      dailySettings.find(s => s.dayIndex === dayIndex)?.occupancyPercentage ??
      100;

    // Calculate actual percentage based on total capacity
    const actualPercentage =
      totalChairs > 0 ? Math.round((totalMembers / totalChairs) * 100) : 0;

    return { totalMembers, target, actualPercentage };
  };

  const handleManualAdd = (dayIndex: number, teamIdStr: string) => {
    const teamId = parseInt(teamIdStr);
    const currentSchedule = getTeamSchedule(teamId);

    // Simple logic: If strict consecutive rule is required, we might need more complex logic.
    // For now, let's try to just add the day. The store might enforce rules.
    // However, to be safe with the current store logic helper, let's try to find a consecutive pair including this day.
    // But if we want TRUE manual freedom, the store needs update.
    // Assuming the user wants to keep the 2-day rule for now but just "place" them manually.

    // If team is not scheduled, add to [day, day+1] or [day-1, day]
    if (currentSchedule.length === 0) {
      const nextDay = dayIndex + 1 < maxDays ? dayIndex + 1 : dayIndex - 1;
      const newDays = [dayIndex, nextDay].sort((a, b) => a - b);
      onUpdateSchedule(teamId, newDays, maxDays);
    } else {
      // If already scheduled, maybe move them?
      // Let's just move their block to start or end at this day.
      const nextDay = dayIndex + 1 < maxDays ? dayIndex + 1 : dayIndex - 1;
      const newDays = [dayIndex, nextDay].sort((a, b) => a - b);
      onUpdateSchedule(teamId, newDays, maxDays);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold">Weekly Schedule</h2>

        <div className="flex flex-wrap items-center gap-2">
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

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="mr-1 size-4" />
                Capacity
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-60">
              <div className="space-y-3">
                <Label>Total chairs/capacity</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={chairsInput}
                    onChange={e => setChairsInput(e.target.value)}
                    onBlur={handleChairsUpdate}
                    onKeyDown={e => e.key === 'Enter' && handleChairsUpdate()}
                    className="h-9"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Used to calculate occupancy %
                </p>
              </div>
            </PopoverContent>
          </Popover>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onClear}
              disabled={schedule.length === 0}
            >
              <Eraser className="mr-1 size-4" />
              Clear
            </Button>
            <Button
              size="sm"
              onClick={onGenerate}
              disabled={teams.length === 0}
            >
              <RefreshCw className="mr-1 h-4 w-4" />
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

      <div className="rounded-lg border bg-card shadow-fluent-sm overflow-hidden">
        {/* Day headers */}
        <div
          className="grid border-b bg-muted/30"
          style={{ gridTemplateColumns: `repeat(${maxDays}, 1fr)` }}
        >
          {days.map((day, i) => {
            const { totalMembers, target, actualPercentage } =
              getDayOccupancy(i);
            const isOverCapacity = actualPercentage > target;
            // User requested to work without assigned teams filtering, so we show all teams.
            // We could still mark them as "Assigned" in the UI if needed, but for now just show all.
            const avaliableTeams = teams;

            return (
              <div
                key={day}
                className="border-r last:border-r-0 px-3 py-3 flex flex-col gap-2"
              >
                <div className="text-center">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {daysShort[i]}
                  </p>
                  <p className="text-sm font-medium mt-0.5">{day}</p>
                </div>

                {/* Occupancy Info */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                    <span>
                      {totalMembers} / {totalChairs}
                    </span>
                    <Popover>
                      <PopoverTrigger asChild>
                        <button className="hover:underline cursor-pointer">
                          {target}%
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-48 p-2">
                        <div className="space-y-2">
                          <Label className="text-xs">Target Occupancy %</Label>
                          <Input
                            type="number"
                            className="h-7 text-xs"
                            defaultValue={target}
                            onBlur={e => {
                              const val = parseInt(e.target.value);
                              if (!isNaN(val) && val >= 0 && val <= 100) {
                                onUpdateDailyOccupancy(i, val);
                              }
                            }}
                            onKeyDown={e => {
                              if (e.key === 'Enter') {
                                const val = parseInt(e.currentTarget.value);
                                if (!isNaN(val) && val >= 0 && val <= 100) {
                                  onUpdateDailyOccupancy(i, val);
                                }
                              }
                            }}
                          />
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                  <Progress
                    value={actualPercentage}
                    max={100}
                    className={`h-1.5 ${isOverCapacity ? 'bg-destructive/20 [&>div]:bg-destructive' : ''}`}
                  />
                  {isOverCapacity && (
                    <div className="flex items-center gap-1 text-[10px] text-destructive font-medium">
                      <AlertCircle className="h-3 w-3" />
                      <span>Over Value</span>
                    </div>
                  )}
                </div>

                {/* Manual Add Button */}
                <div className="mt-1">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-6 text-[10px] px-2 w-full bg-background/50 hover:bg-background border-dashed shadow-none"
                        onPointerDown={e => e.stopPropagation()}
                      >
                        <Plus className="mr-1 h-3 w-3" />
                        Add Team
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-48 p-1"
                      onPointerDown={e => e.stopPropagation()}
                    >
                      <div className="max-h-[200px] overflow-y-auto space-y-1">
                        {avaliableTeams.length === 0 ? (
                          <div className="text-xs text-muted-foreground p-2 text-center">
                            No teams available
                          </div>
                        ) : (
                          avaliableTeams.map(team => (
                            <button
                              key={team.id}
                              onClick={() =>
                                handleManualAdd(i, team.id.toString())
                              }
                              className="w-full flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground rounded-sm transition-colors text-left"
                            >
                              <div
                                className="w-2 h-2 rounded-full shrink-0"
                                style={{ backgroundColor: team.color }}
                              />
                              <span className="truncate">{team.name}</span>
                            </button>
                          ))
                        )}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            );
          })}
        </div>

        {/* Calendar grid with DnD */}
        <DndContext
          sensors={sensors}
          collisionDetection={pointerWithin}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
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
      </div>

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
