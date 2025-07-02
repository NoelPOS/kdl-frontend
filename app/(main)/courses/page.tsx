"use client";

import { usePathname, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ChevronDown } from "lucide-react";

const ageRanges = [
  "all",
  "5-6 yrs",
  "7-8 yrs",
  "9-10 yrs",
  "11-12 yrs",
  "13+ yrs",
];
const mediums = ["all", "iPad", "Computer", "Tablet", "Physical Materials"];

type FilterFormData = {
  ageRange: string;
  medium: string;
};

const PreCoursesPage = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { register, handleSubmit, reset } = useForm<FilterFormData>({
    defaultValues: {
      ageRange: "all",
      medium: "all",
    },
  });

  const onSubmit = (data: FilterFormData) => {
    reset();
    router.replace(
      `${pathname}/details?ageRange=${data.ageRange}&medium=${data.medium}`
    );
  };

  return (
    <Dialog open={true} modal={false}>
      <DialogContent className="sm:max-w-[400px] p-6 [&>button]:hidden">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Filter Courses
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
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
                {ageRanges.map((range) => (
                  <option key={range} value={range}>
                    {range}
                  </option>
                ))}
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
                {mediums.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
            </div>
          </div>
          <DialogFooter className="flex justify-end gap-3 mt-6">
            <Button
              type="submit"
              className="bg-yellow-500 hover:bg-yellow-600 text-white rounded-full px-6"
            >
              Filter
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PreCoursesPage;
