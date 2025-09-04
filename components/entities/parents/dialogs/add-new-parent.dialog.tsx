"use client";
import { useForm } from "react-hook-form";
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
import { Plus } from "lucide-react";
import { useRef, useState } from "react";
import { addNewParent } from "@/lib/api";
import { useRouter } from "next/navigation";
import Image from "next/image";

export type ParentFormData = {
  name: string;
  email: string;
  contactNo: string;
  lineId: string;
  address: string;
  profilePicture: string;
};

export default function AddNewParent() {
  const closeRef = useRef<HTMLButtonElement>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { isSubmitting, errors },
  } = useForm<ParentFormData>({
    defaultValues: {
      name: "",
      email: "",
      contactNo: "",
      lineId: "",
      address: "",
      profilePicture: "",
    },
    mode: "onSubmit",
  });
  const router = useRouter();

  const onSubmit = async (data: ParentFormData) => {
    let imageUrl = "";
    let key = "";
    try {
      let toastId: string | number | undefined;
      if (imageFile) {
        toastId = showToast.loading("Uploading image...");
        const getUrlRes = await fetch(
          `/api/s3-upload-url?fileName=${encodeURIComponent(
            imageFile.name
          )}&fileType=${encodeURIComponent(imageFile.type)}&folder=parents`
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
        key = `parents/${imageFile.name}`;
        imageUrl = `https://${
          process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME
        }.s3.amazonaws.com/parents/${encodeURIComponent(imageFile.name)}`;
        showToast.dismiss(toastId);
        showToast.success("Image uploaded");
      }
      toastId = showToast.loading("Creating parent...");
      await addNewParent({
        ...data,
        profilePicture: imageUrl,
        profileKey: key,
      });
      showToast.dismiss(toastId);
      showToast.success("Parent created successfully");
      closeRef.current?.click();
      router.refresh();
    } catch (error) {
      showToast.dismiss();
      const errorMsg =
        typeof error === "object" && error && "message" in error
          ? (error as any).message
          : String(error);
      showToast.error("Error creating parent", errorMsg);
      console.error("Error creating parent:", error);
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
          New Parent
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px] p-8">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Add New Parent
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 gap-y-4">
            <div className="flex flex-col gap-2 items-center">
              {imagePreview && (
                <Image
                  src={imagePreview}
                  width={96}
                  height={96}
                  alt="Profile Preview"
                  className="w-24 h-24 rounded-full object-cover border border-gray-300 mb-2"
                />
              )}
              <Input type="file" accept="image/*" onChange={onImageChange} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                {...register("name", { required: "Name is required" })}
                placeholder="Enter parent name"
                className="border-black "
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.name.message}
                </p>
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
                <p className="text-red-500 text-xs mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="contactNo">Contact No</Label>
              <Input
                id="contactNo"
                {...register("contactNo", {
                  required: "Contact number is required",
                  pattern: {
                    value: /^\d+$/,
                    message: "Contact number must contain only numbers",
                  },
                  minLength: {
                    value: 8,
                    message: "Contact number must be at least 8 digits",
                  },
                })}
                placeholder="Enter contact number"
                className="border-black "
              />
              {errors.contactNo && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.contactNo.message}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="lineId">Line ID</Label>
              <Input
                id="lineId"
                {...register("lineId", {
                  pattern: {
                    value: /^[a-zA-Z0-9_.-]+$/,
                    message:
                      "Line ID can only contain letters, numbers, underscore, dot, and hyphen",
                  },
                })}
                placeholder="Enter Line ID"
                className="border-black "
              />
              {errors.lineId && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.lineId.message}
                </p>
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
                <p className="text-red-500 text-xs mt-1">
                  {errors.address.message}
                </p>
              )}
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
