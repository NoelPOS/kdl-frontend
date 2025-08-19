"use client";

import React, { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { Parent } from "@/app/types/parent.type";
import { updateParentById } from "@/lib/api";

interface ParentFormData {
  name: string;
  phone: string;
  email: string;
  address: string;
  lineId: string;
}

export default function ParentDetailClient({
  parent,
}: {
  parent: Partial<Parent>;
}) {
  //   console.log("ParentDetailClient", parent);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ParentFormData>({
    defaultValues: {
      name: parent.name || "",
      phone: parent.contactNo || "",
      email: parent.email || "",
      address: parent.address || "",
      lineId: parent.lineId || "",
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

  const onSubmit = async (data: ParentFormData) => {
    if (!parent.id) {
      setMessage({ type: "error", text: "Parent ID is required" });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    let newImageUrl = parent.profilePicture;
    let newProfileKey = parent.profileKey;

    if (imageFile) {
      if (parent.profileKey) {
        await fetch("/api/s3-delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: parent.profileKey }),
        });
      }
      const getUrlRes = await fetch(
        `/api/s3-upload-url?fileName=${encodeURIComponent(
          imageFile.name
        )}&fileType=${encodeURIComponent(imageFile.type)}&folder=parents`
      );
      if (getUrlRes.ok) {
        const { url } = await getUrlRes.json();
        const uploadRes = await fetch(url, {
          method: "PUT",
          headers: { "Content-Type": imageFile.type },
          body: imageFile,
        });
        if (uploadRes.ok) {
          newProfileKey = `parents/${imageFile.name}`;
          newImageUrl = `https://${
            process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME
          }.s3.amazonaws.com/parents/${encodeURIComponent(imageFile.name)}`;
        }
      }
    }

    try {
      const updateData: Partial<Parent> = {
        ...data,
        profilePicture: newImageUrl,
        profileKey: newProfileKey,
      };

      await updateParentById(Number(parent.id), updateData);
      setMessage({ type: "success", text: "Parent updated successfully!" });
    } catch (error) {
      console.error("Error updating parent:", error);
      setMessage({
        type: "error",
        text: "Failed to update parent. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-80 p-4 flex flex-col bg-blue-50">
      <div className="mb-6">
        <nav className="flex items-center text-sm font-medium">
          <Link
            href="/parents"
            className="text-gray-900 hover:underline text-2xl font-bold"
          >
            Parents
          </Link>
          <span className="mx-2">&gt;</span>
          <span className="text-gray-900 text-2xl font-bold">
            {parent.name}
          </span>
        </nav>
      </div>

      <div className="flex flex-col items-center mb-4">
        <div
          className="w-24 h-24 mb-2 flex items-center justify-center cursor-pointer"
          onClick={handleImageClick}
        >
          <Image
            src={imagePreview || parent.profilePicture || "/student.png"}
            alt="parent profile"
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
        <h2 className="text-blue-600 font-medium text-lg">{parent.name}</h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 flex-1">
        <div>
          <Label className="text-xs text-black block">Parent ID</Label>
          <Input
            value={parent.id}
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
            {...register("phone")}
            className="bg-white border border-black"
          />
        </div>

        <div>
          <Label className="text-xs text-black block">Email</Label>
          <Input
            {...register("email")}
            className="bg-white border border-black"
          />
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
            {...register("lineId")}
            className="bg-white border border-black"
          />
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
            disabled={isLoading}
            className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
          >
            {isLoading ? "Updating..." : "Update Parent"}
          </Button>
        </div>
      </form>
    </div>
  );
}
