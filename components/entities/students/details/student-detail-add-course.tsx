"use client";

import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Search } from "lucide-react";
import { DialogTrigger } from "@radix-ui/react-dialog";
import { searchCourses } from "@/lib/api";
import { useDebouncedCallback } from "use-debounce";
import { Course } from "@/app/types/course.type";

interface StudentDetailAddCourseProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (course: Pick<Course, "id" | "title">) => void;
  onCancel?: () => void;
  courseData?: Pick<Course, "id" | "title">;
}

export function StudentDetailAddCourse({
  open,
  onOpenChange,
  onSubmit: afterCourse,
  onCancel,
  courseData, // Add this
}: StudentDetailAddCourseProps) {
  const { register, handleSubmit, setValue, reset } = useForm<{
    course: string;
  }>({
    defaultValues: {
      course: "",
    },
  });

  const [searchResults, setSearchResults] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course>();

  // Reset form and sync state when dialog opens
  useEffect(() => {
    if (open) {
      if (courseData && courseData.id !== -1) {
        setValue("course", courseData.title);
        setSelectedCourse(courseData as Course);
      } else {
        reset();
        setSelectedCourse(undefined);
        setSearchResults([]);
      }
    }
  }, [open, courseData, setValue, reset]);

  const debouncedSearch = useDebouncedCallback(async (value: string) => {
    if (value.length >= 2) {
      try {
        const results = await searchCourses(value);
        setSearchResults(results);
      } catch (err) {
        console.error("Course search failed", err);
      }
    } else {
      setSearchResults([]);
    }
  }, 300);

  const handleSelectCourse = (course: Course) => {
    setValue("course", course.title);
    setSelectedCourse(course);
    setSearchResults([]);
  };

  const onSubmit = () => {
    if (selectedCourse && afterCourse) {
      afterCourse(selectedCourse);
      const query = new URLSearchParams();
      query.set("id", String(selectedCourse.id));
      query.set("course", selectedCourse.title);
      if (typeof window !== "undefined") {
        window.history.pushState({}, "", `?${query.toString()}`);
      }
    }
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center gap-2 rounded-full"
          onClick={() => onOpenChange(true)}
        >
          <Plus className="h-4 w-4" />
          Add Course
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px] p-0 rounded-3xl overflow-hidden max-h-[80vh] overflow-y-auto">
        <div className="bg-white p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="mt-6">
            <div className="space-y-6">
              <div className="space-y-2 relative">
                <Label htmlFor="course" className="text-sm font-medium">
                  Course Name
                </Label>
                <div className="relative">
                  <Input
                    id="course"
                    {...register("course")}
                    placeholder="Enter course name"
                    onChange={(e) => {
                      setSelectedCourse(undefined);
                      debouncedSearch(e.target.value);
                    }}
                    autoComplete="off"
                    className="w-full"
                  />
                  <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500" />
                </div>

                {searchResults.length > 0 && (
                  <ul className="absolute z-10 bg-white border border-gray-200 shadow w-full rounded mt-1 max-h-48 overflow-y-auto">
                    {searchResults.map((course) => (
                      <li
                        key={course.id}
                        onClick={() => handleSelectCourse(course)}
                        className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                      >
                        {course.title}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <DialogFooter className="flex justify-between gap-4 mt-8 px-0">
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="text-red-500 border-red-500 hover:bg-red-50 hover:text-red-600 rounded-full flex-1"
                  onClick={onCancel}
                >
                  Cancel
                </Button>
              </DialogClose>
              <Button
                type="submit"
                className="bg-blue-500 text-white hover:bg-blue-600 rounded-full flex-1"
                disabled={!selectedCourse}
              >
                Next
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default StudentDetailAddCourse;
