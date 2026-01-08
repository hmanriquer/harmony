import { toast } from 'sonner';
import { create } from 'zustand';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Team } from '@/@types/teams';
import { Member } from '@/@types/members';
import { AttendanceSchedule, TEAM_COLORS } from '@/@types/attendance';
import {
  createTeam,
  deleteTeam,
  listTeams,
  updateTeam,
} from '@/services/teams.service';
import {
  createMember,
  deleteMember,
  updateMember,
} from '@/services/members.service';
import {
  clearAllSchedules,
  createSchedules,
  deleteSchedulesByTeam,
  listSchedules,
} from '@/services/schedule.service';
import { listSettings, toggleFriday } from '@/services/attendance.service';

export interface AttendanceData {
  teams: Team[];
  schedule: AttendanceSchedule[];
  includeFriday: boolean;
}

interface AttendanceState {
  localSchedule: AttendanceSchedule[] | null;
  setLocalSchedule: (
    schedule:
      | AttendanceSchedule[]
      | null
      | ((prev: AttendanceSchedule[] | null) => AttendanceSchedule[] | null)
  ) => void;
}

export const useAttendanceState = create<AttendanceState>(set => ({
  localSchedule: null,
  setLocalSchedule: schedule =>
    set(state => ({
      localSchedule:
        typeof schedule === 'function'
          ? schedule(state.localSchedule)
          : schedule,
    })),
}));

const getNextColor = (teams: Team[]): string => {
  const usedColors = teams.map(t => t.color);
  const availableColor = TEAM_COLORS.find(c => !usedColors.includes(c));
  return availableColor || TEAM_COLORS[teams.length % TEAM_COLORS.length];
};

async function fetchAttendanceData() {
  const [teamsResult, scheduleResult, settingsResult] = await Promise.all([
    listTeams(),
    listSchedules(),
    listSettings(),
  ]);

  const teams: Team[] = teamsResult || [];

  const scheduleMap = new Map<number, number[]>();
  (scheduleResult || []).forEach(s => {
    const existing = scheduleMap.get(s.teamId) || [];
    existing.push(s.dayIndex);
    scheduleMap.set(s.teamId, existing);
  });

  const schedule: AttendanceSchedule[] = Array.from(scheduleMap.entries()).map(
    ([teamId, days]) => ({ teamId, days: days.sort((a, b) => a - b) })
  );

  return {
    teams,
    schedule,
    includeFriday: settingsResult[0]?.includeFriday ?? false,
  };
}

export function useAttendanceData() {
  return useQuery({
    queryKey: ['attendance-data'],
    queryFn: fetchAttendanceData,
    staleTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });
}

export function useTeamMutations() {
  const queryClient = useQueryClient();
  const { setLocalSchedule } = useAttendanceState();
  const { data } = useAttendanceData();
  const teams = data?.teams || [];

  const invalidateData = () => {
    setLocalSchedule(null);
    queryClient.invalidateQueries({ queryKey: ['attendance-data'] });
  };

  const addTeamMutation = useMutation({
    mutationFn: async (name: string) => {
      const color = getNextColor(teams);
      const result = await createTeam({ name, color, members: [] });
      return result;
    },
    onMutate: async name => {
      await queryClient.cancelQueries({ queryKey: ['attendance-data'] });
      const previousData = queryClient.getQueryData(['attendance-data']);

      queryClient.setQueryData(
        ['attendance-data'],
        (old: AttendanceData | undefined) => {
          if (!old) return old;
          const color = getNextColor(old.teams || []);
          // Optimistic team with temp ID
          const newTeam = { id: -Math.random(), name, color, members: [] };
          return {
            ...old,
            teams: [...old.teams, newTeam],
          };
        }
      );

      return { previousData };
    },
    onError: (_err, _newTeam, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['attendance-data'], context.previousData);
      }
    },
    onSuccess: () => {
      toast.success('Team added successfully');
    },
    onSettled: () => invalidateData(),
  });

  const removeTeamMutation = useMutation({
    mutationFn: async (id: number) => {
      const result = await deleteTeam(id);
      return result;
    },
    onMutate: async id => {
      await queryClient.cancelQueries({ queryKey: ['attendance-data'] });
      const previousData = queryClient.getQueryData(['attendance-data']);

      queryClient.setQueryData(
        ['attendance-data'],
        (old: AttendanceData | undefined) => {
          if (!old) return old;
          return {
            ...old,
            teams: old.teams.filter((t: Team) => t.id !== id),
          };
        }
      );

      return { previousData };
    },
    onError: (_err, _id, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['attendance-data'], context.previousData);
      }
    },
    onSuccess: () => {
      toast.success('Team removed successfully');
    },
    onSettled: () => invalidateData(),
  });

  const updateTeamMutation = useMutation({
    mutationFn: async ({ team, id }: { team: Team; id: number }) => {
      const result = await updateTeam({ ...team }, id);
      return result;
    },
    onMutate: async ({ team, id }) => {
      await queryClient.cancelQueries({ queryKey: ['attendance-data'] });
      const previousData = queryClient.getQueryData(['attendance-data']);

      queryClient.setQueryData(
        ['attendance-data'],
        (old: AttendanceData | undefined) => {
          if (!old) return old;
          return {
            ...old,
            teams: old.teams.map((t: Team) =>
              t.id === id ? { ...t, ...team } : t
            ),
          };
        }
      );

      return { previousData };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['attendance-data'], context.previousData);
      }
    },
    onSuccess: () => {
      toast.success('Team updated successfully');
    },
    onSettled: () => invalidateData(),
  });

  return {
    addTeam: (name: string) => addTeamMutation.mutate(name),
    removeTeam: (id: number) => removeTeamMutation.mutate(id),
    updateTeam: (team: Team, id: number) =>
      updateTeamMutation.mutate({ team, id }),
  };
}

