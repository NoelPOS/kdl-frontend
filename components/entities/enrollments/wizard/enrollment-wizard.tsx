"use client";

import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  ComfirmClassScheduleData,
  Student,
  TeacherData,
} from "@/app/types/course.type";
import { SessionOverview } from "@/app/types/session.type";
import { StepProgressBar } from "./step-progress-bar";
import {
  WizardMode,
  EnrollmentWizardData,
} from "./types";
import { Step1Student } from "./steps/step-1-student";
import { Step2Course } from "./steps/step-2-course";
import { Step3ClassType } from "./steps/step-3-class-type";
import { Step4Teacher } from "./steps/step-4-teacher";
import { Step5Confirm } from "./steps/step-5-confirm";

interface EnrollmentWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prefillCourseId?: number;
  prefillCourseTitle?: string;
  prefillStudentId?: number;
  prefillStudentName?: string;
  mode: WizardMode;
  onSuccess?: () => void;
  // For assign mode (TBC course)
  session?: SessionOverview;
  studentData?: Student;
}

/**
 * Determine active steps based on mode and class type.
 * Steps: 1=Student, 2=Course, 3=ClassType, 4=Teacher, 5=Confirm
 *
 * from-course: skips step 2 (course already known)
 * from-student: skips step 1 (student already known)
 * check class type (id 2 or 11): skips step 4 (no teacher needed)
 */
function getActiveSteps(
  mode: WizardMode,
  classOptionId?: number
): number[] {
  const steps: number[] = [];

  if (mode === "from-course") {
    steps.push(1); // student selection
  } else {
    steps.push(2); // course selection
  }

  steps.push(3); // class type & schedule

  // Skip teacher for "check" types (id 2 or 11)
  if (classOptionId !== 2 && classOptionId !== 11) {
    steps.push(4); // teacher & room
  }

  steps.push(5); // confirm

  return steps;
}

function getStepLabels(activeSteps: number[]): string[] {
  const labels: Record<number, string> = {
    1: "Students",
    2: "Course",
    3: "Schedule",
    4: "Teacher",
    5: "Confirm",
  };
  return activeSteps.map((s) => labels[s]);
}

