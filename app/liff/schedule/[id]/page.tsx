'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useLiff } from '@/context/liff/liff.context';
import Image from 'next/image';
import {
  ChevronLeft,
  Calendar,
  Clock,
  MapPin,
  User,
  CheckCircle,
  XCircle,
  MessageSquare,
  Edit,
  Check,
} from 'lucide-react';

interface ScheduleDetail {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  attendance?: 'present' | 'absent' | 'pending';
  feedback?: string;
  homework?: string;
  session: {
    id: number;
    courseName: string;
    student: {
      id: number;
      firstName: string;
      lastName: string;
      profilePicture?: string;
    };
  };
  teacher: {
    id: number;
    name: string;
    profilePicture?: string;
  };
  room?: {
    id: number;
    name: string;
  };
}

export default function ScheduleDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { profile } = useLiff();

  const scheduleId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [schedule, setSchedule] = useState<ScheduleDetail | null>(null);
  const [confirmSuccess, setConfirmSuccess] = useState(false);

  const fetchScheduleDetail = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/parents/schedules/${scheduleId}`,
        {
          headers: {
            'Authorization': `Bearer ${profile?.userId}`,
          },
        }
      );

      if (!response.ok) throw new Error('Failed to fetch schedule');

      const data = await response.json();
      setSchedule(data);
    } catch (error) {
      console.error('Error fetching schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScheduleDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scheduleId]);

  const handleConfirm = async () => {
    if (!schedule) return;

    try {
      setSubmitting(true);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/parents/schedules/${scheduleId}/confirm`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${profile?.userId}`,
          },
        }
      );

      if (!response.ok) throw new Error('Failed to confirm schedule');

      // Show success state
      setConfirmSuccess(true);

      // Auto-redirect after 2 seconds
      setTimeout(() => {
        router.back();
      }, 2000);
    } catch (error) {
      console.error('Error confirming schedule:', error);
      alert('Failed to confirm schedule. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReschedule = async () => {
    if (!schedule) return;

    // In a real implementation, this would open a modal or navigate to a reschedule page
    // For now, we'll send a message to the bot
    try {
      setSubmitting(true);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/parents/schedules/${scheduleId}/reschedule`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${profile?.userId}`,
          },
        }
      );

      if (!response.ok) throw new Error('Failed to request reschedule');

      alert('Reschedule request sent! Our team will contact you shortly.');
      router.back();
    } catch (error) {
      console.error('Error requesting reschedule:', error);
      alert('Failed to send reschedule request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatTime = (time: string) => {
    return time.substring(0, 5); // "HH:MM"
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading schedule...</p>
        </div>
      </div>
    );
  }

  if (!schedule) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Schedule not found</p>
          <button
            onClick={() => router.back()}
            className="mt-4 text-blue-600 hover:underline"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  if (confirmSuccess) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-green-50">
        <div className="text-center px-6">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <Check className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-green-900 mb-2">Confirmed!</h2>
          <p className="text-green-700">
            Schedule confirmed successfully. You&apos;ll receive a notification.
          </p>
        </div>
      </div>
    );
  }

  const isUpcoming = schedule.status === 'upcoming';
  const isCompleted = schedule.status === 'completed';
  const isCancelled = schedule.status === 'cancelled';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-1 hover:bg-gray-100 rounded-full"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <h1 className="text-lg font-semibold">Schedule Details</h1>
              <p className="text-sm text-gray-600">{schedule.session.courseName}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Student Card */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            {schedule.session.student.profilePicture ? (
              <Image
                src={schedule.session.student.profilePicture}
                alt={schedule.session.student.firstName}
                width={48}
                height={48}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <User className="w-6 h-6 text-blue-600" />
              </div>
            )}
            <div>
              <p className="font-semibold text-gray-900">
                {schedule.session.student.firstName} {schedule.session.student.lastName}
              </p>
              <p className="text-sm text-gray-600">{schedule.session.courseName}</p>
            </div>
          </div>
        </div>

        {/* Status Badge */}
        {isCancelled && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
            <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-red-900">This class has been cancelled</p>
              <p className="text-sm text-red-700">Please contact us for more information</p>
            </div>
          </div>
        )}

        {isCompleted && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-green-900">Class completed</p>
              {schedule.attendance === 'present' && (
                <p className="text-sm text-green-700">Student attended</p>
              )}
              {schedule.attendance === 'absent' && (
                <p className="text-sm text-red-700">Student was absent</p>
              )}
            </div>
          </div>
        )}

        {/* Schedule Info */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-4 space-y-4">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600">Date</p>
                <p className="font-medium text-gray-900">{formatDate(schedule.date)}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600">Time</p>
                <p className="font-medium text-gray-900">
                  {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-gray-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-gray-600">Teacher</p>
                <div className="flex items-center gap-2 mt-1">
                  {schedule.teacher.profilePicture ? (
                    <Image
                      src={schedule.teacher.profilePicture}
                      alt={schedule.teacher.name}
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="w-4 h-4 text-gray-600" />
                    </div>
                  )}
                  <p className="font-medium text-gray-900">{schedule.teacher.name}</p>
                </div>
              </div>
            </div>

            {schedule.room && (
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Location</p>
                  <p className="font-medium text-gray-900">{schedule.room.name}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Feedback & Homework (for completed classes) */}
        {isCompleted && (
          <>
            {schedule.feedback && (
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-start gap-3">
                  <MessageSquare className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 mb-2">Teacher&apos;s Feedback</p>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {schedule.feedback}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {schedule.homework && (
              <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                <div className="flex items-start gap-3">
                  <Edit className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-amber-900 mb-2">Homework</p>
                    <p className="text-amber-800 text-sm leading-relaxed">
                      {schedule.homework}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Action Buttons (for upcoming classes only) */}
      {isUpcoming && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 space-y-3">
          <button
            onClick={handleConfirm}
            disabled={submitting}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Confirming...</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                <span>Confirm Attendance</span>
              </>
            )}
          </button>

          <button
            onClick={handleReschedule}
            disabled={submitting}
            className="w-full bg-white text-gray-700 py-3 rounded-lg font-semibold border border-gray-300 hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            <Edit className="w-5 h-5" />
            <span>Request Reschedule</span>
          </button>
        </div>
      )}
    </div>
  );
}
