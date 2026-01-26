'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default function BackButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className="flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-gray-300 rounded-lg text-gray-800 font-semibold hover:bg-gray-100 transition-colors fixed top-4 left-4 z-50"
    >
      <ArrowLeft className="h-4 w-4" />
      <span>Back</span>
    </button>
  );
}