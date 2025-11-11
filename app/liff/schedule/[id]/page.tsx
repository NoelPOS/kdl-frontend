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
  room: string;
  attendance: string;
  feedback?: string;
  remark?: string;
  session: {
    id: number;
  };
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
    profilePicture?: string;
  } | null;
  course: {
    id: number;
    title: string;
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
        `${process.env.NEXT_PUBLIC_API_URL}/parent-portal/schedules/${scheduleId}`
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
        `${process.env.NEXT_PUBLIC_API_URL}/parent-portal/schedules/${scheduleId}/confirm`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
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

    try {
      setSubmitting(true);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/parent-portal/schedules/${scheduleId}/reschedule`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) throw new Error('Failed to request reschedule');

      alert('Schedule has been cancelled. A replacement class will be arranged. Our team will contact you soon.');
      router.back();
    } catch (error) {
      console.error('Error requesting reschedule:', error);
      alert('Failed to cancel schedule. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Date TBD';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatTime = (time: string) => {
    if (!time) return 'TBD';
    return time.substring(0, 5); // "HH:MM"
  };

  // Determine schedule status based on date and attendance
  const getScheduleStatus = () => {
    if (!schedule) return { isUpcoming: false, isCompleted: false, isCancelled: false };
    
    // Handle null dates (replacement schedules)
    if (!schedule.date) {
      const isCancelled = schedule.attendance === 'cancelled';
      const isUpcoming = !isCancelled && schedule.attendance === 'pending';
      return { isUpcoming, isCompleted: false, isCancelled };
    }
    
    const scheduleDate = new Date(schedule.date);
    const now = new Date();
    const isCancelled = schedule.attendance === 'cancelled';
    const isCompleted = schedule.attendance === 'completed' || scheduleDate < now;
    const isUpcoming = !isCompleted && !isCancelled;

    return { isUpcoming, isCompleted, isCancelled };
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

  const { isUpcoming, isCompleted, isCancelled } = getScheduleStatus();

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="px-4 py-3">
          <button
            onClick={() => router.back()}
            className="text-gray-600 hover:text-gray-900 text-sm"
          >
            ← Back
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-4 space-y-4">
        {/* Student Profile Card */}
        <div className="bg-white rounded-lg p-4">
          <div className="flex items-center gap-3">
            {schedule.student?.profilePicture ? (
              <Image
                src={schedule.student.profilePicture}
                alt={schedule.student.name}
                width={60}
                height={60}
                className="w-15 h-15 rounded-full object-cover"
              />
            ) : (
              <div className="w-15 h-15 rounded-full bg-blue-100 flex items-center justify-center">
                <User className="w-8 h-8 text-blue-600" />
              </div>
            )}
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {schedule.student?.name}
              </h2>
              <p className="text-sm text-gray-600">
                {schedule.student?.studentId || ''}
              </p>
            </div>
          </div>
        </div>

        {/* Last Update Info */}
        <p className="text-xs text-gray-500 px-2">
          Data last updated at {new Date().toLocaleDateString('en-GB', { 
            day: 'numeric', 
            month: 'short', 
            year: 'numeric' 
          })} {new Date().toLocaleTimeString('en-GB', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })} hrs.
        </p>

        {/* Course Name */}
        <div className="bg-white rounded-lg p-4">
          <h3 className="text-lg font-bold text-gray-900">
            {schedule.course?.title}
          </h3>
        </div>

        {/* Status Badge */}
        {isCancelled && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm font-medium text-red-900">⚠️ This class has been cancelled</p>
          </div>
        )}

        {isCompleted && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-sm font-medium text-green-900">✓ Class completed</p>
          </div>
        )}

        {/* Schedule Information */}
        <div className="bg-white rounded-lg p-4 space-y-3">
          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-gray-600">Date</p>
              <p className="font-medium text-gray-900">{formatDate(schedule.date)}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-gray-600">Time</p>
              <p className="font-medium text-gray-900">
                {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)} Hrs.
              </p>
            </div>
          </div>

          {schedule.room && schedule.room !== 'TBD' && (
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-gray-600">Location</p>
                <p className="font-medium text-gray-900">{schedule.room}</p>
              </div>
            </div>
          )}

          {schedule.teacher && (
            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
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
          )}

          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-gray-600">Status</p>
              <p className="font-medium text-gray-900 capitalize">
                {schedule.attendance === 'pending' ? 'Pending' : 
                 schedule.attendance === 'confirmed' ? 'Confirmed' : 
                 schedule.attendance === 'completed' ? 'Completed' : 
                 schedule.attendance === 'cancelled' ? 'Cancelled' : 
                 'Pending'}
              </p>
            </div>
          </div>
        </div>

        {/* Feedback Area */}
        <div className="bg-white rounded-lg p-4">
          <div className="flex items-start gap-2 mb-2">
            <MessageSquare className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm font-semibold text-gray-700">Feedback</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 min-h-[100px] border border-gray-200">
            {schedule.feedback ? (
              <p className="text-sm text-gray-900 leading-relaxed whitespace-pre-wrap">
                {schedule.feedback}
              </p>
            ) : (
              <p className="text-sm text-gray-500 italic">No feedback</p>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons (for upcoming classes only) */}
      {isUpcoming && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
          <div className="flex gap-3">
            <button
              onClick={handleReschedule}
              disabled={submitting}
              className="flex-1 bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? 'Processing...' : 'Reschedule'}
            </button>

            <button
              onClick={handleConfirm}
              disabled={submitting}
              className="flex-1 bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? 'Processing...' : 'Confirm'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
