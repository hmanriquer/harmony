'use client';

import { Header } from '@/components/header';
import { TeamsList } from '@/components/team-list';
import { ScheduleView } from '@/components/schedule-view';
import { useAttendance } from '@/hooks/use-attendance';

export default function Main() {
  const {
    teams,
    schedule,
    includeFriday,
    isLoading,
    addTeam,
    removeTeam,
    addMember,
    removeMember,
    generateSchedule,
    clearSchedule,
    updateTeamSchedule,
    toggleFriday,
  } = useAttendance();

  if (isLoading)
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-6 py-8">
        <div className="grid gap-8 lg:grid-cols-[320px_1fr] xl:grid-cols-[360px_1fr]">
          <aside className="space-y-6">
            <TeamsList
              teams={teams}
              onAddTeam={addTeam}
              onRemoveTeam={removeTeam}
              onAddMember={addMember}
              onRemoveMember={(_, memberId) => removeMember(memberId)}
            />
          </aside>

          <section>
            <ScheduleView
              teams={teams}
              schedule={schedule}
              includeFriday={includeFriday}
              onToggleFriday={toggleFriday}
              onGenerate={generateSchedule}
              onUpdateSchedule={updateTeamSchedule}
              onClear={clearSchedule}
            />
          </section>
        </div>
      </main>
    </div>
  );
}
