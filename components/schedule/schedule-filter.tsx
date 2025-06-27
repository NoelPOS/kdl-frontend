"use client";
import { FilterFormData, Student } from "@/app/types/schedule.type";
import { searchStudents } from "@/lib/axio";
import { useRef, useState, useCallback, useMemo } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Calendar, Search, Filter as FilterIcon } from "lucide-react";
import { Button } from "../ui/button";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "../ui/dialog";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function ScheduleFilter() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const { register, handleSubmit, setValue, watch } = useForm<FilterFormData>({
    defaultValues: {
      startDate: searchParams.get("startDate") || "",
      endDate: searchParams.get("endDate") || "",
      studentName: searchParams.get("studentName") || "",
    },
  });

  const [searchResults, setSearchResults] = useState<Student[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const startDateRef = useRef<HTMLInputElement>(null);
  const endDateRef = useRef<HTMLInputElement>(null);

  const { ref: startDateRHFRef } = register("startDate");
  const { ref: endDateRHFRef } = register("endDate");

  const studentName = watch("studentName");

  const handleSearch = useCallback(
    async (query: string) => {
      setValue("studentName", query);
      if (query.length >= 2) {
        try {
          const results = await searchStudents(query);
          setSearchResults(results);
          setShowDropdown(true);
        } catch (error) {
          console.log(error);
          setSearchResults([]);
          setShowDropdown(false);
        }
      } else {
        setSearchResults([]);
        setShowDropdown(false);
      }
    },
    [setValue]
  );

  const handleSelectStudent = useCallback(
    (student: Student) => {
      setValue("studentName", student.name);
      setSearchResults([]);
      setShowDropdown(false);
    },
    [setValue]
  );

  const onSubmit = useCallback(
    (data: FilterFormData) => {
      const params = new URLSearchParams(searchParams);
      params.set("startDate", data.startDate);
      params.set("endDate", data.endDate);
      params.set("studentName", data.studentName);
      router.replace(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  const searchDropdown = useMemo(() => {
    if (!showDropdown || searchResults.length === 0) return null;
    return (
      <ul className="absolute z-10 bg-white border border-gray-200 shadow-lg w-full rounded-md mt-1 max-h-48 overflow-y-auto top-full">
        {searchResults.map((student) => (
          <li
            key={student.id}
            onClick={() => handleSelectStudent(student)}
            className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer"
          >
            {student.name} ({student.nickname})
          </li>
        ))}
      </ul>
    );
  }, [showDropdown, searchResults, handleSelectStudent]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <FilterIcon className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Filter Schedules
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1  gap-4 mb-4">
            {/* Start Date */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="startDate">Start Date</Label>
              <div
                className="relative cursor-pointer"
                onClick={() => startDateRef.current?.showPicker()}
              >
                <Input
                  id="startDate"
                  type="date"
                  {...register("startDate")}
                  ref={(e) => {
                    startDateRHFRef(e);
                    startDateRef.current = e;
                  }}
                  className="border-gray-300 pr-10"
                />
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
            {/* End Date */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="endDate">End Date</Label>
              <div
                className="relative cursor-pointer"
                onClick={() => endDateRef.current?.showPicker()}
              >
                <Input
                  id="endDate"
                  type="date"
                  {...register("endDate")}
                  ref={(e) => {
                    endDateRHFRef(e);
                    endDateRef.current = e;
                  }}
                  className="border-gray-300 pr-10"
                />
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
            {/* Student Search */}
            <div className="flex flex-col gap-2 relative">
              <Label htmlFor="studentName">Student</Label>
              <div className="relative">
                <Input
                  id="studentName"
                  value={studentName}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search for a student"
                  className="border-gray-300 pr-10"
                  autoComplete="off"
                />
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
              {searchDropdown}
            </div>
          </div>
          <DialogFooter className="flex justify-end gap-2 mt-4">
            <DialogClose asChild>
              <Button
                type="submit"
                className="bg-yellow-500 text-white hover:bg-yellow-600 px-6"
              >
                Filter
              </Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
