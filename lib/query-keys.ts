/**
 * Centralized query key factory for TanStack Query.
 *
 * Convention:
 *   - Top-level key  = entity name (string)
 *   - Second level   = operation ('list', 'detail')
 *   - Third level    = filters/params (object) — different params = separate cache entry
 *
 * Why a factory?
 *   Enables precise cache invalidation:
 *
 *   queryClient.invalidateQueries({ queryKey: queryKeys.students.all() })
 *     → invalidates ALL student-related queries
 *
 *   queryClient.invalidateQueries({ queryKey: queryKeys.students.lists() })
 *     → invalidates all student list queries (any filter combination)
 *
 *   queryClient.invalidateQueries({ queryKey: queryKeys.students.detail(id) })
 *     → invalidates only that specific student
 */
export const queryKeys = {
  students: {
    all: () => ["students"] as const,
    lists: () => ["students", "list"] as const,
    list: (filters: Record<string, unknown>) =>
      ["students", "list", filters] as const,
    details: () => ["students", "detail"] as const,
    detail: (id: string) => ["students", "detail", id] as const,
  },

  teachers: {
    all: () => ["teachers"] as const,
    lists: () => ["teachers", "list"] as const,
    list: (filters: Record<string, unknown>) =>
      ["teachers", "list", filters] as const,
    details: () => ["teachers", "detail"] as const,
    detail: (id: string) => ["teachers", "detail", id] as const,
  },

  courses: {
    all: () => ["courses"] as const,
    lists: () => ["courses", "list"] as const,
    list: (filters: Record<string, unknown>) =>
      ["courses", "list", filters] as const,
    details: () => ["courses", "detail"] as const,
    detail: (id: string) => ["courses", "detail", id] as const,
  },

  schedules: {
    all: () => ["schedules"] as const,
    lists: () => ["schedules", "list"] as const,
    list: (filters: Record<string, unknown>) =>
      ["schedules", "list", filters] as const,
    details: () => ["schedules", "detail"] as const,
    detail: (id: string) => ["schedules", "detail", id] as const,
  },

  sessions: {
    all: () => ["sessions"] as const,
    lists: () => ["sessions", "list"] as const,
    list: (filters: Record<string, unknown>) =>
      ["sessions", "list", filters] as const,
  },

  invoices: {
    all: () => ["invoices"] as const,
    lists: () => ["invoices", "list"] as const,
    list: (filters: Record<string, unknown>) =>
      ["invoices", "list", filters] as const,
    details: () => ["invoices", "detail"] as const,
    detail: (id: string) => ["invoices", "detail", id] as const,
  },

  receipts: {
    all: () => ["receipts"] as const,
    lists: () => ["receipts", "list"] as const,
    list: (filters: Record<string, unknown>) =>
      ["receipts", "list", filters] as const,
    detail: (id: string) => ["receipts", "detail", id] as const,
  },

  parents: {
    all: () => ["parents"] as const,
    lists: () => ["parents", "list"] as const,
    list: (filters: Record<string, unknown>) =>
      ["parents", "list", filters] as const,
    details: () => ["parents", "detail"] as const,
    detail: (id: string) => ["parents", "detail", id] as const,
  },

  registrars: {
    all: () => ["registrars"] as const,
    lists: () => ["registrars", "list"] as const,
    list: (filters: Record<string, unknown>) =>
      ["registrars", "list", filters] as const,
    detail: (id: string) => ["registrars", "detail", id] as const,
  },

  notifications: {
    all: () => ["notifications"] as const,
    lists: () => ["notifications", "list"] as const,
    list: (filters: Record<string, unknown>) =>
      ["notifications", "list", filters] as const,
  },

  rooms: {
    all: () => ["rooms"] as const,
    lists: () => ["rooms", "list"] as const,
    list: (filters?: Record<string, unknown>) =>
      filters ? ["rooms", "list", filters] as const : ["rooms", "list"] as const,
  },

  discounts: {
    all: () => ["discounts"] as const,
    lists: () => ["discounts", "list"] as const,
    list: (filters?: Record<string, unknown>) =>
      filters ? ["discounts", "list", filters] as const : ["discounts", "list"] as const,
  },

  classOptions: {
    all: () => ["class-options"] as const,
    lists: () => ["class-options", "list"] as const,
    list: (filters?: Record<string, unknown>) =>
      filters
        ? ["class-options", "list", filters] as const
        : ["class-options", "list"] as const,
  },

  enrollments: {
    all: () => ["enrollments"] as const,
    lists: () => ["enrollments", "list"] as const,
    list: (filters: Record<string, unknown>) =>
      ["enrollments", "list", filters] as const,
    byStudent: (studentId: string) =>
      ["enrollments", "student", studentId] as const,
  },

  feedbacks: {
    all: () => ["feedbacks"] as const,
    lists: () => ["feedbacks", "list"] as const,
    list: (filters: Record<string, unknown>) =>
      ["feedbacks", "list", filters] as const,
  },

  analytics: {
    all: () => ["analytics"] as const,
    dashboard: () => ["analytics", "dashboard"] as const,
    statistics: (filters: Record<string, unknown>) =>
      ["analytics", "statistics", filters] as const,
  },

  today: {
    all: () => ["today"] as const,
    schedule: (date: string) => ["today", "schedule", date] as const,
  },
} as const;
