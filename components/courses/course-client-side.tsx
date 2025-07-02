"use client";

// basic imports
import { useState } from "react";

// components import
import AddTeacher from "./add-teacher-dialog";
import AddStudent from "./add-student-dialog";
import ClassScheduleForm from "./class-schedule-dialog";
import ClassScheduleConfirm from "./class-schedule-confirm";
import { CourseCard } from "./course-card";

// type imports
import {
  ComfirmClassScheduleData,
  Course,
  Student,
  TeacherData,
} from "@/app/types/course.type";

function CourseClientSide({ courses }: { courses: Course[] }) {
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

  // dialog handler functions
  const handleStudentSubmit = (students: Student[]) => {
    setStudentsData(students);
    setOpen(false);
    setCourseTypeOpen(true);
  };

  const handleClassScheduleSubmit = (schedule: ComfirmClassScheduleData) => {
    setClassScheduleData(schedule);
    setCourseTypeOpen(false);
    setTeacherOpen(true);
  };

  const handleTeacherSubmit = (teacher: TeacherData) => {
    setTeacherData(teacher);
    setTeacherOpen(false);
    setConfirmOpen(true);
  };

  const handleConfirmCancel = () => {
    setConfirmOpen(false);
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

  const handleConfirmSubmit = () => {
    setConfirmOpen(false);
    setStudentsData([]);
    setClassScheduleData({
      classType: { id: -1, classLimit: 0, classMode: "", tuitionFee: 0 },
    });
    setTeacherData({ teacher: "", room: "", remark: "", teacherId: -1 });
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-4 gap-4 ">
        <AddStudent
          open={open}
          onOpenChange={setOpen}
          onSubmit={handleStudentSubmit}
        />
        <ClassScheduleForm
          open={courseTypeOpen}
          onOpenChange={setCourseTypeOpen}
          afterClassSchedule={handleClassScheduleSubmit}
        />
        <AddTeacher
          open={teacherOpen}
          onOpenChange={setTeacherOpen}
          afterTeacher={handleTeacherSubmit}
        />
        {courses.map((course: Course, index: number) => (
          <CourseCard
            open={open}
            onOpenChange={setOpen}
            key={index}
            course={course}
          />
        ))}
      </div>
      {confirmOpen && (
        <div className="hide-scrollbar-y fixed inset-0 z-10 overflow-y-scroll bg-white ">
          <div className="bg-white rounded-lg h-full ">
            <ClassScheduleConfirm
              students={studentsData}
              classSchedule={classScheduleData}
              teacherData={teacherData}
              onCancel={handleConfirmCancel}
              onConfirm={handleConfirmSubmit}
            />
          </div>
        </div>
      )}
    </>
  );
}

export default CourseClientSide;
