"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Search, Trash2 } from "lucide-react";

import { searchCourses, assignCoursesToTeacher } from "@/lib/api";
import { Course } from "@/app/types/course.type";

interface CourseFormData {
  title: string;
  id: string;
}

type FormData = {
  courses: CourseFormData[];
};

interface ConnectTeacherCourseDialogProps {
  teacherId: number;
  onSuccess?: () => void;
}

export function ConnectTeacherCourseDialog({
  teacherId,
  onSuccess,
}: ConnectTeacherCourseDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      courses: [
        {
          title: "",
          id: "",
        } as CourseFormData,
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "courses",
  });

  const [activeSearchIndex, setActiveSearchIndex] = useState<number>(-1);
  const [searchResults, setSearchResults] = useState<Course[]>([]);

  const handleSelectCourse = (index: number, course: Course) => {
    setValue(`courses.${index}.title`, course.title);
    setValue(`courses.${index}.id`, course.id.toString());
    setSearchResults([]);
    setActiveSearchIndex(-1);
  };

  const handleSearch = async (query: string, index: number) => {
    setActiveSearchIndex(index);

    if (query.length >= 3) {
      try {
        const results = await searchCourses(query);
        setSearchResults(results);
      } catch (error) {
        console.error("Search failed", error);
        setSearchResults([]);
      }
    } else {
      setSearchResults([]);
    }
  };

  const addCourse = () => {
    append({
      title: "",
      id: "",
    } as CourseFormData);
  };

  const removeCourse = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  const onSubmit = async (data: FormData) => {
    // Validate that all courses have required fields
    const isValid = data.courses.every(
      (course) => course.title !== "" && course.id !== ""
    );

    if (!isValid) {
      alert("Please fill in all required fields for all courses.");
      return;
    }

    setIsLoading(true);
    try {
      // Assign courses to the teacher using the existing function
      const courseIds = data.courses.map((course) => parseInt(course.id));
      await assignCoursesToTeacher(teacherId, courseIds);

      // Reset form
      reset({
        courses: [
          {
            title: "",
            id: "",
          } as CourseFormData,
        ],
      });

      setOpen(false);
      onSuccess?.();
    } catch (error) {
      console.error("Failed to connect courses:", error);
      alert("Failed to connect courses. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    reset({
      courses: [
        {
          title: "",
          id: "",
        } as CourseFormData,
      ],
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Connect Course
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[400px] p-0 rounded-3xl overflow-hidden max-h-[80vh] overflow-y-auto">
        <div className="bg-white p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              Connect Courses
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6">
            <div className="space-y-6">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className={index > 0 ? "pt-4 border-t border-gray-200" : ""}
                >
                  <div className="space-y-4">
                    {/* Course Title (with search) */}
                    <div className="space-y-1 relative">
                      <Label
                        htmlFor={`courses.${index}.courseTitle`}
                        className="text-xs text-gray-500"
                      >
                        Course title
                      </Label>
                      <div className="relative">
                        <Input
                          {...register(`courses.${index}.title` as const, {
                            required: "Course title is required",
                          })}
                          placeholder="Mathematics"
                          className="border-gray-300 rounded-lg pr-10"
                          onChange={(e) => handleSearch(e.target.value, index)}
                          autoComplete="off"
                        />
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      </div>
                      {activeSearchIndex === index &&
                        searchResults.length > 0 && (
                          <ul className="absolute z-10 bg-white border border-gray-200 shadow w-full rounded mt-1 max-h-48 overflow-y-auto">
                            {searchResults.map((course) => (
                              <li
                                key={course.id}
                                onClick={() =>
                                  handleSelectCourse(index, course)
                                }
                                className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                              >
                                {course.title} ({course.ageRange})
                              </li>
                            ))}
                          </ul>
                        )}
                    </div>

                    {index > 0 && (
                      <div className="flex justify-end">
                        <Button
                          type="button"
                          variant="ghost"
                          className="text-red-500 p-1 h-auto hover:bg-red-50"
                          onClick={() => removeCourse(index)}
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Add Course Button */}
              <div className="flex justify-start pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="text-amber-500 border-amber-500 rounded-full text-sm px-4 py-1 h-auto"
                  onClick={addCourse}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Course
                </Button>
              </div>
            </div>

            <DialogFooter className="flex justify-between gap-4 mt-8 px-0">
              <Button
                type="button"
                variant="outline"
                className="text-red-500 border-red-500 hover:bg-red-50 hover:text-red-600 rounded-full flex-1"
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-blue-500 text-white hover:bg-blue-600 rounded-full flex-1"
              >
                {isLoading ? "Connecting..." : "Connect"}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ConnectTeacherCourseDialog;
