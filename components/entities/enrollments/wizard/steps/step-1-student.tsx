"use client";

import { useState, useEffect, useCallback } from "react";
import { useDebounce } from "use-debounce";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Search, Trash2 } from "lucide-react";
import { searchStudents, checkStudentHasWipSession } from "@/lib/api";
import { Student } from "@/app/types/course.type";
import { showToast } from "@/lib/toast";
import type { StepPanelProps } from "../types";

interface Step1Props extends StepPanelProps {
  courseId?: number;
}

export function Step1Student({ data, onChange, onValidChange, courseId }: Step1Props) {
  // Local state for student rows
  const [rows, setRows] = useState<Student[]>(
    data.students && data.students.length > 0
      ? data.students.map((s) => ({
          id: s.id,
          name: s.name,
          nickname: s.nickname,
          studentId: s.studentId,
        }))
      : [{ id: "", name: "", nickname: "", studentId: "" }]
  );

  // Search state
  const [activeSearchIndex, setActiveSearchIndex] = useState(-1);
  const [activeSearchField, setActiveSearchField] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Student[]>([]);
  const [selectedMap, setSelectedMap] = useState<Record<number, boolean>>(() => {
    // Mark existing rows from draft as selected
    const map: Record<number, boolean> = {};
    if (data.students) {
      data.students.forEach((s, i) => {
        if (s.id) map[i] = true;
      });
    }
    return map;
  });

  const [debouncedQuery] = useDebounce(searchQuery, 300);

  // Search effect
  useEffect(() => {
    if (!debouncedQuery.trim() || activeSearchIndex < 0) {
      setSearchResults([]);
      return;
    }
    const doSearch = async () => {
      try {
        const results = await searchStudents(debouncedQuery, activeSearchField);
        setSearchResults(results);
      } catch {
        setSearchResults([]);
      }
    };
    doSearch();
  }, [debouncedQuery, activeSearchIndex, activeSearchField]);

  // Sync to parent + validate
  const syncToParent = useCallback(
    (updatedRows: Student[]) => {
      const validStudents = updatedRows.filter((r) => r.id && r.name);
      onChange({
        students: validStudents.map((s) => ({
          id: s.id,
          name: s.name,
          nickname: s.nickname,
          studentId: s.studentId,
        })),
      });
      onValidChange(validStudents.length > 0);
    },
    [onChange, onValidChange]
  );

  const handleSelectStudent = async (index: number, student: Student) => {
    // Check for duplicates
    const isDuplicate = rows.some(
      (r, i) => i !== index && r.id === student.id
    );
    if (isDuplicate) {
      showToast.error("This student is already added.");
      return;
    }

    // Check WIP session if courseId is available
    if (courseId) {
      try {
        const { hasWipSession } = await checkStudentHasWipSession(
          Number(student.id),
          courseId
        );
        if (hasWipSession) {
          showToast.error(
            `${student.name} is already enrolled in this course.`
          );
          return;
        }
      } catch {
        showToast.error("Failed to check enrollment status.");
        return;
      }
    }

    const updated = [...rows];
    updated[index] = { ...student };
    setRows(updated);
    setSelectedMap((prev) => ({ ...prev, [index]: true }));
    setSearchResults([]);
    setActiveSearchIndex(-1);
    setSearchQuery("");
    syncToParent(updated);
  };

  const handleSearch = (query: string, index: number, field: string) => {
    setActiveSearchIndex(index);
    setActiveSearchField(field);
    setSearchQuery(query);
    // Clear selection if user is editing
    setSelectedMap((prev) => ({ ...prev, [index]: false }));
  };

  const addRow = () => {
    const updated = [...rows, { id: "", name: "", nickname: "", studentId: "" }];
    setRows(updated);
  };

  const removeRow = (index: number) => {
    if (rows.length <= 1) return;
    const updated = rows.filter((_, i) => i !== index);
    setRows(updated);
    // Reindex selectedMap
    const newMap: Record<number, boolean> = {};
    updated.forEach((_, i) => {
      const oldIndex = i >= index ? i + 1 : i;
      if (selectedMap[oldIndex]) newMap[i] = true;
    });
    setSelectedMap(newMap);
    syncToParent(updated);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          Select Students
        </h3>
        <p className="text-sm text-muted-foreground">
          Search and select students to enroll in this course.
        </p>
      </div>

      {rows.map((row, index) => (
        <div
          key={index}
          className={
            index > 0
              ? "pt-4 border-t border-gray-200 space-y-3"
              : "space-y-3"
          }
        >
          {/* Student Name */}
          <div className="space-y-1 relative">
            <Label className="text-xs text-gray-500">Student Name</Label>
            <div className="relative">
              <Input
                value={row.name}
                placeholder="Search by name..."
                onChange={(e) => {
                  const updated = [...rows];
                  updated[index] = { ...updated[index], name: e.target.value };
                  setRows(updated);
                  handleSearch(e.target.value, index, "name");
                }}
                autoComplete="off"
                className="pr-10"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
            {activeSearchIndex === index &&
              activeSearchField === "name" &&
              searchResults.length > 0 && (
                <ul className="absolute z-10 bg-white border border-gray-200 shadow-[var(--shadow-md)] w-full rounded-lg mt-1 max-h-48 overflow-y-auto">
                  {searchResults.map((student) => (
                    <li
                      key={student.id}
                      onClick={() => handleSelectStudent(index, student)}
                      className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                    >
                      {student.name} ({student.nickname})
                    </li>
                  ))}
                </ul>
              )}
          </div>

          {/* Nickname */}
          <div className="space-y-1 relative">
            <Label className="text-xs text-gray-500">Nickname</Label>
            <div className="relative">
              <Input
                value={row.nickname}
                placeholder="Search by nickname..."
                onChange={(e) => {
                  const updated = [...rows];
                  updated[index] = {
                    ...updated[index],
                    nickname: e.target.value,
                  };
                  setRows(updated);
                  handleSearch(e.target.value, index, "nickname");
                }}
                autoComplete="off"
                className="pr-10"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
            {activeSearchIndex === index &&
              activeSearchField === "nickname" &&
              searchResults.length > 0 && (
                <ul className="absolute z-10 bg-white border border-gray-200 shadow-[var(--shadow-md)] w-full rounded-lg mt-1 max-h-48 overflow-y-auto">
                  {searchResults.map((student) => (
                    <li
                      key={student.id}
                      onClick={() => handleSelectStudent(index, student)}
                      className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                    >
                      {student.name} ({student.nickname})
                    </li>
                  ))}
                </ul>
              )}
          </div>

          {/* Student ID display */}
          <div className="space-y-1 relative">
            <Label className="text-xs text-gray-500">Student ID</Label>
            <div className="relative">
              <Input
                value={row.studentId || row.id}
                placeholder="Search by ID..."
                onChange={(e) => {
                  handleSearch(e.target.value, index, "id");
                }}
                autoComplete="off"
                className="pr-10"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
            {activeSearchIndex === index &&
              activeSearchField === "id" &&
              searchResults.length > 0 && (
                <ul className="absolute z-10 bg-white border border-gray-200 shadow-[var(--shadow-md)] w-full rounded-lg mt-1 max-h-48 overflow-y-auto">
                  {searchResults.map((student) => (
                    <li
                      key={student.id}
                      onClick={() => handleSelectStudent(index, student)}
                      className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                    >
                      {student.name} ({student.nickname})
                    </li>
                  ))}
                </ul>
              )}
          </div>

          {/* Selection indicator */}
          {selectedMap[index] && row.name && (
            <p className="text-xs text-green-600 font-medium">
              Selected: {row.name} ({row.nickname})
            </p>
          )}

          {index > 0 && (
            <div className="flex justify-end">
              <Button
                type="button"
                variant="ghost"
                className="text-red-500 p-1 h-auto hover:bg-red-50"
                onClick={() => removeRow(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        className="text-amber-500 border-amber-500 rounded-full text-sm px-4 py-1 h-auto"
        onClick={addRow}
      >
        <Plus className="h-3 w-3 mr-1" />
        Add Student
      </Button>
    </div>
  );
}
