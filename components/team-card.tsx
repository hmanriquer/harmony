'use client';

import { useState } from 'react';
import {
  Users,
  Trash2,
  Plus,
  X,
  ChevronDown,
  ChevronRight,
  Pencil,
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
  onUpdate: (data: Partial<Team>) => void;
  onAddMember: (member: Omit<TeamMember, 'id'>) => void;
  onRemoveMember: (memberId: number) => void;
}

export function TeamCard({
  team,
  onRemove,
  onUpdate,
  onAddMember,
  onRemoveMember,
}: TeamCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [capacity, setCapacity] = useState(team.capacity?.toString() ?? '0');
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(team.name);

  const handleNameSave = () => {
    if (tempName.trim() && tempName !== team.name) {
      onUpdate({ name: tempName.trim() });
    } else {
      setTempName(team.name); // Revert if empty or unchanged
    }
    setIsEditingName(false);
  };

  const handleNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleNameSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setTempName(team.name);
      setIsEditingName(false);
    }
  };

  const handleCapacityBlur = () => {
    const val = parseInt(capacity);
    if (!isNaN(val) && val >= 0 && val !== team.capacity) {
      onUpdate({ capacity: val });
    }
  };
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
    <div
      className="rounded-lg border bg-card shadow-fluent-sm transition-all hover:shadow-fluent-md animate-fade-in group"
      style={{
        backgroundImage: `linear-gradient(to bottom right, hsl(var(--card)), color-mix(in srgb, ${team.color}, transparent 80%))`,
      }}
    >
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="flex items-center justify-between p-4">
          <CollapsibleTrigger asChild>
            <button className="flex flex-1 items-center gap-2 sm:gap-3 text-left w-full min-w-0">
              <div
                className="h-3 w-3 rounded-full shrink-0"
                style={{ backgroundColor: team.color }}
              />

              <div className="flex-1 min-w-0 mr-1 flex items-center gap-2">
                {isEditingName ? (
                  <Input
                    value={tempName}
                    onChange={e => setTempName(e.target.value)}
                    onBlur={handleNameSave}
                    onKeyDown={handleNameKeyDown}
                    onClick={e => e.stopPropagation()}
                    className="h-6 py-0 px-1 text-sm font-medium min-w-0 w-full"
                    autoFocus
                  />
                ) : (
                  <div
                    className="flex items-center gap-2 min-w-0 group/name cursor-text"
                    onDoubleClick={e => {
                      e.stopPropagation();
                      setIsEditingName(true);
                    }}
                    title="Double click to rename"
                  >
                    <span className="font-medium truncate">{team.name}</span>
                    <Pencil
                      className="h-3 w-3 text-muted-foreground opacity-0 group-hover/name:opacity-100 transition-opacity shrink-0"
                      onClick={e => {
                        e.stopPropagation();
                        setIsEditingName(true);
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {/* Members Count Badge */}
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-md border text-nowrap shrink-0">
                  <Users className="h-3 w-3" />
                  <span>{team.members.length}</span>
                </div>

                {/* Capacity Input Badge */}
                <div
                  className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-md border shrink-0"
                  title="Team Capacity"
                >
                  <span className="font-medium text-[10px] uppercase tracking-wider text-muted-foreground/70 text-nowrap">
                    Cap
                  </span>
                  <Input
                    type="number"
                    className="h-5 w-8 text-center px-0 py-0 text-xs border-0 bg-transparent focus-visible:ring-0 shadow-none -my-1 min-w-[32px]"
                    value={capacity}
                    onChange={e => setCapacity(e.target.value)}
                    onBlur={handleCapacityBlur}
                    onClick={e => e.stopPropagation()}
                    min="0"
                    max="99"
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleCapacityBlur();
                    }}
                  />
                </div>
              </div>

              {isOpen ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 ml-1" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 ml-1" />
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
                  onChange={e =>
                    setNewMemberChair(
                      e.target.value ? parseInt(e.target.value) : undefined
                    )
                  }
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
