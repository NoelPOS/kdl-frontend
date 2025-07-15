"use client";
import React, { useState } from "react";

import StudentDetailAddCourse from "./student-detail-add-course";
import AddTeacher from "../courses/add-teacher-dialog";
import ClassScheduleForm from "../courses/class-schedule-dialog";
import ClassScheduleConfirm from "../courses/class-schedule-confirm";
import {
  ComfirmClassScheduleData,
  ComfirmStudent,
  Course,
  TeacherData,
} from "@/app/types/course.type";

function StudentDetailRightClient({
  studentData,
}: {
  studentData: ComfirmStudent[];
}) {
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

  const handleCourseSubmit = (course: { id: number; title: string }) => {
    setCourseData(course);
    setCourseOpen(false);
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
    setCourseData({
      id: -1,
      title: "",
    });
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
    // console.log("Final submission:", {
    //   students: courseData,
    //   schedule: classScheduleData,
    //   teacher: teacherData,
    // });
    setConfirmOpen(false);
    // Reset all data
    setCourseData({
      id: -1,
      title: "",
    });
    setClassScheduleData({
      classType: {
        id: -1,
        classLimit: 0,
        classMode: "",
        tuitionFee: 0,
      },
    });
    setTeacherData({ teacher: "", room: "", remark: "", teacherId: -1 });
    alert("Class schedule confirmed successfully!");
  };
  return (
    <>
      <StudentDetailAddCourse
        open={courseOpen}
        onOpenChange={setCourseOpen}
        onSubmit={handleCourseSubmit}
      />
      <AddTeacher
        courseId={courseData.id}
        open={teacherOpen}
        onOpenChange={setTeacherOpen}
        afterTeacher={handleTeacherSubmit}
      />
      <ClassScheduleForm
        open={courseTypeOpen}
        onOpenChange={setCourseTypeOpen}
        afterClassSchedule={handleClassScheduleSubmit}
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
            />
          </div>
        </div>
      )}
    </>
  );
}

export default StudentDetailRightClient;
