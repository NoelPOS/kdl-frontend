'use client';

import { useEffect, useState } from 'react';

/**
 * LIFF Debug Page
 * 
 * Purpose: Help troubleshoot LIFF initialization issues
 * Open this page directly: https://kdl-frontend.vercel.app/liff/debug
 */
export default function LiffDebugPage() {
  const [debugInfo, setDebugInfo] = useState<any>({
    timestamp: new Date().toISOString(),
    env: {
      liffId: process.env.NEXT_PUBLIC_LIFF_ID,
      apiUrl: process.env.NEXT_PUBLIC_API_URL,
    },
    window: {
      location: typeof window !== 'undefined' ? window.location.href : 'SSR',
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'SSR',
    },
    liff: {
      available: false,
      initialized: false,
      loggedIn: false,
      profile: null,
      error: null,
    }
  });

  useEffect(() => {
    const testLiff = async () => {
      try {
        // Check if LIFF SDK is loaded
        const liffAvailable = typeof window !== 'undefined' && 'liff' in window;
        
        setDebugInfo((prev: any) => ({
          ...prev,
          liff: {
            ...prev.liff,
            available: liffAvailable,
          }
        }));

        if (!liffAvailable) {
          throw new Error('LIFF SDK not loaded. Check if script tag is present.');
        }

        const liffId = process.env.NEXT_PUBLIC_LIFF_ID;
        
        if (!liffId) {
          throw new Error('NEXT_PUBLIC_LIFF_ID not found in environment variables');
        }

        console.log('🔧 Debug: Initializing LIFF with ID:', liffId);

        // Initialize LIFF
        await (window as any).liff.init({ liffId });
        
        const isLoggedIn = (window as any).liff.isLoggedIn();
        
        setDebugInfo((prev: any) => ({
          ...prev,
          liff: {
            ...prev.liff,
            initialized: true,
            loggedIn: isLoggedIn,
          }
        }));

        if (isLoggedIn) {
          const profile = await (window as any).liff.getProfile();
          setDebugInfo((prev: any) => ({
            ...prev,
            liff: {
              ...prev.liff,
              profile,
            }
          }));
        }

        console.log('✅ Debug: LIFF initialized successfully');
        
      } catch (error: any) {
        console.error('❌ Debug: LIFF initialization failed:', error);
        setDebugInfo((prev: any) => ({
          ...prev,
          liff: {
            ...prev.liff,
            error: {
              message: error.message,
              stack: error.stack,
              name: error.name,
            }
          }
        }));
      }
    };

    testLiff();
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace', fontSize: '12px' }}>
      <h1>🔍 LIFF Debug Information</h1>
      
      <div style={{ marginTop: '20px' }}>
        <h2>📋 Quick Checklist</h2>
        <ul>
          <li>✅ Environment Variables: {debugInfo.env.liffId ? 'SET' : '❌ MISSING'}</li>
          <li>✅ LIFF SDK Loaded: {debugInfo.liff.available ? 'YES' : '❌ NO'}</li>
          <li>✅ LIFF Initialized: {debugInfo.liff.initialized ? 'YES' : '❌ NO'}</li>
          <li>✅ User Logged In: {debugInfo.liff.loggedIn ? 'YES' : 'NO'}</li>
        </ul>
      </div>

      <div style={{ marginTop: '20px' }}>
        <h2>🌍 Environment Variables</h2>
        <pre style={{ background: '#f5f5f5', padding: '10px', overflow: 'auto' }}>
          {JSON.stringify(debugInfo.env, null, 2)}
        </pre>
      </div>

      <div style={{ marginTop: '20px' }}>
        <h2>🪟 Window Information</h2>
        <pre style={{ background: '#f5f5f5', padding: '10px', overflow: 'auto' }}>
          {JSON.stringify(debugInfo.window, null, 2)}
        </pre>
      </div>

      <div style={{ marginTop: '20px' }}>
        <h2>📱 LIFF Status</h2>
        <pre style={{ background: '#f5f5f5', padding: '10px', overflow: 'auto' }}>
          {JSON.stringify(debugInfo.liff, null, 2)}
        </pre>
      </div>

      {debugInfo.liff.error && (
        <div style={{ marginTop: '20px', background: '#fee', padding: '10px', borderLeft: '4px solid red' }}>
          <h2>❌ Error Details</h2>
          <p><strong>Message:</strong> {debugInfo.liff.error.message}</p>
          <p><strong>Name:</strong> {debugInfo.liff.error.name}</p>
          <details>
            <summary>Stack Trace</summary>
            <pre style={{ fontSize: '10px', overflow: 'auto' }}>
              {debugInfo.liff.error.stack}
            </pre>
          </details>
        </div>
      )}

      <div style={{ marginTop: '20px', background: '#e3f2fd', padding: '10px', borderLeft: '4px solid blue' }}>
        <h3>💡 Troubleshooting Steps</h3>
        <ol>
          <li>
            <strong>Check Vercel Environment Variables:</strong><br/>
            Go to Vercel Dashboard → Your Project → Settings → Environment Variables<br/>
            Ensure <code>NEXT_PUBLIC_LIFF_ID=2008403698-g6d9DA22</code> is set for Production
          </li>
          <li>
            <strong>Check LINE LIFF Configuration:</strong><br/>
            Go to LINE Developers Console → Your Channel → LIFF tab<br/>
            Ensure Endpoint URL is: <code>https://kdl-frontend.vercel.app/liff/verify</code>
          </li>
          <li>
            <strong>Verify LIFF URL Format:</strong><br/>
            Your rich menu should use: <code>https://liff.line.me/2008403698-g6d9DA22/verify</code><br/>
            This redirects to: <code>https://kdl-frontend.vercel.app/liff/verify</code>
          </li>
          <li>
            <strong>Check Browser Console:</strong><br/>
            Press F12 to open DevTools → Console tab<br/>
            Look for 🔧 📱 ✅ ❌ emoji messages
          </li>
        </ol>
      </div>

      <div style={{ marginTop: '20px' }}>
        <h3>🔗 Useful Links</h3>
        <ul>
          <li><a href="/liff/verify">Go to Verify Page</a></li>
          <li><a href="https://developers.line.biz/console/" target="_blank" rel="noopener">LINE Developers Console</a></li>
          <li><a href="https://vercel.com/dashboard" target="_blank" rel="noopener">Vercel Dashboard</a></li>
        </ul>
      </div>
    </div>
  );
}
