import { fetchDashboardOverview } from "@/lib/api";
import { cookies } from "next/headers";
import { Users, GraduationCap, BookOpen } from "lucide-react";
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

  const hasData = data.activeStudentCount !== undefined || 
                  data.teacherClassCount !== undefined || 
                  (data.courseTypeCounts && data.courseTypeCounts.length > 0);

  if (!hasData) {
    return (
      <div className="mt-6 bg-white border border-gray-200 rounded-lg p-12 text-center">
        <p className="text-gray-500">No data found for the selected filters.</p>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Active Students */}
        {data.activeStudentCount !== undefined && (
          <Card className="border-l-4 border-l-yellow-500">
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2 text-yellow-600">
                <Users className="h-4 w-4" />
                Active Students
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-gray-900">{data.activeStudentCount}</div>
              <p className="text-sm text-gray-500 mt-1">students in selected period</p>
            </CardContent>
          </Card>
        )}

        {/* Teacher Classes */}
        {data.teacherClassCount !== undefined && data.teacherClassCount > 0 && (
          <Card className="border-l-4 border-l-yellow-500">
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2 text-yellow-600">
                <GraduationCap className="h-4 w-4" />
                Classes Taught
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-gray-900">{data.teacherClassCount}</div>
              <p className="text-sm text-gray-500 mt-1">
                {countBy === 'enrollment' ? 'schedule count' : 'class count'}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Total Course Types */}
        {data.courseTypeCounts && data.courseTypeCounts.length > 0 && (
          <Card className="border-l-4 border-l-yellow-500">
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2 text-yellow-600">
                <BookOpen className="h-4 w-4" />
                Course Types
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-gray-900">{data.courseTypeCounts.length}</div>
              <p className="text-sm text-gray-500 mt-1">different courses</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Course Breakdown */}
      {data.courseTypeCounts && data.courseTypeCounts.length > 0 && (
        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle>Class Distribution by Course</CardTitle>
            <CardDescription>
              {countBy === 'enrollment' 
                ? 'Number of schedules per course type'
                : 'Number of classes per course type'}
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
                      {countBy === 'enrollment' ? 'Schedule Count' : 'Class Count'}
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
