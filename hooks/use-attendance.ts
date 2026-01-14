import {
  useAttendanceState,
  useAttendanceData,
  useTeamMutations,
  useMemberMutations,
  useScheduleMutations,
  useSettingsMutations,
} from '@/stores/attendance.store';

export function useAttendance() {
  const { localSchedule } = useAttendanceState();
  const { data, isLoading } = useAttendanceData();
  const teamMutations = useTeamMutations();
  const memberMutations = useMemberMutations();
  const scheduleMutations = useScheduleMutations();
  const settingsMutations = useSettingsMutations();
  const teams = data?.teams || [];
  const schedule = (localSchedule ?? data?.schedule) || [];
  const includeFriday = data?.includeFriday || false;
  const totalChairs = data?.totalChairs || 0;
  const dailySettings = data?.dailySettings || [];

  return {
    teams,
    schedule,
    includeFriday,
    totalChairs,
    dailySettings,
    isLoading,
    ...teamMutations,
    ...memberMutations,
    ...settingsMutations,
    ...scheduleMutations,
  };
}
