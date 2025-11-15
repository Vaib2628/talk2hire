'use client';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted on client before showing loading state
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isLoading && !isAuthenticated) {
      router.push('/sign-in');
    }
  }, [mounted, isAuthenticated, isLoading, router]);

  // During SSR and initial client render, show a consistent loading state
  if (!mounted || isLoading) {
    return (
      <div 
        className="flex items-center justify-center min-h-screen bg-background"
        suppressHydrationWarning
      >
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-200/20 border-t-primary-200 mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Image src="/logo.svg" alt="logo" width={24} height={24} className="animate-pulse" />
            </div>
          </div>
          <p className="mt-6 text-primary-100 text-lg font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to sign-in
  }

  return children;
}
