"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
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
import { Plus, Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { searchStudents, createSession } from "@/lib/api";
import { Student } from "@/app/types/student.type";
import { useRouter } from "next/navigation";

interface AddBlankCoursesFormData {
  selectedStudentId: number;
  studentName: string;
  numberOfCourses: number;
}

export default function AddBlankCoursesDialog() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);

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
      numberOfCourses: 1,
    },
  });

  // Watch the number of courses to ensure it's valid
  const numberOfCourses = watch("numberOfCourses");

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

  const onSubmit = async (data: AddBlankCoursesFormData) => {
    if (!data.selectedStudentId) {
      showToast.error("Please select a student.");
      return;
    }

    if (
      !data.numberOfCourses ||
      data.numberOfCourses < 1 ||
      data.numberOfCourses > 50
    ) {
      showToast.error("Please enter a valid number of courses (1-50).");
      return;
    }

    try {
      // Get the selected student info
      const selectedStudent = students.find(
        (s) => s.id === data.selectedStudentId.toString()
      );

      console.log("=== Creating Blank Course Sessions ===");
      console.log("Student ID:", data.selectedStudentId);
      console.log("Student Name:", selectedStudent?.name);
      console.log("Number of Blank Courses:", data.numberOfCourses);
      console.log("===================================");

      // Replace with your actual blank course ID (this course should have title "TBC" in your database)
      const BLANK_COURSE_ID = 10;

      // Replace with a valid teacher ID from your database
      const DEFAULT_TEACHER_ID = 1;

      // Create session data for each blank course
      for (let i = 1; i <= data.numberOfCourses; i++) {
        const sessionData = {
          studentId: data.selectedStudentId,
          courseId: BLANK_COURSE_ID,
          classOptionId: 2,
          classCancel: 0,
          payment: "Unpaid",
          status: "Pending",
          teacherId: DEFAULT_TEACHER_ID,
          isFromPackage: false,
          packageId: undefined,
        };

        console.log(`Creating blank course session ${i}:`, sessionData);

        const result = await createSession(sessionData);
        console.log(`Blank course session ${i} created:`, result);
      }

      // Success feedback
      console.log("All blank course sessions created successfully!");
      showToast.success(
        `Successfully created ${data.numberOfCourses} blank course sessions for ${selectedStudent?.name}`
      );

      // Close dialog and reset form
      setIsOpen(false);
      reset();
      setSearchQuery("");
      setStudents([]);
      setShowStudentDropdown(false);

      // Refresh the page to show new sessions
      router.refresh();
    } catch (error) {
      console.error("Error creating blank course sessions:", error);
      showToast.error(
        "Error creating blank course sessions. Please try again."
      );
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
        <Button
          variant="outline"
          className="border-yellow-500 text-yellow-600 hover:bg-yellow-50"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Blank Courses
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Blank Courses to Student</DialogTitle>
          <DialogDescription>
            Select a student and specify the number of blank course slots to add
            to their account.
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

            {searchQuery && showStudentDropdown && students.length === 0 && (
              <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg p-3">
                <div className="text-sm text-gray-500">No students found</div>
              </div>
            )}
          </div>

          {/* Number of Courses Input */}
          <div className="space-y-2">
            <Label htmlFor="numberOfCourses">
              Number of Courses <span className="text-red-500">*</span>
            </Label>
            <Input
              id="numberOfCourses"
              type="number"
              min="1"
              max="50"
              placeholder="Enter number of courses to add..."
              {...register("numberOfCourses", {
                required: "Please enter number of courses",
                min: { value: 1, message: "Must be at least 1 course" },
                max: { value: 50, message: "Cannot exceed 50 courses" },
                valueAsNumber: true,
              })}
              className="w-full"
            />
            {errors.numberOfCourses && (
              <p className="text-red-500 text-sm">
                {errors.numberOfCourses.message}
              </p>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating Sessions...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Blank Courses
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
