
'use client';

import { useEffect, useState } from 'react';
import { useLiff } from '@/context/liff/liff.context';
import { useRouter } from 'next/navigation';
import { CreditCard, FileText, CheckCircle, Clock } from 'lucide-react';

interface Invoice {
  id: number;
  documentId: string;
  date: string;
  totalAmount: number;
  receiptDone: boolean;
  studentName: string;
  courseName: string;
  status: 'paid' | 'unpaid'; // We'll derive this from receiptDone
}

export default function PaymentsPage() {
  const { parentProfile, isLoading: liffLoading } = useLiff();
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (parentProfile?.id) {
      fetchInvoices(parentProfile.id);
    } else if (!liffLoading && !parentProfile) {
       // Not logged in or verified
       router.push('/liff/verify');
    }
  }, [parentProfile, liffLoading, router]);

  const fetchInvoices = async (parentId: number) => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/parent-portal/${parentId}/invoices`
      );
      if (!response.ok) throw new Error('Failed to fetch invoices');
      const data = await response.json();
      setInvoices(data);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  if (liffLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
         <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
         <div className="bg-white px-6 pt-6 pb-4 border-b">
        <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
      </div>

      <div className="p-4 space-y-4">
        {invoices.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-xl shadow-sm">
            <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No invoices found</p>
          </div>
        ) : (
          invoices.map((invoice) => (
            <div 
              key={invoice.id} 
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex flex-col gap-3"
            >
              {/* Header row: Doc ID + Status */}
              <div className="flex justify-between items-start">
                 <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-500" />
                    <span className="font-semibold text-gray-900">{invoice.documentId}</span>
                 </div>
                 {invoice.receiptDone ? (
                   <span className="bg-green-100 text-green-700 px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1">
                     <CheckCircle className="w-3 h-3" /> Paid
                   </span>
                 ) : (
                   <span className="bg-red-50 text-red-600 px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1">
                     <Clock className="w-3 h-3" /> Unpaid
                   </span>
                 )}
              </div>

              {/* Details */}
              <div className="text-sm text-gray-600 space-y-1">
                <p>Student: <span className="text-gray-900">{invoice.studentName}</span></p>
                <p>Course: <span className="text-gray-900">{invoice.courseName}</span></p>
                <p>Date: {formatDate(invoice.date)}</p>
              </div>

              {/* Total */}
              <div className="border-t pt-3 flex justify-between items-center mt-1">
                 <span className="text-sm font-medium text-gray-500">Total Amount</span>
                 <span className="text-lg font-bold text-gray-900">{formatCurrency(invoice.totalAmount)}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="flex justify-around items-center py-3">
          <button 
            onClick={() => router.push('/liff/children')}
            className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span className="text-xs">Courses</span>
          </button>
          <button 
             onClick={() => router.push('/liff/children')} // Fallback if no student ID
             className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs">Calendar</span>
          </button>
           <button 
            className="flex flex-col items-center gap-1 text-yellow-500"
          >
            <CreditCard className="w-6 h-6" />
            <span className="text-xs font-medium">Payments</span>
          </button>
          <button 
            onClick={() => router.push('/liff/settings')}
            className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12-0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
            </svg>
            <span className="text-xs">Setting</span>
          </button>
        </div>
      </div>
    </div>
  );
}
