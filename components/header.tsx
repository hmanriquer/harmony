import { LogOut, KeyRound, Rabbit, User } from 'lucide-react';
import { auth } from '@/auth';
import { logout } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ToggleTheme } from './toggle-theme';
import { Separator } from './ui/separator';

export async function Header() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2.5 transition-opacity hover:opacity-90"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-primary to-primary/60 shadow-lg shadow-primary/20 ring-1 ring-white/10">
              <Rabbit className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="hidden md:block">
              <h1 className="text-lg font-bold tracking-tight bg-linear-to-br from-foreground to-muted-foreground bg-clip-text text-transparent">
                HARMONY
              </h1>
            </div>
          </Link>

          <div className="h-6 w-px bg-border/60 mx-2 hidden md:block" />

          <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-muted-foreground">
            <span className="px-2 py-1 rounded-md bg-accent/50 text-foreground">
              Dashboard
            </span>
          </nav>
        </div>

        {session ? (
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="hidden sm:flex flex-col items-end mr-2">
              <span className="text-sm font-medium leading-none">
                {session.user?.name || 'User'}
              </span>
              <span className="text-[10px] text-muted-foreground">
                Workspace Admin
              </span>
            </div>

            <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center border mr-2">
              <User className="h-4 w-4 text-muted-foreground" />
            </div>

            <Separator orientation="vertical" className="h-6 mx-1" />

            <ToggleTheme />

            <Button
              variant="ghost"
              size="icon"
              title="Change Password"
              className="text-muted-foreground hover:text-foreground"
              asChild
            >
              <Link href="/change-password">
                <KeyRound className="h-4 w-4" />
              </Link>
            </Button>

            <form action={logout}>
              <Button
                variant="ghost"
                size="icon"
                title="Logout"
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </form>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link href="/login">Log in</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/register">Get Started</Link>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
