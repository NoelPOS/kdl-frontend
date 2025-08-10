"use client";
import React, { useState } from "react";

import StudentDetailAddCourse from "./student-detail-add-course";
import AddTeacher from "../courses/add-teacher-dialog";
import ClassScheduleDialog from "../courses/class-schedule-dialog";
import ClassScheduleConfirm from "../courses/class-schedule-confirm";
import {
  ComfirmClassScheduleData,
  Student,
  Course,
  TeacherData,
} from "@/app/types/course.type";

type DialogStep = "course" | "schedule" | "teacher" | "confirm" | "closed";

function StudentDetailRightClient({ studentData }: { studentData: Student[] }) {
  // Navigation state
  const [currentStep, setCurrentStep] = useState<DialogStep>("closed");

  // states to control dialogs
  const [courseOpen, setCourseOpen] = useState(false);
  const [courseTypeOpen, setCourseTypeOpen] = useState(false);
  const [teacherOpen, setTeacherOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // State for collected data
  const [courseData, setCourseData] = useState<Pick<Course, "id" | "title">>({
    id: -1,
    title: "",
  });
  const [classScheduleData, setClassScheduleData] =
    useState<ComfirmClassScheduleData>({
      classType: {
        id: -1,
        classLimit: 0,
        classMode: "",
        tuitionFee: 0,
      },
    });
  const [teacherData, setTeacherData] = useState<TeacherData>({
    teacher: "",
    room: "",
    remark: "",
    teacherId: -1,
  });

  // Navigation functions
  const gotoCourseStep = () => {
    setCurrentStep("course");
    setCourseOpen(true);
  };

  const goToScheduleStep = () => {
    setCurrentStep("schedule");
    setCourseOpen(false);
    setCourseTypeOpen(true);
  };

  const goToTeacherStep = () => {
    // Validate that schedule is configured
    if (classScheduleData.classType.id === -1) {
      alert("Please configure the class schedule first!");
      return;
    }

    setCurrentStep("teacher");
    setCourseTypeOpen(false);
    setTeacherOpen(true);
  };

  const goToConfirmStep = () => {
    // For class types other than 2, validate that teacher is selected
    if (classScheduleData.classType.id !== 2 && teacherData.teacherId === -1) {
      alert("Please select a teacher first!");
      return;
    }

    setCurrentStep("confirm");
    setTeacherOpen(false);
    setConfirmOpen(true);
  };

  const goBackToCourse = () => {
    setCurrentStep("course");
    setCourseTypeOpen(false);
    setCourseOpen(true);
  };

  const goBackToSchedule = () => {
    setCurrentStep("schedule");
    setTeacherOpen(false);
    setCourseTypeOpen(true);
  };

  const goBackToTeacher = () => {
    setCurrentStep("teacher");
    setConfirmOpen(false);
    setTeacherOpen(true);
  };

  // dialog handler functions
  const handleCourseSubmit = (course: { id: number; title: string }) => {
    // console.log("Selected Course: ", course);
    // Validate that course is selected
    if (course.id === -1 || !course.title || course.title.trim() === "") {
      alert("Please select a course first!");
      return;
    }
    setCourseData(course);
    goToScheduleStep();
  };

  const handleClassScheduleSubmit = (schedule: ComfirmClassScheduleData) => {
    setClassScheduleData(schedule);
    if (schedule.classType.id === 2) {
      // If class type is 12 times check, go directly to confirm step
      setCurrentStep("confirm");
      setCourseTypeOpen(false);
      setConfirmOpen(true);
    } else {
      goToTeacherStep();
    }
  };

  const handleTeacherSubmit = (teacher: TeacherData) => {
    setTeacherData(teacher);
    goToConfirmStep();
  };

  const handleConfirmCancel = () => {
    setCurrentStep("closed");
    setConfirmOpen(false);
    resetAllData();
  };

  const handleConfirmSubmit = () => {
    setCurrentStep("closed");
    setConfirmOpen(false);
    resetAllData();
  };

  const resetAllData = () => {
    setCourseData({ id: -1, title: "" });
    setClassScheduleData({
      classType: {
        id: -1,
        classLimit: 0,
        classMode: "",
        tuitionFee: 0,
      },
    });
    setTeacherData({ teacher: "", room: "", remark: "", teacherId: -1 });
  };

  const handleDialogClose = () => {
    setCurrentStep("closed");
    setCourseOpen(false);
    setCourseTypeOpen(false);
    setTeacherOpen(false);
    setConfirmOpen(false);
    resetAllData();
  };
  return (
    <>
      <StudentDetailAddCourse
        open={courseOpen}
        onOpenChange={gotoCourseStep}
        onSubmit={handleCourseSubmit}
        onCancel={handleDialogClose}
        courseData={courseData}
      />
      <ClassScheduleDialog
        open={courseTypeOpen}
        afterClassSchedule={handleClassScheduleSubmit}
        onBack={goBackToCourse}
      />
      <AddTeacher
        courseId={courseData.id}
        open={teacherOpen}
        onOpenChange={(open) => {
          // Only allow closing, prevent manual opening
          if (!open) {
            setTeacherOpen(false);
          }
        }}
        afterTeacher={handleTeacherSubmit}
        onBack={goBackToSchedule}
        onCancel={handleDialogClose}
      />

      {confirmOpen && (
        <div className="hide-scrollbar-y fixed inset-0 z-10 overflow-y-scroll bg-white ">
          <div className="bg-white rounded-lg h-full ">
            <ClassScheduleConfirm
              course={courseData}
              courseName={courseData.title}
              students={studentData}
              classSchedule={classScheduleData}
              teacherData={teacherData}
              onCancel={handleConfirmCancel}
              onConfirm={handleConfirmSubmit}
              onBack={goBackToTeacher}
            />
          </div>
        </div>
      )}
    </>
  );
}

export default StudentDetailRightClient;
