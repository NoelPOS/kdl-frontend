"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { EntityDialog } from "@/components/shared/entity-dialog/entity-dialog";
import { FormFieldGroup } from "@/components/shared/form-fields/form-field-group";
import { useCreateDiscount } from "@/hooks/mutation/use-discount-mutations";

type FormData = {
  title: string;
  amount: number;
  usage: string;
};

export function AddNewDiscount() {
  const [open, setOpen] = useState(false);
  const { mutate: createDiscount, isPending } = useCreateDiscount();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: { title: "", amount: 0, usage: "" },
  });

  const onSubmit = (data: FormData) => {
    createDiscount(data, {
      onSuccess: () => {
        reset();
        setOpen(false);
      },
    });
  };

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4 mr-2" />
        Add Discount/Fees
      </Button>

      <EntityDialog
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Add New Discount"
        size="lg"
        footer={
          <>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="add-discount-form"
              disabled={isPending}
              className="bg-yellow-500 hover:bg-yellow-600 text-white"
            >
              {isPending ? "Adding..." : "Add Discount"}
            </Button>
          </>
        }
      >
        <form
          id="add-discount-form"
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
        >
          <FormFieldGroup
            label="Discount Title"
            required
            error={errors.title?.message}
          >
            <Input
              placeholder="Enter discount title"
              {...register("title", { required: "Title is required" })}
            />
          </FormFieldGroup>

          <FormFieldGroup
            label="Amount"
            required
            error={errors.amount?.message}
          >
            <Input
              type="number"
              step="100"
              placeholder="e.g., 500"
              {...register("amount", {
                required: "Amount is required",
                valueAsNumber: true,
              })}
            />
          </FormFieldGroup>

          <FormFieldGroup
            label="Description"
            required
            error={errors.usage?.message}
          >
            <Input
              placeholder="Description of discount"
              {...register("usage", { required: "Description is required" })}
            />
          </FormFieldGroup>
        </form>
      </EntityDialog>
    </>
  );
}
