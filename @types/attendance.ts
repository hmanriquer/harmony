import { Team } from './teams';

export interface AttendanceSchedule {
  teamId: number;
  days: number[];
}

export interface AppState {
  teams: Team[];
  schedule: AttendanceSchedule[];
  includeFriday: boolean;
}

export const WEEKDAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
] as const;
export const WEEKDAYS_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] as const;

export const TEAM_COLORS = [
  'hsl(206 100% 42%)',
  'hsl(142 71% 45%)',
  'hsl(280 65% 60%)',
  'hsl(25 95% 53%)',
  'hsl(340 82% 52%)',
  'hsl(180 60% 45%)',
  'hsl(45 93% 47%)',
  'hsl(220 70% 50%)',
] as const;
