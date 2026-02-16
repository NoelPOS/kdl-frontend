"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SessionOverview } from "@/app/types/session.type";
import {
  ClassOption,
  ComfirmClassScheduleData,
  Student,
  TeacherData,
} from "@/app/types/course.type";

// Import existing dialog components
import ClassTypeSelectionDialog from "./class-type-selection-dialog";
import TeacherRoomSelectionDialog from "./teacher-room-selection-dialog";
import ScheduleConfirmationDialog from "./schedule-confirmation-dialog";

interface SwapScheduleFlowProps {
  session: SessionOverview;
  studentId: number;
  trigger: React.ReactNode;
  studentData?: Student;
}

export type SwapScheduleFlowData = {
  classType?: ClassOption;
  teacherData?: TeacherData;
  classSchedule?: ComfirmClassScheduleData;
};

export default function SwapScheduleFlow({
  session,
  studentId,
  trigger,
  studentData,
}: SwapScheduleFlowProps) {
  const router = useRouter();

  // Flow state
  const [currentStep, setCurrentStep] = useState<
    "classType" | "teacher" | "confirm" | "closed"
  >("closed");
  const [flowData, setFlowData] = useState<SwapScheduleFlowData>({});

  const finalStudentData: Student = studentData || {
    id: studentId.toString(),
    name: "Student",
    nickname: "Student",
  };

  const courseStub = {
    id: session.courseId || 0, // We might need this from session
    title: session.courseTitle || "",
  };

  const handleStart = () => {
    setCurrentStep("classType");
    setFlowData({});
  };

  const handleClassTypeSelected = (classSchedule: ComfirmClassScheduleData) => {
    setFlowData((prev) => ({
      ...prev,
      classType: classSchedule.classType,
      classSchedule,
    }));

    if (classSchedule.classType.id === 2 || classSchedule.classType.id === 11) {
      // If class type is 12 times check or 1 times check, go directly to confirm step
      // Also maybe we need to set a default teacher data?
      // For check slot, teacher is usually TBD or selected later per slot.
      // We'll pass empty teacher data or let confirm dialog handle it.
       setFlowData((prev) => ({
        ...prev,
        teacherData: { 
          teacherId: -1, 
          room: "TBD",
          teacher: "TBD",
          remark: "" 
        }, // Default for check slot
      }));
      setCurrentStep("confirm");
    } else {
      setCurrentStep("teacher");
    }
  };

  const handleTeacherRoomSelected = (teacherData: TeacherData) => {
    setFlowData((prev) => ({ ...prev, teacherData }));
    setCurrentStep("confirm");
  };

  const handleConfirmSchedule = async () => {
    try {
      setCurrentStep("closed");
      router.refresh();
    } catch (error) {
      console.error("Error in swap schedule flow:", error);
    }
  };

  const handleCancel = () => {
    setCurrentStep("closed");
    setFlowData({});
  };

  const handleBack = () => {
    switch (currentStep) {
      case "teacher":
        setCurrentStep("classType");
        break;
      case "confirm":
        // If we skipped teacher step (check slot), go back to classType
        if (flowData.classType?.id === 2 || flowData.classType?.id === 11) {
          setCurrentStep("classType");
        } else {
          setCurrentStep("teacher");
        }
        break;
      default:
        handleCancel();
    }
  };

  return (
    <>
      <div onClick={handleStart}>{trigger}</div>

      {/* Step 1: Class Type Selection */}
      <ClassTypeSelectionDialog
        open={currentStep === "classType"}
        courseId={session.courseId} // Pass courseId from session
        onClassTypeSelected={handleClassTypeSelected}
        onBack={handleCancel}
        mode="assign" // Reuse assign mode UI if needed
      />

      {/* Step 2: Teacher & Room Selection (Only for Fixed/Camp) */}
      <TeacherRoomSelectionDialog
        open={currentStep === "teacher"}
        courseId={session.courseId || 0}
        onTeacherRoomSelected={handleTeacherRoomSelected}
        onBack={handleBack}
        onCancel={handleCancel}
      />

      {/* Step 3: Schedule Confirmation */}
      {currentStep === "confirm" && (
        <div className="hide-scrollbar-y fixed inset-0 z-10 overflow-y-scroll bg-white">
          <div className="bg-white rounded-lg h-full">
            <ScheduleConfirmationDialog
              session={session}
              course={courseStub}
              classSchedule={flowData.classSchedule}
              teacherData={flowData.teacherData}
              students={[finalStudentData]}
              onConfirm={handleConfirmSchedule}
              onBack={handleBack}
              onCancel={handleCancel}
              mode="swap"
            />
          </div>
        </div>
      )}
    </>
  );
}
