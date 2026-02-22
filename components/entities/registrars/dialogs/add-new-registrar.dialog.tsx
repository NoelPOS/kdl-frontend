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
import { useState } from "react";
import { useCreateRegistrar } from "@/hooks/mutation/use-registrar-mutations";
import { useRouter } from "next/navigation";
import Image from "next/image";

export type RegistrarFormData = {
  name: string;
  email: string;
  password: string;
  profilePicture: string;
};

export default function AddNewRegistrar() {
  const [open, setOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const { mutateAsync: createRegistrar } = useCreateRegistrar();
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = useForm<RegistrarFormData>({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      profilePicture: "",
    },
    mode: "onSubmit",
  });
  const router = useRouter();

  const onSubmit = async (data: RegistrarFormData) => {
    let imageUrl = "";
    let key = "";
    try {
      let toastId: string | number | undefined;
      if (imageFile) {
        toastId = showToast.loading("Uploading image...");
        const getUrlRes = await fetch(
          `/api/s3-upload-url?fileName=${encodeURIComponent(
            imageFile.name
          )}&fileType=${encodeURIComponent(imageFile.type)}&folder=registrars`
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
        key = `registrars/${imageFile.name}`;
        imageUrl = `https://${
          process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME
        }.s3.amazonaws.com/registrars/${encodeURIComponent(imageFile.name)}`;
        showToast.dismiss(toastId);
        showToast.success("Image uploaded");
      }
      await createRegistrar({
        ...data,
        profilePicture: imageUrl,
        profileKey: key,
      } as any);
      reset();
      setImagePreview("");
      setImageFile(null);
      setOpen(false);
      router.refresh();
    } catch (error) {
      console.error("Error creating registrar:", error);
      // Hook's onError already handles the toast
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          New Registrar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px] p-8">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Add New Registrar
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
                placeholder="Enter registrar name"
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
                <p className="text-red-500 text-xs mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>
          </div>
          <DialogFooter className="flex justify-end gap-2 mt-8">
            <DialogClose asChild>
              <Button
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
