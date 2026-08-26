'use client';

import { isServer, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';

function createQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { staleTime: 60_000, retry: 1, refetchOnWindowFocus: false } },
  });
}

let browserClient: QueryClient | undefined;

function getQueryClient() {
  if (isServer) return createQueryClient();
  browserClient ??= createQueryClient();
  return browserClient;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={getQueryClient()}>
      {children}
      <Toaster position="top-right" richColors />
    </QueryClientProvider>
  );
}
