'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * LIFF Root Redirect Page
 * 
 * Purpose: Handle LINE OAuth callback at /liff and redirect to /liff/verify
 * 
 * Why needed:
 * - LINE redirects to the LIFF Endpoint URL after login
 * - If Endpoint URL is set to https://kdl-frontend.vercel.app/liff
 * - It will redirect here with OAuth code/state params
 * - We then redirect to /liff/verify to continue the flow
 */
export default function LiffRootPage() {
  const router = useRouter();

  useEffect(() => {
    // Get the current URL with all query parameters
    const currentUrl = new URL(window.location.href);
    const searchParams = currentUrl.searchParams;

    // Build the redirect URL with all query parameters preserved
    const redirectUrl = new URL('/liff/verify', window.location.origin);
    
    // Copy all query parameters (code, state, liffClientId, liffRedirectUri)
    searchParams.forEach((value, key) => {
      redirectUrl.searchParams.set(key, value);
    });

    console.log('🔄 Redirecting from /liff to /liff/verify with params:', {
      code: searchParams.get('code'),
      state: searchParams.get('state'),
      liffClientId: searchParams.get('liffClientId'),
      liffRedirectUri: searchParams.get('liffRedirectUri'),
    });

    // Redirect to verify page
    router.replace(redirectUrl.pathname + redirectUrl.search);
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent mb-4"></div>
        <p className="text-gray-600 font-medium">Redirecting to verification...</p>
      </div>
    </div>
  );
}
