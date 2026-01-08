import { describe, it, expect, vi, beforeEach } from 'vitest';
import { listTeams, getTeam, createTeam } from './teams.service';
import { db } from '@/db';

// Mock the db module
vi.mock('@/db', () => ({
  db: {
    query: {
      teams: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
      },
    },
    insert: vi.fn(() => ({
      values: vi.fn(() => ({
        returning: vi.fn(),
      })),
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(),
      })),
    })),
    delete: vi.fn(() => ({
      where: vi.fn(),
    })),
  },
}));

describe('Teams Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listTeams', () => {
    it('should return a list of teams with members', async () => {
      const mockTeams = [
        { id: 1, name: 'Team A', color: '#ff0000', members: [] },
        { id: 2, name: 'Team B', color: '#00ff00', members: [] },
      ];

      vi.mocked(db.query.teams.findMany).mockResolvedValue(mockTeams as any);

      const result = await listTeams();

      expect(db.query.teams.findMany).toHaveBeenCalledWith({
        with: { members: true },
      });
      expect(result).toEqual(mockTeams);
    });
  });

  describe('getTeam', () => {
    it('should return a team if it exists', async () => {
      const mockTeam = { id: 1, name: 'Team A', color: '#ff0000', members: [] };
      vi.mocked(db.query.teams.findFirst).mockResolvedValue(mockTeam as any);

      const result = await getTeam(1);

      expect(result).toEqual(mockTeam);
    });

    it('should throw an error if team does not exist', async () => {
      vi.mocked(db.query.teams.findFirst).mockResolvedValue(undefined as any);

      await expect(getTeam(999)).rejects.toThrow('Team not found');
    });
  });

  describe('createTeam', () => {
    it('should create a team and return it', async () => {
      const newTeam = { name: 'New Team', color: '#0000ff' };
      const createdTeam = { id: 1, ...newTeam };

      // Mock the chainable insert methods
      const mockReturning = vi.fn().mockResolvedValue([createdTeam]);
      const mockValues = vi.fn(() => ({ returning: mockReturning }));
      vi.mocked(db.insert).mockReturnValue({ values: mockValues } as any);

      const result = await createTeam({ ...newTeam, members: [] });

      expect(db.insert).toHaveBeenCalled();
      expect(result).toEqual(createdTeam);
    });
  });
});
