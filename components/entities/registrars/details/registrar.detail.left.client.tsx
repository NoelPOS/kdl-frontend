"use client";

import React, { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { Registrar } from "@/app/types/registrar.type";
import { updateRegistrarById } from "@/lib/api";

interface RegistrarFormData {
  name: string;
  email: string;
}

export default function RegistrarDetailClient({
  registrar,
}: {
  registrar: Partial<Registrar>;
}) {
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
  } = useForm<RegistrarFormData>({
    defaultValues: {
      name: registrar.name || "",
      email: registrar.email || "",
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

  const onSubmit = async (data: RegistrarFormData) => {
    if (!registrar.id) {
      setMessage({ type: "error", text: "Registrar ID is required" });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    let newImageUrl = registrar.profilePicture;
    let newProfileKey = registrar.profileKey;

    if (imageFile) {
      if (registrar.profileKey) {
        await fetch("/api/s3-delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: registrar.profileKey }),
        });
      }
      const getUrlRes = await fetch(
        `/api/s3-upload-url?fileName=${encodeURIComponent(
          imageFile.name
        )}&fileType=${encodeURIComponent(imageFile.type)}&folder=registrars`
      );
      if (getUrlRes.ok) {
        const { url } = await getUrlRes.json();
        const uploadRes = await fetch(url, {
          method: "PUT",
          headers: { "Content-Type": imageFile.type },
          body: imageFile,
        });
        if (uploadRes.ok) {
          newProfileKey = `registrars/${imageFile.name}`;
          newImageUrl = `https://${
            process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME
          }.s3.amazonaws.com/registrars/${encodeURIComponent(imageFile.name)}`;
        }
      }
    }

    try {
      const updateData: Partial<Registrar> = {
        ...data,
        profilePicture: newImageUrl,
        profileKey: newProfileKey,
      };

      await updateRegistrarById(Number(registrar.id), updateData);
      setMessage({ type: "success", text: "Registrar updated successfully!" });
    } catch (error) {
      console.error("Error updating registrar:", error);
      setMessage({
        type: "error",
        text: "Failed to update registrar. Please try again.",
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
            href="/registrars"
            className="text-gray-900 hover:underline text-2xl font-bold"
          >
            Registrars
          </Link>
          <span className="mx-2">&gt;</span>
          <span className="text-gray-900 text-2xl font-bold">
            {registrar.name}
          </span>
        </nav>
      </div>

      <div className="flex flex-col items-center mb-4">
        <div
          className="w-24 h-24 mb-2 flex items-center justify-center cursor-pointer"
          onClick={handleImageClick}
        >
          <Image
            src={imagePreview || registrar.profilePicture || "/student.png"}
            alt="registrar profile"
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
        <h2 className="text-blue-600 font-medium text-lg">{registrar.name}</h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 flex-1">
        <div>
          <Label className="text-xs text-black block">Registrar ID</Label>
          <Input
            value={registrar.id}
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
            {isLoading ? "Updating..." : "Update Registrar"}
          </Button>
        </div>
      </form>
    </div>
  );
}
