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
    // TODO: Fetch actual schedule count from backend
    // For now, return placeholder
    return 1;
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
              const total = session.classOption.classCount;

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
                    <span>{session.classCancel} class cancel</span>
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
          <button className="flex flex-col items-center gap-1 text-yellow-500">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
            <span className="text-xs font-medium">Courses</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-gray-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs">Calendar</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-gray-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-xs">Setting</span>
          </button>
        </div>
      </div>
    </div>
  );
}
