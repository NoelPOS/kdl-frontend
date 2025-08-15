"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ChevronDown, ChevronUp, Filter, X } from "lucide-react";
import { useRef, useCallback, useState } from "react";
import { cn } from "@/lib/utils";

const receiptStatusOptions = [
  { label: "Choose Status", value: "" },
  { label: "Completed", value: "completed" },
  { label: "Pending", value: "pending" },
  { label: "All", value: "all" },
];

type FilterFormData = {
  documentId: string;
  student: string;
  course: string;
  receiptDone: string;
};

function InvoiceFilterNew() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(true);

  const { register, handleSubmit, watch, reset } = useForm<FilterFormData>({
    defaultValues: {
      documentId: searchParams.get("documentId") || "",
      student: searchParams.get("student") || "",
      course: searchParams.get("course") || "",
      receiptDone: searchParams.get("receiptDone") || "",
    },
  });

  // Watch form values to show active filter count
  const formValues = watch();
  const activeFiltersCount = Object.entries(formValues).filter(
    ([key, value]) => value && value.toString().trim() !== "" && value !== "all"
  ).length;

  const onSubmit = (data: FilterFormData) => {
    const params = new URLSearchParams(searchParams);

    // Always reset to page 1 when filtering
    params.delete("page");

    if (data.documentId) {
      params.set("documentId", data.documentId);
    } else {
      params.delete("documentId");
    }
    if (data.student) {
      params.set("student", data.student);
    } else {
      params.delete("student");
    }
    if (data.course) {
      params.set("course", data.course);
    } else {
      params.delete("course");
    }
    if (data.receiptDone) {
      params.set("receiptDone", data.receiptDone);
    } else {
      params.delete("receiptDone");
    }
    if (
      !data.documentId &&
      !data.student &&
      !data.course &&
      !data.receiptDone
    ) {
      params.delete("documentId");
      params.delete("student");
      params.delete("course");
      params.delete("receiptDone");
      params.set("receiptDone", "all");
    }
    params.delete("page");
    router.replace(`${pathname}?${params.toString()}`);
  };

  const handleClearFilters = useCallback(() => {
    reset({
      documentId: "",
      student: "",
      course: "",
      receiptDone: "",
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
        <form onSubmit={handleSubmit(onSubmit)} className="p-4 pt-0 ">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="documentId">Document ID</Label>
              <Input
                id="documentId"
                {...register("documentId")}
                placeholder="Enter document ID"
                className="border-gray-300"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="student">Student Name</Label>
              <Input
                id="student"
                {...register("student")}
                placeholder="Enter student name"
                className="border-gray-300"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="course">Course</Label>
              <Input
                id="course"
                {...register("course")}
                placeholder="Enter course name"
                className="border-gray-300"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="receiptDone">Receipt Done</Label>
              <div className="relative">
                <select
                  id="receiptDone"
                  {...register("receiptDone")}
                  className="w-full border border-gray-300 rounded-md py-1.5 px-3 appearance-none text-sm text-gray-500"
                >
                  {receiptStatusOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
              </div>
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

export default InvoiceFilterNew;
