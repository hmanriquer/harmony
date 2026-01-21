'use client';

import { TeamsList } from '@/components/team-list';
import { ScheduleView } from '@/components/schedule-view';
import { useAttendance } from '@/hooks/use-attendance';

export function DashboardView() {
  const {
    teams,
    schedule,
    includeFriday,
    totalChairs,
    dailySettings,
    isLoading,
    addTeam,
    removeTeam,
    updateTeam,
    addMember,
    removeMember,
    generateSchedule,
    clearSchedule,
    updateTeamSchedule,
    toggleFriday,
    updateTotalChairs,
    updateDailyOccupancy,
  } = useAttendance();

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-[calc(100vh-73px)]">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );

  return (
    <main className="container mx-auto px-6 py-8">
      <div className="grid gap-8 lg:grid-cols-[370px_1fr] xl:grid-cols-[410px_1fr]">
        <aside className="space-y-6">
          <TeamsList
            teams={teams}
            onAddTeam={addTeam}
            onRemoveTeam={removeTeam}
            onUpdateTeam={(id, data) => {
              const team = teams.find(t => t.id === id);
              if (team) updateTeam({ ...team, ...data }, id);
            }}
            onAddMember={addMember}
            onRemoveMember={(_, memberId) => removeMember(memberId)}
          />
        </aside>

        <section>
          <ScheduleView
            teams={teams}
            schedule={schedule}
            includeFriday={includeFriday}
            totalChairs={totalChairs}
            dailySettings={dailySettings}
            onToggleFriday={toggleFriday}
            onGenerate={generateSchedule}
            onUpdateSchedule={updateTeamSchedule}
            onClear={clearSchedule}
            onUpdateTotalChairs={updateTotalChairs}
            onUpdateDailyOccupancy={updateDailyOccupancy}
          />
        </section>
      </div>
    </main>
  );
}
