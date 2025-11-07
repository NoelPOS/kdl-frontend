'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLiff } from '@/context/liff/liff.context';
import { ChevronLeft, Calendar, Clock, MapPin, User } from 'lucide-react';

interface Schedule {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  attendance?: 'present' | 'absent' | 'pending';
  teacher: {
    id: number;
    name: string;
  };
  room?: {
    id: number;
    name: string;
  };
}

interface Session {
  id: number;
  courseName: string;
  student: {
    id: number;
    firstName: string;
    lastName: string;
  };
}

export default function SchedulesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { profile, parentProfile } = useLiff();

  const sessionId = searchParams.get('sessionId');

  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed'>('upcoming');

  const fetchSchedules = async () => {
    if (!sessionId) return;
    
    try {
      setLoading(true);
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/parent-portal/sessions/${sessionId}/schedules`,
        {
          headers: {
            'Authorization': `Bearer ${profile?.userId}`,
          },
        }
      );

      if (!response.ok) throw new Error('Failed to fetch schedules');

      const data = await response.json();
      setSession(data.session);
      setSchedules(data.schedules);
    } catch (error) {
      console.error('Error fetching schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!sessionId) {
      router.push('/liff/children');
      return;
    }

    fetchSchedules();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, router]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = (time: string) => {
    return time.substring(0, 5); // "HH:MM"
  };

  const getDayOfWeek = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', { weekday: 'short' });
  };

  const filteredSchedules = schedules.filter(schedule => {
    if (activeTab === 'upcoming') {
      return schedule.status === 'upcoming';
    } else {
      return schedule.status === 'completed' || schedule.status === 'cancelled';
    }
  });

  const getStatusBadge = (schedule: Schedule) => {
    if (schedule.status === 'cancelled') {
      return (
        <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">
          Cancelled
        </span>
      );
    }

    if (schedule.status === 'completed' && schedule.attendance) {
      if (schedule.attendance === 'present') {
        return (
          <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
            Present
          </span>
        );
      } else if (schedule.attendance === 'absent') {
        return (
          <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">
            Absent
          </span>
        );
      }
    }

    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading schedules...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3 mb-3">
            <button
              onClick={() => router.back()}
              className="p-1 hover:bg-gray-100 rounded-full"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <h1 className="text-lg font-semibold">{session?.courseName}</h1>
              <p className="text-sm text-gray-600">
                {session?.student.firstName} {session?.student.lastName}
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 border-b">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`pb-2 px-1 font-medium transition-colors relative ${
                activeTab === 'upcoming'
                  ? 'text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Upcoming
              {activeTab === 'upcoming' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`pb-2 px-1 font-medium transition-colors relative ${
                activeTab === 'completed'
                  ? 'text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Completed
              {activeTab === 'completed' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Schedule List */}
      <div className="p-4 space-y-3">
        {filteredSchedules.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              {activeTab === 'upcoming' ? 'No upcoming schedules' : 'No completed schedules'}
            </p>
          </div>
        ) : (
          filteredSchedules.map((schedule) => (
            <div
              key={schedule.id}
              onClick={() => router.push(`/liff/schedule/${schedule.id}`)}
              className="bg-white rounded-lg p-4 border border-gray-200 hover:border-blue-300 cursor-pointer transition-colors"
            >
              {/* Date Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {new Date(schedule.date).getDate()}
                    </div>
                    <div className="text-xs text-gray-500 uppercase">
                      {getDayOfWeek(schedule.date)}
                    </div>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {formatDate(schedule.date)}
                    </p>
                    <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>
                        {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                      </span>
                    </div>
                  </div>
                </div>
                {getStatusBadge(schedule)}
              </div>

              {/* Details */}
              <div className="space-y-2 pl-14">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <User className="w-4 h-4 text-gray-400" />
                  <span>{schedule.teacher.name}</span>
                </div>
                {schedule.room && (
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span>{schedule.room.name}</span>
                  </div>
                )}
              </div>

              {/* Action Indicator */}
              {schedule.status === 'upcoming' && (
                <div className="mt-3 pt-3 border-t border-gray-100 flex justify-end">
                  <span className="text-sm text-blue-600 font-medium">
                    View details →
                  </span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
