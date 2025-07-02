import React from "react";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import Image from "next/image";
import Link from "next/link";
import { Student } from "@/app/types/student.type";

export default async function StudentDetail({
  student,
}: {
  student: Partial<Student>;
}) {
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

      <div className="space-y-3 flex-1">
        <div className="">
          <Label className="text-xs text-black block">Student IDE</Label>
          <Input
            value={student.id}
            readOnly
            className="bg-white border border-black"
          />
        </div>
        <div>
          <Label className="text-xs text-black block">Name</Label>
          <Input
            value={student.name}
            readOnly
            className="bg-white border border-black"
          />
        </div>
        <div>
          <Label className="text-xs text-black block">Nickname</Label>
          <Input
            value={student.nickname}
            readOnly
            className="bg-white border border-black"
          />
        </div>
        <div>
          <Label className="text-xs text-black block">Date of Birth</Label>
          <Input
            value="12 March 2008"
            readOnly
            className="bg-white border border-black"
          />
        </div>
        <div>
          <Label className="text-xs text-black block">Gender</Label>
          <Input
            value={student.gender}
            readOnly
            className="bg-white border border-black"
          />
        </div>
        <div>
          <Label className="text-xs text-black block">School</Label>
          <Input
            value={student.school}
            readOnly
            className="bg-white border border-black"
          />
        </div>
        <div>
          <Label className="text-xs text-black block">Allergic</Label>
          <Input
            value={student.allergic}
            readOnly
            className="bg-white border border-black"
          />
        </div>
        <div>
          <Label className="text-xs text-black block">Do not eat</Label>
          <Input
            value={student.doNotEat}
            readOnly
            className="bg-white border border-black"
          />
        </div>
        <div>
          <Label className="text-xs text-black block">Parent</Label>
          <Input
            value={student.parent ? student.parent : "No specified"}
            readOnly
            className="bg-white border border-black"
          />
        </div>
        <div className="flex items-start space-x-2 pt-2">
          <Checkbox
            id="photoUsage"
            checked={student.adConcent}
            className="mt-1"
          />
          <Label htmlFor="photoUsage" className="text-xs text-gray-700">
            Allow Kiddee Lab to use photo and video for advertisement.
          </Label>
        </div>
      </div>
    </div>
  );
}
