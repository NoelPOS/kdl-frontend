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
import { Plus, Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { searchStudents, createSession } from "@/lib/api";
import { Student } from "@/app/types/student.type";
import { useRouter } from "next/navigation";

interface AddBlankCoursesFormData {
  selectedStudentId: number;
  studentName: string;
  studentNickname: string;
  studentId: string;
  numberOfCourses: number;
}

export default function AddBlankCoursesDialog() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  // Search states
  const [searchResults, setSearchResults] = useState<Student[]>([]);
  const [activeSearchField, setActiveSearchField] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  // Debounce the search query
  const [debouncedSearchQuery] = useDebounce(searchQuery, 300);

  // Effect to handle debounced search
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
      numberOfCourses: 1,
    },
  });

  // Watch the number of courses to ensure it's valid
  const numberOfCourses = watch("numberOfCourses");

  // Handle search for different fields
  const handleSearch = (query: string, field: string) => {
    setActiveSearchField(field);
    setSearchQuery(query);
  };

  // Handle student selection from dropdown
  const handleSelectStudent = (student: Student) => {
    setValue("selectedStudentId", parseInt(student.id));
    setValue("studentName", student.name);
    setValue("studentNickname", student.nickname || "");
    setValue("studentId", student.id);
    setSearchResults([]);
    setActiveSearchField("");
    setSearchQuery("");
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
        `Successfully created ${data.numberOfCourses} blank course sessions for ${data.studentName}`
      );

      // Close dialog and reset form
      setIsOpen(false);
      reset();
      setSearchQuery("");
      setSearchResults([]);

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
                {...register("studentId", {
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
