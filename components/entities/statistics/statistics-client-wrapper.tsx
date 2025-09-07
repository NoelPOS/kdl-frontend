"use client";

import { useState, useEffect } from "react";
import { 
  getDashboardOverview, 
  type DashboardOverview,
  type TotalCounts,
  type RevenueMetrics,
  type TopCourse
} from "@/lib/api";
import { showToast } from "@/lib/toast";
import { Users, GraduationCap, BookOpen, Calendar, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatisticsClientWrapperProps {
  initialData: DashboardOverview | null;
}

export default function StatisticsClientWrapper({ initialData }: StatisticsClientWrapperProps) {
  const [data, setData] = useState<DashboardOverview | null>(initialData);
  const [isLoading, setIsLoading] = useState(false);

  if (!data) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500">No analytics data available</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Total Counts Cards */}
      <TotalCountsSection data={data.totalCounts} />

      {/* Revenue Metrics */}
      <RevenueSection data={data.revenue} />

      {/* Top Courses */}
      <TopCoursesSection data={data.topCourses} />
    </div>
  );
}

function TotalCountsSection({ data }: { data: TotalCounts }) {
  const cards = [
    {
      title: "Total Students",
      value: data.students,
      icon: Users,
      color: "text-blue-500",
      bgColor: "bg-blue-50",
    },
    {
      title: "Total Teachers",
      value: data.teachers,
      icon: GraduationCap,
      color: "text-green-500",
      bgColor: "bg-green-50",
    },
    {
      title: "Total Courses",
      value: data.courses,
      icon: BookOpen,
      color: "text-purple-500",
      bgColor: "bg-purple-50",
    },
    {
      title: "Active Sessions",
      value: data.activeSessions,
      icon: Calendar,
      color: "text-orange-500",
      bgColor: "bg-orange-50",
    },
  ];

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{card.title}</p>
                  <p className="text-3xl font-bold text-gray-800">{card.value.toLocaleString()}</p>
                </div>
                <div className={`p-3 rounded-full ${card.bgColor}`}>
                  <card.icon className={`h-6 w-6 ${card.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function RevenueSection({ data }: { data: RevenueMetrics }) {
  const getGrowthIcon = (growth: number) => {
    if (growth > 0) return TrendingUp;
    if (growth < 0) return TrendingDown;
    return Minus;
  };

  const getGrowthColor = (growth: number) => {
    if (growth > 0) return "text-green-500";
    if (growth < 0) return "text-red-500";
    return "text-gray-500";
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const GrowthIcon = getGrowthIcon(data.revenueGrowth);

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Revenue Analytics</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Revenue */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-3xl font-bold text-gray-800">
              {formatCurrency(data.totalRevenue)}
            </div>
            <p className="text-sm text-gray-500 mt-1">All time</p>
          </CardContent>
        </Card>

        {/* Current Month Revenue */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">This Month</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-3xl font-bold text-gray-800">
              {formatCurrency(data.currentMonthRevenue)}
            </div>
            <p className="text-sm text-gray-500 mt-1">Current month revenue</p>
          </CardContent>
        </Card>

        {/* Revenue Growth */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Growth Rate</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center space-x-2">
              <div className={`text-3xl font-bold ${getGrowthColor(data.revenueGrowth)}`}>
                {data.revenueGrowth > 0 ? '+' : ''}{data.revenueGrowth.toFixed(1)}%
              </div>
              <GrowthIcon className={`h-6 w-6 ${getGrowthColor(data.revenueGrowth)}`} />
            </div>
            <p className="text-sm text-gray-500 mt-1">Month over month</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function TopCoursesSection({ data }: { data: TopCourse[] }) {

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Top Performing Courses</h2>
      <Card>
        <CardContent className="p-0">
          {data.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No course data available
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rank
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Course
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Enrollments
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.map((course, index) => (
                    <tr key={course.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-yellow-100 text-yellow-800 font-semibold text-sm">
                          {index + 1}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{course.title}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{course.enrollmentCount.toLocaleString()}</div>
                        <div className="text-sm text-gray-500">students</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
