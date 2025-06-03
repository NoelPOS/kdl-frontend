"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { classSessions } from "@/lib/data";
import { useState } from "react";
import AddSchedule from "@/components/add-schedule/add-schedule-dialog";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ClassSession } from "@/lib/types";

// type ClassSessionParameter = {
//   id: string;
//   date: string;
//   time: string;
//   course: { name: string };
//   teacher: { fullName: string };
//   student: { fullName: string; id: string };
//   room: string;
//   nickname: string;
//   class: string;
//   remark?: string;
//   status?: string;
// };

export type selectedSessionType = {
  date: string;
  time: string;
  course: string;
  teacher: string;
  student: string;
  room: string;
  nickname: string;
  class: string;
  studentId: string;
  remark?: string;
  status?: string;
};

export default function ClassSchedulePage() {
  const [open, setOpen] = useState(false);
  const [selectedSession, setSelectedSession] =
    useState<selectedSessionType | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const handleRowDoubleClick = (session: ClassSession) => {
    console.log("Row double clicked:", session);
    const teacherName = session.teacher?.fullName || "";
    const studentName = session.student?.fullName || "";
    const courseName = session.course?.name || "";

    // console.log all the session details types
    console.log("Detail of type of session date:", typeof session.date);
    console.log("Detail of type of session time:", typeof session.time);
    console.log("Detail of type of session course:", typeof courseName);
    console.log("Detail of type of session teacher:", typeof teacherName);
    console.log("Detail of type of session student:", typeof studentName);
    console.log("Detail of type of session room:", typeof session.room);
    console.log("Detail of type of session nickname:", typeof session.nickname);
    console.log("Detail of type of session class:", typeof session.class);
    console.log(
      "Detail of type of session studentId:",
      typeof session.student?.id
    );
    console.log("Detail of type of session remark:", typeof session.remark);
    console.log("Detail of type of session status:", typeof session.status);

    setSelectedSession({
      date: session.date,
      time: session.time,
      course: courseName,
      teacher: teacherName,
      student: studentName,
      room: session.room,
      nickname: session.nickname,
      class: session.class,
      studentId: session.student?.id,
      remark: session.remark,
      status: session.status,
    });
    setIsEditMode(true);
    setOpen(true);
  };

  const handleNewClick = () => {
    setIsEditMode(false);
    setOpen(true);
  };

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
          <AddSchedule
            open={open}
            onOpenChange={setOpen}
            initialData={selectedSession || undefined}
            isEditMode={isEditMode}
            handleNewClick={handleNewClick}
          />
        </div>
      </div>

      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="border h-20 text-center">Date</TableHead>
              <TableHead className="border h-20 text-center">Time</TableHead>
              <TableHead className="border h-20 text-center">Student</TableHead>
              <TableHead className="border h-20 text-center">Teacher</TableHead>
              <TableHead className="border h-20 text-center">Course</TableHead>
              <TableHead className="border h-20 text-center">Class</TableHead>
              <TableHead className="border h-20 text-center">Room</TableHead>
              <TableHead className="border h-20 text-center">Status</TableHead>
              <TableHead>Remark</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {classSessions.map((session) => (
              <TableRow
                key={session.id}
                onDoubleClick={() => handleRowDoubleClick(session)}
              >
                <TableCell className="border h-20 text-center">
                  {session.date}
                </TableCell>
                <TableCell className="border h-20 text-center">
                  {session.time}
                </TableCell>
                <TableCell className="border h-20 text-center">
                  {session.student.fullName}
                </TableCell>
                <TableCell className="border h-20 text-center">
                  {session.teacher.fullName}
                </TableCell>
                <TableCell className="border h-20 text-center">
                  {session.course.name}
                </TableCell>
                <TableCell className="border h-20 text-center">
                  {session.class}
                </TableCell>
                <TableCell className="border h-20 text-center">
                  {session.room}
                </TableCell>
                <TableCell className="border h-20 text-center">
                  {session.status && (
                    <Badge
                      className={
                        session.status === "Completed"
                          ? "bg-green-100 text-green-800"
                          : session.status === "Cancelled"
                          ? "bg-red-100 text-red-800"
                          : "bg-blue-100 text-white-800"
                      }
                    >
                      {session.status}
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="border h-20 text-center">
                  {session.remark || ""}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
