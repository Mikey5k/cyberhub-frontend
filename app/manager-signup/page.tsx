"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function ManagerSignup() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the new team lead application page
    router.replace('/team-lead-apply');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700">
      <div className="text-center text-white">
        <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Redirecting to New Application</h1>
        <p className="text-blue-200">Manager signup has moved to the new application flow</p>
      </div>
    </div>
  );
}