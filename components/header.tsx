import { Calendar } from 'lucide-react';

export function Header() {
  return (
    <header className="border-b bg-card shadow-fluent-sm">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <Calendar className="size-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">
              Team Attendance
            </h1>
            <p className="text-sm text-muted-foreground">
              Office Schedule Management
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
