'use client';

import { ReactQueryProvider } from '@/integrations/react-query.integration';
import { ThemeProvider } from '@/integrations/theme.integration';

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
      </ThemeProvider>
    </ReactQueryProvider>
  );
}
