'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { Loader2 } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, isInitialized, initialize } = useAuthStore();

  // Initialize auth from localStorage on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Redirect based on auth state
  useEffect(() => {
    if (isInitialized) {
      if (isAuthenticated) {
        router.replace('/dashboard');
      } else {
        router.replace('/login');
      }
    }
  }, [isAuthenticated, isInitialized, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
    </div>
  );
}
