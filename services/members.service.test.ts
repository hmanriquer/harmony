import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  listMembers,
  getMember,
  createMember,
  updateMember,
  deleteMember,
} from './members.service';
import { db } from '@/db';

// Mock the db module
vi.mock('@/db', () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(),
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

// Mock the Zod schemas to avoid validation errors if we want,
// but for now let's try to provide valid data so typical parsing passes.
// If actual parsing logic is complex, we might trust it works if data is valid.
// The service imports actual schemas, so we need to ensure our usage here matches them.

describe('Members Service', () => {
  const mockMember = {
    id: 1,
    name: 'Alice',
    email: 'alice@example.com',
    teamId: 1,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listMembers', () => {
    it('should return a list of members', async () => {
      const mockFrom = vi.fn().mockResolvedValue([mockMember]);
      // Mock chain: select().from()
      vi.mocked(db.select).mockReturnValue({ from: mockFrom } as any);

      const result = await listMembers();

      expect(result).toEqual([mockMember]);
    });
  });

  describe('getMember', () => {
    it('should return a member if found', async () => {
      const mockWhere = vi.fn().mockResolvedValue([mockMember]);
      const mockFrom = vi.fn(() => ({ where: mockWhere }));
      vi.mocked(db.select).mockReturnValue({ from: mockFrom } as any);

      const result = await getMember(1);

      expect(result).toEqual(mockMember);
    });

    it('should return null if not found', async () => {
      const mockWhere = vi.fn().mockResolvedValue([]);
      const mockFrom = vi.fn(() => ({ where: mockWhere }));
      vi.mocked(db.select).mockReturnValue({ from: mockFrom } as any);

      const result = await getMember(999);

      expect(result).toBeNull();
    });
  });

  describe('createMember', () => {
    it('should create and return a member', async () => {
      const newMemberData = {
        name: 'Bob',
        email: 'bob@example.com',
        teamId: 2,
      };
      const createdMember = { id: 2, ...newMemberData };

      const mockReturning = vi.fn().mockResolvedValue([createdMember]);
      const mockValues = vi.fn(() => ({ returning: mockReturning }));
      vi.mocked(db.insert).mockReturnValue({ values: mockValues } as any);

      const result = await createMember(newMemberData);

      expect(result).toEqual(createdMember);
    });
  });

  describe('updateMember', () => {
    it('should update and return a member', async () => {
      const updateData = { name: 'Alice Updated' };
      const updatedMember = { ...mockMember, ...updateData };

      const mockReturning = vi.fn().mockResolvedValue([updatedMember]);
      const mockWhere = vi.fn(() => ({ returning: mockReturning }));
      const mockSet = vi.fn(() => ({ where: mockWhere }));
      vi.mocked(db.update).mockReturnValue({ set: mockSet } as any);

      const result = await updateMember(1, updateData);

      expect(result).toEqual(updatedMember);
    });
  });

  describe('deleteMember', () => {
    it('should delete a member', async () => {
      const mockWhere = vi.fn().mockResolvedValue(undefined);
      vi.mocked(db.delete).mockReturnValue({ where: mockWhere } as any);

      await deleteMember(1);

      expect(db.delete).toHaveBeenCalled();
    });
  });
});
