export interface InvoiceItem {
  id: number;
  invoiceId: number;
  description: string;
  amount: string;
}

export interface Invoice {
  studentId: number;
  id: number;
  documentId: string;
  date: string;
  paymentMethod: string;
  totalAmount: string;
  sessionId: number | null;
  coursePlusId: number | null;
  packageId: string | null;
  receiptDone: boolean;
  type: "course" | "courseplus" | "package";
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
