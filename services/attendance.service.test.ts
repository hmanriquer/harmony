import { describe, it, expect, vi, beforeEach } from 'vitest';
import { toggleFriday, listSettings } from './attendance.service';
import { db } from '@/db';

// Mock the db module
vi.mock('@/db', () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(),
    })),
    update: vi.fn(() => ({
      set: vi.fn(),
    })),
  },
}));

describe('Attendance Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('toggleFriday', () => {
    it('should update the friday setting', async () => {
      const mockSet = vi.fn().mockResolvedValue(undefined);
      vi.mocked(db.update).mockReturnValue({ set: mockSet } as any);

      await toggleFriday(true);

      expect(db.update).toHaveBeenCalled();
      expect(mockSet).toHaveBeenCalledWith({ includeFriday: true });
    });
  });

  describe('listSettings', () => {
    it('should return settings', async () => {
      const mockSettings = [{ id: 1, includeFriday: true }];
      const mockFrom = vi.fn().mockResolvedValue(mockSettings);
      vi.mocked(db.select).mockReturnValue({ from: mockFrom } as any);

      const result = await listSettings();

      expect(db.select).toHaveBeenCalled();
      expect(result).toEqual(mockSettings);
    });
  });
});
