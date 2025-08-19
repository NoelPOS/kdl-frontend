"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";

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

import { searchStudents } from "@/lib/api";

import { Student } from "@/app/types/course.type";

type FormData = {
  students: Student[];
};

interface AddStudentProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (students: Student[]) => void;
  onCancel?: () => void;
}

export function AddStudent({
  open,
  onOpenChange,
  onSubmit: afterStudent,
  onCancel,
}: AddStudentProps) {
  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      students: [
        {
          name: "",
          nickname: "",
          id: "",
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "students",
  });

  const [activeSearchIndex, setActiveSearchIndex] = useState<number>(-1);
  const [searchResults, setSearchResults] = useState<Student[]>([]);

  const handleSelectStudent = (index: number, student: Student) => {
    setValue(`students.${index}.name`, student.name);
    setValue(`students.${index}.nickname`, student.nickname);
    setValue(`students.${index}.id`, student.id);
    setSearchResults([]);
    setActiveSearchIndex(-1);
  };

  const handleSearch = async (query: string, index: number) => {
    setActiveSearchIndex(index);

    if (query.length >= 3) {
      try {
        const results = await searchStudents(query);
        setSearchResults(results);
      } catch (error) {
        console.error("Search failed", error);
        setSearchResults([]);
      }
    } else {
      setSearchResults([]);
    }
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

  const onSubmit = (data: FormData) => {
    // Validate that all students have required fields
    const isValid = data.students.every(
      (student) =>
        student.name !== "" && student.nickname !== "" && student.id !== ""
    );

    if (!isValid) {
      alert("Please fill in all required fields for all students.");
      return;
    }

    // reset({
    //   students: [
    //     {
    //       name: "",
    //       nickname: "",
    //       id: "",
    //     },
    //   ],
    // });
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
              {typeof window !== "undefined"
                ? new URLSearchParams(window.location.search).get("course")
                : null}
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
                          onChange={(e) => handleSearch(e.target.value, index)}
                          autoComplete="off"
                        />
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      </div>
                      {activeSearchIndex === index &&
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
                      <Input
                        {...register(`students.${index}.nickname` as const, {
                          required: "Nickname is required",
                        })}
                        placeholder="Jane"
                        className="border-gray-300 rounded-lg"
                      />
                    </div>

                    {/* ID */}
                    <div className="space-y-1">
                      <Label
                        htmlFor={`students.${index}.id`}
                        className="text-xs text-gray-500"
                      >
                        ID
                      </Label>
                      <Input
                        {...register(`students.${index}.id` as const, {
                          required: "Student ID is required",
                        })}
                        placeholder="202501001"
                        className="border-gray-300 rounded-lg"
                      />
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
                className="bg-blue-500 text-white hover:bg-blue-600 rounded-full flex-1"
              >
                Next
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default AddStudent;
