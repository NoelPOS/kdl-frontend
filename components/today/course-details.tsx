import React from "react";
import { Course } from "@/app/types/today.type";
import StudentSchedule from "../students/student-schedule";

interface CourseDetailsProps {
  selectedCourse: Course | null;
}

const CourseDetails: React.FC<CourseDetailsProps> = ({ selectedCourse }) => {
  if (!selectedCourse) return null;

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex flex-col text-sm">
          <div>
            <span className="font-medium">Class:</span>{" "}
            {selectedCourse.title.split(" (")[0]}
          </div>
          <div>
            <span className="font-medium">Time:</span> {selectedCourse.fullTime}
          </div>
          <div>
            <span className="font-medium">Teacher:</span>{" "}
            {selectedCourse.teacher}
          </div>
          <div>
            <span className="font-medium">Room:</span> {selectedCourse.room}
          </div>
        </div>
      </div>

      <StudentSchedule initialSchedules={selectedCourse.students} />
    </div>
  );
};

export default CourseDetails;
