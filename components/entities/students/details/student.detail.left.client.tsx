"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useDebounce } from "use-debounce";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { Search } from "lucide-react";
import { Student } from "@/app/types/student.type";
import { Parent } from "@/app/types/parent.type";
import { useSearchParents } from "@/hooks/query/use-parents";
import { useUpdateStudent } from "@/hooks/mutation/use-student-mutations";
import { useRef } from "react";
import { useRouter } from "next/navigation";
import { Calendar22 } from "@/components/shared/schedule/date-picker";

interface StudentFormData {
  id: string;
  name: string;
  nickname: string;
  dob: string;
  gender: string;
  school: string;
  allergic: string;
  doNotEat: string;
  parent: string;
  nationalId: string;
  adConcent: boolean;
}

interface StudentDetailClientProps {
  student: Partial<Student>;
  onStudentUpdate?: (updatedStudent: Partial<Student>) => void;
}

export default function StudentDetailClient({
  student,
  onStudentUpdate,
}: StudentDetailClientProps) {
  console.log("Student is here", student)
  const router = useRouter();
  const [localStudent, setLocalStudent] = useState<Partial<Student>>(student);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const { mutate: updateStudent, isPending: isUpdating } = useUpdateStudent(
    Number(localStudent.id || 0)
  );
  const [imagePreview, setImagePreview] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parent search states
  const [selectedParent, setSelectedParent] = useState<Parent | null>(null);
  const [parentQuery, setParentQuery] = useState(localStudent.parent || "");
  const [showParentResults, setShowParentResults] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false); // Track user interaction
  const [debouncedParentQuery] = useDebounce(parentQuery, 300);

  // Use the search parents hook
  const { data: parentSearchResults = [] } = useSearchParents(
    debouncedParentQuery,
    { enabled: hasUserInteracted && debouncedParentQuery.length >= 2 }
  );

  // Update show results based on search results
  useEffect(() => {
    if (hasUserInteracted && debouncedParentQuery.length >= 2 && parentSearchResults.length > 0) {
      setShowParentResults(true);
    } else {
      setShowParentResults(false);
      if (debouncedParentQuery.length === 0) {
        setSelectedParent(null);
      }
    }
  }, [debouncedParentQuery, parentSearchResults, hasUserInteracted]);

  // Update parent query when localStudent changes
  useEffect(() => {
    setParentQuery(localStudent.parent || "");
  }, [localStudent.parent]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<StudentFormData>({
    defaultValues: {
      id: localStudent.id,
      name: localStudent.name || "",
      nickname: localStudent.nickname || "",
      dob: localStudent.dob || "",
      gender: localStudent.gender || "",
      school: localStudent.school || "",
      allergic: Array.isArray(localStudent.allergic)
        ? localStudent.allergic.join(", ")
        : "",
      doNotEat: Array.isArray(localStudent.doNotEat)
        ? localStudent.doNotEat.join(", ")
        : "",
      parent: localStudent.parent || "",
      nationalId: localStudent.nationalId || "",
      adConcent: localStudent.adConcent || false,
    },
  });

  // Update local state when student prop changes
  useEffect(() => {
    setLocalStudent(student);
    reset({
      id: student.id,
      name: student.name || "",
      nickname: student.nickname || "",
      dob: student.dob || "",
      gender: student.gender || "",
      school: student.school || "",
      allergic: Array.isArray(student.allergic)
        ? student.allergic.join(", ")
        : "",
      doNotEat: Array.isArray(student.doNotEat)
        ? student.doNotEat.join(", ")
        : "",
      parent: student.parent || "",
      nationalId: student.nationalId || "",
      adConcent: student.adConcent || false,
    });
  }, [student, reset]);

  const adConcentValue = watch("adConcent");

  // Parent search handlers
  const handleParentSearch = (query: string) => {
    setHasUserInteracted(true); // Mark that user has interacted
    setParentQuery(query);
    setValue("parent", query);
  };

  const handleSelectParent = (parent: Parent) => {
    console.log("Selecting parent:", parent.name); // Debug log
    setSelectedParent(parent);
    setParentQuery(parent.name); // Update the controlled input state
    setValue("parent", parent.name); // Update the form state
    setShowParentResults(false);
  };

  const handleParentInputBlur = () => {
    // Delay hiding results to allow click events on dropdown items to fire
    setTimeout(() => {
      setShowParentResults(false);
    }, 300); // Increased delay to ensure click events work
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const onSubmit = async (data: StudentFormData) => {
    if (!localStudent.id) return;

    setIsUploading(true);
    setMessage(null);

    let newImageUrl = localStudent.profilePicture;
    let newProfileKey = localStudent.profileKey;

    // If a new image is selected, delete the old one and upload the new one
    if (imageFile) {
      // 1. Delete old image from S3 if key exists
      if (localStudent.profileKey) {
        await fetch("/api/s3-delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: localStudent.profileKey }),
        });
      }
      // 2. Upload new image to S3
      const getUrlRes = await fetch(
        `/api/s3-upload-url?fileName=${encodeURIComponent(
          imageFile.name
        )}&fileType=${encodeURIComponent(imageFile.type)}&folder=students`
      );
      if (getUrlRes.ok) {
        const { url } = await getUrlRes.json();
        const uploadRes = await fetch(url, {
          method: "PUT",
          headers: { "Content-Type": imageFile.type },
          body: imageFile,
        });
        if (uploadRes.ok) {
          newProfileKey = `students/${imageFile.name}`;
          newImageUrl = `https://${
            process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME
          }.s3.amazonaws.com/students/${encodeURIComponent(imageFile.name)}`;
        }
      }
    }

    setIsUploading(false);

    const { parent, ...rest } = data;
    const updateData: Partial<Student> = {
      ...rest,
      allergic: data.allergic
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      doNotEat: data.doNotEat
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      profilePicture: newImageUrl,
      profileKey: newProfileKey,
      parentId: selectedParent ? selectedParent.id : undefined,
    };
    console.log("Update Data is here", updateData);

    // Create optimistic update data
    const optimisticUpdate: Partial<Student> = {
      ...localStudent,
      ...updateData,
      parent: selectedParent ? selectedParent.name : data.parent,
    };

    updateStudent(updateData, {
      onSuccess: () => {
        // Update local state immediately
        setLocalStudent(optimisticUpdate);
        setImageFile(null);
        setImagePreview("");
        if (onStudentUpdate) {
          onStudentUpdate(optimisticUpdate);
        }
        router.refresh();
      },
    });
  };

  return (
    <div className="w-80 p-4 flex flex-col bg-blue-50">
      <div className="mb-6">
        <nav className="flex items-center text-sm font-medium">
          <Link
            href="/students"
            className="text-gray-900 hover:underline text-2xl font-bold"
          >
            Students
          </Link>
          <span className="mx-2">&gt;</span>
          <span className="text-gray-900 text-2xl font-bold">
            {localStudent.nickname}
          </span>
        </nav>
      </div>

      <div className="flex flex-col items-center mb-4">
        <div
          className="w-24 h-24 mb-2 flex items-center justify-center cursor-pointer"
          onClick={handleImageClick}
        >
          <Image
            src={imagePreview || localStudent.profilePicture || "/student.png"}
            alt="student profile"
            width={90}
            height={90}
            className="rounded-full object-cover"
          />
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleImageChange}
          />
        </div>
        <h2 className="text-amber-500 font-medium text-lg">
          {localStudent.nickname}
        </h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 flex-1">
        <div className="">
          <Label className="text-xs text-black block">Student ID</Label>
          <Input
            value={localStudent.studentId}
            readOnly
            className="bg-gray-100 border border-black"
          />
        </div>

        <div>
          <Label className="text-xs text-black block">Name</Label>
          <Input
            {...register("name", { required: "Name is required" })}
            className="bg-white border border-black"
          />
          {errors.name && (
            <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <Label className="text-xs text-black block">Nickname</Label>
          <Input
            {...register("nickname", { required: "Nickname is required" })}
            className="bg-white border border-black"
          />
          {errors.nickname && (
            <p className="text-red-500 text-xs mt-1">
              {errors.nickname.message}
            </p>
          )}
        </div>

        <div>
          <Label className="text-xs text-black block">Date of Birth</Label>
          <div {...register("dob", { 
            required: "Date of birth is required",
            validate: (value) => {
              if (!value) return "Date of birth is required";
              const birthDate = new Date(value);
              const today = new Date();
              const age = today.getFullYear() - birthDate.getFullYear();
              if (age < 0 || age > 100) {
                return "Please enter a valid date of birth";
              }
              if (birthDate > today) {
                return "Date of birth cannot be in the future";
              }
              return true;
            }
          })}>
            <Calendar22
              date={watch("dob") ? new Date(watch("dob")) : undefined}
              onChange={(date) => {
                setValue("dob", date ? date.toLocaleDateString("en-CA") : "");
              }}
            />
          </div>
          {errors.dob && (
            <p className="text-red-500 text-xs mt-1">{errors.dob.message}</p>
          )}
        </div>

        <div>
          <Label className="text-xs text-black block">Gender</Label>
          <select
            {...register("gender")}
            className="bg-white border border-black w-full px-3 py-2 text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>

        <div>
          <Label className="text-xs text-black block">School</Label>
          <Input
            {...register("school")}
            className="bg-white border border-black"
          />
        </div>

        <div>
          <Label className="text-xs text-black block">National ID</Label>
          <Input
            {...register("nationalId", {
              pattern: {
                value: /^\d{13}$/,
                message: "National ID must be exactly 13 digits",
              },
            })}
            className="bg-white border border-black"
            placeholder="Enter 13-digit national ID"
          />
          {errors.nationalId && (
            <p className="text-red-500 text-xs mt-1">
              {errors.nationalId.message}
            </p>
          )}
        </div>

        <div>
          <Label className="text-xs text-black block">
            Allergic (comma-separated)
          </Label>
          <Input
            {...register("allergic")}
            className="bg-white border border-black"
            placeholder="e.g., nuts, dairy, eggs"
          />
        </div>

        <div>
          <Label className="text-xs text-black block">
            Do not eat (comma-separated)
          </Label>
          <Input
            {...register("doNotEat")}
            className="bg-white border border-black"
            placeholder="e.g., spicy food, seafood"
          />
        </div>

        <div>
          <Label className="text-xs text-black block">Parent</Label>
          <div className="relative">
            <Input
              placeholder="Search for parent..."
              value={parentQuery}
              onChange={(e) => handleParentSearch(e.target.value)}
              onFocus={() => setHasUserInteracted(true)}
              onBlur={handleParentInputBlur}
              className="bg-white border border-black pr-10"
            />
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />

            {/* Search Results Dropdown */}
            {showParentResults && parentSearchResults.length > 0 && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                {parentSearchResults.map((parent) => (
                  <div
                    key={parent.id}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                    onClick={() => handleSelectParent(parent)}
                  >
                    <div className="font-medium">{parent.name}</div>
                  </div>
                ))}
              </div>
            )}

            {/* No Results Message */}
            {showParentResults &&
              debouncedParentQuery.length >= 2 &&
              parentSearchResults.length === 0 && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg">
                  <div className="px-4 py-2 text-sm text-gray-500">
                    No parents found for &quot;{debouncedParentQuery}&quot;
                  </div>
                </div>
              )}
          </div>
        </div>

        <div className="flex items-start space-x-2 pt-2">
          <Checkbox
            id="photoUsage"
            checked={adConcentValue}
            onCheckedChange={(checked) =>
              setValue("adConcent", checked as boolean)
            }
            className="mt-1"
          />
          <Label htmlFor="photoUsage" className="text-xs text-gray-700">
            Allow Kiddee Lab to use photo and video for advertisement.
          </Label>
        </div>

        {message && (
          <div
            className={`p-2 text-xs rounded ${
              message.type === "success"
                ? "bg-blue-100 text-blue-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="pt-4">
          <Button
            type="submit"
            disabled={isUploading || isUpdating}
            className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
          >
            {isUploading || isUpdating ? "Updating..." : "Update Student"}
          </Button>
        </div>
      </form>
    </div>
  );
}

// if we update here directly, we can always click udpate or wrongly click and make unnecessary api request right? how about I keep this inputs readonly and then when clicked update student, I will open a dialog and I will do the edit there. in that way, it's better right? for the dialog copy exactly the same.