export function useMemberMutations() {
  const queryClient = useQueryClient();
  const { setLocalSchedule } = useAttendanceState();

  const invalidateData = () => {
    setLocalSchedule(null);
    queryClient.invalidateQueries({ queryKey: ['attendance-data'] });
  };

  const addMemberMutation = useMutation({
    mutationFn: async (member: Omit<Member, 'id'>) => {
      const result = await createMember(member);
      return result;
    },
    onMutate: async member => {
      await queryClient.cancelQueries({ queryKey: ['attendance-data'] });
      const previousData = queryClient.getQueryData(['attendance-data']);

      queryClient.setQueryData(
        ['attendance-data'],
        (old: AttendanceData | undefined) => {
          if (!old) return old;
          // Find team and add member optimistically
          const updatedTeams = old.teams.map((t: Team) => {
            if (t.id === member.teamId) {
              return {
                ...t,
                members: [
                  ...t.members,
                  { ...member, id: -Math.random() }, // Temp ID
                ],
              };
            }
            return t;
          });

          return { ...old, teams: updatedTeams };
        }
      );

      return { previousData };
    },
    onError: (_err, _member, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['attendance-data'], context.previousData);
      }
    },
    onSuccess: () => {
      toast.success('Member added successfully');
    },
    onSettled: () => invalidateData(),
  });

  const removeMemberMutation = useMutation({
    mutationFn: async (id: number) => {
      const result = await deleteMember(id);
      return result;
    },
    onMutate: async id => {
      await queryClient.cancelQueries({ queryKey: ['attendance-data'] });
      const previousData = queryClient.getQueryData(['attendance-data']);

      queryClient.setQueryData(
        ['attendance-data'],
        (old: AttendanceData | undefined) => {
          if (!old) return old;
          // Remove member from whichever team they belong to
          const updatedTeams = old.teams.map((t: Team) => ({
            ...t,
            members: t.members.filter((m: Member) => m.id !== id),
          }));
          return { ...old, teams: updatedTeams };
        }
      );

      return { previousData };
    },
    onError: (_err, _id, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['attendance-data'], context.previousData);
      }
    },
    onSuccess: () => {
      toast.success('Member removed successfully');
    },
    onSettled: () => invalidateData(),
  });

  const updateMemberMutation = useMutation({
    mutationFn: async ({ member, id }: { member: Member; id: number }) => {
      const result = await updateMember(id, member);
      return result;
    },
    onMutate: async ({ member, id }) => {
      await queryClient.cancelQueries({ queryKey: ['attendance-data'] });
      const previousData = queryClient.getQueryData(['attendance-data']);

      queryClient.setQueryData(
        ['attendance-data'],
        (old: AttendanceData | undefined) => {
          if (!old) return old;
          const updatedTeams = old.teams.map((t: Team) => {
            // We might not knwo the teamId from update param easily if it changed,
            // but typically member updates are in place or moved.
            // For simplicity, we assume we update the member wherever found.
            return {
              ...t,
              members: t.members.map((m: Member) =>
                m.id === id ? { ...m, ...member } : m
              ),
            };
          });

          return { ...old, teams: updatedTeams };
        }
      );

      return { previousData };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['attendance-data'], context.previousData);
      }
    },
    onSuccess: () => {
      toast.success('Member updated successfully');
    },
    onSettled: () => invalidateData(),
  });

  return {
    addMember: (teamId: number, member: Omit<Member, 'id' | 'teamId'>) =>
      addMemberMutation.mutate({ ...member, teamId }),
    removeMember: (id: number) => removeMemberMutation.mutate(id),
    updateMember: (member: Member, id: number) =>
      updateMemberMutation.mutate({ member, id }),
  };
}

