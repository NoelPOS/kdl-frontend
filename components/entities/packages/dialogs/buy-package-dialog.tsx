"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
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
import { Plus, Loader2, Search, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { searchStudents, purchasePackage, getCourseTypes } from "@/lib/api";
import { PackagePurchaseRequest } from "@/app/types/package.type";
import { Student } from "@/app/types/student.type";
import { useRouter } from "next/navigation";

interface BuyPackageFormData {
  selectedStudentId: number;
  selectedClassOptionId: number;
  studentName: string;
}

export function BuyPackageDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [classOptions, setClassOptions] = useState<any[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<BuyPackageFormData>({
    defaultValues: {
      selectedStudentId: 0,
      selectedClassOptionId: 0,
      studentName: "",
    },
  });

  // Load class options on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const options = await getCourseTypes();
        setClassOptions(options);
      } catch (error) {
        console.error("Failed to load data:", error);
      }
    };

    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  // Search students
  const handleStudentSearch = async (query: string) => {
    setSearchQuery(query);
    setValue("studentName", query);

    if (query.length >= 2) {
      try {
        const results = await searchStudents(query);
        setStudents(results);
        setShowStudentDropdown(true);
      } catch (error) {
        console.error("Student search failed:", error);
        setStudents([]);
      }
    } else {
      setStudents([]);
      setShowStudentDropdown(false);
    }
  };

  const handleSelectStudent = (student: Student) => {
    setValue("selectedStudentId", parseInt(student.id));
    setValue("studentName", student.name);
    setSearchQuery(student.name);
    setShowStudentDropdown(false);
    setStudents([]);
  };

  const onSubmit = async (data: BuyPackageFormData) => {
    if (!data.selectedStudentId || !data.selectedClassOptionId) {
      alert("Please select a student and class option.");
      return;
    }

    const selectedClassOption = classOptions.find((opt) => {
      return Number(opt.id) === Number(data.selectedClassOptionId);
    });

    if (!selectedClassOption) {
      alert("Please select a valid class option.");
      return;
    }

    setIsLoading(true);
    try {
      const request = {
        studentId: data.selectedStudentId,
        studentName: data.studentName,
        classOptionId: data.selectedClassOptionId,
        classOptionTitle: selectedClassOption.classMode, // Using classMode as title
        classMode: selectedClassOption.classMode,
        tuitionFee: selectedClassOption.tuitionFee,
        classLimit: selectedClassOption.classLimit || 0, // Default to 0 if not available
      } as PackagePurchaseRequest;

      const success = await purchasePackage(request);
      if (success) {
        setIsOpen(false);
        reset();
        setSearchQuery("");
        router.refresh(); // Refresh to show updated data
        alert("Package purchased successfully!");
      } else {
        alert("Failed to purchase package. Please try again.");
      }
    } catch (error) {
      console.error("Error purchasing package:", error);
      alert("An error occurred while purchasing the package.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    reset();
    setSearchQuery("");
    setStudents([]);
    setShowStudentDropdown(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-yellow-500 hover:bg-yellow-600">
          <Plus className="h-4 w-4 mr-2" />
          Buy Package
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Purchase Package</DialogTitle>
          <DialogDescription>
            Select a student and class option to purchase a prepaid package.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Student Selection */}
          <div className="space-y-2 relative">
            <Label htmlFor="studentName">
              Select Student <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="studentName"
                placeholder="Search and select a student..."
                value={searchQuery}
                onChange={(e) => handleStudentSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Student Dropdown */}
            {showStudentDropdown && students.length > 0 && (
              <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto">
                {students.map((student) => (
                  <button
                    key={student.id}
                    type="button"
                    onClick={() => handleSelectStudent(student)}
                    className="w-full px-3 py-2 text-left hover:bg-gray-100 focus:bg-gray-100"
                  >
                    <div className="font-medium">{student.name}</div>
                    {student.nickname && (
                      <div className="text-sm text-gray-500">
                        ({student.nickname})
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Class Option Selection */}
          <div className="space-y-2 relative">
            <Label htmlFor="classOption">
              Class Option <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <select
                id="classOption"
                {...register("selectedClassOptionId", {
                  required: "Please select a class option",
                })}
                className="w-full h-10 px-3 pr-10 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent appearance-none"
              >
                <option value="">Select a class option...</option>
                {classOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.classMode} - ${option.tuitionFee}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>

            {errors.selectedClassOptionId && (
              <p className="text-red-500 text-sm">
                {errors.selectedClassOptionId.message}
              </p>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-yellow-500 hover:bg-yellow-600"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Purchasing...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Purchase Package
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
