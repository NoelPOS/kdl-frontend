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
import { useRef } from "react";

export type ParentFormData = {
  name: string;
  email: string;
  phone: string;
  active: boolean;
};

export default function AddNewParent() {
  const closeRef = useRef<HTMLButtonElement>(null);
  const { register, handleSubmit } = useForm<ParentFormData>({
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      active: true,
    },
  });

  const onSubmit = (data: ParentFormData) => {
    console.log("Add new parent:", data);
    closeRef.current?.click();
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
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                {...register("phone")}
                placeholder="Enter phone number"
                className="border-black "
              />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="active" {...register("active")} />
              <Label htmlFor="active">Active</Label>
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
              className="bg-purple-500 text-white hover:bg-purple-400 rounded-2xl w-[5rem]"
            >
              Add
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
