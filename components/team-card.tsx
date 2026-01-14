'use client';

import { useState } from 'react';
import {
  Users,
  Trash2,
  Plus,
  X,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { Team } from '@/@types/teams';
import { Member as TeamMember } from '@/@types/members';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface TeamCardProps {
  team: Team;
  onRemove: () => void;
  onAddMember: (member: Omit<TeamMember, 'id'>) => void;
  onRemoveMember: (memberId: number) => void;
}

export function TeamCard({
  team,
  onRemove,
  onAddMember,
  onRemoveMember,
}: TeamCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberChair, setNewMemberChair] = useState<number | undefined>();

  const handleAddMember = () => {
    if (newMemberName.trim()) {
      onAddMember({
        name: newMemberName.trim(),
        email: newMemberEmail.trim() || undefined,
        teamId: team.id,
        chairNumber: newMemberChair,
      });
      setNewMemberName('');
      setNewMemberEmail('');
      setNewMemberChair(undefined);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddMember();
    }
  };

  return (
    <div className="rounded-lg border bg-card shadow-fluent-sm transition-shadow hover:shadow-fluent-md animate-fade-in">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="flex items-center justify-between p-4">
          <CollapsibleTrigger asChild>
            <button className="flex flex-1 items-center gap-3 text-left">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: team.color }}
              />
              <span className="font-medium">{team.name}</span>
              <span className="ml-2 flex items-center gap-1 text-sm text-muted-foreground">
                <Users className="h-3.5 w-3.5" />
                {team.members.length}
              </span>
              {isOpen ? (
                <ChevronDown className="ml-auto h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground" />
              )}
            </button>
          </CollapsibleTrigger>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="ml-2 h-8 w-8 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete team?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete &quot;{team.name}&quot; and all
                  its members.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={onRemove}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <CollapsibleContent>
          <div className="border-t px-4 pb-4 pt-3">
            {/* Members list */}
            {team.members.length > 0 && (
              <div className="mb-4 space-y-2">
                {team.members.map(member => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2"
                  >
                    <div>
                      <p className="text-sm font-medium">{member.name}</p>
                      <div className="flex gap-2 text-xs text-muted-foreground">
                        {member.email && <span>{member.email}</span>}
                        {member.chairNumber && (
                          <span className="font-mono bg-primary/10 text-primary px-1 rounded">
                            #{member.chairNumber}
                          </span>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => onRemoveMember(member.id)}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Add member form */}
            <div className="space-y-2">
              <Input
                placeholder="Member name"
                value={newMemberName}
                onChange={e => setNewMemberName(e.target.value)}
                onKeyDown={handleKeyDown}
                className="h-9"
              />
              <div className="flex gap-2">
                <Input
                  placeholder="Email (optional)"
                  type="email"
                  value={newMemberEmail}
                  onChange={e => setNewMemberEmail(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="h-9"
                />
                <Button
                  size="sm"
                  onClick={handleAddMember}
                  disabled={!newMemberName.trim()}
                  className="h-9 px-3"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Chair # (opt)"
                  type="number"
                  value={newMemberChair || ''}
                  onChange={e => setNewMemberChair(e.target.value ? parseInt(e.target.value) : undefined)}
                  onKeyDown={handleKeyDown}
                  className="h-9 w-24"
                />
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
