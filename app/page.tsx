import { ContactCard } from "@/components/today-student";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { students, classSessions, scheduleBlocks, timeSlots } from "@/lib/data";

export default function TodayPage() {
  return (
    <div className="p-6 ">
      <div className="h-[5rem]">
        {/* <h1 className="text-2xl font-semibold text-gray-900 mb-4">
          Today's Schedule
        </h1>
        <p className="text-gray-600 mb-6">
          View the schedule for today, including classes and student contacts.
        </p> */}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Page Header */}

        {/* Schedule Grid */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg border p-4 mb-6">
            <div className="grid grid-cols-7 gap-2 mb-4">
              {timeSlots.map((time) => (
                <div
                  key={time}
                  className=" text-sm font-medium text-gray-600 p-2"
                >
                  {time}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2 h-20">
              {scheduleBlocks.map((block) => {
                const startIndex = timeSlots.indexOf(block.startTime);
                const endIndex = timeSlots.indexOf(block.endTime);
                const span = endIndex - startIndex;
                console.log("span", span);

                return (
                  <div
                    key={block.id}
                    className={`
                      ${
                        block.color === "blue" ? "bg-cyan-400" : "bg-orange-400"
                      }
                      text-white rounded p-2 flex items-center justify-center font-medium
                    `}
                    style={{
                      gridColumn: `${startIndex + 1} / span ${span}`,
                    }}
                  >
                    {block.title}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Schedule Table */}
          <div className="bg-white rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="border">Time</TableHead>
                  <TableHead className="border">Student</TableHead>
                  <TableHead className="border">Teacher</TableHead>
                  <TableHead className="border">Course</TableHead>
                  <TableHead className="border">Class</TableHead>
                  <TableHead className="border">Room</TableHead>
                  <TableHead className="border">Remark</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classSessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell className="border h-15">
                      {session.time}
                    </TableCell>
                    <TableCell className="border h-15">
                      {session.student.fullName}
                    </TableCell>
                    <TableCell className="border h-15">
                      {session.teacher.fullName}
                    </TableCell>
                    <TableCell className="border h-15">
                      {session.course.name}
                    </TableCell>
                    <TableCell className="border h-15">
                      {session.class}
                    </TableCell>
                    <TableCell className="border h-15">
                      {session.room}
                    </TableCell>
                    <TableCell className="border h-15">
                      {session.remark || ""}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Contact Cards */}
        <div className="space-y-3">
          {students.map((student) => (
            <ContactCard key={student.id} student={student} showBadge />
          ))}
        </div>
      </div>
    </div>
  );
}
