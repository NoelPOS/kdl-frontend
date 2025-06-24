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

      <div className="bg-white rounded-lg border">
        {/* <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="border text-center">
                Profile picture
              </TableHead>
              <TableHead className="border text-center">Student ID</TableHead>
              <TableHead className="border text-center">Name</TableHead>
              <TableHead className="border text-center">Nickname</TableHead>
              <TableHead className="border text-center">Class no</TableHead>
              <TableHead className="border text-center">Attendance</TableHead>
              <TableHead className="border text-center">Remark</TableHead>
              <TableHead className="border text-center">Warning</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {selectedCourse.students.map((student) => (
              <TableRow key={student.id}>
                <TableCell className="text-center">
                  <Avatar className="h-10 w-10 mx-auto">
                    <AvatarImage
                      src={student.profilePicture}
                      alt={student.name}
                    />
                    <AvatarFallback>
                      {student.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                </TableCell>
                <TableCell className="border text-center">
                  {student.id}
                </TableCell>
                <TableCell className="border text-center">
                  {student.name}
                </TableCell>
                <TableCell className="border text-center">
                  {student.nickname}
                </TableCell>
                <TableCell className="border text-center">
                  {student.classNo}
                </TableCell>
                <TableCell className="border text-center">
                  {student.attendance}
                </TableCell>
                <TableCell className="border text-center">
                  {student.remark}
                </TableCell>
                <TableCell className="border text-center">
                  {student.warning}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table> */}
        <StudentSchedule initialSchedules={selectedCourse.students} />
      </div>
    </div>
  );
};

export default CourseDetails;
