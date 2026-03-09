import { ClassOption } from "@/app/types/course.type";

export type WizardMode = "from-course" | "from-student";

export interface EnrollmentDraft {
  mode: WizardMode;
  currentStep: number;
  savedAt: string;
  data: EnrollmentWizardData;
}

export interface EnrollmentWizardData {
  // Student (step 1 in from-course mode)
  students?: Array<{
    id: string;
    name: string;
    nickname: string;
    studentId?: string;
  }>;
  // Course (step 2 in from-student mode)
  courseId?: number;
  courseTitle?: string;
  // Class type & schedule (step 3)
  classOptionId?: number;
  classOptionData?: ClassOption;
  scheduleData?: {
    fixedDays?: string[];
    fixedStartTime?: string;
    fixedEndTime?: string;
    fixedStartDate?: string;
    campDates?: string[];
    campStartTime?: string;
    campEndTime?: string;
  };
  // Teacher & room (step 4)
  teacherId?: number;
  teacherName?: string;
  room?: string;
  remark?: string;
}

export interface StepPanelProps {
  data: EnrollmentWizardData;
  onChange: (partial: Partial<EnrollmentWizardData>) => void;
  onValidChange: (valid: boolean) => void;
}

/**
 * Get the localStorage key for a draft based on mode and context.
 */
export function getDraftKey(
  mode: WizardMode,
  id: number | string
): string {
  return mode === "from-student"
    ? `kdl_enrollment_draft_${id}`
    : `kdl_enrollment_draft_course_${id}`;
}

/**
 * Save draft to localStorage.
 */
export function saveDraft(key: string, draft: EnrollmentDraft): void {
  try {
    localStorage.setItem(key, JSON.stringify(draft));
  } catch {
    // Silently fail if localStorage is full
  }
}

/**
 * Load draft from localStorage.
 */
export function loadDraft(key: string): EnrollmentDraft | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as EnrollmentDraft;
  } catch {
    return null;
  }
}

/**
 * Remove draft from localStorage.
 */
export function removeDraft(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
}
