import LoginForm from '@/components/login-form';

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-[linear-gradient(to_bottom_right,var(--tw-gradient-stops))] from-background via-muted/50 to-background dark:from-background dark:via-background dark:to-accent/20 relative overflow-hidden">
      {/* Abstract background blobs */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-30 animate-pulse" />
      <div className="absolute bottom-1/4 -right-20 w-120 h-120 bg-indigo-500/20 rounded-full blur-3xl opacity-20" />

      <div className="w-full max-w-sm relative z-10">
        <LoginForm />
      </div>

      <div className="absolute bottom-6 text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} Harmony Inc. All rights reserved.
      </div>
    </main>
  );
}
