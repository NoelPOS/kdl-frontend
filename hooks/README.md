# Hooks Directory

This directory contains all custom React hooks for the KDL LMS frontend.

## Structure

```
hooks/
├── query/      — TanStack Query data-fetching hooks (reads)
├── mutation/   — TanStack Query mutation hooks (writes: create, update, delete)
└── ui/         — Pure UI state hooks (no API dependency)
```

## Conventions

### Query hooks (`hooks/query/`)
- One file per entity: `use-students.ts`, `use-teachers.ts`, etc.
- Named exports: `useStudentList`, `useStudentDetail`
- Always use `queryKeys` from `lib/query-keys.ts`
- Call API functions from `lib/api/` — never call `clientApi` directly

### Mutation hooks (`hooks/mutation/`)
- One file per entity: `use-student-mutations.ts`, etc.
- Named exports: `useCreateStudent`, `useUpdateStudent`, `useDeleteStudent`
- Always invalidate relevant query keys on success
- Handle success toasts inside the hook — keep components clean

### UI hooks (`hooks/ui/`)
- No API calls — pure React state
- Examples: `use-dialog.ts`, `use-filters.ts`, `use-mobile.ts`

## Rule

**Components must never import from `lib/api/` directly.**
All data access goes through hooks in this directory.
