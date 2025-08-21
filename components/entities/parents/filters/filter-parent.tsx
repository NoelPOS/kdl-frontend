"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { useDebounce } from "use-debounce";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ChevronDown, ChevronUp, Filter, X, Search } from "lucide-react";
import { useState, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import { searchStudents } from "@/lib/api";
import { Student } from "@/app/types/student.type";

type FilterFormData = {
  query: string;
  child: string;
  address: string;
};

export default function ParentFilter() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(true);

  // Student/Child search state
  const [studentSearchResults, setStudentSearchResults] = useState<Student[]>(
    []
  );
  const [showStudentResults, setShowStudentResults] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentQuery, setStudentQuery] = useState(
    searchParams.get("child") || ""
  );

  // Debounce the student search query
  const [debouncedStudentQuery] = useDebounce(studentQuery, 300);

  const { register, handleSubmit, watch, reset, setValue } =
    useForm<FilterFormData>({
      defaultValues: {
        query: searchParams.get("query") || "",
        child: searchParams.get("child") || "all",
        address: searchParams.get("address") || "all",
      },
    });

  // Watch form values to show active filter count
  const formValues = watch();
  const activeFiltersCount = Object.entries(formValues).filter(
    ([key, value]) => value && value.toString().trim() !== "" && value !== "all"
  ).length;

  // Effect to handle debounced student search
  useEffect(() => {
    const performStudentSearch = async () => {
      if (debouncedStudentQuery.length >= 2) {
        try {
          const results = await searchStudents(debouncedStudentQuery, "name");
          setStudentSearchResults(results || []);
          setShowStudentResults(true);
        } catch (error) {
          console.error("Student search failed:", error);
          setStudentSearchResults([]);
          setShowStudentResults(false);
        }
      } else {
        setStudentSearchResults([]);
        setShowStudentResults(false);
        if (debouncedStudentQuery.length === 0) {
          setSelectedStudent(null);
        }
      }
    };

    performStudentSearch();
  }, [debouncedStudentQuery]);

  // Student search handlers
  const handleStudentSearch = (query: string) => {
    setStudentQuery(query);
    setValue("child", query);
  };

  const handleSelectStudent = (student: Student) => {
    setSelectedStudent(student);
    setValue("child", student.name);
    setStudentQuery(student.name);
    setShowStudentResults(false);
    setStudentSearchResults([]);
  };

  const handleStudentInputBlur = () => {
    setTimeout(() => {
      setShowStudentResults(false);
    }, 200);
  };

  const onSubmit = (data: FilterFormData) => {
    const params = new URLSearchParams(searchParams);
    if (data.query) {
      params.set("query", data.query);
    } else {
      params.delete("query");
    }
    if (data.child) {
      params.set("child", data.child);
    } else {
      params.set("child", "all");
    }
    if (data.address) {
      params.set("address", data.address);
    } else {
      params.set("address", "all");
    }
    params.delete("page");
    router.replace(`${pathname}?${params.toString()}`);
  };

  const handleClearFilters = useCallback(() => {
    reset({
      query: "",
      child: "all",
      address: "all",
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
              <Label htmlFor="parentName">Parent Name</Label>
              <Input
                id="parentName"
                {...register("query")}
                placeholder="Enter parent name"
                className="border-gray-300"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="child">Child</Label>
              <div className="relative">
                <Input
                  id="child"
                  placeholder="Search for child..."
                  value={studentQuery}
                  onChange={(e) => handleStudentSearch(e.target.value)}
                  onBlur={handleStudentInputBlur}
                  className="border-gray-300 pr-10"
                />
                <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />

                {/* Search Results Dropdown */}
                {showStudentResults && studentSearchResults.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                    {studentSearchResults.map((student) => (
                      <div
                        key={student.id}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                        onClick={() => handleSelectStudent(student)}
                      >
                        <div className="font-medium">{student.name}</div>
                        {student.nickname && (
                          <div className="text-gray-500">
                            Nickname: {student.nickname}
                          </div>
                        )}
                        <div className="text-gray-500">
                          Student ID: {student.id}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* No Results Message */}
                {showStudentResults &&
                  debouncedStudentQuery.length >= 2 &&
                  studentSearchResults.length === 0 && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg">
                      <div className="px-4 py-2 text-sm text-gray-500">
                        No students found for &quot;{debouncedStudentQuery}
                        &quot;
                      </div>
                    </div>
                  )}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                {...register("address")}
                placeholder="Enter address"
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
