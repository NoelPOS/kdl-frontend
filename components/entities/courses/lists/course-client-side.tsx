"use client";

// basic imports
import { useState } from "react";

// components import
import TeacherRoomSelectionDialog from "@/components/entities/students/dialogs/teacher-room-selection-dialog";
import AddStudent from "../dialogs/add-student-dialog";
import ClassTypeSelectionDialog from "@/components/entities/students/dialogs/class-type-selection-dialog";
import ScheduleConfirmationDialog from "@/components/entities/students/dialogs/schedule-confirmation-dialog";
import { CourseCard } from "../cards/course-card";
import { Pagination } from "@/components/ui/pagination";

// type imports
import {
  ComfirmClassScheduleData,
  Course,
  Student,
  TeacherData,
} from "@/app/types/course.type";

type DialogStep = "students" | "schedule" | "teacher" | "confirm" | "closed";

interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNext: boolean;
  hasPrev: boolean;
}

function CourseClientSide({
  courses,
  pagination,
}: {
  courses: Course[];
  pagination: PaginationData;
}) {
  // Navigation state
  const [currentStep, setCurrentStep] = useState<DialogStep>("closed");

  // states to control dialogs
  const [open, setOpen] = useState(false);
  const [courseTypeOpen, setCourseTypeOpen] = useState(false);
  const [teacherOpen, setTeacherOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // State for collected data from dialogs
  const [studentsData, setStudentsData] = useState<Student[]>([]);
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
  const [courseId, setCourseId] = useState<number>(-1);
  const [courseName, setCourseName] = useState<string>("");

  // Navigation functions
  const openStudentDialog = (courseId: number) => {
    setCourseId(courseId);
    setCurrentStep("students");
    setOpen(true);
  };

  const goToScheduleStep = () => {
    setCurrentStep("schedule");
    setOpen(false);
    setCourseTypeOpen(true);
  };

  const goToTeacherStep = () => {
    setCurrentStep("teacher");
    setCourseTypeOpen(false);
    setTeacherOpen(true);
  };

  const goToConfirmStep = () => {
    setCurrentStep("confirm");
    setTeacherOpen(false);
    setConfirmOpen(true);
  };

  const goBackToStudents = () => {
    setCurrentStep("students");
    setCourseTypeOpen(false);
    setOpen(true);
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
  const handleStudentSubmit = (students: Student[]) => {
    setStudentsData(students);
    goToScheduleStep();
  };

  const handleClassScheduleSubmit = (schedule: ComfirmClassScheduleData) => {
    console.log("Class Schedule Data:", schedule);
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
    setStudentsData([]);
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
    setOpen(false);
    setCourseTypeOpen(false);
    setTeacherOpen(false);
    setConfirmOpen(false);
    resetAllData();
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-4 gap-4 ">
        <AddStudent
          open={open}
          onOpenChange={setOpen}
          onSubmit={handleStudentSubmit}
          onCancel={handleDialogClose}
          courseId={courseId}
        />
        <ClassTypeSelectionDialog
          open={courseTypeOpen}
          courseId={courseId}
          onClassTypeSelected={handleClassScheduleSubmit}
          onBack={goBackToStudents}
          mode="create"
        />
        <TeacherRoomSelectionDialog
          courseId={courseId}
          open={teacherOpen}
          onTeacherRoomSelected={handleTeacherSubmit}
          onBack={goBackToSchedule}
          onCancel={handleDialogClose}
          mode="create"
        />
        {courses.length > 0 &&
          courses.map((course: Course, index: number) => (
            <CourseCard
              open={open}
              onOpenChange={setOpen}
              key={index}
              course={course}
              setCourseId={setCourseId}
              setCourseName={setCourseName}
              onOpenDialog={openStudentDialog}
            />
          ))}
      </div>

      {courses.length > 0 && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalCount={pagination.totalCount}
          hasNext={pagination.hasNext}
          hasPrev={pagination.hasPrev}
          itemsPerPage={10}
          itemName="courses"
        />
      )}

      {confirmOpen && (
        <div className="hide-scrollbar-y fixed inset-0 z-10 overflow-y-scroll bg-white ">
          <div className="bg-white rounded-lg h-full ">
            <ScheduleConfirmationDialog
              course={{
                id: courseId,
                title: courseName,
              }}
              students={studentsData}
              classSchedule={classScheduleData}
              teacherData={teacherData}
              onCancel={handleConfirmCancel}
              onConfirm={handleConfirmSubmit}
              onBack={goBackToTeacher}
              mode="create"
            />
          </div>
        </div>
      )}
    </>
  );
}

export default CourseClientSide;
