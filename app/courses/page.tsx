"use client";
import AddCourse from "@/components/add-course/add-course-dialog";
import AddStudent from "@/components/add-student/add-student-dialog";
import AddTeacher from "@/components/add-teacher/add-teacher-dialog";
import ClassScheduleForm from "@/components/create-class-schedule/class-schedule-dialog";
import { CourseCard } from "@/components/course-card";
import { Input } from "@/components/ui/input";
import { courses } from "@/lib/data";
import { Search } from "lucide-react";
import { useState } from "react";
import ClassScheduleConfirm from "@/components/class-schedule-confirm/class-schedule-confirm";
import { ComfirmClassScheduleData } from "@/lib/types";

// Types for the collected data
type Student = {
  studentName: string;
  nickname: string;
  id: string;
};

// type ClassSession = {
//   date: string;
//   startTime: string;
//   endTime: string;
// };

// type ClassScheduleData = {
//   classType: "12-times-check" | "12-times-fixed" | "camp-class" | "";
//   checkStartTime?: string;
//   checkEndTime?: string;
//   fixedSessions?: ClassSession[];
//   campSessions?: ClassSession[];
// };

type TeacherData = {
  teacher: string;
  room: string;
  remark: string;
};

export default function CoursesPage() {
  const [open, setOpen] = useState(false);
  const [courseOpen, setCourseOpen] = useState(false);
  const [courseTypeOpen, setCourseTypeOpen] = useState(false);
  const [teacherOpen, setTeacherOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // State for collected data
  const [studentsData, setStudentsData] = useState<Student[]>([]);
  const [classScheduleData, setClassScheduleData] =
    useState<ComfirmClassScheduleData>({
      classType: "",
    });
  const [teacherData, setTeacherData] = useState<TeacherData>({
    teacher: "",
    room: "",
    remark: "",
  });

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
    // Reset all data
    setStudentsData([]);
    setClassScheduleData({ classType: "" });
    setTeacherData({ teacher: "", room: "", remark: "" });
  };

  const handleConfirmSubmit = () => {
    console.log("Final submission:", {
      students: studentsData,
      schedule: classScheduleData,
      teacher: teacherData,
    });
    setConfirmOpen(false);
    // Reset all data
    setStudentsData([]);
    setClassScheduleData({ classType: "" });
    setTeacherData({ teacher: "", room: "", remark: "" });
    alert("Class schedule confirmed successfully!");
  };

  return (
    <div className="p-6  ">
      <div className="flex items-center justify-center mb-6 ">
        <div className="flex items-center justify-around w-full gap-4">
          <div className="flex-1/4"></div>

          <div className="relative flex-2/4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black h-4 w-4" />
            <Input
              placeholder="Search ..."
              className="pl-10 w-[20rem] rounded-full border-black"
            />
          </div>
          <AddCourse open={courseOpen} onOpenChange={setCourseOpen} />
          <AddTeacher
            open={teacherOpen}
            onOpenChange={setTeacherOpen}
            afterTeacher={handleTeacherSubmit}
          />
          <ClassScheduleForm
            open={courseTypeOpen}
            onOpenChange={setCourseTypeOpen}
            afterClassSchedule={handleClassScheduleSubmit}
          />
          <AddStudent
            open={open}
            onOpenChange={setOpen}
            onSubmit={handleStudentSubmit}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ">
        {courses.map((course, index) => (
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
    </div>
  );
}
