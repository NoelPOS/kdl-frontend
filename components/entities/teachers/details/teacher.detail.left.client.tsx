"use client";

import React, { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Teacher } from "@/app/types/teacher.type";
import {
  useUpdateTeacher,
  useDeleteTeacher,
} from "@/hooks/mutation/use-teacher-mutations";
import { showToast } from "@/lib/toast";

interface TeacherFormData {
  name: string;
  contactNo: string;
  email: string;
  address: string;
  lineId: string;
}

export default function TeacherDetailClient({
  teacher,
}: {
  teacher: Partial<Teacher>;
}) {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { mutate: updateTeacher, isPending: isUpdating } = useUpdateTeacher(
    Number(teacher.id || 0)
  );
  const { mutate: deleteTeacher, isPending: isDeleting } = useDeleteTeacher();
  const [imagePreview, setImagePreview] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TeacherFormData>({
    defaultValues: {
      name: teacher.name || "",
      contactNo: teacher.contactNo || "",
      email: teacher.email || "",
      address: teacher.address || "",
      lineId: teacher.lineId || "",
    },
  });

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

  const onSubmit = async (data: TeacherFormData) => {
    if (!teacher.id) {
      showToast.error("Teacher ID is required");
      return;
    }

    setIsUploading(true);

    let newImageUrl = teacher.profilePicture;
    let newProfileKey = teacher.profileKey;

    if (imageFile) {
      if (teacher.profileKey) {
        await fetch("/api/s3-delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: teacher.profileKey }),
        });
      }
      const getUrlRes = await fetch(
        `/api/s3-upload-url?fileName=${encodeURIComponent(
          imageFile.name
        )}&fileType=${encodeURIComponent(imageFile.type)}&folder=teachers`
      );
      if (getUrlRes.ok) {
        const { url } = await getUrlRes.json();
        const uploadRes = await fetch(url, {
          method: "PUT",
          headers: { "Content-Type": imageFile.type },
          body: imageFile,
        });
        if (uploadRes.ok) {
          newProfileKey = `teachers/${imageFile.name}`;
          newImageUrl = `https://${
            process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME
          }.s3.amazonaws.com/teachers/${encodeURIComponent(imageFile.name)}`;
        }
      }
    }

    setIsUploading(false);

    const updateData: Partial<Teacher> = {
      ...data,
      profilePicture: newImageUrl,
      profileKey: newProfileKey,
    };

    updateTeacher(updateData);
  };

  const handleDelete = () => {
    setIsDeleteDialogOpen(false);
    deleteTeacher(Number(teacher.id!), {
      onSuccess: () => {
        setTimeout(() => {
          router.push("/teachers");
        }, 1500);
      },
    });
  };

  return (
    <div className="w-80 p-4 flex flex-col bg-blue-50">
      <div className="mb-6">
        <nav className="flex items-center text-sm font-medium">
          <Link
            href="/teachers"
            className="text-gray-900 hover:underline text-2xl font-bold"
          >
            Teachers
          </Link>
          <span className="mx-2">&gt;</span>
          <span className="text-gray-900 text-2xl font-bold">
            {teacher.name}
          </span>
        </nav>
      </div>

      <div className="flex flex-col items-center mb-4">
        <div
          className="w-24 h-24 mb-2 flex items-center justify-center cursor-pointer"
          onClick={handleImageClick}
        >
          <Image
            src={imagePreview || teacher.profilePicture || "/default.png"}
            alt="teacher profile"
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
        <h2 className="text-blue-600 font-medium text-lg">{teacher.name}</h2>
        {teacher.role === "none" && (
          <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded mt-2">
            Deleted
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 flex-1">
        <div>
          <Label className="text-xs text-black block">Teacher ID</Label>
          <Input
            value={teacher.id}
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
          <Label className="text-xs text-black block">Phone</Label>
          <Input
            {...register("contactNo", {
              pattern: {
                value: /^\d+$/,
                message: "Phone number must contain only numbers",
              },
              minLength: {
                value: 8,
                message: "Phone number must be at least 8 digits",
              },
            })}
            className="bg-white border border-black"
          />
          {errors.contactNo && (
            <p className="text-red-500 text-xs mt-1">
              {errors.contactNo.message}
            </p>
          )}
        </div>

        <div>
          <Label className="text-xs text-black block">Email</Label>
          <Input
            {...register("email", {
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Invalid email address",
              },
            })}
            className="bg-white border border-black"
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <Label className="text-xs text-black block">Address</Label>
          <Input
            {...register("address")}
            className="bg-white border border-black"
          />
        </div>

        <div>
          <Label className="text-xs text-black block">Line ID</Label>
          <Input
            {...register("lineId", {
              pattern: {
                value: /^[a-zA-Z0-9_.-]+$/,
                message:
                  "Line ID can only contain letters, numbers, underscore, dot, and hyphen",
              },
            })}
            className="bg-white border border-black"
          />
          {errors.lineId && (
            <p className="text-red-500 text-xs mt-1">{errors.lineId.message}</p>
          )}
        </div>

        <div className="pt-4">
          <Button
            type="submit"
            disabled={isUploading || isUpdating || teacher.role === "none"}
            className="w-full bg-yellow-600 hover:bg-yellow-700 text-white mb-3"
          >
            {isUploading || isUpdating ? "Updating..." : "Update Teacher"}
          </Button>

          {teacher.role !== "none" && (
            <Button
              type="button"
              onClick={() => setIsDeleteDialogOpen(true)}
              disabled={isDeleting || isUploading || isUpdating}
              className="w-full bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? "Deleting..." : "Delete Teacher"}
            </Button>
          )}
        </div>
      </form>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Delete Teacher</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{teacher.name}</strong>? 
              This action will set their role to &apos;none&apos; and they will be marked as deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? "Deleting..." : "Delete Teacher"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
