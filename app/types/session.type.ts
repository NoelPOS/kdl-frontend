export interface SessionOverview {
  courseTitle: string;
  mode: string;
  completedCount: number;
  classCancel: number;
  progress: string;
  sessionId: number;
  courseId: number;
  courseDescription: string;
  payment: string;
  medium: string;
  status: string;
  comment?: string;
}

export interface SessionStatusUpdate {
  payment?: string;
  invoiceDone?: boolean;
  comment?: string;
}
