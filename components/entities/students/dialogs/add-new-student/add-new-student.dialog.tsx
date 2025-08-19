"use client";

import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { showToast } from "@/lib/toast";
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
import { Plus, Search, Calendar, ChevronDown, X } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { useDebounce } from "use-debounce";
import {
  addNewStudent,
  searchParents,
  assignChildrenToParent,
} from "@/lib/api";
import { Checkbox } from "@/components/ui/checkbox";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Parent } from "@/app/types/parent.type";

export type FormData = {
  name: string;
  nickname: string;
  school: string;
  dob: string;
  gender: string;
  allergic: string;
  doNotEat: string;
  parent: string;
  parentId: number | null;
  phone: string;
  adConcent: boolean;
  profilePicture: string;
  profilePictureId?: string; // Add this for Cloudinary public_id
};

export function AddNewStudent() {
  const router = useRouter();
  const closeRef = useRef<HTMLButtonElement>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [parentSearchResults, setParentSearchResults] = useState<Parent[]>([]);
  const [showParentResults, setShowParentResults] = useState(false);
  const [selectedParent, setSelectedParent] = useState<Parent | null>(null);
  const [parentQuery, setParentQuery] = useState("");

  // Debounce the search query with 300ms delay
  const [debouncedParentQuery] = useDebounce(parentQuery, 500);

  const {
    register,
    reset,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    defaultValues: {
      name: "",
      nickname: "",
      school: "",
      dob: "",
      gender: "",
      allergic: "",
      doNotEat: "",
      parent: "",
      parentId: null,
      phone: "",
      adConcent: false,
      profilePicture: "",
    },
  });

  const { ref: dateRHFRef } = register("dob", {
    required: "Date of birth is required",
  });
  const dateRef = useRef<HTMLInputElement>(null);

  // Effect to handle debounced search
  useEffect(() => {
    const performSearch = async () => {
      if (debouncedParentQuery.length >= 2) {
        try {
          const results = await searchParents(debouncedParentQuery);
          // console.log("Parent search results:", results);
          setParentSearchResults(results || []);
          setShowParentResults(true);
        } catch (error) {
          console.error("Parent search failed:", error);
          setParentSearchResults([]);
          setShowParentResults(false);
        }
      } else {
        setParentSearchResults([]);
        setShowParentResults(false);
        if (debouncedParentQuery.length === 0) {
          setSelectedParent(null);
          setValue("parentId", null);
        }
      }
    };

    performSearch();
  }, [debouncedParentQuery, setValue]);

  // Parent search input handler
  const handleParentSearch = (query: string) => {
    setParentQuery(query);
    setValue("parent", query);
  };

  const handleSelectParent = (parent: Parent) => {
    setSelectedParent(parent);
    setValue("parent", parent.name);
    setValue("parentId", parent.id);
    setParentQuery(parent.name); // Update the query state as well
    setShowParentResults(false);
    setParentSearchResults([]);
  };

  // Close parent search results when clicking outside
  const handleParentInputBlur = () => {
    // Add a longer delay to allow for clicking on search results
    setTimeout(() => {
      setShowParentResults(false);
    }, 200);
  };

  const onSubmit = async (data: FormData) => {
    // Check if there are any validation errors
    if (Object.keys(errors).length > 0) {
      console.log("Form has validation errors:", errors);
      return;
    }

    try {
      let imageUrl = "";
      let key = "";
      let toastId: string | number | undefined;
      if (imageFile) {
        toastId = showToast.loading("Uploading image...");
        const getUrlRes = await fetch(
          `/api/s3-upload-url?fileName=${encodeURIComponent(
            imageFile.name
          )}&fileType=${encodeURIComponent(imageFile.type)}&folder=students`
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

        key = `students/${imageFile.name}`;
        imageUrl = `https://${
          process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME
        }.s3.amazonaws.com/students/${encodeURIComponent(imageFile.name)}`;
        showToast.dismiss(toastId);
        showToast.success("Image uploaded");
      }

      toastId = showToast.loading("Creating student...");
      const preparedData = {
        ...data,
        allergic: data.allergic.split(" "),
        doNotEat: data.doNotEat.split(" "),
        profilePicture: imageUrl,
        profileKey: key,
      };
      console.log("Prepared student data:", preparedData);
      const newStudent = await addNewStudent(preparedData);
      showToast.dismiss(toastId);

      // If a parent was selected, assign the student to the parent
      if (selectedParent && newStudent.id) {
        toastId = showToast.loading("Assigning parent...");
        try {
          await assignChildrenToParent(selectedParent.id, {
            studentIds: [Number(newStudent.id)],
            isPrimary: true,
          });
          showToast.dismiss(toastId);
          showToast.success("Parent assigned successfully");
        } catch (parentError) {
          showToast.dismiss(toastId);
          console.error("Failed to assign parent:", parentError);
          showToast.warning(
            "Student created but failed to assign parent. You can assign the parent later."
          );
        }
      }

      showToast.success("Student created successfully!");
      reset();
      closeRef.current?.click();
      router.refresh();
    } catch (error) {
      showToast.dismiss();
      console.error("Error creating student:", error);
      showToast.error("Failed to create student. Please try again.");
    }
  };

  const onImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        // setValue("profilePicture", reader.result as string);
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

      <DialogContent className="sm:max-w-[700px] p-8">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Add New Student
          </DialogTitle>
          <p className="text-sm text-gray-600 text-center mt-2">
            Fields marked with <span className="text-red-500">*</span> are
            required
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Profile */}
          <div className="flex flex-col gap-2 mb-2">
            <div className="relative flex flex-col items-center gap-2">
              {imagePreview && (
                <Image
                  src={imagePreview}
                  width={400}
                  height={400}
                  alt="Profile Preview"
                  className="w-24 h-24 rounded-full object-cover border border-gray-300 mb-2"
                />
              )}
              <Input type="file" accept="image/*" onChange={onImageChange} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
            {/* Name */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Name *</Label>
              <div className="relative">
                <Input
                  id="name"
                  {...register("name", {
                    required: "Name is required",
                    minLength: {
                      value: 2,
                      message: "Name must be at least 2 characters",
                    },
                  })}
                  placeholder="Enter student name"
                  className={`border ${
                    errors.name ? "border-red-500" : "border-black"
                  }`}
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>
            </div>

            {/* School */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="school">School *</Label>
              <div className="relative">
                <Input
                  id="school"
                  {...register("school", {
                    required: "School is required",
                  })}
                  placeholder="Enter school name"
                  className={`border ${
                    errors.school ? "border-red-500" : "border-black"
                  }`}
                />
                {errors.school && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.school.message}
                  </p>
                )}
              </div>
            </div>

            {/* Nickname */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="nickname">Nickname *</Label>
              <div className="relative">
                <Input
                  id="nickname"
                  {...register("nickname", {
                    required: "Nickname is required",
                  })}
                  placeholder="Enter nickname"
                  className={`border ${
                    errors.nickname ? "border-red-500" : "border-black"
                  }`}
                />
                {errors.nickname && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.nickname.message}
                  </p>
                )}
              </div>
            </div>

            {/* allergic */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="allergic">Allergic</Label>
              <div className="relative">
                <Input
                  id="allergic"
                  {...register("allergic")}
                  placeholder="Enter allergies"
                  className="border-black "
                />
              </div>
            </div>

            {/* Date */}
            <div
              className="flex flex-col gap-2"
              onClick={() => dateRef.current?.showPicker()}
            >
              <Label htmlFor="dob">DOB *</Label>
              <div className="relative">
                <Input
                  id="dob"
                  type="date"
                  {...register("dob")}
                  ref={(e) => {
                    dateRHFRef(e); // connect RHF ref
                    dateRef.current = e; // also assign to your own ref
                  }}
                  className={`border ${
                    errors.dob ? "border-red-500" : "border-black"
                  }`}
                />
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-black" />
              </div>
              {errors.dob && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.dob.message}
                </p>
              )}
            </div>

            {/* doNotEat */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="doNotEat">Do Not Eat</Label>
              <div className="relative">
                <Input
                  id="doNotEat"
                  {...register("doNotEat")}
                  placeholder="Enter do not eat"
                  className="border-black "
                />
              </div>
            </div>

            {/* Gender */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="gender">Gender *</Label>
              <div className="relative">
                <select
                  id="gender"
                  {...register("gender", {
                    required: "Gender is required",
                  })}
                  className={`w-full border rounded-md py-1.5 px-2 ${
                    errors.gender ? "border-red-500" : "border-black"
                  }`}
                  style={{ fontSize: "0.875rem" }}
                >
                  <option value="" disabled hidden>
                    Select a gender
                  </option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-black pointer-events-none" />
              </div>
              {errors.gender && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.gender.message}
                </p>
              )}
            </div>

            {/* Parent */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="parent">Parent</Label>
              <div className="relative">
                <Input
                  id="parent"
                  {...register("parent")}
                  className="border-black pr-16"
                  placeholder="Search for a parent"
                  onChange={(e) => handleParentSearch(e.target.value)}
                  onBlur={handleParentInputBlur}
                  autoComplete="off"
                />
                <Search className="absolute right-8 top-1/2 -translate-y-1/2 h-5 w-5 text-black" />

                {showParentResults && parentSearchResults.length > 0 && (
                  <ul className="absolute z-10 bg-white border border-gray-200 shadow w-full rounded mt-1 max-h-48 overflow-y-auto">
                    {parentSearchResults.map((parent) => (
                      <li
                        key={parent.id}
                        onMouseDown={(e) => {
                          // Prevent blur event from firing before click
                          e.preventDefault();
                          handleSelectParent(parent);
                        }}
                        className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                      >
                        {parent.name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            {/* Phone */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="phone">Phone *</Label>
              <div className="relative">
                <Input
                  id="phone"
                  {...register("phone", {
                    required: "Phone number is required",
                    pattern: {
                      value: /^[0-9+\-\s()]+$/,
                      message: "Please enter a valid phone number",
                    },
                  })}
                  placeholder="Enter student phone"
                  className={`border ${
                    errors.phone ? "border-red-500" : "border-black"
                  }`}
                />
                {errors.phone && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.phone.message}
                  </p>
                )}
              </div>
            </div>
            {/* Checkbox */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="allowAdvertisement"
                onCheckedChange={(checked) => setValue("adConcent", !!checked)}
              />
              <Label
                htmlFor="allowAdvertisement"
                className="text-sm text-gray-600"
              >
                Allow the school to use photo and video for advertisement
              </Label>
            </div>
          </div>

          <DialogFooter className="flex justify-end gap-2 mt-8">
            <DialogClose asChild>
              <Button
                ref={closeRef}
                type="button"
                variant="outline"
                disabled={isSubmitting}
                className={`text-red-600 border-red-600 rounded-2xl w-[5rem] ${
                  isSubmitting
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-red-500 hover:text-white"
                }`}
              >
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={isSubmitting}
              className={`text-white rounded-2xl w-[5rem] ${
                isSubmitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-yellow-500 hover:bg-yellow-400"
              }`}
            >
              {isSubmitting ? "Adding..." : "Add"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
export default AddNewStudent;