export function useScheduleMutations() {
  const queryClient = useQueryClient();
  const { localSchedule, setLocalSchedule } = useAttendanceState();
  const { data } = useAttendanceData();
  const teams = data?.teams || [];
  const schedule = localSchedule ?? data?.schedule ?? [];
  const includeFriday = data?.includeFriday ?? true;

  const invalidateData = () => {
    setLocalSchedule(null);
    queryClient.invalidateQueries({ queryKey: ['attendance-data'] });
  };

  const generateSchedule = async () => {
    if (teams.length === 0) return;

    const maxDays = includeFriday ? 5 : 4;
    const newSchedule: AttendanceSchedule[] = [];
    const dayAssignments: number[] = Array(maxDays).fill(0);

    const consecutivePairs: number[][] = [];
    for (let start = 0; start < maxDays - 1; start++) {
      consecutivePairs.push([start, start + 1]);
    }

    const shuffledTeams = [...teams].sort(() => Math.random() - 0.5);

    shuffledTeams.forEach(team => {
      let bestPair = consecutivePairs[0];
      let minLoad = Infinity;

      for (const pair of consecutivePairs) {
        const load = pair.reduce((sum, d) => sum + dayAssignments[d], 0);
        if (load < minLoad) {
          minLoad = load;
          bestPair = pair;
        }
      }

      bestPair.forEach(d => dayAssignments[d]++);
      newSchedule.push({ teamId: team.id, days: [...bestPair] });
    });

    for (let day = 0; day < maxDays; day++) {
      if (dayAssignments[day] === 0 && teams.length > 0) {
        const adjancentSchedule = newSchedule.find(s => {
          const [d1, d2] = s.days;
          if (day === d1 - 1 && day >= 0) return true;
          if (day === d2 - 1 && day < maxDays) return true;
          return false;
        });

        if (adjancentSchedule) {
          const [d1, d2] = adjancentSchedule.days;
          dayAssignments[d1]--;
          dayAssignments[d2]--;

          if (day < d1) adjancentSchedule.days = [day, day + 1];
          else adjancentSchedule.days = [day - 1, day];

          adjancentSchedule.days.forEach(d => dayAssignments[d]++);
        }
      }
    }

    const scheduleInserts = newSchedule.flatMap(entry =>
      entry.days.map(day => ({ teamId: entry.teamId, dayIndex: day }))
    );

    if (scheduleInserts.length > 0) {
      await createSchedules(scheduleInserts);
      invalidateData();
    }

    setLocalSchedule(newSchedule);
    queryClient.invalidateQueries({ queryKey: ['attendance-data'] });
  };

  const updateTeamSchedule = async (
    teamId: number,
    newDays: number[],
    maxDays: number
  ) => {
    let finalDays = [...newDays].sort((a, b) => a - b);

    if (finalDays.length === 1) {
      const day = finalDays[0];
      if (day + 1 < maxDays) {
        finalDays = [day, day + 1];
      } else if (day > 0) {
        finalDays = [day - 1, day];
      }
    } else if (finalDays.length === 2 && finalDays[1] - finalDays[0] !== 1) {
      const newDay = newDays[newDays.length - 1];
      if (newDay + 1 < maxDays) {
      }
    }

    if (finalDays.length === 2 && finalDays[1] - finalDays[0] !== 1) {
      const newDay = newDays[newDays.length - 1];
      if (newDay + 1 < maxDays) {
        finalDays = [newDay, newDay + 1];
      } else if (newDay > 0) {
        finalDays = [newDay - 1, newDay];
      }
    }

    await deleteSchedulesByTeam(teamId);

    if (finalDays.length > 0) {
      const scheduleInserts = finalDays.map(day => ({ teamId, dayIndex: day }));
      await createSchedules(scheduleInserts);
    }

    setLocalSchedule(prev => {
      const currentSchedule = prev ?? schedule;
      const existingIndex = currentSchedule.findIndex(s => s.teamId === teamId);

      if (existingIndex >= 0) {
        return currentSchedule.map((s, i) =>
          i === existingIndex ? { ...s, days: finalDays } : s
        );
      }
      return [...currentSchedule, { teamId, days: finalDays }];
    });
  };

  const clearSchedule = async () => {
    await clearAllSchedules();
    setLocalSchedule(null);
    queryClient.invalidateQueries({ queryKey: ['attendance-data'] });
  };

  return {
    generateSchedule,
    updateTeamSchedule,
    clearSchedule,
  };
}

export function useSettingsMutations() {
  const queryClient = useQueryClient();
  const { setLocalSchedule } = useAttendanceState();
  const { data } = useAttendanceData();
  const includeFriday = data?.includeFriday ?? false;

  const invalidateData = () => {
    setLocalSchedule(null);
    queryClient.invalidateQueries({ queryKey: ['attendance-data'] });
  };

  const toggleFridayMutation = useMutation({
    mutationFn: async () => {
      const newValue = !includeFriday;
      await toggleFriday(newValue);
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['attendance-data'] });
      const previousData = queryClient.getQueryData(['attendance-data']);

      queryClient.setQueryData(
        ['attendance-data'],
        (old: AttendanceData | undefined) => {
          if (!old) return old;
          return {
            ...old,
            includeFriday: !old.includeFriday,
          };
        }
      );

      return { previousData };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['attendance-data'], context.previousData);
      }
    },
    onSuccess: () => {
      toast.success('Settings updated successfully');
    },
    onSettled: () => invalidateData(),
  });

  return {
    toggleFriday: () => toggleFridayMutation.mutate(),
  };
}
