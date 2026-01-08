'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';

/**
 * LIFF Calendar/Schedules Page (Mockup 2)
 * 
 * Shows calendar view with schedules for a student
 * Matches your UI mockup with:
 * - Student header with profile picture and ID
 * - Month calendar view with blue highlighted dates for class days
 * - Upcoming/Completed tabs
 * - Schedule cards with date, time, location, and teacher info
 * - Bottom navigation
 */

interface Schedule {
  schedule_id: string;
  schedule_date: string;
  schedule_startTime: string;
  schedule_endTime: string;
  schedule_room: string;
  schedule_attendance: string;
  schedule_remark: string;
  schedule_feedback: string;
  schedule_feedbackDate: string;
  schedule_verifyFb: boolean;
  schedule_feedbackModifiedByName: string;
  schedule_feedbackModifiedAt: string;
  schedule_classNumber: number;
  schedule_warning: string;
  schedule_courseId: string;
  course_title: string;
  session_mode: string;
  teacher_name: string;
  student_id: string;
  student_name: string;
  student_nickname: string;
  student_profilePicture: string;
  student_phone: string;
}

export default function SchedulesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const studentId = searchParams?.get('studentId');
  const sessionId = searchParams?.get('sessionId');

  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [student, setStudent] = useState<any>(null);
  const [courseName, setCourseName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState('');
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed'>('upcoming');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const fetchSchedules = async () => {
    // We need either sessionId OR studentId to fetch schedules
    if (!sessionId && !studentId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      
      let url = '';
      if (sessionId) {
        url = `${process.env.NEXT_PUBLIC_API_URL}/parent-portal/sessions/${sessionId}/schedules`;
      } else {
        // Fallback: Fetch ALL schedules for the student if no session selected
        url = `${process.env.NEXT_PUBLIC_API_URL}/parent-portal/students/${studentId}/schedules`;
      }

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Failed to fetch schedules');
      }

      const data = await response.json();
      setSchedules(data);
      
      if (data.length > 0) {
        // Map snake_case fields to student object
        setStudent({
          id: data[0].student_id,
          name: data[0].student_name,
          nickname: data[0].student_nickname,
          profilePicture: data[0].student_profilePicture,
        });
        if (sessionId) {
          setCourseName(data[0].course_title || '');
        } else {
          setCourseName('All Courses');
        }
      }

      // Set last update time
      const now = new Date();
      setLastUpdate(
        `${now.getDate()} ${now.toLocaleString('en-US', { month: 'short' })} ${now.getFullYear()} ${now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} hrs.`
      );
    } catch (error) {
      console.error('Error fetching schedules:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (sessionId) {
      fetchSchedules();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, studentId]);

  const handleScheduleClick = (scheduleId: string) => {
    router.push(`/liff/schedule/${scheduleId}?studentId=${studentId}`);
  };

  // Helper to get local date string (YYYY-MM-DD) without timezone conversion
  const getLocalDateString = (date: Date | string | null) => {
    if (!date) return null;
    const d = typeof date === 'string' ? new Date(date) : date;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Calendar functions
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek };
  };

  const hasScheduleOnDate = (date: Date) => {
    const dateStr = getLocalDateString(date);
    return schedules.some(schedule => {
      if (!schedule.schedule_date) return false; // Skip schedules with null dates
      const scheduleDate = getLocalDateString(schedule.schedule_date);
      return scheduleDate === dateStr;
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSameDate = (date1: Date | null, date2: Date) => {
    if (!date1) return false;
    return date1.toDateString() === date2.toDateString();
  };

  const getFilteredSchedules = () => {
    let filtered = schedules;

    // Filter by selected date if one is selected
    if (selectedDate) {
      const selectedDateStr = getLocalDateString(selectedDate);
      filtered = filtered.filter(schedule => {
        if (!schedule.schedule_date) return false; // Skip schedules with null dates
        const scheduleDate = getLocalDateString(schedule.schedule_date);
        return scheduleDate === selectedDateStr;
      });
    }

    // Filter by tab (upcoming/completed)
    const now = new Date();
    filtered = filtered.filter(schedule => {
      if (!schedule.schedule_date) return false; // Skip schedules with null dates
      const scheduleDate = new Date(schedule.schedule_date);
      const isCompleted = schedule.schedule_attendance === 'completed' || scheduleDate < now;
      
      if (activeTab === 'upcoming') {
        return !isCompleted && schedule.schedule_attendance !== 'cancelled';
      } else {
        return isCompleted || schedule.schedule_attendance === 'cancelled';
      }
    });

    return filtered.sort((a, b) => {
      // Handle null dates - put them at the end
      if (!a.schedule_date) return 1;
      if (!b.schedule_date) return -1;
      
      const dateA = new Date(a.schedule_date + ' ' + a.schedule_startTime);
      const dateB = new Date(b.schedule_date + ' ' + b.schedule_startTime);
      return activeTab === 'upcoming' 
        ? dateA.getTime() - dateB.getTime()
        : dateB.getTime() - dateA.getTime();
    });
  };

  const renderCalendar = () => {
    const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);
    const monthYear = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const days = [];

    // Day headers
    const dayHeaders = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

    // Empty cells for days before month starts (adjust for Monday start)
    const adjustedStartDay = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1;
    for (let i = 0; i < adjustedStartDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-12"></div>);
    }

    // Days of month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const hasSchedule = hasScheduleOnDate(date);
      const isCurrentDay = isToday(date);
      const isSelected = isSameDate(selectedDate, date);

      days.push(
        <button
          key={day}
          onClick={() => setSelectedDate(date)}
          className={`h-12 flex items-center justify-center rounded-full text-sm font-medium transition-colors
            ${hasSchedule ? 'bg-blue-500 text-white hover:bg-blue-600' : 'text-gray-700 hover:bg-gray-100'}
            ${isCurrentDay && !hasSchedule ? 'ring-2 ring-yellow-400' : ''}
            ${isSelected ? 'ring-2 ring-blue-700' : ''}
          `}
        >
          {day}
        </button>
      );
    }

    return (
      <div className="bg-white p-4 mb-4">
        {/* Month navigation */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h3 className="text-lg font-semibold">{monthYear}</h3>
          <button
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayHeaders.map(day => (
            <div key={day} className="text-center text-xs font-medium text-gray-600">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {days}
        </div>
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = (time: string) => {
    if (!time) return 'TBD';
    return time.substring(0, 5); // "HH:MM"
  };

  const getStatusBadge = (schedule: Schedule) => {
    if (schedule.schedule_attendance === 'cancelled') {
      return (
        <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">
          Cancelled
        </span>
      );
    }

    if (schedule.schedule_attendance === 'completed') {
      return (
        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
          Completed
        </span>
      );
    }

    return (
      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
        Pending
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent mb-4"></div>
          <p className="text-gray-600">Loading schedules...</p>
        </div>
      </div>
    );
  }

  const filteredSchedules = getFilteredSchedules();

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
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

        {courseName && (
          <div className="mt-3 bg-blue-50 rounded-lg p-3">
            <p className="text-sm font-medium text-blue-900">{courseName}</p>
            <p className="text-xs text-blue-600 mt-1">
              {activeTab === 'upcoming' 
                ? `${filteredSchedules.length} upcoming ${filteredSchedules.length === 1 ? 'class' : 'classes'}`
                : `${filteredSchedules.length} completed ${filteredSchedules.length === 1 ? 'class' : 'classes'}`
              }
            </p>
          </div>
        )}
      </div>

      {/* Calendar View */}
      {renderCalendar()}

      {/* Tabs */}
      <div className="bg-white px-6 py-3 flex gap-6 border-b sticky top-0 z-10">
        <button
          onClick={() => {
            setActiveTab('upcoming');
            setSelectedDate(null);
          }}
          className={`pb-2 font-medium transition-colors relative ${
            activeTab === 'upcoming'
              ? 'text-yellow-500'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Upcoming
          {activeTab === 'upcoming' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellow-500"></div>
          )}
        </button>
        <button
          onClick={() => {
            setActiveTab('completed');
            setSelectedDate(null);
          }}
          className={`pb-2 font-medium transition-colors relative ${
            activeTab === 'completed'
              ? 'text-gray-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Completed
          {activeTab === 'completed' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-600"></div>
          )}
        </button>
      </div>

      {/* Schedule Cards */}
      <div className="px-6 py-4">
        {selectedDate && (
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing schedules for <span className="font-medium">{formatDate(selectedDate.toISOString())}</span>
            </p>
            <button
              onClick={() => setSelectedDate(null)}
              className="text-sm text-blue-600 hover:underline"
            >
              Clear filter
            </button>
          </div>
        )}

        {filteredSchedules.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📅</div>
            <p className="text-gray-500">
              {selectedDate 
                ? 'No schedules found for this date'
                : activeTab === 'upcoming' 
                  ? 'No upcoming schedules'
                  : 'No completed schedules'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredSchedules.map((schedule) => {
              // Safety check for null dates (should be filtered out already)
              if (!schedule.schedule_date) return null;
              
              const scheduleDate = new Date(schedule.schedule_date);
              const month = scheduleDate.toLocaleDateString('en-US', { month: 'short' });
              const day = scheduleDate.getDate();

              return (
                <button
                  key={schedule.schedule_id}
                  onClick={() => handleScheduleClick(schedule.schedule_id)}
                  className="w-full bg-blue-50 rounded-lg p-4 text-left transition-all hover:shadow-lg active:scale-95 border border-blue-100"
                >
                  <div className="flex gap-4">
                    {/* Date Badge */}
                    <div className="flex flex-col items-center justify-center bg-white rounded-lg p-3 min-w-[60px]">
                      <div className="text-2xl font-bold text-blue-600">{day}</div>
                      <div className="text-xs text-gray-600 uppercase">{month}</div>
                    </div>

                    {/* Schedule Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-bold text-gray-900">{schedule.course_title}</h3>
                        {getStatusBadge(schedule)}
                      </div>

                      <div className="space-y-1 text-sm text-gray-700">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>{formatTime(schedule.schedule_startTime)} - {formatTime(schedule.schedule_endTime)} Hrs.</span>
                        </div>

                        {schedule.teacher_name && (
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span>{schedule.teacher_name}</span>
                          </div>
                        )}

                        {schedule.schedule_room && schedule.schedule_room !== 'TBD' && (
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span>{schedule.schedule_room}</span>
                          </div>
                        )}
                      </div>
                    </div>
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
            className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span className="text-xs">Courses</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-yellow-500">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs font-medium">Calendar</span>
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
