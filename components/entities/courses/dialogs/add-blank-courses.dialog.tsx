"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useDebounce } from "use-debounce";
import { showToast } from "@/lib/toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Plus, Search, Loader2, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { searchStudents } from "@/lib/api";
import { useCreatePackage } from "@/hooks/mutation/use-session-mutations";
import { useCoursePackages } from "@/hooks/query/use-course-packages";
import { Student } from "@/app/types/student.type";
import { useRouter } from "next/navigation";

interface AddBlankCoursesFormData {
  selectedStudentId: number;
  studentName: string;
  studentNickname: string;
  studentId: string;
  studentIdDisplay?: string;
  packageId: string;
  price: string;
}

export default function AddBlankCoursesDialog() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const { mutate: createPackage, isPending } = useCreatePackage();
  const { data: coursePackages = [], isLoading: isLoadingPackages } = useCoursePackages();

  const [searchResults, setSearchResults] = useState<Student[]>([]);
  const [activeSearchField, setActiveSearchField] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  const [debouncedSearchQuery] = useDebounce(searchQuery, 300);

  useEffect(() => {
    const performSearch = async () => {
      if (debouncedSearchQuery.trim() && activeSearchField) {
        try {
          const results = await searchStudents(
            debouncedSearchQuery,
            activeSearchField
          );
          setSearchResults(results);
        } catch (error) {
          console.error("Search failed", error);
          setSearchResults([]);
        }
      } else {
        setSearchResults([]);
      }
    };

    performSearch();
  }, [debouncedSearchQuery, activeSearchField]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<AddBlankCoursesFormData>({
    defaultValues: {
      selectedStudentId: 0,
      studentName: "",
      studentNickname: "",
      studentId: "",
      studentIdDisplay: "",
      packageId: "",
      price: "",
    },
  });

  const packageId = watch("packageId");
  const selectedPackage = coursePackages.find((p) => p.id.toString() === packageId);

  const handleSearch = (query: string, field: string) => {
    setActiveSearchField(field);
    setSearchQuery(query);
  };

  const handleSelectStudent = (student: Student) => {
    setValue("selectedStudentId", parseInt(student.id));
    setValue("studentName", student.name);
    setValue("studentNickname", student.nickname || "");
    setValue("studentId", student.id);
    setValue("studentIdDisplay", student.studentId || "");
    setSearchResults([]);
    setActiveSearchField("");
    setSearchQuery("");
  };

  const onSubmit = (data: AddBlankCoursesFormData) => {
    if (!data.selectedStudentId) {
      showToast.error("Please select a student.");
      return;
    }

    if (!data.packageId) {
      showToast.error("Please select a course package.");
      return;
    }

    const priceNum = parseFloat(data.price);
    if (!data.price || isNaN(priceNum) || priceNum <= 0) {
      showToast.error("Please enter a valid price.");
      return;
    }

    createPackage(
      {
        studentId: data.selectedStudentId,
        packageId: parseInt(data.packageId),
        price: priceNum,
      },
      {
        onSuccess: () => {
          setIsOpen(false);
          reset();
          setSearchQuery("");
          setSearchResults([]);
          router.refresh();
        },
      }
    );
  };

  const handleClose = () => {
    setIsOpen(false);
    reset();
    setSearchQuery("");
    setSearchResults([]);
    setActiveSearchField("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="border-yellow-500  hover:bg-yellow-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Course Package
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Course Package to Student</DialogTitle>
          <DialogDescription>
            Select a student, choose a package template, and set the price for this assignment.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Student Name */}
          <div className="space-y-2 relative">
            <Label htmlFor="studentName">
              Student Name <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                {...register("studentName", {
                  required: "Student name is required",
                })}
                placeholder="Jane Doe"
                className="pr-10"
                onChange={(e) => handleSearch(e.target.value, "name")}
                autoComplete="off"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
            {activeSearchField === "name" && searchResults.length > 0 && (
              <ul className="absolute z-10 bg-white border border-gray-200 shadow w-full rounded mt-1 max-h-48 overflow-y-auto">
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
            )}
          </div>

          {/* Student Nickname */}
          <div className="space-y-2 relative">
            <Label htmlFor="studentNickname">
              Student Nickname <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                {...register("studentNickname", {
                  required: "Student nickname is required",
                })}
                placeholder="Jane"
                className="pr-10"
                onChange={(e) => handleSearch(e.target.value, "nickname")}
                autoComplete="off"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
            {activeSearchField === "nickname" && searchResults.length > 0 && (
              <ul className="absolute z-10 bg-white border border-gray-200 shadow w-full rounded mt-1 max-h-48 overflow-y-auto">
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
            )}
          </div>

          {/* Student ID */}
          <div className="space-y-2 relative">
            <Label htmlFor="studentId">
              Student ID <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                {...register("studentIdDisplay", {
                  required: "Student ID is required",
                })}
                placeholder="202501001"
                className="pr-10"
                onChange={(e) => handleSearch(e.target.value, "id")}
                autoComplete="off"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
            {activeSearchField === "id" && searchResults.length > 0 && (
              <ul className="absolute z-10 bg-white border border-gray-200 shadow w-full rounded mt-1 max-h-48 overflow-y-auto">
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
            )}
          </div>

          {/* Course Package Select */}
          <div className="space-y-2">
            <Label htmlFor="packageId">
              Course Package <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <select
                id="packageId"
                {...register("packageId", {
                  required: "Please select a package",
                })}
                className="w-full border rounded-md px-3 py-2 pr-10 appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoadingPackages}
              >
                <option value="">
                  {isLoadingPackages ? "Loading packages..." : "Select a package..."}
                </option>
                {coursePackages.map((pkg) => (
                  <option key={pkg.id} value={pkg.id.toString()}>
                    {pkg.name} ({pkg.numberOfCourses} classes)
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
            {errors.packageId && (
              <p className="text-red-500 text-sm">{errors.packageId.message}</p>
            )}
            {selectedPackage && (
              <p className="text-sm text-gray-500">
                This package includes {selectedPackage.numberOfCourses} TBC class slots.
              </p>
            )}
          </div>

          {/* Price Input */}
          <div className="space-y-2">
            <Label htmlFor="price">
              Price <span className="text-red-500">*</span>
            </Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="1"
              {...register("price", {
                required: "Please enter a price",
              })}
              placeholder="e.g. 5000"
            />
            <p className="text-xs text-gray-500">
              Enter the custom price for this package assignment. This will be used when generating the invoice.
            </p>
            {errors.price && (
              <p className="text-red-500 text-sm">{errors.price.message}</p>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating Package...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Package
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
