'use client';

import { ReactQueryProvider } from '@/integrations/react-query.integration';
import { ThemeProvider } from '@/integrations/theme.integration';
import { Toaster } from '@/components/ui/sonner';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ReactQueryProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        {children}
        <Toaster position="top-center" richColors closeButton />
      </ThemeProvider>
    </ReactQueryProvider>
  );
}
