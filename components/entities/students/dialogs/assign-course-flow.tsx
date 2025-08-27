"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SessionOverview } from "@/app/types/session.type";
import {
  Course,
  ClassOption,
  ComfirmClassScheduleData,
  Student,
  TeacherData,
} from "@/app/types/course.type";

// Import existing dialog components (we'll modify them)
import CourseSelectionDialog from "./course-selection-dialog";
import ClassTypeSelectionDialog from "./class-type-selection-dialog";
import TeacherRoomSelectionDialog from "./teacher-room-selection-dialog";
import ScheduleConfirmationDialog from "./schedule-confirmation-dialog";

interface AssignCourseFlowProps {
  session: SessionOverview;
  studentId: number;
  trigger: React.ReactNode;
  studentData?: Student; // Add optional student data prop
}

export type AssignCourseFlowData = {
  course?: Course;
  classType?: ClassOption;
  teacherData?: TeacherData;
  classSchedule?: ComfirmClassScheduleData;
};

export default function AssignCourseFlow({
  session,
  studentId,
  trigger,
  studentData,
}: AssignCourseFlowProps) {
  const router = useRouter();

  // Flow state
  const [currentStep, setCurrentStep] = useState<
    "course" | "classType" | "teacher" | "confirm" | "closed"
  >("closed");
  const [flowData, setFlowData] = useState<AssignCourseFlowData>({});

  // Use provided student data or fallback to default
  const finalStudentData: Student = studentData || {
    id: studentId.toString(),
    name: "Student",
    nickname: "Student",
  };

  const handleStart = () => {
    setCurrentStep("course");
    setFlowData({});
  };

  const handleCourseSelected = (course: Pick<Course, "id" | "title">) => {
    setFlowData((prev) => ({
      ...prev,
      course: course as Course, // Type assertion since we only need id and title for this flow
    }));
    setCurrentStep("classType");
  };

  const handleClassTypeSelected = (classSchedule: ComfirmClassScheduleData) => {
    setFlowData((prev) => ({
      ...prev,
      classType: classSchedule.classType,
      classSchedule,
    }));
    setCurrentStep("teacher");
  };

  const handleTeacherRoomSelected = (teacherData: TeacherData) => {
    setFlowData((prev) => ({ ...prev, teacherData }));
    setCurrentStep("confirm");
  };

  const handleConfirmSchedule = async () => {
    try {
      console.log("=== Updating TBC Session and Creating Schedules ===");
      console.log("Session ID:", session.sessionId);
      console.log("Flow Data:", flowData);

      // This will be handled in the schedule confirmation dialog
      // After successful update, close the flow
      setCurrentStep("closed");
      router.refresh();
    } catch (error) {
      console.error("Error in assign course flow:", error);
    }
  };

  const handleCancel = () => {
    setCurrentStep("closed");
    setFlowData({});
  };

  const handleBack = () => {
    switch (currentStep) {
      case "classType":
        setCurrentStep("course");
        break;
      case "teacher":
        setCurrentStep("classType");
        break;
      case "confirm":
        setCurrentStep("teacher");
        break;
      default:
        handleCancel();
    }
  };

  return (
    <>
      <div onClick={handleStart}>{trigger}</div>

      {/* Step 1: Course Selection */}
      <CourseSelectionDialog
        open={currentStep === "course"}
        onCourseSelected={handleCourseSelected}
        onCancel={handleCancel}
        studentId={studentId}
      />

      {/* Step 2: Class Type Selection */}
      <ClassTypeSelectionDialog
        open={currentStep === "classType"}
        courseId={flowData.course?.id}
        onClassTypeSelected={handleClassTypeSelected}
        onBack={handleBack}
      />

      {/* Step 3: Teacher & Room Selection */}
      <TeacherRoomSelectionDialog
        open={currentStep === "teacher"}
        courseId={flowData.course?.id || 0}
        onTeacherRoomSelected={handleTeacherRoomSelected}
        onBack={handleBack}
        onCancel={handleCancel}
      />

      {/* Step 4: Schedule Confirmation */}
      {currentStep === "confirm" && (
        <div className="hide-scrollbar-y fixed inset-0 z-10 overflow-y-scroll bg-white">
          <div className="bg-white rounded-lg h-full">
            <ScheduleConfirmationDialog
              session={session}
              course={flowData.course}
              classSchedule={flowData.classSchedule}
              teacherData={flowData.teacherData}
              students={[finalStudentData]}
              onConfirm={handleConfirmSchedule}
              onBack={handleBack}
              onCancel={handleCancel}
              mode="assign" // This tells it to update session instead of create
            />
          </div>
        </div>
      )}
    </>
  );
}
