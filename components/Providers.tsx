"use client";

import { useEffect } from "react";
import { SessionProvider, useSession, signOut } from "next-auth/react";

// If the refresh token was rejected (expired/revoked), the jwt callback sets
// session.error — force a real sign-out instead of leaving a dead session.
function SessionWatcher() {
  const { data: session } = useSession();

  useEffect(() => {
    if ((session as any)?.error) {
      signOut({ callbackUrl: "/login" });
    }
  }, [session]);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider refetchInterval={5 * 60} refetchOnWindowFocus>
      <SessionWatcher />
      {children}
    </SessionProvider>
  );
}
