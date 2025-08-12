export interface Enrollment {
  session_id: number;
  session_createdat: string;
  student_id: number;
  student_name: string;
  course_title: string;
  classoption_tuitionfee: string;
  transaction_type?: "course" | "courseplus" | "package";
}

export interface DiscountRow {
  id: string;
  description: string;
  amount: number;
}

export interface InvoiceItem {
  description: string;
  amount: number;
}

export interface SessionGroup {
  sessionId: string; // could be 12 for session, cp-12 for course plus
  transactionType: "course" | "courseplus" | "package";
  actualId: string; // The actual ID to send to backend (could be session_id, courseplus_id)
}

export interface InvoiceSubmission {
  studentId: number;
  documentId: string;
  date: string;
  paymentMethod: string;
  totalAmount: number;
  studentName: string;
  courseName: string;
  sessionGroups: SessionGroup[]; // Array of sessions with their types and IDs
  items: InvoiceItem[];
}
