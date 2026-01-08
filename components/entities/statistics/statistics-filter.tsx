"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { format } from "date-fns";
import { getAllTeachers } from "@/lib/api";
import { Teacher } from "@/app/types/teacher.type";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, ChevronDown, ChevronUp, Filter, X, GraduationCap, Users } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatisticsFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isExpanded, setIsExpanded] = useState(true);
  
  // Local state for filter values
  const [startDate, setStartDate] = useState<Date | undefined>(
    searchParams.get("startDate") ? new Date(searchParams.get("startDate")!) : undefined
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    searchParams.get("endDate") ? new Date(searchParams.get("endDate")!) : undefined
  );
  const [teacherId, setTeacherId] = useState(searchParams.get("teacherId") || "");
  const [countBy, setCountBy] = useState<'timeslot' | 'enrollment'>(searchParams.get("countBy") as 'timeslot' | 'enrollment' || 'timeslot');

  // Calculate active filters count
  const activeFiltersCount = [startDate, endDate, teacherId].filter(Boolean).length;

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const data = await getAllTeachers();
        setTeachers(data);
      } catch (error) {
        console.error("Failed to fetch teachers:", error);
      }
    };
    fetchTeachers();
  }, []);

  const handleApplyFilter = () => {
    const params = new URLSearchParams();
    
    // Always add 'applied' param to indicate user clicked Apply Filters
    params.set("applied", "true");
    
    if (startDate) params.set("startDate", format(startDate, "yyyy-MM-dd"));
    if (endDate) params.set("endDate", format(endDate, "yyyy-MM-dd"));
    if (teacherId) params.set("teacherId", teacherId);
    params.set("countBy", countBy);
    
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleClearFilters = useCallback(() => {
    setStartDate(undefined);
    setEndDate(undefined);
    setTeacherId("");
    setCountBy('timeslot');
    router.push(pathname);
  }, [router, pathname]);

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
        <div className="p-4 pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            {/* Start Date Picker */}
            <div className="flex flex-col gap-2">
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal border-gray-300",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            {/* End Date Picker */}
            <div className="flex flex-col gap-2">
              <Label>End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal border-gray-300",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                    disabled={(date) => startDate ? date < startDate : false}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Teacher Select */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="teacher">Teacher (Optional)</Label>
              <div className="relative">
                <select
                  id="teacher"
                  value={teacherId}
                  onChange={(e) => setTeacherId(e.target.value)}
                  className="w-full border border-gray-300 rounded-md py-2 px-3 appearance-none text-sm"
                >
                  <option value="">All Teachers</option>
                  {teachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id.toString()}>
                      {teacher.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Counting Perspective Toggle */}
          <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <Label className="mb-2 block text-sm font-medium text-gray-700">Counting Perspective</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={countBy === 'timeslot' ? 'default' : 'outline'}
                onClick={() => setCountBy('timeslot')}
                className={cn(
                  "flex-1",
                  countBy === 'timeslot' 
                    ? "bg-yellow-500 hover:bg-yellow-600 text-white" 
                    : "bg-white hover:bg-gray-100 text-gray-700"
                )}
              >
                <GraduationCap className="mr-2 h-4 w-4" />
                Teacher View
                <span className="ml-2 text-xs opacity-80">(Unique Classes)</span>
              </Button>
              <Button
                type="button"
                variant={countBy === 'enrollment' ? 'default' : 'outline'}
                onClick={() => setCountBy('enrollment')}
                className={cn(
                  "flex-1",
                  countBy === 'enrollment' 
                    ? "bg-yellow-500 hover:bg-yellow-600 text-white" 
                    : "bg-white hover:bg-gray-100 text-gray-700"
                )}
              >
                <Users className="mr-2 h-4 w-4" />
                Student View
                <span className="ml-2 text-xs opacity-80">(Total Enrollments)</span>
              </Button>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              {countBy === 'timeslot' 
                ? "Counts unique time slots (3 students at same time = 1 class)"
                : "Counts individual enrollments (3 students at same time = 3 enrollments)"}
            </p>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button
              onClick={handleApplyFilter}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-6"
            >
              Apply Filters
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
