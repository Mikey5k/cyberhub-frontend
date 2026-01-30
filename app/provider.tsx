"use client";

import { SessionProvider, useSession } from "next-auth/react";
import { useEffect } from "react";

// Component to sync NextAuth session with localStorage
function AuthSync({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      // Sync NextAuth session with localStorage (for compatibility)
      localStorage.setItem('cyberhub_email', session.user.email || '');
      localStorage.setItem('cyberhub_role', session.user.role || 'user');
      localStorage.setItem('cyberhub_phone', session.user.phone || 'google_user');
      
      // Store minimal user object
      const userData = {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: session.user.role,
        phone: session.user.phone,
        image: session.user.image
      };
      localStorage.setItem('cyberhub_user', JSON.stringify(userData));
      
      // Also sync to sessionStorage for consistency
      sessionStorage.setItem('cyberhub_email', session.user.email || '');
      sessionStorage.setItem('cyberhub_role', session.user.role || 'user');
      sessionStorage.setItem('cyberhub_phone', session.user.phone || 'google_user');
      sessionStorage.setItem('cyberhub_user', JSON.stringify(userData));
      
      console.log("Google auth synced to localStorage");
    }
  }, [session, status]);

  return <>{children}</>;
}

export default function Provider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <AuthSync>{children}</AuthSync>
    </SessionProvider>
  );
}