'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { Sidebar } from '@/components/Sidebar';
import { SocketProvider } from '@/components/SocketProvider';
import { Loader2 } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { initialize, isAuthenticated } = useAuthStore();

  useEffect(() => {
    // Check localStorage directly
    const stored = localStorage.getItem('restaurant-auth');
    console.log('[Dashboard] localStorage:', stored);

    if (stored) {
      try {
        const data = JSON.parse(stored);
        console.log('[Dashboard] Parsed data:', data);
        if (data.token && data.user && data.restaurant) {
          // Initialize store from localStorage
          initialize();
          setIsLoggedIn(true);
        } else {
          router.replace('/login');
        }
      } catch (e) {
        console.error('[Dashboard] Parse error:', e);
        router.replace('/login');
      }
    } else {
      console.log('[Dashboard] No auth data, redirecting to login');
      router.replace('/login');
    }
    setIsChecking(false);
  }, [initialize, router]);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <SocketProvider>
      <div className="min-h-screen bg-gray-50">
        <Sidebar />
        <main className="lg:pl-72">
          <div className="p-4 lg:p-8 pt-16 lg:pt-8">
            {children}
          </div>
        </main>
      </div>
    </SocketProvider>
  );
}
