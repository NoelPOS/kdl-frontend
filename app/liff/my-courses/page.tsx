'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';

/**
 * LIFF Courses Page (Mockup 1)
 * 
 * Shows all courses/sessions for a selected child
 * Matches your UI mockup with:
 * - Student header with profile picture and ID
 * - Course cards with teacher, progress, and cancellations
 * - Color-coded status (in-progress, completed)
 */

interface Session {
  id: number;
  studentId: number;
  courseId: number;
  status: string;
  payment: string;
  classCancel: number;
  completedCount: number;
  totalScheduledCount: number;
  canceledCount: number;
  course: {
    id: number;
    title: string;
  };
  teacher: {
    id: number;
    name: string;
  } | null;
  classOption: {
    id: number;
    classMode: string;
    classCount: number;
  };
  student: {
    id: number;
    name: string;
    nickname: string;
    studentId: string;
    profilePicture?: string;
  };
}

export default function CoursesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const studentId = searchParams?.get('studentId');

  const [sessions, setSessions] = useState<Session[]>([]);
  const [student, setStudent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState('');

  const fetchSessions = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/parent-portal/students/${studentId}/sessions`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch sessions');
      }

      const data = await response.json();
      setSessions(data);
      
      // Get student info from the first session if available
      if (data.length > 0 && data[0].student) {
        setStudent(data[0].student);
      }

      // Set last update time
      const now = new Date();
      setLastUpdate(
        `${now.getDate()} ${now.toLocaleString('en-US', { month: 'short' })} ${now.getFullYear()} ${now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} hrs.`
      );
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (studentId) {
      fetchSessions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId]);

  const handleCourseClick = (sessionId: number) => {
    router.push(`/liff/schedules?sessionId=${sessionId}&studentId=${studentId}`);
  };

  const getCompletedClasses = (session: Session) => {
    // Return the completed count from backend
    return session.completedCount || 0;
  };

  const getTotalClasses = (session: Session) => {
    // Return the class count from class option
    return session.classOption?.classCount || 0;
  };

  const getCanceledClasses = (session: Session) => {
    // Return the canceled count from backend
    return session.canceledCount || 0;
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'wip':
        return 'bg-blue-100';
      case 'completed':
        return 'bg-gray-100';
      case 'paid':
        return 'bg-green-100';
      default:
        return 'bg-gray-100';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent mb-4"></div>
          <p className="text-gray-600">Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Student Header */}
      <div className="bg-white px-6 pt-6 pb-4">
        <button
          onClick={() => router.back()}
          className="mb-4 text-gray-600 hover:text-gray-900"
        >
          ← Back
        </button>

        <div className="flex items-center gap-4 mb-2">
          <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-200">
            {student?.profilePicture ? (
              <Image
                src={student.profilePicture}
                alt={student.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl">
                👤
              </div>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {student?.name || 'Student'}
            </h1>
            <p className="text-gray-600">{student?.studentId}</p>
          </div>
        </div>

        <p className="text-xs text-gray-500">
          Data last updated at {lastUpdate}
        </p>
      </div>

      {/* Courses Section */}
      <div className="px-6 py-4">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Courses</h2>

        {sessions.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <p className="text-gray-500">No courses found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {sessions.map((session) => {
              const completed = getCompletedClasses(session);
              const total = getTotalClasses(session);
              const canceled = getCanceledClasses(session);

              return (
                <button
                  key={session.id}
                  onClick={() => handleCourseClick(session.id)}
                  className={`${getStatusColor(session.status)} rounded-2xl p-4 text-left transition-all hover:shadow-lg active:scale-95`}
                >
                  {/* Course Title */}
                  <h3 className="font-bold text-gray-900 mb-3 leading-tight min-h-[2.5rem]">
                    {session.course.title}
                  </h3>

                  {/* Teacher */}
                  <div className="flex items-center gap-2 mb-2 text-sm text-gray-700">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>{session.teacher?.name || 'TBD'}</span>
                  </div>

                  {/* Progress */}
                  <div className="flex items-center gap-2 mb-2 text-sm text-gray-700">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{completed} out of {total}</span>
                  </div>

                  {/* Cancellations */}
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{canceled} class cancel</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="flex justify-around items-center py-3">
          <button 
            onClick={() => router.push(`/liff/my-courses?studentId=${studentId}`)}
            className="flex flex-col items-center gap-1 text-yellow-500"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span className="text-xs font-medium">Courses</span>
          </button>
          <button 
             onClick={() => router.push(`/liff/schedules?studentId=${studentId}`)}
             className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs">Calendar</span>
          </button>
          <button 
            onClick={() => router.push('/liff/payments')}
            className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600"
          >
           <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            <span className="text-xs">Payments</span>
          </button>
          <button 
            onClick={() => router.push('/liff/settings')}
            className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12-0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
            </svg>
            <span className="text-xs">Setting</span>
          </button>
        </div>
      </div>
    </div>
  );
}
