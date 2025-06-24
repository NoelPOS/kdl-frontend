import { StudentCourse } from "./student-course";
import StudentDetailRightClient from "./student-detail-right-client";
import { getStudentSession } from "@/lib/axio";
import { ComfirmStudent } from "@/app/types/course.type";
import StudentSessionSearch from "./search/student-session.search";

export default async function StudentDetailRight({
  student,
  query,
}: {
  student: ComfirmStudent;
  query: string;
}) {
  const sessions = await getStudentSession(Number(student.id));
  const filtered = query
    ? sessions.filter((s) =>
        s.courseTitle.toLowerCase().includes(query.toLowerCase())
      )
    : sessions;

  return (
    <>
      <div className="flex-1 p-6">
        <div className="flex justify-between items-center mb-6">
          <div></div>
          <div className="relative w-[400px]">
            <StudentSessionSearch />
          </div>
          <StudentDetailRightClient studentData={[student]} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {filtered.length > 0 ? (
            filtered.map((s) => <StudentCourse key={s.sessionId} course={s} />)
          ) : (
            <h1> This student has no session yet. </h1>
          )}
        </div>
      </div>

      {/* {showSchedule && <StudentSchedule />} */}
    </>
  );
}
