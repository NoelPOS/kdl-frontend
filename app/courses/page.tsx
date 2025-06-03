"use client";
import AddCourse from "@/components/add-course/add-course-dialog";
import AddStudent from "@/components/add-student/add-student-dialog";
import ClassScheduleForm from "@/components/class-schedule/class-schedule-dialog";
import { CourseCard } from "@/components/course-card";
import { Input } from "@/components/ui/input";
import { courses } from "@/lib/data";
import { Search } from "lucide-react";
import { useState } from "react";

export default function CoursesPage() {
  const [open, setOpen] = useState(false);
  const [courseOpen, setCourseOpen] = useState(false);
  const [courseTypeOpen, setCourseTypeOpen] = useState(false);
  // const [teacherOpen, setTeacherOpen] = useState(false);
  return (
    <div className="p-6">
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
          <ClassScheduleForm
            open={courseTypeOpen}
            onOpenChange={setCourseTypeOpen}
          />
          <AddStudent
            open={open}
            onOpenChange={setOpen}
            afterStudent={setCourseTypeOpen}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {courses.map((course, index) => (
          <CourseCard
            open={open}
            onOpenChange={setOpen}
            key={index}
            course={course}
          />
        ))}
      </div>
    </div>
  );
}
