export interface Enrollment {
  session_id: number;
  session_createdAt: string;
  student_id: number;
  student_name: string;
  course_title: string;
  classOption_tuitionFee: string;
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
  sessionId: number;
  documentId: string;
  date: string;
  paymentMethod: string;
  totalAmount: number;
  items: InvoiceItem[];
}
