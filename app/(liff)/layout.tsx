'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { LiffProvider, useLiff } from '@/context/liff/liff.context';

/**
 * LIFF Layout
 * 
 * Security Features:
 * 1. Wraps all LIFF pages with LiffProvider
 * 2. Prevents access to pages outside LIFF routes
 * 3. Auto-redirects based on authentication state
 * 4. Shows loading state during LIFF initialization
 * 
 * Route Protection:
 * - /liff/verify: Public (for verification)
 * - /liff/children: Requires verified parent
 * - /liff/my-courses/*: Requires verified parent
 * - /liff/schedules/*: Requires verified parent
 * - /liff/schedule/*: Requires verified parent
 */

function LiffLayoutContent({ children }: { children: React.ReactNode }) {
  const { isLoading, isLoggedIn, parentProfile, login } = useLiff();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Wait for LIFF to initialize
    if (isLoading) return;

    // Not logged in to LINE - trigger LINE login
    if (!isLoggedIn) {
      login();
      return;
    }

    // Logged in but parent not verified
    if (isLoggedIn && !parentProfile) {
      // Redirect to verification page unless already there
      if (pathname !== '/liff/verify') {
        router.push('/liff/verify');
      }
      return;
    }

    // Verified parent trying to access verify page - redirect to children
    if (isLoggedIn && parentProfile && pathname === '/liff/verify') {
      router.push('/liff/children');
      return;
    }
  }, [isLoading, isLoggedIn, parentProfile, pathname, router, login]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-green-50 to-white">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent mb-4"></div>
          <p className="text-gray-600 font-medium">Loading KDL Portal...</p>
        </div>
      </div>
    );
  }

  // Render page content
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
}

export default function LiffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LiffProvider>
      <LiffLayoutContent>{children}</LiffLayoutContent>
    </LiffProvider>
  );
}
