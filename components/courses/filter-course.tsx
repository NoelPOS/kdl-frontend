"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
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
import { Label } from "@/components/ui/label";
import { ChevronDown, Filter as FilterIcon } from "lucide-react";

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

const FilterCourse = () => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const { register, handleSubmit } = useForm<FilterFormData>({
    defaultValues: {
      ageRange: searchParams.get("ageRange") || ageRanges[0],
      medium: searchParams.get("medium") || mediums[0],
    },
  });

  const onSubmit = (data: FilterFormData) => {
    const params = new URLSearchParams(searchParams);
    params.set("ageRange", data.ageRange);
    params.set("medium", data.medium);
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <FilterIcon className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px] p-6">
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
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                className="border-gray-300 text-gray-500 hover:bg-gray-50 hover:text-gray-700 rounded-full px-6"
              >
                Cancel
              </Button>
            </DialogClose>
            <DialogClose>
              <Button
                type="submit"
                className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-6"
              >
                Filter
              </Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default FilterCourse;
