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
import { addNewDiscount } from "@/lib/api";
import { useRouter } from "next/navigation";

export type FormData = {
  title: string;
  amount: number;
  usage: string;
};

export function AddNewDiscount() {
  const router = useRouter();
  const closeRef = useRef<HTMLButtonElement>(null);

  const { register, handleSubmit } = useForm<FormData>({
    defaultValues: {
      title: "",
      amount: 0,
      usage: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      await addNewDiscount(data);
      closeRef.current?.click();
      router.refresh();
    } catch (error) {
      console.error("Error adding discount:", error);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          New Discount
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px] p-8">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Add New Discount
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
          <div className="flex flex-col gap-1">
            <Label htmlFor="title" className="text-sm text-gray-500">
              Discount Title
            </Label>
            <Input
              id="title"
              placeholder="Enter discount title"
              {...register("title", { required: true })}
            />
          </div>

          <div className="flex flex-col gap-1">
            <Label htmlFor="amount" className="text-sm text-gray-500">
              Amount
            </Label>
            <Input
              id="amount"
              type="number"
              step="100"
              placeholder="e.g., 50.00"
              {...register("amount", { required: true, valueAsNumber: true })}
            />
          </div>

          <div className="flex flex-col gap-1">
            <Label htmlFor="usage" className="text-sm text-gray-500">
              Description
            </Label>
            <Input
              id="usage"
              type="text"
              placeholder="description of discount"
              {...register("usage", { required: true })}
            />
          </div>

          <DialogFooter className="gap-2 mt-6">
            <DialogClose asChild>
              <Button ref={closeRef} type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              className="bg-yellow-500 hover:bg-yellow-600 text-white"
            >
              Add Discount
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
