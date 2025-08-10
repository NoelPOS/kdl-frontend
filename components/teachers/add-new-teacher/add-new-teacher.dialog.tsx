"use client";
import { useForm, useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Search, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import {
  addNewTeacher,
  searchCourses,
  assignCoursesToTeacher,
} from "@/lib/axio";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Course } from "@/app/types/course.type";

export type TeacherFormData = {
  name: string;
  email: string;
  contactNo: string;
  lineId: string;
  address: string;
  profilePicture: string;
  courses: Pick<Course, "id" | "title">[];
};

export default function AddNewTeacher() {
  const closeRef = useRef<HTMLButtonElement>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [activeSearchIndex, setActiveSearchIndex] = useState<number>(-1);
  const [searchResults, setSearchResults] = useState<Course[]>([]);

  const { register, handleSubmit, setValue, control } =
    useForm<TeacherFormData>({
      defaultValues: {
        name: "",
        email: "",
        contactNo: "",
        lineId: "",
        address: "",
        profilePicture: "",
        courses: [
          {
            id: 0,
            title: "",
          },
        ],
      },
    });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "courses",
  });

  const router = useRouter();

  const onSubmit = async (data: TeacherFormData) => {
    console.log("adding...");
    let imageUrl = "";
    let key = "";
    if (imageFile) {
      // 1. Get a pre-signed S3 upload URL from the backend
      const getUrlRes = await fetch(
        `/api/s3-upload-url?fileName=${encodeURIComponent(
          imageFile.name
        )}&fileType=${encodeURIComponent(imageFile.type)}&folder=teachers`
      );
      if (!getUrlRes.ok) {
        // handle error (show message, etc.)
        return;
      }
      const { url } = await getUrlRes.json();
      // 2. Upload the file directly to S3 using the pre-signed URL
      const uploadRes = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": imageFile.type },
        body: imageFile,
      });
      if (!uploadRes.ok) {
        console.log(uploadRes);
        return;
      }
      key = `teachers/${imageFile.name}`;
      // 3. Construct the S3 file URL (assuming public bucket)
      imageUrl = `https://${
        process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME
      }.s3.amazonaws.com/teachers/${encodeURIComponent(imageFile.name)}`;

      // console.log(imageUrl);
    }
    try {
      // First, create the teacher without courses
      const teacherData = {
        name: data.name,
        email: data.email,
        contactNo: data.contactNo,
        lineId: data.lineId,
        address: data.address,
        profilePicture: imageUrl,
        profileKey: key,
      };

      console.log(teacherData);
      const newTeacher = await addNewTeacher(teacherData);
      // Then, assign courses to the teacher if any courses are selected
      const selectedCourses = data.courses.filter((course) => course.id > 0);
      if (selectedCourses.length > 0) {
        const courseIds = selectedCourses.map((course) => course.id);
        await assignCoursesToTeacher(newTeacher.id, courseIds);
      }
      closeRef.current?.click();
      router.refresh();
    } catch (error) {
      console.error("Error creating teacher or assigning courses:", error);
    }
  };

  const handleSelectCourse = (index: number, course: Course) => {
    setValue(`courses.${index}.id`, course.id);
    setValue(`courses.${index}.title`, course.title);
    setSearchResults([]);
    setActiveSearchIndex(-1);
  };

  const handleSearch = async (query: string, index: number) => {
    setActiveSearchIndex(index);

    if (query.length >= 3) {
      try {
        const results = await searchCourses(query);
        setSearchResults(results);
      } catch (error) {
        console.error("Search failed", error);
        setSearchResults([]);
      }
    } else {
      setSearchResults([]);
    }
  };

  const addCourse = () => {
    append({
      id: 0,
      title: "",
    });
  };

  const removeCourse = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  const onImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          New
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px] p-8 max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Add New Teacher
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 gap-y-4">
            <div className="flex flex-col gap-2 items-center">
              {imagePreview && (
                <Image
                  src={imagePreview}
                  alt="Profile Preview"
                  className="w-24 h-24 rounded-full object-cover border border-gray-300 mb-2"
                  width={96}
                  height={96}
                />
              )}
              <Input type="file" accept="image/*" onChange={onImageChange} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="Enter teacher name"
                className="border-black "
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                {...register("email")}
                placeholder="Enter email"
                className="border-black "
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="contactNo">Contact No</Label>
              <Input
                id="contactNo"
                {...register("contactNo")}
                placeholder="Enter contact number"
                className="border-black "
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="lineId">Line ID</Label>
              <Input
                id="lineId"
                {...register("lineId")}
                placeholder="Enter Line ID"
                className="border-black "
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                {...register("address")}
                placeholder="Enter address"
                className="border-black "
              />
            </div>

            {/* Courses Section */}
            <div className="flex flex-col gap-4">
              <Label className="text-lg font-semibold">Courses</Label>
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className={`p-4 border rounded-lg ${
                    index > 0 ? "border-t border-gray-200" : ""
                  }`}
                >
                  <div className="space-y-4">
                    {/* Course Name (with search) */}
                    <div className="space-y-1 relative">
                      <Label
                        htmlFor={`courses.${index}.title`}
                        className="text-xs text-gray-500"
                      >
                        Course name
                      </Label>
                      <div className="relative">
                        <Input
                          {...register(`courses.${index}.title` as const)}
                          placeholder="Tinkamo"
                          className="border-gray-300 rounded-lg pr-10"
                          onChange={(e) => handleSearch(e.target.value, index)}
                          autoComplete="off"
                        />
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      </div>
                      {activeSearchIndex === index &&
                        searchResults.length > 0 && (
                          <ul className="absolute z-10 bg-white border border-gray-200 shadow w-full rounded mt-1 max-h-48 overflow-y-auto">
                            {searchResults.map((course) => (
                              <li
                                key={course.id}
                                onClick={() =>
                                  handleSelectCourse(index, course)
                                }
                                className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                              >
                                {course.title}
                              </li>
                            ))}
                          </ul>
                        )}
                    </div>

                    {index > 0 && (
                      <div className="flex justify-end">
                        <Button
                          type="button"
                          variant="ghost"
                          className="text-red-500 p-1 h-auto hover:bg-red-50"
                          onClick={() => removeCourse(index)}
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Add Course Button */}
              <div className="flex justify-start">
                <Button
                  type="button"
                  variant="outline"
                  className="text-amber-500 border-amber-500 rounded-full text-sm px-4 py-1 h-auto"
                  onClick={addCourse}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Course
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter className="flex justify-end gap-2 mt-8">
            <DialogClose asChild>
              <Button
                ref={closeRef}
                type="button"
                variant="outline"
                className="text-red-600 border-red-600 hover:bg-red-500 hover:text-white rounded-2xl w-[5rem]"
              >
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              className="bg-green-500 text-white hover:bg-green-400 rounded-2xl w-[5rem]"
            >
              Add
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
