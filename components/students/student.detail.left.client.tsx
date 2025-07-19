"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import Image from "next/image";
import Link from "next/link";
import { Student } from "@/app/types/student.type";
import { updateStudentById } from "@/lib/axio";

interface StudentFormData {
  name: string;
  nickname: string;
  gender: string;
  school: string;
  allergic: string;
  doNotEat: string;
  parent: string;
  adConcent: boolean;
}

export default function StudentDetailClient({
  student,
}: {
  student: Partial<Student>;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<StudentFormData>({
    defaultValues: {
      name: student.name || "",
      nickname: student.nickname || "",
      gender: student.gender || "",
      school: student.school || "",
      allergic: Array.isArray(student.allergic)
        ? student.allergic.join(", ")
        : "",
      doNotEat: Array.isArray(student.doNotEat)
        ? student.doNotEat.join(", ")
        : "",
      adConcent: student.adConcent || false,
    },
  });

  const adConcentValue = watch("adConcent");

  const onSubmit = async (data: StudentFormData) => {
    if (!student.id) {
      setMessage({ type: "error", text: "Student ID is required" });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const updateData: Partial<Student> = {
        ...data,
        allergic: data.allergic
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        doNotEat: data.doNotEat
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      };

      await updateStudentById(Number(student.id), updateData);
      setMessage({ type: "success", text: "Student updated successfully!" });
    } catch (error) {
      console.error("Error updating student:", error);
      setMessage({
        type: "error",
        text: "Failed to update student. Please try again.",
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
            href="/students"
            className="text-gray-900 hover:underline text-2xl font-bold"
          >
            Students
          </Link>
          <span className="mx-2">&gt;</span>
          <span className="text-gray-900 text-2xl font-bold">
            {student.nickname}
          </span>
        </nav>
      </div>

      <div className="flex flex-col items-center mb-4">
        <div className="relative w-24 h-24 mb-2">
          <Image
            src="/student.png"
            alt="student profile"
            width={96}
            height={96}
            className="rounded-full object-cover"
          />
        </div>
        <h2 className="text-amber-500 font-medium text-lg">
          {student.nickname}
        </h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 flex-1">
        <div className="">
          <Label className="text-xs text-black block">Student ID</Label>
          <Input
            value={student.id}
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
          <Input
            value="12 March 2008"
            readOnly
            className="bg-gray-100 border border-black"
          />
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

        {/* <div>
          <Label className="text-xs text-black block">Parent</Label>
          <Input
            {...register('parent')}
            className="bg-white border border-black"
          />
        </div> */}

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
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="pt-4">
          <Button
            type="submit"
            disabled={isLoading || !isDirty}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isLoading ? "Updating..." : "Update Student"}
          </Button>
        </div>
      </form>
    </div>
  );
}
