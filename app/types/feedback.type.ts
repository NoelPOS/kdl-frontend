// Feedback-related types for the feedback management system

export interface FeedbackItem {
  id: string;
  scheduleId: string;
  studentId: string;
  studentName: string;
  studentNickname: string;
  studentProfilePicture: string;
  courseTitle: string;
  teacherName: string;
  feedback: string;
  feedbackDate: string;
  sessionDate: string;
  sessionTime: string;
  verifyFb?: boolean; // Whether feedback has been verified by admin/registrar
}

export interface FeedbackFilter {
  studentName?: string;
  courseName?: string;
  teacherName?: string;
  startDate?: string;
  endDate?: string;
}

export interface FeedbackResponse {
  feedbacks: FeedbackItem[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Backend response type for feedback verification
export interface VerifyFeedbackResponse {
  success: boolean;
  message: string;
  scheduleId: number;
  updatedFeedback: string;
  verifiedBy: string;
  verifiedAt: string;
  verificationNote?: string | null;
  scheduleDetails: {
    studentName: string;
    teacherName: string;
    courseName: string;
    date: string;
  };
}
