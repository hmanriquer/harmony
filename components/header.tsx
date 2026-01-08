import { LogOut, KeyRound, Rabbit } from 'lucide-react';
import { auth } from '@/auth';
import { logout } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ToggleTheme } from './toggle-theme';

export async function Header() {
  const session = await auth();

  return (
    <header className="border-b bg-card shadow-fluent-sm">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
              <Rabbit className="size-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">HARMONY</h1>
              <p className="text-sm text-muted-foreground">
                Office Schedule Management
              </p>
            </div>
          </div>
          {session && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground mr-2">
                {session.user?.name || 'User'}
              </span>
              <ToggleTheme />
              <Button
                variant="ghost"
                size="icon"
                title="Change Password"
                asChild
              >
                <Link href="/change-password">
                  <KeyRound className="h-5 w-5" />
                </Link>
              </Button>
              <form action={logout}>
                <Button variant="ghost" size="icon" title="Logout">
                  <LogOut className="h-5 w-5" />
                </Button>
              </form>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
