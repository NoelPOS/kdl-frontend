"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User, MapPin } from "lucide-react";
import { Course, TeacherData } from "@/app/types/course.type";
import { getTeacherByCourseId } from "@/lib/axio";

const ROOM_OPTIONS = [
  { value: "Room 1", label: "Room 1" },
  { value: "Room 2", label: "Room 2" },
  { value: "Room 3", label: "Room 3" },
  { value: "Room 4", label: "Room 4" },
  { value: "Room 5", label: "Room 5" },
];

interface PackageTeacherSelectionProps {
  course: Course;
  onTeacherSelected: (teacher: TeacherData) => void;
  onBack: () => void;
  onCancel: () => void;
}

export function PackageTeacherSelection({
  course,
  onTeacherSelected,
  onBack,
  onCancel,
}: PackageTeacherSelectionProps) {
  const [teachers, setTeachers] = useState<{ id: number; name: string }[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [room, setRoom] = useState("");
  const [remark, setRemark] = useState("");
  const [loading, setLoading] = useState(true);

  // Load teachers for the selected course
  useEffect(() => {
    const loadTeachers = async () => {
      try {
        setLoading(true);
        const teacherList = await getTeacherByCourseId(course.id);
        setTeachers(teacherList);
      } catch (error) {
        console.error("Failed to load teachers:", error);
      } finally {
        setLoading(false);
      }
    };

    loadTeachers();
  }, [course.id]);

  const handleTeacherSelect = (teacher: { id: number; name: string }) => {
    setSelectedTeacher(teacher);
  };

  const handleNext = () => {
    if (!selectedTeacher || !room.trim()) {
      alert("Please select a teacher and enter a room.");
      return;
    }

    const teacherData: TeacherData = {
      teacher: selectedTeacher.name,
      teacherId: selectedTeacher.id,
      room: room.trim(),
      remark: remark.trim(),
    };

    onTeacherSelected(teacherData);
  };

  const isValid = () => {
    return selectedTeacher && room.trim().length > 0;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <p className="text-sm text-gray-600">Loading teachers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Teacher Selection */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900 flex items-center gap-2">
          <User className="h-4 w-4" />
          Available Teachers
        </h4>

        {teachers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No teachers available for this course
          </div>
        ) : (
          <div className="grid gap-3">
            {teachers.map((teacher) => (
              <button
                key={teacher.id}
                type="button"
                onClick={() => handleTeacherSelect(teacher)}
                className={`
                  p-4 rounded-lg border text-left transition-colors
                  ${
                    selectedTeacher?.id === teacher.id
                      ? "bg-green-50 border-green-300 text-green-900"
                      : "bg-white border-gray-200 hover:bg-gray-50"
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <div className="font-medium">{teacher.name}</div>
                  {selectedTeacher?.id === teacher.id && (
                    <div className="text-green-600 text-sm font-medium">
                      Selected
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Room Input */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900 flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          Session Details
        </h4>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="room">Room *</Label>
            <Select value={room} onValueChange={setRoom}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a room" />
              </SelectTrigger>
              <SelectContent>
                {ROOM_OPTIONS.map((roomOption) => (
                  <SelectItem key={roomOption.value} value={roomOption.value}>
                    {roomOption.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="remark">Remark</Label>
            <textarea
              id="remark"
              value={remark}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setRemark(e.target.value)
              }
              placeholder="Any special instructions or remarks..."
              className="w-full p-2 border border-gray-300 rounded-md resize-none"
              rows={3}
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Button variant="outline" onClick={onBack} className="flex-1">
          Back
        </Button>
        <Button variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button
          onClick={handleNext}
          disabled={!isValid()}
          className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white"
        >
          Next: Confirm
        </Button>
      </div>
    </div>
  );
}
