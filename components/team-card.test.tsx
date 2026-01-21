import { render, screen, fireEvent } from '@testing-library/react';
import { TeamCard } from './team-card';
import { describe, it, expect, vi } from 'vitest';

describe('TeamCard', () => {
  const mockTeam = {
    id: 1,
    name: 'Test Team',
    color: '#ff0000',
    capacity: 5,
    members: [
      { id: 1, name: 'Alice', email: 'alice@example.com', teamId: 1 },
      { id: 2, name: 'Bob', teamId: 1 },
    ],
  };

  const mockProps = {
    team: mockTeam,
    onRemove: vi.fn(),
    onUpdate: vi.fn(),
    onAddMember: vi.fn(),
    onRemoveMember: vi.fn(),
  };

  it('renders team name and member count', () => {
    render(<TeamCard {...mockProps} />);
    expect(screen.getByText('Test Team')).toBeDefined();
    // Use regex for case insensitive match as we used uppercase in UI
    expect(screen.getByText(/cap/i)).toBeDefined();
    // Check for input with value 5
    const capacityInput = screen.getByDisplayValue('5');
    expect(capacityInput).toBeDefined();
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

  it('calls onUpdate when modifying capacity', () => {
    render(<TeamCard {...mockProps} />);

    // Find capacity input (type="number")
    const capacityInput = screen.getAllByRole('spinbutton')[0];
    expect(capacityInput).toBeDefined();

    // Change value
    fireEvent.change(capacityInput, { target: { value: '10' } });
    fireEvent.blur(capacityInput);

    expect(mockProps.onUpdate).toHaveBeenCalledWith({ capacity: 10 });
  });
});
