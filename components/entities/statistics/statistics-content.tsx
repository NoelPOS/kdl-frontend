import { fetchDashboardOverview } from "@/lib/api";
import { cookies } from "next/headers";
import { Users, GraduationCap, BookOpen, CalendarClock, ClipboardList } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface StatisticsContentProps {
  startDate?: string;
  endDate?: string;
  teacherId?: number;
  countBy?: 'timeslot' | 'enrollment';
  attendance?: string;
}

export default async function StatisticsContent({ startDate, endDate, teacherId, countBy, attendance }: StatisticsContentProps) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  const filter = { startDate, endDate, teacherId, countBy, attendance };
  
  let data = null;
  let error = null;

  try {
    const result = await fetchDashboardOverview(accessToken, filter);
    data = result.data;
  } catch (err) {
    console.error("Failed to fetch analytics data:", err);
    error = "Failed to load analytics data. Please try again later.";
  }

  if (error) {
    return (
      <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <h3 className="text-red-800 font-medium mb-2">Unable to Load Analytics</h3>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="mt-6 bg-white border border-gray-200 rounded-lg p-12 text-center">
        <p className="text-gray-500">No analytics data available.</p>
      </div>
    );
  }

  const isTeacherView = countBy === 'timeslot';
  const hasData = data.activeStudentCount !== undefined ||
    data.timeslotCount !== undefined ||
    data.scheduleCount !== undefined ||
    (data.courseTypeCounts && data.courseTypeCounts.length > 0);

  if (!hasData) {
    return (
      <div className="mt-6 bg-white border border-gray-200 rounded-lg p-12 text-center">
        <p className="text-gray-500">No data found for the selected filters.</p>
      </div>
    );
  }

  const mainCount = isTeacherView ? data.timeslotCount : data.scheduleCount;
  const mainLabel = isTeacherView ? "Timeslots" : "Total Schedules";
  const mainDescription = isTeacherView
    ? "Distinct classes (same date, time, and room = 1). One class with 3 students = 1 timeslot."
    : "Each student enrollment counts as one. One class with 3 students = 3 schedules.";

  return (
    <div className="mt-6 space-y-6">
      {/* View explanation */}
      <Card className="border border-gray-200 bg-gray-50/50">
        <CardContent className="pt-4 pb-4">
          <p className="text-sm text-gray-700">
            {isTeacherView ? (
              <>
                <strong>Teacher View:</strong> Numbers are counted by <strong>timeslots</strong> (unique date + time + room).
                One class with multiple students = one timeslot. Use this to see how many classes were taught.
              </>
            ) : (
              <>
                <strong>Student View:</strong> Numbers are counted by <strong>schedules</strong> (each enrollment).
                One class with 3 students = 3 schedules. Use this to see total student enrollments.
              </>
            )}
          </p>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main count: Timeslots or Schedules */}
        <Card className="border-l-4 border-l-yellow-500">
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2 text-yellow-600">
              {isTeacherView ? <CalendarClock className="h-4 w-4" /> : <ClipboardList className="h-4 w-4" />}
              {mainLabel}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-gray-900">{mainCount}</div>
            <p className="text-sm text-gray-500 mt-1">{mainDescription}</p>
          </CardContent>
        </Card>

        {/* Students */}
        <Card className="border-l-4 border-l-yellow-500">
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2 text-yellow-600">
              <Users className="h-4 w-4" />
              Students
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-gray-900">{data.activeStudentCount}</div>
            <p className="text-sm text-gray-500 mt-1">
              Unique students in the selected period{teacherId ? " (for selected teacher)" : ""}.
            </p>
          </CardContent>
        </Card>

        {/* Courses */}
        <Card className="border-l-4 border-l-yellow-500">
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2 text-yellow-600">
              <BookOpen className="h-4 w-4" />
              Courses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-gray-900">{data.distinctCourseCount}</div>
            <p className="text-sm text-gray-500 mt-1">
              Different course types in the selected period.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Course Breakdown */}
      {data.courseTypeCounts && data.courseTypeCounts.length > 0 && (
        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle>
              {isTeacherView ? "Timeslots by Course" : "Schedules by Course"}
            </CardTitle>
            <CardDescription>
              {isTeacherView
                ? "Number of distinct classes (timeslots) per course. Same date, time, room = one."
                : "Number of schedule entries (student enrollments) per course."}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="border h-20 text-center whitespace-nowrap min-w-[80px]">Rank</TableHead>
                    <TableHead className="border h-20 text-center whitespace-nowrap font-semibold min-w-[200px]">Course</TableHead>
                    <TableHead className="border h-20 text-center whitespace-nowrap font-semibold min-w-[120px]">
                      {isTeacherView ? "Timeslots" : "Schedules"}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.courseTypeCounts
                    .sort((a, b) => b.count - a.count)
                    .map((item, index) => (
                      <TableRow key={index} className="hover:bg-gray-50">
                        <TableCell className="border h-20 text-center whitespace-nowrap px-2">
                          {index + 1}
                        </TableCell>
                        <TableCell className="border h-20 text-center whitespace-nowrap px-2 font-medium">
                          {item.subject}
                        </TableCell>
                        <TableCell className="border h-20 text-center whitespace-nowrap px-2 font-semibold">
                          {item.count}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
