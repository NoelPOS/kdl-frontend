"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ChevronDown, ChevronUp, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import { getCourseTypes } from "@/lib/axio";

type FilterFormData = {
  query: string;
  status: string;
  classMode: string;
};

const FilterPackage = () => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(true);
  const [courseTypes, setCourseTypes] = useState<any[]>([]);

  const { register, handleSubmit, watch, reset } = useForm<FilterFormData>({
    defaultValues: {
      query: searchParams.get("query") || "",
      status: searchParams.get("status") || "all",
      classMode: searchParams.get("classMode") || "all",
    },
  });

  // Watch form values to show active filter count
  const formValues = watch();
  const activeFiltersCount = Object.entries(formValues).filter(
    ([key, value]) => value && value.toString().trim() !== "" && value !== "all"
  ).length;

  // Load course types on component mount
  useEffect(() => {
    const loadCourseTypes = async () => {
      try {
        const types = await getCourseTypes();
        setCourseTypes(types);
      } catch (error) {
        console.error("Failed to load course types:", error);
      }
    };

    loadCourseTypes();
  }, []);

  const onSubmit = (data: FilterFormData) => {
    const params = new URLSearchParams(searchParams);
    if (data.query) {
      params.set("query", data.query);
    } else {
      params.delete("query");
    }
    if (data.status && data.status !== "all") {
      params.set("status", data.status);
    } else {
      params.delete("status");
    }
    if (data.classMode && data.classMode !== "all") {
      params.set("classMode", data.classMode);
    } else {
      params.delete("classMode");
    }
    // Reset to page 1 when filtering
    params.delete("page");
    router.replace(`${pathname}?${params.toString()}`);
  };

  const clearFilters = useCallback(() => {
    reset({
      query: "",
      status: "all",
      classMode: "all",
    });
    router.replace(pathname);
  }, [reset, router, pathname]);

  return (
    <div className="bg-white rounded-lg border shadow-sm mb-6">
      <div
        className="flex items-center justify-between p-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <span className="font-medium text-gray-900">Filter Packages</span>
          {activeFiltersCount > 0 && (
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
              {activeFiltersCount} active
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {activeFiltersCount > 0 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                clearFilters();
              }}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Clear Filters
            </Button>
          )}
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-500" />
          )}
        </div>
      </div>

      <div
        className={cn(
          "transition-all duration-200 ease-in-out overflow-hidden",
          isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="p-4 pt-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Search Query */}
            <div className="space-y-2">
              <Label htmlFor="query">Search</Label>
              <Input
                id="query"
                placeholder="Student name"
                {...register("query")}
                className="w-full"
              />
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <div className="relative">
                <select
                  id="status"
                  {...register("status")}
                  className="w-full border border-gray-300 rounded-md py-1.5 px-3 appearance-none text-sm text-gray-500"
                >
                  <option value="all">All Status</option>
                  <option value="used">Used</option>
                  <option value="not_used">Not Used</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Course Type Filter */}
            <div className="space-y-2">
              <Label htmlFor="classMode">Course Type</Label>
              <div className="relative">
                <select
                  id="classMode"
                  {...register("classMode")}
                  className="w-full border border-gray-300 rounded-md py-1.5 px-3 appearance-none text-sm text-gray-500"
                >
                  <option value="all">All Types</option>
                  {courseTypes.map((type) => (
                    <option key={type.id} value={type.classMode}>
                      {type.classMode} - ${type.tuitionFee}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" className="bg-yellow-500 hover:bg-yellow-600">
              Apply Filters
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FilterPackage;
