"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";

const statusOptions = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "All", value: "all" },
];

export default function PreParentsPage() {
  const router = useRouter();
  const [status, setStatus] = useState("all");
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Filter parents by status:", status);
    router.replace("/parents/details");
  };
  return (
    <Dialog open={true} modal={false}>
      <DialogContent className="sm:max-w-[350px] p-6 [&>button]:hidden">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold ">
            Filter Parents
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="flex flex-col gap-1">
            <Label htmlFor="status" className="text-sm text-gray-500">
              Status
            </Label>
            <div className="relative">
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full border border-gray-300 rounded-md py-2 px-3 appearance-none"
              >
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
            </div>
          </div>
          <DialogFooter className="flex justify-end gap-3 mt-6">
            <Button
              type="submit"
              className="bg-yellow-500 hover:bg-yellow-600 text-white rounded-full px-6"
            >
              Filter
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
