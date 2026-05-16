"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider, useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { setAuthToken } from "@/lib/auth-token";

/**
 * Syncs the SchoolSetu backend JWT (stored inside the NextAuth session) into
 * localStorage so all API calls that use authHeaders() pick it up automatically.
 * Runs on every render where the session is authenticated.
 */
function SessionBridge() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated" && session?.backendToken) {
      setAuthToken(session.backendToken);
    }
  }, [session?.backendToken, status]);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,
            refetchOnWindowFocus: false
          }
        }
      })
  );

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <SessionBridge />
        {children}
      </QueryClientProvider>
    </SessionProvider>
  );
}