export default function EnrollmentWizard({
  open,
  onOpenChange,
  prefillCourseId,
  prefillCourseTitle,
  prefillStudentId,
  prefillStudentName,
  mode,
  onSuccess,
  session,
  studentData,
}: EnrollmentWizardProps) {
  const [wizardData, setWizardData] = useState<EnrollmentWizardData>(() => {
    const initial: EnrollmentWizardData = {};
    if (mode === "from-course" && prefillCourseId) {
      initial.courseId = prefillCourseId;
      initial.courseTitle = prefillCourseTitle;
    }
    if (mode === "from-student" && prefillStudentId && studentData) {
      initial.students = [
        {
          id: studentData.id,
          name: studentData.name,
          nickname: studentData.nickname,
          studentId: studentData.studentId,
        },
      ];
    }
    return initial;
  });

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isCurrentStepValid, setIsCurrentStepValid] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Track the latest classSchedule for step 5
  const classScheduleRef = useRef<ComfirmClassScheduleData | null>(null);

  // Compute active steps based on class type
  const activeSteps = getActiveSteps(mode, wizardData.classOptionId);
  const stepLabels = getStepLabels(activeSteps);
  const currentStep = activeSteps[currentStepIndex];
  const totalSteps = activeSteps.length;
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === totalSteps - 1;

  // Data change handler
  const handleDataChange = useCallback(
    (partial: Partial<EnrollmentWizardData>) => {
      setWizardData((prev) => ({ ...prev, ...partial }));
    },
    []
  );

  // Validity change handler
  const handleValidChange = useCallback((valid: boolean) => {
    setIsCurrentStepValid(valid);
  }, []);

  // Class schedule ready handler (from step 3)
  const handleClassScheduleReady = useCallback(
    (schedule: ComfirmClassScheduleData) => {
      classScheduleRef.current = schedule;
    },
    []
  );

  // Navigate next
  const handleNext = useCallback(() => {
    if (!isCurrentStepValid && currentStep !== 5) return;
    if (isLastStep) return; // Step 5 handles its own submission
    setCurrentStepIndex((prev) => Math.min(prev + 1, totalSteps - 1));
    setIsCurrentStepValid(false);
  }, [isCurrentStepValid, currentStep, isLastStep, totalSteps]);

  // Navigate back
  const handleBack = useCallback(() => {
    if (isFirstStep) return;
    setCurrentStepIndex((prev) => Math.max(prev - 1, 0));
  }, [isFirstStep]);

  // Close handler
  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      onOpenChange(newOpen);
    },
    [onOpenChange]
  );

  // Success handler
  const handleWizardSuccess = useCallback(() => {
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      onOpenChange(false);
      setCurrentStepIndex(0);
      setWizardData({});
      if (onSuccess) onSuccess();
    }, 1500);
  }, [onOpenChange, onSuccess]);

  // Build teacher data for step 5
  const buildTeacherData = (): TeacherData => {
    // For check types without teacher selection
    if (wizardData.classOptionId === 2 || wizardData.classOptionId === 11) {
      return {
        teacherId: -1,
        teacher: "TBD",
        room: "TBD",
        remark: "",
      };
    }
    return {
      teacherId: wizardData.teacherId || -1,
      teacher: wizardData.teacherName || "TBD",
      room: wizardData.room || "TBD",
      remark: wizardData.remark || "",
    };
  };

  // Build students array for step 5
  const buildStudents = (): Student[] => {
    if (wizardData.students && wizardData.students.length > 0) {
      return wizardData.students.map((s) => ({
        id: s.id,
        name: s.name,
        nickname: s.nickname,
        studentId: s.studentId,
      }));
    }
    // from-student mode: use prefilled student
    if (studentData) {
      return [studentData];
    }
    return [];
  };

  // Build class schedule for step 5
  const buildClassSchedule = (): ComfirmClassScheduleData | null => {
    if (classScheduleRef.current) return classScheduleRef.current;
    if (!wizardData.classOptionData) return null;
    return {
      classType: wizardData.classOptionData,
      fixedDays: wizardData.scheduleData?.fixedDays,
      fixedStartTime: wizardData.scheduleData?.fixedStartTime,
      fixedEndTime: wizardData.scheduleData?.fixedEndTime,
      fixedStartDate: wizardData.scheduleData?.fixedStartDate,
      campDates: wizardData.scheduleData?.campDates,
      campStartTime: wizardData.scheduleData?.campStartTime,
      campEndTime: wizardData.scheduleData?.campEndTime,
    };
  };

  // Render current step
  const renderStep = () => {
    if (showSuccess) {
      return (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-10 h-10 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Enrollment Created!
            </h2>
            <p className="text-muted-foreground">
              Redirecting...
            </p>
          </div>
        </div>
      );
    }

    switch (currentStep) {
      case 1:
        return (
          <Step1Student
            data={wizardData}
            onChange={handleDataChange}
            onValidChange={handleValidChange}
            courseId={wizardData.courseId}
          />
        );
      case 2:
        return (
          <Step2Course
            data={wizardData}
            onChange={handleDataChange}
            onValidChange={handleValidChange}
            studentId={prefillStudentId}
          />
        );
      case 3:
        return (
          <Step3ClassType
            data={wizardData}
            onChange={handleDataChange}
            onValidChange={handleValidChange}
            courseId={wizardData.courseId}
            onClassScheduleReady={handleClassScheduleReady}
          />
        );
      case 4:
        return (
          <Step4Teacher
            data={wizardData}
            onChange={handleDataChange}
            onValidChange={handleValidChange}
            courseId={wizardData.courseId || 0}
          />
        );
      case 5: {
        const classSchedule = buildClassSchedule();
        const teacherDataObj = buildTeacherData();
        const studentsArr = buildStudents();

        if (!classSchedule || !wizardData.courseId) {
          return (
            <div className="text-center py-8 text-muted-foreground">
              Missing required data. Please go back and complete previous
              steps.
            </div>
          );
        }

        return (
          <Step5Confirm
            courseId={wizardData.courseId}
            courseTitle={wizardData.courseTitle || ""}
            classSchedule={classSchedule}
            teacherData={teacherDataObj}
            students={studentsArr}
            mode={session ? "assign" : "create"}
            session={session}
            onSuccess={handleWizardSuccess}
          />
        );
      }
      default:
        return null;
    }
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-none p-0 flex flex-col"
      >
        <SheetTitle className="sr-only">
          {session ? "Assign Course" : "New Enrollment"}
        </SheetTitle>
        {/* Header */}
        {!showSuccess && (
          <div className="px-6 pt-6 pb-4 border-b flex-shrink-0">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold tracking-tight">
                {session ? "Assign Course" : "New Enrollment"}
              </h2>
              <span className="text-sm text-muted-foreground">
                Step {currentStepIndex + 1} of {totalSteps}
              </span>
            </div>
            <StepProgressBar
              currentStep={currentStepIndex + 1}
              totalSteps={totalSteps}
              stepLabels={stepLabels}
            />
          </div>
        )}

        {/* Scrollable Step Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {renderStep()}
        </div>

        {/* Footer */}
        {!showSuccess && (
          <div className="px-6 py-4 border-t flex-shrink-0 flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={isFirstStep}
            >
              &larr; Back
            </Button>
            <div className="flex items-center gap-2">
              {/* Only show Next for non-confirm steps; step 5 has its own submit */}
              {currentStep !== 5 && (
                <Button
                  onClick={handleNext}
                  disabled={!isCurrentStepValid}
                >
                  Next &rarr;
                </Button>
              )}
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
