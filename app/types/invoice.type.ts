export interface InvoiceItem {
  id: number;
  invoiceId: number;
  description: string;
  amount: string;
}

export interface Invoice {
  id: number;
  documentId: string;
  date: string;
  paymentMethod: string;
  totalAmount: string;
  sessionId: number;
  receiptDone: boolean;
  items: InvoiceItem[];
  session: {
    id: number;
    student: {
      id: number;
      name: string;
    };
    course: {
      title: string;
    };
  };
}

export interface FetchAllInvoices {
  invoices: Invoice[];
  limit: number;
  page: number;
  total: number;
}
