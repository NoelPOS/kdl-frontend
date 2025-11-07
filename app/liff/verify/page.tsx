'use client';

import { useState } from 'react';
import { useLiff } from '@/context/liff/liff.context';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

/**
 * LIFF Login/Verification Page
 * 
 * Purpose:
 * - Link LINE user ID to parent account
 * - Verify parent identity via email OR phone
 * - Upgrade parent to verified state
 * 
 * Flow:
 * 1. Parent enters email or phone
 * 2. Backend checks if parent exists
 * 3. Backend links LINE user ID to parent
 * 4. Rich menu upgrades to verified state
 * 5. Redirect to children selector
 */

export default function LiffLoginPage() {
  const { profile, refreshParentProfile } = useLiff();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    email: '',
    contactNo: '',
  });
  const [useEmail, setUseEmail] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profile) {
      setError('LINE profile not available');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/parent-portal/verify`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            lineUserId: profile.userId,
            email: useEmail ? formData.email : undefined,
            contactNo: !useEmail ? formData.contactNo : undefined,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Verification failed');
      }

      setSuccess(true);
      
      // Refresh parent profile and wait for it to complete
      await refreshParentProfile();

      // Small delay to ensure state update, then redirect
      setTimeout(() => {
        router.push('/liff/children');
        router.refresh(); // Force refresh to pick up new state
      }, 1500);

    } catch (err: any) {
      setError(err.message || 'Failed to verify account');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-white p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification Successful! 🎉</h2>
            <p className="text-gray-600">
              Your LINE account has been linked successfully.
            </p>
          </div>
          <p className="text-sm text-gray-500">
            Redirecting to your portal...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-white p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mb-4">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-3xl">🎓</span>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome to KDL Portal
          </h1>
          <p className="text-gray-600 text-sm">
            Please verify your identity to continue
          </p>
        </div>

        {/* LINE Profile Display */}
        {profile && (
          <div className="bg-green-50 rounded-lg p-4 mb-6 flex items-center gap-3">
            <Image
              src={profile.pictureUrl || '/default-avatar.png'}
              alt={profile.displayName}
              width={48}
              height={48}
              className="w-12 h-12 rounded-full"
            />
            <div>
              <p className="font-medium text-gray-900">{profile.displayName}</p>
              <p className="text-sm text-gray-500">LINE Account</p>
            </div>
          </div>
        )}

        {/* Verification Method Toggle */}
        <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => setUseEmail(true)}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              useEmail
                ? 'bg-white text-green-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📧 Email
          </button>
          <button
            type="button"
            onClick={() => setUseEmail(false)}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              !useEmail
                ? 'bg-white text-green-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📱 Phone
          </button>
        </div>

        {/* Verification Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {useEmail ? (
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="your@email.com"
                required={useEmail}
              />
              <p className="mt-1 text-xs text-gray-500">
                Enter the email registered with KDL
              </p>
            </div>
          ) : (
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                value={formData.contactNo}
                onChange={(e) => setFormData({ ...formData, contactNo: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="0812345678"
                required={!useEmail}
              />
              <p className="mt-1 text-xs text-gray-500">
                Enter the phone number registered with KDL
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">⚠️ {error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Verifying...
              </span>
            ) : (
              '🔐 Verify & Continue'
            )}
          </button>
        </form>

        {/* Help Text */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-center text-gray-500">
            Not registered yet?{' '}
            <span className="text-green-600 font-medium">
              Please contact KDL office
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
