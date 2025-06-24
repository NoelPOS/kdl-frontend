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
import { Plus, Search, Calendar, ChevronDown } from "lucide-react";
import { useRef } from "react";
import { addNewStudent } from "@/lib/axio";
import { Checkbox } from "../../ui/checkbox";
import { useRouter } from "next/navigation";

export type FormData = {
  name: string;
  nickname: string;
  school: string;
  dob: string;
  gender: string;
  allergic: string;
  doNotEat: string;
  parent: string;
  phone: string;
  adConcent: boolean;
  profilePicture: string;
};

export function AddNewStudent() {
  const router = useRouter();
  const closeRef = useRef<HTMLButtonElement>(null);

  const { register, handleSubmit, setValue } = useForm<FormData>({
    defaultValues: {
      name: "",
      nickname: "",
      school: "",
      dob: "",
      gender: "",
      allergic: "",
      doNotEat: "",
      parent: "",
      phone: "",
      adConcent: false,
      profilePicture: "",
    },
  });

  const { ref: dateRHFRef } = register("dob");
  const dateRef = useRef<HTMLInputElement>(null);

  const onSubmit = async (data: FormData) => {
    await addNewStudent({
      ...data,
      allergic: data.allergic.split(" "),
      doNotEat: data.doNotEat.split(" "),
    });
    closeRef.current?.click();
    router.refresh();
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
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Profile */}
          <div className="flex flex-col gap-2">
            <div className="relative">
              <Input type="file" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
            {/* Name */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Name</Label>
              <div className="relative">
                <Input
                  id="name"
                  {...register("name")}
                  placeholder="Enter student name"
                  className="border-black "
                />
              </div>
            </div>

            {/* School */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="school">School</Label>
              <div className="relative">
                <Input
                  id="school"
                  {...register("school")}
                  placeholder="Enter school name"
                  className="border-black "
                />
              </div>
            </div>

            {/* Nickname */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="nickname">Nickname</Label>
              <div className="relative">
                <Input
                  id="nickname"
                  {...register("nickname")}
                  placeholder="Enter nickname"
                  className="border-black "
                />
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
              <Label htmlFor="dob">DOB</Label>
              <div className="relative">
                <Input
                  id="dob"
                  type="date"
                  {...register("dob")}
                  ref={(e) => {
                    dateRHFRef(e); // connect RHF ref
                    dateRef.current = e; // also assign to your own ref
                  }}
                  className="border-black"
                />
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-black" />
              </div>
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

            {/* Nick Name */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="gender">Gender</Label>
              <div className="relative">
                <select
                  id="gender"
                  {...register("gender")}
                  className="border-black w-full border rounded-md py-1.5 px-2"
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
            </div>

            {/* Parent */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="parent">Parent</Label>
              <div className="relative">
                <Input
                  id="parent"
                  {...register("parent")}
                  className=" border-black"
                  placeholder="Search for a parent"
                />
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-black" />
              </div>
            </div>
            {/* Phone */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="phone">Phone</Label>
              <div className="relative">
                <Input
                  id="phone"
                  {...register("phone")}
                  placeholder="Enter student phone"
                  className="border-black "
                />
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
export default AddNewStudent;
