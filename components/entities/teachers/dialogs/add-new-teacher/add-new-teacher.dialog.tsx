"use client";
import { useForm, useFieldArray } from "react-hook-form";
import { showToast } from "@/lib/toast";
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
} from "@/lib/api";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Course } from "@/app/types/course.type";

export type TeacherFormData = {
  name: string;
  email: string;
  contactNo: string;
  lineId: string;
  address: string;
  password: string;
  confirmPassword: string;
  profilePicture: string;
  courses: Pick<Course, "id" | "title">[];
};

export default function AddNewTeacher() {
  const closeRef = useRef<HTMLButtonElement>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [activeSearchIndex, setActiveSearchIndex] = useState<number>(-1);
  const [searchResults, setSearchResults] = useState<Course[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<TeacherFormData>({
    defaultValues: {
      name: "",
      email: "",
      contactNo: "",
      lineId: "",
      address: "",
      password: "",
      confirmPassword: "",
      profilePicture: "",
      courses: [
        {
          id: 0,
          title: "",
        },
      ],
    },
    mode: "onSubmit",
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "courses",
  });

  const router = useRouter();

  const onSubmit = async (data: TeacherFormData) => {
    let imageUrl = "";
    let key = "";
    try {
      let toastId: string | number | undefined;
      if (imageFile) {
        toastId = showToast.loading("Uploading image...");
        const getUrlRes = await fetch(
          `/api/s3-upload-url?fileName=${encodeURIComponent(
            imageFile.name
          )}&fileType=${encodeURIComponent(imageFile.type)}&folder=teachers`
        );
        if (!getUrlRes.ok) {
          showToast.dismiss(toastId);
          showToast.error("Failed to get upload URL");
          return;
        }
        const { url } = await getUrlRes.json();
        const uploadRes = await fetch(url, {
          method: "PUT",
          headers: { "Content-Type": imageFile.type },
          body: imageFile,
        });
        if (!uploadRes.ok) {
          showToast.dismiss(toastId);
          showToast.error("Image upload failed");
          return;
        }
        key = `teachers/${imageFile.name}`;
        imageUrl = `https://${
          process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME
        }.s3.amazonaws.com/teachers/${encodeURIComponent(imageFile.name)}`;
        showToast.dismiss(toastId);
        showToast.success("Image uploaded");
      }
      toastId = showToast.loading("Creating teacher...");
      const teacherData = {
        name: data.name,
        email: data.email,
        contactNo: data.contactNo,
        lineId: data.lineId,
        address: data.address,
        password: data.password,
        profilePicture: imageUrl,
        profileKey: key,
      };
      // console.log("Creating teacher with data:", teacherData);
      const newTeacher = await addNewTeacher(teacherData);
      showToast.dismiss(toastId);
      showToast.success("Teacher created successfully");
      const selectedCourses = data.courses.filter((course) => course.id > 0);
      if (selectedCourses.length > 0) {
        toastId = showToast.loading("Assigning courses...");
        const courseIds = selectedCourses.map((course) => course.id);
        await assignCoursesToTeacher(newTeacher.id, courseIds);
        showToast.dismiss(toastId);
        showToast.success("Courses assigned");
      }
      closeRef.current?.click();
      router.refresh();
    } catch (error) {
      showToast.dismiss();
      const errorMsg =
        typeof error === "object" && error && "message" in error
          ? (error as any).message
          : String(error);
      showToast.error("Error creating teacher or assigning courses", errorMsg);
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
          New Teacher
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
                {...register("name", { required: "Name is required" })}
                placeholder="Enter teacher name"
                className="border-black "
              />
              {errors.name && (
                <span className="text-red-500 text-xs">
                  {errors.name.message}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Invalid email address",
                  },
                })}
                placeholder="Enter email"
                className="border-black "
              />
              {errors.email && (
                <span className="text-red-500 text-xs">
                  {errors.email.message}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="contactNo">Contact No</Label>
              <Input
                id="contactNo"
                {...register("contactNo", {
                  required: "Contact number is required",
                })}
                placeholder="Enter contact number"
                className="border-black "
              />
              {errors.contactNo && (
                <span className="text-red-500 text-xs">
                  {errors.contactNo.message}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="lineId">Line ID</Label>
              <Input
                id="lineId"
                {...register("lineId", { required: "Line ID is required" })}
                placeholder="Enter Line ID"
                className="border-black "
              />
              {errors.lineId && (
                <span className="text-red-500 text-xs">
                  {errors.lineId.message}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                {...register("address", { required: "Address is required" })}
                placeholder="Enter address"
                className="border-black "
              />
              {errors.address && (
                <span className="text-red-500 text-xs">
                  {errors.address.message}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                })}
                placeholder="Enter password"
                className="border-black "
              />
              {errors.password && (
                <span className="text-red-500 text-xs">
                  {errors.password.message}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                {...register("confirmPassword", {
                  required: "Please confirm your password",
                  validate: (value, formValues) =>
                    value === formValues.password || "Passwords do not match",
                })}
                placeholder="Confirm password"
                className="border-black "
              />
              {errors.confirmPassword && (
                <span className="text-red-500 text-xs">
                  {errors.confirmPassword.message}
                </span>
              )}
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
              className="bg-yellow-500 text-white hover:bg-yellow-400 rounded-2xl w-[5rem]"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Adding..." : "Add"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
