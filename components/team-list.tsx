'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Team } from '@/@types/teams';
import { Member as TeamMember } from '@/@types/members';
import { TeamCard } from './team-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface TeamsListProps {
  teams: Team[];
  onAddTeam: (name: string) => void;
  onRemoveTeam: (teamId: number) => void;
  onAddMember: (teamId: number, member: Omit<TeamMember, 'id'>) => void;
  onRemoveMember: (teamId: number, memberId: number) => void;
}

export function TeamsList({
  teams,
  onAddTeam,
  onRemoveTeam,
  onAddMember,
  onRemoveMember,
}: TeamsListProps) {
  const [newTeamName, setNewTeamName] = useState('');

  const handleAddTeam = () => {
    if (newTeamName.trim()) {
      onAddTeam(newTeamName.trim());
      setNewTeamName('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddTeam();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Teams</h2>
        <span className="text-sm text-muted-foreground">
          {teams.length} teams
        </span>
      </div>

      {/* Add team form */}
      <div className="flex gap-2">
        <Input
          placeholder="New team name..."
          value={newTeamName}
          onChange={e => setNewTeamName(e.target.value)}
          onKeyDown={handleKeyDown}
          className="h-10"
        />
        <Button
          onClick={handleAddTeam}
          disabled={!newTeamName.trim()}
          className="h-10"
        >
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </div>

      {/* Teams list */}
      <div className="space-y-3">
        {teams.length === 0 ? (
          <div className="rounded-lg border border-dashed bg-muted/30 p-8 text-center">
            <p className="text-sm text-muted-foreground">
              No teams yet. Add your first team above.
            </p>
          </div>
        ) : (
          teams.map(team => (
            <TeamCard
              key={team.id}
              team={team}
              onRemove={() => onRemoveTeam(team.id)}
              onAddMember={member => onAddMember(team.id, member)}
              onRemoveMember={memberId => onRemoveMember(team.id, memberId)}
            />
          ))
        )}
      </div>
    </div>
  );
}
