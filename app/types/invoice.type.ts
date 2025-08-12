export interface InvoiceItem {
  id: number;
  invoiceId: number;
  description: string;
  amount: string;
}

export interface SessionGroup {
  sessionId: string; // could be 12 for session, cp-12 for course plus
  transactionType: "course" | "courseplus" | "package";
  actualId: string;
}

export interface Invoice {
  studentId: number;
  id: number;
  documentId: string;
  date: string;
  paymentMethod: string;
  totalAmount: string;
  sessionGroups?: SessionGroup[]; // New field for multiple sessions
  receiptDone: boolean;
  // type: "course" | "courseplus" | "package";
  studentName: string | null;
  courseName: string | null;
  items: InvoiceItem[];
}

export interface FetchAllInvoices {
  invoices: Invoice[];
  limit: number;
  page: number;
  total: number;
}
