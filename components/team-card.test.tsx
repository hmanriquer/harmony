import { render, screen, fireEvent } from '@testing-library/react';
import { TeamCard } from './team-card';
import { describe, it, expect, vi } from 'vitest';

describe('TeamCard', () => {
  const mockTeam = {
    id: 1,
    name: 'Test Team',
    color: '#ff0000',
    members: [
      { id: 1, name: 'Alice', email: 'alice@example.com', teamId: 1 },
      { id: 2, name: 'Bob', teamId: 1 },
    ],
  };

  const mockProps = {
    team: mockTeam,
    onRemove: vi.fn(),
    onAddMember: vi.fn(),
    onRemoveMember: vi.fn(),
  };

  it('renders team name and member count', () => {
    render(<TeamCard {...mockProps} />);
    expect(screen.getByText('Test Team')).toBeDefined();
    expect(screen.getByText('2')).toBeDefined();
  });

  it('expands to show members when clicked', () => {
    render(<TeamCard {...mockProps} />);

    // Initial state: members hidden (collapsible content)
    // Note: Radix Collapsible might render content but hide it, or not render.
    // We click to expand.
    const trigger = screen.getByText('Test Team');
    fireEvent.click(trigger);

    // Now members should be visible
    expect(screen.getByText('Alice')).toBeDefined();
    expect(screen.getByText('Bob')).toBeDefined();
  });

  it('calls onAddMember when adding a new member', () => {
    render(<TeamCard {...mockProps} />);

    // Expand first
    fireEvent.click(screen.getByText('Test Team'));

    const nameInput = screen.getByPlaceholderText('Member name');
    fireEvent.change(nameInput, { target: { value: 'Charlie' } });

    const addButton = screen
      .getAllByRole('button')
      .find(b => b.querySelector('svg.lucide-plus'));
    if (addButton) {
      fireEvent.click(addButton);
    } else {
      // fall back if icon search fails (though it shouldn't)
      throw new Error('Add button not found');
    }

    expect(mockProps.onAddMember).toHaveBeenCalledWith({
      name: 'Charlie',
      email: undefined,
      teamId: 1,
    });
  });
});
