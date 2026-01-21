'use client';

import { useActionState } from 'react';
import { authenticate } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import Link from 'next/link';
import {
  Sparkles,
  User,
  Lock,
  AlertCircle,
  ArrowRight,
  Rabbit,
} from 'lucide-react';

export default function LoginForm() {
  const [errorMessage, formAction, isPending] = useActionState(
    authenticate,
    undefined
  );

  return (
    <div className="animate-in fade-in zoom-in duration-500 slide-in-from-bottom-4">
      <div className="mb-8 text-center space-y-2">
        <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-2xl bg-linear-to-br from-primary to-indigo-500 shadow-lg shadow-primary/20 ring-1 ring-white/10 mb-4">
          <Rabbit className="h-6 w-6 text-white" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Welcome back
        </h1>
        <p className="text-muted-foreground">
          Sign in to your account to continue
        </p>
      </div>

      <Card className="border-border/50 bg-card/60 backdrop-blur-xl shadow-xl shadow-black/5 ring-1 ring-black/5">
        <form action={formAction}>
          <CardContent className="space-y-4 pt-6">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="username"
                  type="text"
                  name="username"
                  placeholder="jdoe"
                  required
                  className="pl-9 h-10 border-muted-foreground/20 focus-visible:ring-primary/30"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  required
                  className="pl-9 h-10 border-muted-foreground/20 focus-visible:ring-primary/30"
                />
              </div>
            </div>

            {errorMessage && (
              <div
                className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-md animate-in slide-in-from-top-2"
                aria-live="polite"
              >
                <AlertCircle className="h-4 w-4 shrink-0" />
                <p>{errorMessage}</p>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex flex-col gap-4 py-6">
            <Button
              className="w-full h-10 shadow-md shadow-primary/20 transition-all hover:shadow-primary/40 group"
              disabled={isPending}
            >
              {isPending ? 'Logging in...' : 'Sign in'}
              {!isPending && (
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              )}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{' '}
              <Link
                href="/register"
                className="font-medium text-foreground hover:underline underline-offset-4 decoration-primary decoration-2"
              >
                Create one
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
