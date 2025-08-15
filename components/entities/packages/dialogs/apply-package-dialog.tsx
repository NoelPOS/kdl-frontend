"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Gift } from "lucide-react";
import { Package } from "@/app/types/package.type";
import { applyPackage } from "@/lib/axio";
import ClassScheduleConfirm from "@/components/entities/courses/schedule/class-schedule-confirm";

// Create simplified components for package application
import { PackageCourseSelection } from "../selection/package-course-selection";
import { PackageScheduleSelection } from "../selection/package-schedule-selection";
import { PackageTeacherSelection } from "../selection/package-teacher-selection";

// Import types from your existing flow
import {
  Student,
  Course,
  TeacherData,
  ComfirmClassScheduleData,
} from "@/app/types/course.type";

type DialogStep = "course" | "schedule" | "teacher" | "review" | "closed";

interface PackageScheduleData {
  classMode: string;
  dates: string[];
  startTime: string;
  endTime: string;
  days?: string[]; // For fixed schedules
}

interface ApplyPackageDialogProps {
  package: Package;
}

export function ApplyPackageDialog({ package: pkg }: ApplyPackageDialogProps) {
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<DialogStep>("closed");

  // State for collected data
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [scheduleData, setScheduleData] = useState<PackageScheduleData | null>(
    null
  );
  const [teacherData, setTeacherData] = useState<TeacherData | null>(null);

  // Student data based on package
  const studentData: Student[] = [
    {
      id: pkg.studentId.toString(),
      name: pkg.studentName,
      nickname: pkg.studentName,
    },
  ];

  // Start the application flow
  const startApplyFlow = () => {
    setCurrentStep("course");
    setOpen(true);
  };

  // Handle course selection
  const handleCourseSelected = (course: Course) => {
    setSelectedCourse(course);

    // Skip both schedule and teacher selection for "12 times check" packages
    if (pkg.classMode.includes("12 times check")) {
      // Create a default schedule data for 12 times check packages
      const defaultScheduleData: PackageScheduleData = {
        classMode: pkg.classMode,
        dates: [], // No specific dates needed for flexible packages
        startTime: "",
        endTime: "",
      };
      setScheduleData(defaultScheduleData);

      // Create a default teacher data for 12 times check packages
      const defaultTeacherData: TeacherData = {
        teacher: "TBD", // To Be Determined
        teacherId: -1,
        room: "TBD",
        remark:
          "Teacher and schedule will be arranged individually for each session",
      };
      setTeacherData(defaultTeacherData);

      // Go directly to review
      setCurrentStep("review");
    } else {
      setCurrentStep("schedule");
    }
  };

  // Handle schedule selection
  const handleScheduleSelected = (schedule: PackageScheduleData) => {
    setScheduleData(schedule);

    // For some package types, we might not need teacher selection
    if (shouldSkipTeacherSelection(pkg.classMode)) {
      setCurrentStep("review");
    } else {
      setCurrentStep("teacher");
    }
  };

  // Handle teacher selection
  const handleTeacherSelected = (teacher: TeacherData) => {
    setTeacherData(teacher);
    setCurrentStep("review");
  };

  // Helper function to determine if teacher selection should be skipped
  const shouldSkipTeacherSelection = (classMode: string) => {
    // You can customize this logic based on your class modes
    return classMode === "12 times checked"; // For example, flexible packages might not need teacher selection
  };

  // Convert package schedule data to class schedule format
  const convertToClassScheduleData = (
    schedule: PackageScheduleData,
    classMode: string
  ): ComfirmClassScheduleData => {
    // Use the class mode directly from the package
    const mockClassType = {
      id: 1,
      classLimit: pkg.classLimit,
      classMode: classMode,
      tuitionFee: pkg.tuitionFee,
    };

    // For "12 times check" packages, return a default flexible schedule
    if (classMode.includes("12 times check")) {
      return {
        classType: mockClassType,
        campDates: [], // Empty dates for flexible scheduling
        campStartTime: schedule.startTime || "",
        campEndTime: schedule.endTime || "",
      };
    }

    if (classMode.includes("fixed") && schedule.days) {
      // For fixed sessions, return the recurring schedule
      return {
        classType: mockClassType,
        fixedDays: schedule.days,
        fixedStartTime: schedule.startTime,
        fixedEndTime: schedule.endTime,
      };
    } else {
      // For camp/flexible, return specific dates
      return {
        classType: mockClassType,
        campDates: schedule.dates,
        campStartTime: schedule.startTime,
        campEndTime: schedule.endTime,
      };
    }
  };

  // Handle final confirmation
  const handleConfirmSubmit = async () => {
    try {
      if (!selectedCourse) {
        console.warn("No course selected for package application");
        alert("Error: No course selected. Please try again.");
        return;
      }

      // Since ClassScheduleConfirm will handle session and schedule creation,
      // we only need to apply the package (which updates status and stores course info)
      console.log("Applying package to course:", selectedCourse.title);
      const packageUpdated = await applyPackage(
        pkg.id,
        selectedCourse.id,
        selectedCourse.title
      );

      if (!packageUpdated) {
        console.warn("Failed to apply package");
        alert("Warning: Package may not have been applied properly.");
      }

      setOpen(false);
      resetAllData();
      alert(
        "Package applied successfully! Session created and package marked as used."
      );

      // Refresh the page to show updated package status
      if (typeof window !== "undefined") {
        window.location.reload();
      }
    } catch (error) {
      console.error("Error applying package:", error);
      alert("There was an error applying the package. Please try again.");
    }
  };

  // Handle cancellation
  const handleCancel = () => {
    setOpen(false);
    resetAllData();
  };

  // Reset all data
  const resetAllData = () => {
    setCurrentStep("closed");
    setSelectedCourse(null);
    setScheduleData(null);
    setTeacherData(null);
  };

  // Back navigation functions
  const goBackToCourse = () => setCurrentStep("course");
  const goBackToSchedule = () => setCurrentStep("schedule");
  const goBackToTeacher = () => {
    // If this is a "12 times check" package, go back to course (skip schedule)
    if (pkg.classMode.includes("12 times check")) {
      setCurrentStep("course");
    } else {
      setCurrentStep("schedule");
    }
  };

  return (
    <>
      <Button
        className="w-full bg-yellow-500 hover:bg-yellow-600 text-white"
        onClick={startApplyFlow}
      >
        <Gift className="h-4 w-4 mr-2" />
        Apply Package
      </Button>

      <Dialog open={open && currentStep !== "review"} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Apply Package: {pkg.classOptionTitle}</DialogTitle>
          </DialogHeader>

          {/* Package Info Bar */}
          <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200 mb-4">
            <div className="flex items-center justify-between text-sm">
              <div>
                <strong>Student:</strong> {pkg.studentName}
              </div>
            </div>
          </div>

          {/* Step Content */}
          {currentStep === "course" && (
            <PackageCourseSelection
              onCourseSelected={handleCourseSelected}
              onCancel={handleCancel}
            />
          )}

          {currentStep === "schedule" && selectedCourse && (
            <PackageScheduleSelection
              course={selectedCourse}
              classMode={pkg.classMode}
              onScheduleSelected={handleScheduleSelected}
              onBack={goBackToCourse}
              onCancel={handleCancel}
            />
          )}

          {currentStep === "teacher" && selectedCourse && (
            <PackageTeacherSelection
              course={selectedCourse}
              onTeacherSelected={handleTeacherSelected}
              onBack={goBackToTeacher}
              onCancel={handleCancel}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Full-screen Schedule Review */}
      {currentStep === "review" &&
        selectedCourse &&
        (scheduleData || pkg.classMode.includes("12 times check")) &&
        teacherData && (
          <div className="hide-scrollbar-y fixed inset-0 z-50 overflow-y-scroll bg-white">
            <div className="bg-white rounded-lg h-full">
              <ClassScheduleConfirm
                courseName={selectedCourse.title}
                course={{
                  id: selectedCourse.id,
                  title: selectedCourse.title,
                }}
                students={studentData}
                classSchedule={convertToClassScheduleData(
                  scheduleData!,
                  pkg.classMode
                )}
                teacherData={teacherData}
                isFromPackage={true}
                packageId={pkg.id}
                onCancel={() => {
                  // For "12 times check" packages, go back to course selection
                  if (pkg.classMode.includes("12 times check")) {
                    setCurrentStep("course");
                  } else {
                    setCurrentStep("teacher");
                  }
                }}
                onConfirm={handleConfirmSubmit}
                onBack={() => {
                  // For "12 times check" packages, go back to course selection
                  if (pkg.classMode.includes("12 times check")) {
                    setCurrentStep("course");
                  } else {
                    setCurrentStep("teacher");
                  }
                }}
              />
            </div>
          </div>
        )}
    </>
  );
}
