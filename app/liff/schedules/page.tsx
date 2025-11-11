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
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  room: string;
  attendance: string;
  feedback: string;
  student: {
    id: number;
    name: string;
    nickname: string;
    studentId: string;
    profilePicture?: string;
  };
  teacher: {
    id: number;
    name: string;
  } | null;
  course: {
    id: number;
    title: string;
  };
  session: {
    id: number;
    classOption: {
      id: number;
      classMode: string;
    };
  };
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
    if (!sessionId) return;

    try {
      setIsLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/parent-portal/sessions/${sessionId}/schedules`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch schedules');
      }

      const data = await response.json();
      setSchedules(data);
      
      if (data.length > 0) {
        setStudent(data[0].student);
        setCourseName(data[0].course?.title || '');
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
  }, [sessionId]);

  const handleScheduleClick = (scheduleId: number) => {
    router.push(`/liff/schedule/${scheduleId}?studentId=${studentId}`);
  };

  // Helper to get local date string (YYYY-MM-DD) without timezone conversion
  const getLocalDateString = (date: Date | string) => {
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
      const scheduleDate = getLocalDateString(schedule.date);
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
        const scheduleDate = getLocalDateString(schedule.date);
        return scheduleDate === selectedDateStr;
      });
    }

    // Filter by tab (upcoming/completed)
    const now = new Date();
    filtered = filtered.filter(schedule => {
      const scheduleDate = new Date(schedule.date);
      const isCompleted = schedule.attendance === 'completed' || scheduleDate < now;
      
      if (activeTab === 'upcoming') {
        return !isCompleted && schedule.attendance !== 'cancelled';
      } else {
        return isCompleted || schedule.attendance === 'cancelled';
      }
    });

    return filtered.sort((a, b) => {
      const dateA = new Date(a.date + ' ' + a.startTime);
      const dateB = new Date(b.date + ' ' + b.startTime);
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
    if (schedule.attendance === 'cancelled') {
      return (
        <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">
          Cancelled
        </span>
      );
    }

    if (schedule.attendance === 'completed') {
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
              const scheduleDate = new Date(schedule.date);
              const month = scheduleDate.toLocaleDateString('en-US', { month: 'short' });
              const day = scheduleDate.getDate();

              return (
                <button
                  key={schedule.id}
                  onClick={() => handleScheduleClick(schedule.id)}
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
                        <h3 className="font-bold text-gray-900">{schedule.course.title}</h3>
                        {getStatusBadge(schedule)}
                      </div>

                      <div className="space-y-1 text-sm text-gray-700">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>{formatTime(schedule.startTime)} - {formatTime(schedule.endTime)} Hrs.</span>
                        </div>

                        {schedule.teacher && (
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span>{schedule.teacher.name}</span>
                          </div>
                        )}

                        {schedule.room && schedule.room !== 'TBD' && (
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span>{schedule.room}</span>
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
          <button 
            className="flex flex-col items-center gap-1 text-yellow-500"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM5 8V6h14v2H5z" />
            </svg>
            <span className="text-xs font-medium">Calendar</span>
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
