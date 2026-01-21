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
    <div className="space-y-6 animate-fade-in">
      {/* Header card */}
      <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
        <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1.5">
            <h2 className="text-2xl font-semibold tracking-tight">
              Weekly Schedule
            </h2>
            <p className="text-sm text-muted-foreground">
              Manage team attendance and capacity
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 mr-2">
              <Switch
                id="friday-toggle"
                checked={includeFriday}
                onCheckedChange={onToggleFriday}
              />
              <Label
                htmlFor="friday-toggle"
                className="text-sm font-medium cursor-pointer"
              >
                Include Friday
              </Label>
            </div>

            <div className="h-8 w-px bg-border hidden sm:block mx-1" />

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-9">
                  <Settings className="mr-2 h-4 w-4" />
                  Capacity
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-72">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-medium leading-none">Total Capacity</h4>
                    <p className="text-sm text-muted-foreground">
                      Set the total number of available chairs/seats.
                    </p>
                  </div>
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
                </div>
              </PopoverContent>
            </Popover>

            <Button
              variant="outline"
              size="sm"
              onClick={onClear}
              disabled={schedule.length === 0}
              className="h-9"
            >
              <Eraser className="mr-2 h-4 w-4" />
              Clear
            </Button>

            <Button
              size="sm"
              onClick={onGenerate}
              disabled={teams.length === 0}
              className="h-9 px-4 shadow-sm"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Generate
            </Button>
          </div>
        </div>
      </div>

      {/* Constraints Info */}
      <div className="flex items-center gap-2.5 text-sm text-muted-foreground bg-accent/40 border border-border/50 rounded-lg px-4 py-3">
        <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
        <p>
          <span className="font-medium text-foreground">Constraint:</span> Each
          team must be scheduled for exactly{' '}
          <span className="font-medium text-foreground">
            2 consecutive days
          </span>{' '}
          per week.
        </p>
      </div>

      {/* Main Schedule Board */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        {/* Day headers */}
        <div
          className="grid border-b bg-muted/40"
          style={{ gridTemplateColumns: `repeat(${maxDays}, 1fr)` }}
        >
          {days.map((day, i) => {
            const { totalMembers, target, actualPercentage } =
              getDayOccupancy(i);
            const isOverCapacity = actualPercentage > target;
            const avaliableTeams = teams;

            return (
              <div
                key={day}
                className="border-r last:border-r-0 px-4 py-4 flex flex-col gap-3 group/day"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                      {daysShort[i]}
                    </p>
                    <p className="text-sm font-semibold text-foreground mt-0.5">
                      {day}
                    </p>
                  </div>

                  {/* Manual Add Button (Visible on hover) */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover/day:opacity-100 transition-opacity"
                        onPointerDown={e => e.stopPropagation()}
                      >
                        <Plus className="h-3.5 w-3.5 text-muted-foreground" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-56 p-2"
                      align="end"
                      onPointerDown={e => e.stopPropagation()}
                    >
                      <div className="mb-2 px-2 text-xs font-medium text-muted-foreground">
                        Add Team to {daysShort[i]}
                      </div>
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
                              className="w-full flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground rounded-md transition-colors text-left"
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

                {/* Occupancy Info */}
                <div className="space-y-1.5 bg-background/50 rounded-md p-2 border border-border/50">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground font-medium">
                      {totalMembers} / {totalChairs} seats
                    </span>
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          className={`font-medium hover:underline decoration-dashed decoration-muted-foreground/50 ${isOverCapacity ? 'text-destructive' : 'text-muted-foreground'}`}
                        >
                          {actualPercentage}%
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-56 p-3">
                        <div className="space-y-3">
                          <div className="space-y-1">
                            <Label className="text-xs font-medium">
                              Target Occupancy
                            </Label>
                            <p className="text-[10px] text-muted-foreground">
                              Threshold for warning indication
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              className="h-8"
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
                            <span className="text-sm font-medium">%</span>
                          </div>
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
                    <div className="flex items-center gap-1.5 text-[10px] text-destructive font-medium animate-pulse">
                      <AlertCircle className="h-3 w-3" />
                      <span>Capacity Exceeded</span>
                    </div>
                  )}
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
            className="grid bg-muted/5 min-h-[300px]"
            style={{ gridTemplateColumns: `repeat(${maxDays}, 1fr)` }}
          >
            {days.map((_, dayIndex) => {
              const dayTeams = getTeamsForDay(dayIndex);
              return (
                <DroppableDay key={dayIndex} dayIndex={dayIndex}>
                  <div className="h-full p-2 space-y-2">
                    {dayTeams.length === 0 ? (
                      <div className="flex h-full flex-col items-center justify-center min-h-[120px] text-center p-4 border-2 border-dashed border-border/40 rounded-lg m-2">
                        <span className="text-xs font-medium text-muted-foreground/60">
                          No teams assigned
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
                  </div>
                </DroppableDay>
              );
            })}
          </div>

          {/* Drag overlay */}
          <DragOverlay>
            {activeTeam && activeDayIndex !== null && (
              <div
                className="rounded-lg px-4 py-2.5 text-sm font-semibold shadow-fluent-xl ring-2 ring-primary/20 backdrop-blur-sm"
                style={{
                  backgroundColor: `color-mix(in srgb, ${activeTeam.color}, transparent 10%)`,
                  color: '#fff',
                }}
              >
                {activeTeam.name}
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Team schedule summary (Kanban) */}
      {schedule.length > 0 && (
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold tracking-tight">
              Schedule Overview
            </h3>
          </div>

          <div
            className={`grid gap-6 ${
              includeFriday
                ? 'grid-cols-1 md:grid-cols-3'
                : 'grid-cols-1 sm:grid-cols-2'
            }`}
          >
            {[
              {
                title: 'Mon - Tue',
                teams: teams.filter(t => {
                  const days = getTeamSchedule(t.id);
                  return days.includes(0); // Starts or includes Monday
                }),
              },
              {
                title: 'Wed - Thu',
                teams: teams.filter(t => {
                  const days = getTeamSchedule(t.id);
                  return days.includes(2); // Starts or includes Wednesday
                }),
              },
              ...(includeFriday
                ? [
                    {
                      title: 'Friday',
                      teams: teams.filter(t => {
                        const days = getTeamSchedule(t.id);
                        return days.includes(4);
                      }),
                    },
                  ]
                : []),
            ].map(group => (
              <div
                key={group.title}
                className="group relative flex flex-col gap-3 rounded-xl border bg-card/50 p-5 shadow-sm transition-all hover:bg-card hover:shadow-md"
              >
                <div className="flex items-center justify-between border-b pb-3 border-border/50">
                  <h4 className="font-semibold text-sm text-foreground/80 uppercase tracking-wider">
                    {group.title}
                  </h4>
                  <span className="text-xs font-medium text-muted-foreground bg-accent/50 px-2 py-0.5 rounded-full">
                    {group.teams.length}
                  </span>
                </div>

                <div className="space-y-3 pt-1">
                  {group.teams.length === 0 ? (
                    <div className="py-8 text-center">
                      <p className="text-xs text-muted-foreground italic">
                        No active teams
                      </p>
                    </div>
                  ) : (
                    group.teams.map(team => (
                      <div
                        key={team.id}
                        className="flex items-center gap-3 rounded-lg border bg-background p-3.5 shadow-sm transition-all hover:border-primary/20 hover:shadow-md group/card"
                        style={{
                          borderLeft: `4px solid ${team.color}`,
                        }}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-base font-semibold truncate text-card-foreground group-hover/card:text-primary transition-colors">
                            {team.name}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {teams.length === 0 && (
        <div className="rounded-xl border-2 border-dashed bg-muted/20 p-12 text-center animate-in fade-in zoom-in duration-500">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Calendar className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">No teams yet</h3>
          <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
            Start by adding teams to your workspace using the sidebar on the
            left.
          </p>
        </div>
      )}

      {teams.length > 0 && schedule.length === 0 && (
        <div className="rounded-xl border-2 border-dashed bg-muted/20 p-12 text-center animate-in fade-in zoom-in duration-500">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <RefreshCw className="h-8 w-8 text-primary" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">Ready to Schedule</h3>
          <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
            Click &quot;Generate&quot; to automatically create an optimized
            attendance schedule for your teams.
          </p>
          <Button
            onClick={onGenerate}
            className="mt-6 shadow-lg shadow-primary/20"
          >
            Generate Schedule
          </Button>
        </div>
      )}
    </div>
  );
}
