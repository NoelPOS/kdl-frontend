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

export interface InvoiceSubmission {
  studentId: number;
  sessionId: number | string | null;
  coursePlusId?: number | string | null;
  packageId?: number | string | null;
  documentId: string;
  date: string;
  paymentMethod: string;
  totalAmount: number;
  studentName: string;
  courseName: string;
  transactionType: "course" | "courseplus" | "package";
  items: InvoiceItem[];
}
