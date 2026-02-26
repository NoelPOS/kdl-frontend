"use client";
import { useState, useCallback } from "react";
import {
  Filter,
  X,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

import { useForm } from "react-hook-form";
import { useDebounce } from "use-debounce";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar22 } from "@/components/shared/schedule/date-picker";

type NotificationFilterFormData = {
  startDate?: string;
  endDate?: string;
  search?: string;
  type?: string;
  status?: string;
  workflowStatus?: string;
};

const TYPE_OPTIONS = [
  { value: "all", label: "All Types" },
  { value: "schedule_confirmed", label: "Schedule Confirmed" },
  { value: "schedule_cancelled", label: "Schedule Cancelled" },
  { value: "feedback_submitted", label: "Feedback Submitted" },
];

const STATUS_OPTIONS = [
  { value: "all", label: "All Status" },
  { value: "unread", label: "Unread" },
  { value: "read", label: "Read" },
];

const WORKFLOW_STATUS_OPTIONS = [
  { value: "all", label: "All" },
  { value: "incoming", label: "Incoming" },
  { value: "wip", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
  { value: "ignored", label: "Ignored" },
];

interface NotificationFilterFormProps {
  onFilter: (filters: NotificationFilterFormData) => void;
  initialFilters?: NotificationFilterFormData;
}

export function NotificationFilterForm({
  onFilter,
  initialFilters,
}: NotificationFilterFormProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, setValue, watch, reset } = useForm<NotificationFilterFormData>({
    defaultValues: {
      startDate: initialFilters?.startDate || "",
      endDate: initialFilters?.endDate || "",
      search: initialFilters?.search || "",
      type: initialFilters?.type || "all",
      status: initialFilters?.status || "all",
      workflowStatus: initialFilters?.workflowStatus || "all",
    },
  });

  const onSubmit = useCallback(
    (data: NotificationFilterFormData) => {
      setLoading(true);
      onFilter(data);
      setLoading(false);
    },
    [onFilter]
  );

  const handleClearFilters = useCallback(() => {
    reset({
      startDate: "",
      endDate: "",
      search: "",
      type: "all",
      status: "all",
      workflowStatus: "all",
    });
    onFilter({
      startDate: "",
      endDate: "",
      search: "",
      type: "all",
      status: "all",
      workflowStatus: "all",
    });
  }, [reset, onFilter]);

  // Watch all form values to show active filter count
  const formValues = watch();
  
  // Calculate active filters count (excluding defaults)
  const activeFiltersCount = Object.entries(formValues).filter(
    ([key, value]) => {
        if (!value) return false;
        if (key === 'type' && value === 'all') return false;
        if (key === 'status' && value === 'all') return false;
        if (key === 'workflowStatus' && value === 'all') return false;
        return value.toString().trim() !== "";
    }
  ).length;

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
        <div className="max-h-[70vh] overflow-y-auto sm:max-h-none sm:overflow-visible">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="p-4 pt-0 border-t border-gray-100"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {/* Start Date */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Calendar22
                  date={
                    watch("startDate") ? new Date(watch("startDate")!) : undefined
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
                  date={watch("endDate") ? new Date(watch("endDate")!) : undefined}
                  onChange={(date) =>
                    setValue(
                      "endDate",
                      date ? date.toLocaleDateString("en-CA") : ""
                    )
                  }
                />
              </div>

              {/* Search */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="search">Search</Label>
                <Input
                  id="search"
                  placeholder="Search by message or title..."
                  className="border-gray-300"
                  {...register("search")}
                />
              </div>

              {/* Attendance Status (Type) */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="attendanceStatus">Type</Label>
                <div className="w-full">
                  <Select
                    value={watch("type")}
                    onValueChange={(v) => setValue("type", v)}
                  >
                    <SelectTrigger id="type" className="w-full">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {TYPE_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

               {/* Status */}
               <div className="flex flex-col gap-2">
                <Label htmlFor="classStatus">Status</Label>
                <div className="w-full">
                  <Select
                    value={watch("status")}
                    onValueChange={(v) => setValue("status", v)}
                  >
                    <SelectTrigger id="status" className="w-full">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Workflow Status */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="workflowStatus">Workflow Status</Label>
                <Select
                  value={watch("workflowStatus")}
                  onValueChange={(v) => setValue("workflowStatus", v)}
                >
                  <SelectTrigger id="workflowStatus" className="w-full">
                    <SelectValue placeholder="Select workflow status" />
                  </SelectTrigger>
                  <SelectContent>
                    {WORKFLOW_STATUS_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

            </div>

            <div className="flex justify-end gap-2 mt-4">
              <Button
                type="submit"
                className="bg-yellow-500 text-white hover:bg-yellow-600 px-6"
                disabled={loading}
              >
                {loading ? "Filtering..." : "Apply Filters"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
