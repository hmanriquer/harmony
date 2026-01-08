import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createSchedule,
  createSchedules,
  listSchedules,
  getTeamSchedules,
  updateSchedule,
  deleteSchedule,
  deleteSchedulesByTeam,
  clearAllSchedules,
} from './schedule.service';
import { db } from '@/db';

vi.mock('@/db', () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(),
      })),
    })),
    insert: vi.fn(() => ({
      values: vi.fn(() => ({
        returning: vi.fn(),
      })),
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(() => ({
          returning: vi.fn(),
        })),
      })),
    })),
    delete: vi.fn(() => ({
      where: vi.fn(),
    })),
  },
}));

describe('Schedule Service', () => {
  const mockSchedule = { id: 101, teamId: 1, dayIndex: 0 };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createSchedule', () => {
    it('should create a single schedule', async () => {
      const newSchedule = { teamId: 1, dayIndex: 0 };
      const resultSchedule = { id: 101, ...newSchedule };

      const mockReturning = vi.fn().mockResolvedValue([resultSchedule]);
      const mockValues = vi.fn(() => ({ returning: mockReturning }));
      vi.mocked(db.insert).mockReturnValue({ values: mockValues } as any);

      const result = await createSchedule(newSchedule);
      expect(result).toEqual(resultSchedule);
    });
  });

  describe('createSchedules', () => {
    it('should create multiple schedules', async () => {
      const newSchedules = [
        { teamId: 1, dayIndex: 0 },
        { teamId: 1, dayIndex: 1 },
      ];
      const resultSchedules = [
        { id: 101, ...newSchedules[0] },
        { id: 102, ...newSchedules[1] },
      ];

      const mockReturning = vi.fn().mockResolvedValue(resultSchedules);
      const mockValues = vi.fn(() => ({ returning: mockReturning }));
      vi.mocked(db.insert).mockReturnValue({ values: mockValues } as any);

      const result = await createSchedules(newSchedules);
      expect(result).toEqual(resultSchedules);
    });
  });

  describe('listSchedules', () => {
    it('should list all schedules', async () => {
      const mockFrom = vi.fn().mockResolvedValue([mockSchedule]);
      vi.mocked(db.select).mockReturnValue({ from: mockFrom } as any);

      const result = await listSchedules();
      expect(result).toEqual([mockSchedule]);
    });
  });

  describe('getTeamSchedules', () => {
    it('should list schedules specific to a team', async () => {
      const mockWhere = vi.fn().mockResolvedValue([mockSchedule]);
      const mockFrom = vi.fn(() => ({ where: mockWhere }));
      vi.mocked(db.select).mockReturnValue({ from: mockFrom } as any);

      const result = await getTeamSchedules(1);

      expect(mockFrom).toHaveBeenCalled(); // check proper chain
      expect(result).toEqual([mockSchedule]);
    });
  });

  describe('updateSchedule', () => {
    it('should update a schedule', async () => {
      const updateData = { id: 101, teamId: 1, dayIndex: 2 };

      const mockReturning = vi.fn().mockResolvedValue([updateData]);
      const mockWhere = vi.fn(() => ({ returning: mockReturning }));
      const mockSet = vi.fn(() => ({ where: mockWhere }));
      vi.mocked(db.update).mockReturnValue({ set: mockSet } as any);

      const result = await updateSchedule(updateData);
      expect(result).toEqual(updateData);
    });
  });

  describe('deleteSchedule', () => {
    it('should delete a schedule', async () => {
      const mockWhere = vi.fn().mockResolvedValue(undefined);
      vi.mocked(db.delete).mockReturnValue({ where: mockWhere } as any);

      await deleteSchedule(101);
      expect(db.delete).toHaveBeenCalled();
    });
  });

  describe('deleteSchedulesByTeam', () => {
    it('should delete schedules by team', async () => {
      const mockWhere = vi.fn().mockResolvedValue(undefined);
      vi.mocked(db.delete).mockReturnValue({ where: mockWhere } as any);

      await deleteSchedulesByTeam(1);
      expect(db.delete).toHaveBeenCalled();
    });
  });

  describe('clearAllSchedules', () => {
    it('should clear all schedules', async () => {
      // db.delete(schedules) without where
      vi.mocked(db.delete).mockResolvedValue(undefined as any);

      await clearAllSchedules();
      expect(db.delete).toHaveBeenCalled();
    });
  });
});
