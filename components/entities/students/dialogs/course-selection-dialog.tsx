"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
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
import { Search } from "lucide-react";
import { searchCourses } from "@/lib/api";
import { useDebouncedCallback } from "use-debounce";
import { Course } from "@/app/types/course.type";

interface CourseSelectionDialogProps {
  open: boolean;
  onCourseSelected: (course: Pick<Course, "id" | "title">) => void;
  onCancel: () => void;
  courseData?: Pick<Course, "id" | "title">;
}

export default function CourseSelectionDialog({
  open,
  onCourseSelected,
  onCancel,
  courseData,
}: CourseSelectionDialogProps) {
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
    if (selectedCourse && onCourseSelected) {
      onCourseSelected(selectedCourse);
    }
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-[400px] p-0 rounded-3xl overflow-hidden max-h-[80vh] overflow-y-auto">
        <div className="bg-white p-6">
          <DialogHeader>
            <DialogTitle>Select Course</DialogTitle>
          </DialogHeader>

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
                className="bg-yellow-500 text-white hover:bg-yellow-600 rounded-full flex-1"
                disabled={!selectedCourse}
              >
                Select
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
