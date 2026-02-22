/**
 * Enrollment mutations.
 *
 * In this system, enrollment creation is handled as part of invoice creation
 * (see use-invoice-mutations.ts → useCreateInvoice).
 *
 * This file is reserved for future standalone enrollment operations
 * (e.g., bulk enrollment imports, enrollment cancellation).
 */

// Re-export invoice creation with enrollment-appropriate invalidation pattern
// for use cases that think in terms of enrollments rather than invoices.
export { useCreateInvoice as useCreateEnrollment } from "./use-invoice-mutations";
