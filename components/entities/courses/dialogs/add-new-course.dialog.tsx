"use client";

import { useRouter } from "next/navigation";
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

import { addNewCourse } from "@/lib/api";
import { useRef } from "react";
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
  const router = useRouter();
  const closeRef = useRef<HTMLButtonElement>(null);
  const { register, handleSubmit, reset } = useForm<CourseFormData>({
    defaultValues: {
      title: "",
      description: "",
      ageRange: "7-8 yrs",
      medium: "iPad",
    },
  });

  const onSubmit = async (data: CourseFormData) => {
    const newCourse = await addNewCourse(data);
    if (onCourseAdded && newCourse) {
      onCourseAdded(newCourse);
    }
    reset();
    closeRef.current?.click();
  };

  return (
    <Dialog>
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
                Course Title
              </Label>
              <Input
                id="title"
                {...register("title")}
                placeholder="Animation & Game Creator"
                className="border-gray-300"
              />
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1">
              <Label htmlFor="description" className="text-sm text-gray-500">
                Description
              </Label>
              <Input
                id="description"
                {...register("description")}
                placeholder="Lorem ipsum dolor sit"
                className="border-gray-300"
              />
            </div>

            {/* Age Range */}
            <div className="flex flex-col gap-1">
              <Label htmlFor="ageRange" className="text-sm text-gray-500">
                Age Range
              </Label>
              <div className="relative">
                <select
                  id="ageRange"
                  {...register("ageRange")}
                  className="w-full border border-gray-300 rounded-md py-2 px-3 appearance-none"
                >
                  <option value="5-6 yrs">5-6 yrs</option>
                  <option value="7-8 yrs">7-8 yrs</option>
                  <option value="9-10 yrs">9-12 yrs</option>
                  <option value="13+ yrs">13-18 yrs</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Medium */}
            <div className="flex flex-col gap-1">
              <Label htmlFor="medium" className="text-sm text-gray-500">
                Learning Medium
              </Label>
              <div className="relative">
                <select
                  id="medium"
                  {...register("medium")}
                  className="w-full border border-gray-300 rounded-md py-2 px-3 appearance-none"
                >
                  <option value="iPad">iPad</option>
                  <option value="Computer">Computer</option>
                  <option value="Tablet">Tablet</option>
                  <option value="Physical Materials">Physical Materials</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          <DialogFooter className="flex justify-end gap-3 mt-6">
            <DialogClose asChild>
              <Button
                ref={closeRef}
                type="button"
                variant="outline"
                className="border-gray-300 text-gray-500 hover:bg-gray-50 hover:text-gray-700 rounded-full px-6"
              >
                Cancel
              </Button>
            </DialogClose>

            <Button
              type="submit"
              className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-6"
            >
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default AddNewCourse;
