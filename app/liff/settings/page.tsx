
'use client';

import { useState } from 'react';
import { useLiff } from '@/context/liff/liff.context';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';

/**
 * LIFF Settings Page
 * 
 * Features:
 * - View current parent profile
 * - Logout (Unlink LINE account)
 */
export default function SettingsPage() {
  const { parentProfile, profile, isLoading, logout } = useLiff();
  const router = useRouter();
  const searchParams = useSearchParams();
  const studentId = searchParams?.get('studentId');
  const [isUnlinking, setIsUnlinking] = useState(false);

  const coursesHref = studentId ? `/liff/my-courses?studentId=${studentId}` : '/liff/children';
  const calendarHref = studentId ? `/liff/schedules?studentId=${studentId}` : '/liff/children';
  const paymentsHref = studentId ? `/liff/payments?studentId=${studentId}` : '/liff/payments';

  const handleLogout = async () => {
    if (!profile?.userId) return;

    if (!confirm('Are you sure you want to log out? You will need to verify your account again to access the portal.')) {
      return;
    }

    try {
      setIsUnlinking(true);

      // Call backend to unlink
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/parent-portal/unlink`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            lineUserId: profile.userId,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to unlink account');
      }

      // Clear local state
      // We don't have a direct clear function in context typically, 
      // but reloading the verify page will force a fresh state check
      router.push('/liff/verify');
      router.refresh();
      
    } catch (error) {
      console.error('Logout failed:', error);
      alert('Failed to log out. Please try again.');
      setIsUnlinking(false);
    }
  };

  // Reset Password State (email-based, 3-step flow)
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetStep, setResetStep] = useState<'send' | 'verify' | 'reset' | 'done'>('send');
  const [resetCode, setResetCode] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetSubmitting, setResetSubmitting] = useState(false);

  const openResetModal = () => {
    setResetStep('send');
    setResetCode('');
    setResetNewPassword('');
    setResetConfirmPassword('');
    setResetError('');
    setShowResetModal(true);
  };

  const handleSendCode = async () => {
    const email = parentProfile?.email;
    if (!email) return;
    setResetError('');
    setResetSubmitting(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role: 'parent' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to send code');
      setResetStep('verify');
    } catch (err: any) {
      setResetError(err.message);
    } finally {
      setResetSubmitting(false);
    }
  };

  const handleVerifyCode = async () => {
    const email = parentProfile?.email;
    if (!email) return;
    setResetError('');
    setResetSubmitting(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify-reset-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: resetCode, email, role: 'parent' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Invalid or expired code');
      setResetStep('reset');
    } catch (err: any) {
      setResetError(err.message);
    } finally {
      setResetSubmitting(false);
    }
  };

  const handleResetPassword = async () => {
    const email = parentProfile?.email;
    if (!email) return;
    if (resetNewPassword !== resetConfirmPassword) {
      setResetError('Passwords do not match');
      return;
    }
    setResetError('');
    setResetSubmitting(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: resetCode, newPassword: resetNewPassword, email, role: 'parent' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to reset password');
      setResetStep('done');
    } catch (err: any) {
      setResetError(err.message);
    } finally {
      setResetSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent mb-4"></div>
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white px-6 pt-6 pb-4 border-b">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
      </div>

      <div className="p-6 space-y-6">
        {/* Profile Card */}
        {parentProfile && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Account</h2>
            
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-3xl">
                👤
              </div>
              <div>
                <p className="font-bold text-gray-900">{parentProfile.name}</p>
                <p className="text-sm text-gray-500">{parentProfile.email}</p>
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-3 text-sm text-green-700 flex items-center gap-2">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Verified Parent
            </div>
          </div>
        )}

        {/* LINE Info */}
        {profile && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
             <h2 className="text-lg font-semibold text-gray-900 mb-4">LINE Account</h2>
             <div className="flex items-center gap-3">
                {profile.pictureUrl && (
                  <Image 
                    src={profile.pictureUrl} 
                    alt={profile.displayName} 
                    width={40} 
                    height={40} 
                    className="rounded-full"
                  />
                )}
                <span className="font-medium">{profile.displayName}</span>
             </div>
          </div>
        )}

        {/* Reset Password Button */}
        <button
          onClick={openResetModal}
          className="w-full bg-white border border-gray-200 text-gray-700 font-medium py-4 rounded-xl shadow-sm hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 mb-4"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Reset Password
        </button>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          disabled={isUnlinking}
          className="w-full bg-white border border-red-200 text-red-600 font-medium py-4 rounded-xl shadow-sm hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
        >
          {isUnlinking ? (
             <div className="animate-spin rounded-full h-5 w-5 border-2 border-red-600 border-t-transparent"></div>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </>
          )}
        </button>
        
        <p className="text-xs text-center text-gray-500">
          Unlinking will return you to the verification screen. You can re-link with a different email later.
        </p>

        {/* Change Password Dialog */}
        {/* Reset Password Modal (3-step: send → verify → reset → done) */}
        {showResetModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-sm">

              {/* Step 1 — Send code */}
              {resetStep === 'send' && (
                <>
                  <h2 className="text-xl font-bold mb-1">Reset Password</h2>
                  <p className="text-sm text-gray-500 mb-5">
                    We'll send a 6-digit code to your registered email.
                  </p>
                  <div className="mb-4 bg-gray-50 rounded-lg px-4 py-3 text-sm text-gray-700 flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {parentProfile?.email}
                  </div>
                  {resetError && <p className="text-red-500 text-sm mb-3">{resetError}</p>}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowResetModal(false)}
                      className="flex-1 px-4 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSendCode}
                      disabled={resetSubmitting}
                      className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-60"
                    >
                      {resetSubmitting ? 'Sending...' : 'Send Code'}
                    </button>
                  </div>
                </>
              )}

              {/* Step 2 — Verify code */}
              {resetStep === 'verify' && (
                <>
                  <h2 className="text-xl font-bold mb-1">Enter Code</h2>
                  <p className="text-sm text-gray-500 mb-5">
                    We sent a 6-digit code to <strong>{parentProfile?.email}</strong>
                  </p>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Verification Code</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="000000"
                      className="w-full border rounded-lg p-2 text-center text-lg tracking-widest"
                      value={resetCode}
                      onChange={(e) => setResetCode(e.target.value.replace(/\D/g, ''))}
                    />
                  </div>
                  {resetError && <p className="text-red-500 text-sm mb-3">{resetError}</p>}
                  <div className="flex gap-2 mb-3">
                    <button
                      type="button"
                      onClick={() => { setResetStep('send'); setResetError(''); }}
                      className="flex-1 px-4 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handleVerifyCode}
                      disabled={resetSubmitting || resetCode.length !== 6}
                      className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-60"
                    >
                      {resetSubmitting ? 'Verifying...' : 'Verify'}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={handleSendCode}
                    className="w-full text-sm text-green-600 hover:text-green-700 text-center"
                  >
                    Resend code
                  </button>
                </>
              )}

              {/* Step 3 — New password */}
              {resetStep === 'reset' && (
                <>
                  <h2 className="text-xl font-bold mb-1">New Password</h2>
                  <p className="text-sm text-gray-500 mb-5">Enter a new password for your account.</p>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      placeholder="At least 6 characters"
                      className="w-full border rounded-lg p-2"
                      value={resetNewPassword}
                      onChange={(e) => setResetNewPassword(e.target.value)}
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                    <input
                      type="password"
                      required
                      placeholder="Repeat new password"
                      className="w-full border rounded-lg p-2"
                      value={resetConfirmPassword}
                      onChange={(e) => setResetConfirmPassword(e.target.value)}
                    />
                  </div>
                  {resetError && <p className="text-red-500 text-sm mb-3">{resetError}</p>}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => { setResetStep('verify'); setResetError(''); }}
                      className="flex-1 px-4 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handleResetPassword}
                      disabled={resetSubmitting || !resetNewPassword || !resetConfirmPassword}
                      className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-60"
                    >
                      {resetSubmitting ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </>
              )}

              {/* Step 4 — Done */}
              {resetStep === 'done' && (
                <div className="text-center py-4">
                  <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-7 h-7 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold mb-2">Password Reset!</h2>
                  <p className="text-sm text-gray-500 mb-6">Your password has been updated successfully.</p>
                  <button
                    type="button"
                    onClick={() => setShowResetModal(false)}
                    className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                  >
                    Done
                  </button>
                </div>
              )}

            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="flex justify-around items-center py-3">
          <button 
            onClick={() => router.push(coursesHref)}
            className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span className="text-xs">Courses</span>
          </button>
          <button 
             onClick={() => router.push(calendarHref)}
             className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs">Calendar</span>
          </button>
          <button 
            onClick={() => router.push(paymentsHref)}
            className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600"
          >
           <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            <span className="text-xs">Payments</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-yellow-500">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12-0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
            </svg>
            <span className="text-xs font-medium">Setting</span>
          </button>
        </div>
      </div>
    </div>
  );
}
