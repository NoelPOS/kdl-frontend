"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, ChevronDown } from "lucide-react";

import { useCreateCourse } from "@/hooks/mutation/use-course-mutations";
import { Course } from "@/app/types/course.type";

export type CourseFormData = {
  title: string;
  description: string;
  ageRange: string;
  medium: string;
};

export function AddNewCourse({
  onCourseAdded,
}: {
  onCourseAdded?: (course: Course) => void;
}) {
  const [open, setOpen] = useState(false);
  const { mutate: createCourse, isPending } = useCreateCourse();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CourseFormData>({
    defaultValues: {
      title: "",
      description: "",
      ageRange: "",
      medium: "",
    },
  });

  const onSubmit = (data: CourseFormData) => {
    createCourse(data as any, {
      onSuccess: (newCourse) => {
        if (onCourseAdded && newCourse) {
          onCourseAdded(newCourse as Course);
        }
        reset();
        setOpen(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          New Course
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[550px] p-6">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Create New Course
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-4">
          <div className="space-y-4">
            {/* Course Title */}
            <div className="flex flex-col gap-1">
              <Label htmlFor="title" className="text-sm text-gray-500">
                Course Title *
              </Label>
              <Input
                id="title"
                {...register("title", {
                  required: "Course title is required",
                  minLength: {
                    value: 3,
                    message: "Course title must be at least 3 characters long",
                  },
                  maxLength: {
                    value: 100,
                    message: "Course title must not exceed 100 characters",
                  },
                })}
                placeholder="Animation & Game Creator"
                className={`border-gray-300 ${
                  errors.title ? "border-red-500 focus:border-red-500" : ""
                }`}
              />
              {errors.title && (
                <span className="text-red-500 text-sm">
                  {errors.title.message}
                </span>
              )}
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1">
              <Label htmlFor="description" className="text-sm text-gray-500">
                Description *
              </Label>
              <Input
                id="description"
                {...register("description", {
                  required: "Course description is required",
                  minLength: {
                    value: 10,
                    message: "Description must be at least 10 characters long",
                  },
                  maxLength: {
                    value: 5000,
                    message: "Description must not exceed 500 characters",
                  },
                })}
                placeholder="Lorem ipsum dolor sit"
                className={`border-gray-300 ${
                  errors.description
                    ? "border-red-500 focus:border-red-500"
                    : ""
                }`}
              />
              {errors.description && (
                <span className="text-red-500 text-sm">
                  {errors.description.message}
                </span>
              )}
            </div>

            {/* Age Range */}
            <div className="flex flex-col gap-1">
              <Label htmlFor="ageRange" className="text-sm text-gray-500">
                Age Range *
              </Label>
              <div className="relative">
                <select
                  id="ageRange"
                  {...register("ageRange", {
                    required: "Please select an age range",
                  })}
                  className={`w-full border border-gray-300 rounded-md py-2 px-3 appearance-none ${
                    errors.ageRange ? "border-red-500 focus:border-red-500" : ""
                  }`}
                >
                  <option value="">Select age range</option>
                  <option value="5-6 yrs">5-6 yrs</option>
                  <option value="7-8 yrs">7-8 yrs</option>
                  <option value="9-10 yrs">9-12 yrs</option>
                  <option value="13+ yrs">13-18 yrs</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
              </div>
              {errors.ageRange && (
                <span className="text-red-500 text-sm">
                  {errors.ageRange.message}
                </span>
              )}
            </div>

            {/* Medium */}
            <div className="flex flex-col gap-1">
              <Label htmlFor="medium" className="text-sm text-gray-500">
                Learning Medium *
              </Label>
              <div className="relative">
                <select
                  id="medium"
                  {...register("medium", {
                    required: "Please select a learning medium",
                  })}
                  className={`w-full border border-gray-300 rounded-md py-2 px-3 appearance-none ${
                    errors.medium ? "border-red-500 focus:border-red-500" : ""
                  }`}
                >
                  <option value="">Select learning medium</option>
                  <option value="iPad">iPad</option>
                  <option value="Computer">Computer</option>
                  <option value="Tablet">Tablet</option>
                  <option value="Physical Materials">Physical Materials</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
              </div>
              {errors.medium && (
                <span className="text-red-500 text-sm">
                  {errors.medium.message}
                </span>
              )}
            </div>
          </div>

          <DialogFooter className="flex justify-end gap-3 mt-6">
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                className="border-gray-300 text-gray-500 hover:bg-gray-50 hover:text-gray-700 rounded-full px-6"
              >
                Cancel
              </Button>
            </DialogClose>

            <Button
              type="submit"
              disabled={isPending}
              className="bg-yellow-500 hover:bg-yellow-600 text-white rounded-full px-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default AddNewCourse;
