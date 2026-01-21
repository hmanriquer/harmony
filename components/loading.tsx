import React from 'react';

export default function Loading() {
  return (
    <div className="flex h-[calc(100vh-73px)] w-full flex-col items-center justify-center gap-4">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      <p className="text-sm font-medium text-muted-foreground">
        Loading your workspace...
      </p>
    </div>
  );
}
