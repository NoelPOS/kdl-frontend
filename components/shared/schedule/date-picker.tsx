"use client";

import * as React from "react";
import { Calendar1 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type Calendar22Props = {
  label?: string;
  date?: Date;
  onChange?: (date: Date | undefined) => void;
};

export function Calendar22({ label, date, onChange }: Calendar22Props) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="flex flex-col gap-3 w-full">
      {label && (
        <Label htmlFor="date" className="px-1">
          {label}
        </Label>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            id="date"
            className="w-full justify-between font-normal "
          >
            {date ? date.toLocaleDateString() : "Select date"}
            <Calendar1 />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            captionLayout="dropdown"
            onSelect={(d) => {
              onChange?.(d); // notify parent
              setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
