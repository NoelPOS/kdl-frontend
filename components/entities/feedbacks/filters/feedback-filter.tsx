"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ChevronDown, ChevronUp, Filter, X, Calendar } from "lucide-react";
import { useState, useCallback, useRef } from "react";
import { cn } from "@/lib/utils";
import { Calendar22 } from "@/components/shared/schedule/date-picker";

type FilterFormData = {
  studentName: string;
  courseName: string;
  teacherName: string;
  startDate: string;
  endDate: string;
};

export default function FeedbackFilter() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(true);

  const { register, handleSubmit, watch, reset, setValue } =
    useForm<FilterFormData>({
      defaultValues: {
        studentName: searchParams.get("studentName") || "",
        courseName: searchParams.get("courseName") || "",
        teacherName: searchParams.get("teacherName") || "",
        startDate: searchParams.get("startDate") || "",
        endDate: searchParams.get("endDate") || "",
      },
    });

  // Watch form values to show active filter count
  const formValues = watch();
  const activeFiltersCount = Object.entries(formValues).filter(
    ([key, value]) => value && value.toString().trim() !== ""
  ).length;

  const onSubmit = (data: FilterFormData) => {
    const params = new URLSearchParams(searchParams);

    // Always reset to page 1 when filtering
    params.delete("page");

    // Always add status=all to trigger fetch
    params.set("status", "all");

    if (data.studentName) {
      params.set("studentName", data.studentName);
    } else {
      params.delete("studentName");
    }
    if (data.courseName) {
      params.set("courseName", data.courseName);
    } else {
      params.delete("courseName");
    }
    if (data.teacherName) {
      params.set("teacherName", data.teacherName);
    } else {
      params.delete("teacherName");
    }
    if (data.startDate) {
      params.set("startDate", data.startDate);
    } else {
      params.delete("startDate");
    }
    if (data.endDate) {
      params.set("endDate", data.endDate);
    } else {
      params.delete("endDate");
    }

    router.replace(`${pathname}?${params.toString()}`);
  };

  const handleClearFilters = useCallback(() => {
    reset({
      studentName: "",
      courseName: "",
      teacherName: "",
      startDate: "",
      endDate: "",
    });
    router.replace(pathname);
  }, [reset, router, pathname]);

  return (
    <div className="mb-5 border border-gray-200 rounded-lg bg-white shadow-sm">
      {/* Filter Header */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <Filter className="h-5 w-5 text-gray-600" />
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900">Filters</span>
            {activeFiltersCount > 0 && (
              <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activeFiltersCount > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleClearFilters();
              }}
              className="text-gray-500 hover:text-gray-700 h-8 px-2"
            >
              <X className="h-4 w-4" />
              Clear
            </Button>
          )}
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-gray-600" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-600" />
          )}
        </div>
      </div>

      {/* Filter Content */}
      <div
        className={cn(
          "transition-all duration-300 ease-in-out overflow-hidden",
          isExpanded ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="p-4 pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            {/* Start Date */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Calendar22
                date={
                  watch("startDate") ? new Date(watch("startDate")) : undefined
                }
                onChange={(date) =>
                  setValue(
                    "startDate",
                    date ? date.toLocaleDateString("en-CA") : ""
                  )
                }
              />
            </div>

            {/* End Date */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="endDate">End Date</Label>
              <Calendar22
                date={watch("endDate") ? new Date(watch("endDate")) : undefined}
                onChange={(date) =>
                  setValue(
                    "endDate",
                    date ? date.toLocaleDateString("en-CA") : ""
                  )
                }
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="studentName">Student Name</Label>
              <Input
                id="studentName"
                {...register("studentName")}
                placeholder="Enter student name"
                className="border-gray-300"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="courseName">Course Name</Label>
              <Input
                id="courseName"
                {...register("courseName")}
                placeholder="Enter course name"
                className="border-gray-300"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="teacherName">Teacher Name</Label>
              <Input
                id="teacherName"
                {...register("teacherName")}
                placeholder="Enter teacher name"
                className="border-gray-300"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button
              type="submit"
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-6"
            >
              Apply Filters
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
