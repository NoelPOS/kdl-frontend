"use client";
import { useForm } from "react-hook-form";
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
import { addNewParent } from "@/lib/axio";
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
  const { register, handleSubmit, setValue } = useForm<ParentFormData>({
    defaultValues: {
      name: "",
      email: "",
      contactNo: "",
      lineId: "",
      address: "",
      profilePicture: "",
    },
  });
  const router = useRouter();

  const onSubmit = async (data: ParentFormData) => {
    await addNewParent(data);
    console.log(imageFile);
    closeRef.current?.click();
    router.refresh();
  };

  const onImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setValue("profilePicture", reader.result as string);
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
                {...register("name")}
                placeholder="Enter parent name"
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
            >
              Add
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
