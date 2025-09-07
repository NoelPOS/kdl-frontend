"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { useDebounce } from "use-debounce";
import { showToast } from "@/lib/toast";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Search, Trash2 } from "lucide-react";

import { searchStudents, checkStudentHasWipSession } from "@/lib/api";

import { Student } from "@/app/types/course.type";
import { set } from "nprogress";

type FormData = {
  students: Student[];
};

interface AddStudentProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (students: Student[]) => void;
  onCancel?: () => void;
  courseId?: number; // Add course ID
}

export function AddStudent({
  open,
  onOpenChange,
  onSubmit: afterStudent,
  onCancel,
  courseId, // Add this
}: AddStudentProps) {
  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    defaultValues: {
      students: [
        {
          name: "",
          nickname: "",
          id: "",
          studentId: "",
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "students",
  });

  const [activeSearchIndex, setActiveSearchIndex] = useState<number>(-1);
  const [activeSearchField, setActiveSearchField] = useState<string>("");
  const [searchResults, setSearchResults] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudents, setSelectedStudents] = useState<
    Record<number, Student>
  >({});
  const [displayIds, setDisplayIds] = useState<Record<number, string>>({});

  // Debounce the search query
  const [debouncedSearchQuery] = useDebounce(searchQuery, 300);

  // Effect to handle debounced search
  useEffect(() => {
    const performSearch = async () => {
      if (debouncedSearchQuery.trim() && activeSearchIndex >= 0) {
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
  }, [debouncedSearchQuery, activeSearchIndex, activeSearchField]);

  const handleSelectStudent = (index: number, student: Student) => {
    setValue(`students.${index}.name`, student.name);
    setValue(`students.${index}.nickname`, student.nickname);
    setValue(`students.${index}.id`, student.id);
    setValue(`students.${index}.studentId`, student.studentId);

    // Set the display ID for showing studentId
    setDisplayIds((prev) => ({
      ...prev,
      [index]: student.studentId || student.id, // Show studentId if available, fallback to id
    }));

    setSearchResults([]);
    setActiveSearchIndex(-1);
    setActiveSearchField("");
    setSearchQuery("");

    setSelectedStudents((prev) => ({
      ...prev,
      [index]: student,
    }));
  };

  const handleSearch = (query: string, index: number, field: string) => {
    setActiveSearchIndex(index);
    setActiveSearchField(field);
    setSearchQuery(query);
  };

  const addStudent = () => {
    append({
      name: "",
      nickname: "",
      id: "",
    });
  };

  const removeStudent = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  const onSubmit = async (data: FormData) => {
    const hasAnyStudentData = data.students.some(
      (student) => student.name.trim() !== "" || student.nickname.trim() !== ""
    );

    if (!hasAnyStudentData) {
      showToast.error("Please add at least one student before proceeding.");
      return;
    }

    for (let i = 0; i < data.students.length; i++) {
      const current = data.students[i];
      const original = selectedStudents[i];

      // If something was typed but never selected
      if (!original && (current.name || current.nickname || current.id)) {
        showToast.error(
          "Please select students from the dropdown list. Manual input is not allowed."
        );
        return;
      }

      // If selected but modified afterwards
      if (
        original &&
        (current.name !== original.name ||
          current.nickname !== original.nickname ||
          current.id !== original.id)
      ) {
        showToast.error(
          "You modified a selected student. Please reselect from the dropdown."
        );
        return;
      }
    }

    // ✅ Duplicates check
    const studentIds = data.students.map((s) => s.id).filter(Boolean);
    const duplicateIds = studentIds.filter(
      (id, index) => studentIds.indexOf(id) !== index
    );
    if (duplicateIds.length > 0) {
      showToast.error(
        "Duplicate students found. Please remove duplicate entries."
      );
      return;
    }

    if (courseId) {
      try {
        const validStudents = data.students.filter((s) => s.id && s.name);
        const wipCheckPromises = validStudents.map(async (student) => {
          const { hasWipSession } = await checkStudentHasWipSession(
            Number(student.id),
            courseId
          );
          return { student, hasWipSession };
        });

        const wipCheckResults = await Promise.all(wipCheckPromises);
        const studentsWithWip = wipCheckResults.filter(
          (result) => result.hasWipSession
        );

        if (studentsWithWip.length > 0) {
          const studentNames = studentsWithWip
            .map((result) => result.student.name)
            .join(", ");
          showToast.error(
            ` ${studentNames} are already enrolled in this course.`
          );
          return;
        }
      } catch (error) {
        console.error("Error checking WIP sessions:", error);
        showToast.error(
          "Failed to check student enrollment status. Please try again."
        );
        return;
      }
    }

    showToast.success("Students added successfully!");
    if (afterStudent) {
      afterStudent(data.students);
    }
    onOpenChange(false);
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] p-0 rounded-3xl overflow-hidden max-h-[80vh] overflow-y-auto">
        <div className="bg-white p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              Add Students to Course
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
                    {/* Student Name (with search) */}
                    <div className="space-y-1 relative">
                      <Label
                        htmlFor={`students.${index}.studentName`}
                        className="text-xs text-gray-500"
                      >
                        Student name
                      </Label>
                      <div className="relative">
                        <Input
                          {...register(`students.${index}.name` as const, {
                            required: "Student name is required",
                          })}
                          placeholder="Jane Doe"
                          className="border-gray-300 rounded-lg pr-10"
                          onChange={(e) =>
                            handleSearch(e.target.value, index, "name")
                          }
                          autoComplete="off"
                        />
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      </div>
                      {activeSearchIndex === index &&
                        activeSearchField === "name" &&
                        searchResults.length > 0 && (
                          <ul className="absolute z-10 bg-white border border-gray-200 shadow w-full rounded mt-1 max-h-48 overflow-y-auto">
                            {searchResults.map((student) => (
                              <li
                                key={student.id}
                                onClick={() =>
                                  handleSelectStudent(index, student)
                                }
                                className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                              >
                                {student.name} ({student.nickname})
                              </li>
                            ))}
                          </ul>
                        )}
                    </div>

                    {/* Nickname */}
                    <div className="space-y-1">
                      <Label
                        htmlFor={`students.${index}.nickname`}
                        className="text-xs text-gray-500"
                      >
                        Nickname
                      </Label>
                      <div className="relative">
                        <Input
                          {...register(`students.${index}.nickname` as const, {
                            required: "Nickname is required",
                          })}
                          onChange={(e) =>
                            handleSearch(e.target.value, index, "nickname")
                          }
                          placeholder="Jane"
                          className="border-gray-300 rounded-lg"
                        />
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        {activeSearchIndex === index &&
                          activeSearchField === "nickname" &&
                          searchResults.length > 0 && (
                            <ul className="absolute z-10 bg-white border border-gray-200 shadow w-full rounded mt-1 max-h-48 overflow-y-auto">
                              {searchResults.map((student) => (
                                <li
                                  key={student.id}
                                  onClick={() =>
                                    handleSelectStudent(index, student)
                                  }
                                  className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                                >
                                  {student.name} ({student.nickname})
                                </li>
                              ))}
                            </ul>
                          )}
                      </div>
                    </div>

                    {/* ID */}
                    <div className="space-y-1">
                      <Label
                        htmlFor={`students.${index}.id`}
                        className="text-xs text-gray-500"
                      >
                        Student ID
                      </Label>
                      {/* Hidden input to maintain form registration */}
                      <input
                        type="hidden"
                        {...register(`students.${index}.id` as const, {
                          required: "Student ID is required",
                        })}
                      />
                      <div className="relative">
                        <Input
                          value={displayIds[index] || ""}
                          onChange={(e) => {
                            const value = e.target.value;
                            setDisplayIds((prev) => ({
                              ...prev,
                              [index]: value,
                            }));
                            handleSearch(value, index, "id");
                          }}
                          placeholder="202501001"
                          className="border-gray-300 rounded-lg"
                        />
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        {activeSearchIndex === index &&
                          activeSearchField === "id" &&
                          searchResults.length > 0 && (
                            <ul className="absolute z-10 bg-white border border-gray-200 shadow w-full rounded mt-1 max-h-48 overflow-y-auto">
                              {searchResults.map((student) => (
                                <li
                                  key={student.id}
                                  onClick={() =>
                                    handleSelectStudent(index, student)
                                  }
                                  className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                                >
                                  {student.name} ({student.nickname})
                                </li>
                              ))}
                            </ul>
                          )}
                      </div>
                    </div>

                    {index > 0 && (
                      <div className="flex justify-end">
                        <Button
                          type="button"
                          variant="ghost"
                          className="text-red-500 p-1 h-auto hover:bg-red-50"
                          onClick={() => removeStudent(index)}
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Add Student Button */}
              <div className="flex justify-start pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="text-amber-500 border-amber-500 rounded-full text-sm px-4 py-1 h-auto"
                  onClick={addStudent}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Student
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
                disabled={isSubmitting}
                className="bg-yellow-500 text-white hover:bg-yellow-600 rounded-full flex-1 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Checking...
                  </>
                ) : (
                  "Next"
                )}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default AddStudent;
