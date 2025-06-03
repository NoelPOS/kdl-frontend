"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Calendar, Clock, ChevronDown } from "lucide-react";
import { useRef } from "react";

type ClassSession = {
  date: string;
  startTime: string;
  endTime: string;
};

type FormData = {
  classType: "12-times-check" | "12-times-fixed" | "camp-class" | "";
  // For 12 times check
  checkStartTime: string;
  checkEndTime: string;
  // For 12 times fixed
  fixedSessions: ClassSession[];
  // For camp class
  campSessions: ClassSession[];
};

interface ClassScheduleFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ClassScheduleForm({
  open,
  onOpenChange,
}: ClassScheduleFormProps) {
  const { control, register, handleSubmit, watch } = useForm<FormData>({
    defaultValues: {
      classType: "",
      checkStartTime: "",
      checkEndTime: "",
      fixedSessions: Array.from({ length: 12 }, () => ({
        date: "",
        startTime: "",
        endTime: "",
      })),
      campSessions: [
        {
          date: "",
          startTime: "",
          endTime: "",
        },
      ],
    },
  });

  const {
    fields: campFields,
    append: appendCamp,
    remove: removeCamp,
  } = useFieldArray({
    control,
    name: "campSessions",
  });

  // Refs for 12 times check
  const checkStartTimeRef = useRef<HTMLInputElement>(null);
  const checkEndTimeRef = useRef<HTMLInputElement>(null);

  // Refs for 12 times fixed (arrays of refs)
  const fixedDateRefs = useRef<(HTMLInputElement | null)[]>([]);
  const fixedStartTimeRefs = useRef<(HTMLInputElement | null)[]>([]);
  const fixedEndTimeRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Refs for camp class (dynamic arrays)
  const campDateRefs = useRef<(HTMLInputElement | null)[]>([]);
  const campStartTimeRefs = useRef<(HTMLInputElement | null)[]>([]);
  const campEndTimeRefs = useRef<(HTMLInputElement | null)[]>([]);

  const classType = watch("classType");

  const addCampSession = () => {
    appendCamp({
      date: "",
      startTime: "",
      endTime: "",
    });
  };

  const removeCampSession = (index: number) => {
    if (campFields.length > 1) {
      removeCamp(index);
      // Clean up refs
      campDateRefs.current.splice(index, 1);
      campStartTimeRefs.current.splice(index, 1);
      campEndTimeRefs.current.splice(index, 1);
    }
  };

  const onSubmit = (data: FormData) => {
    console.log("Class Schedule Submitted:", data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 rounded-3xl overflow-hidden max-h-[80vh] overflow-y-auto">
        <div className="bg-white p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              Create Class Schedule
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6">
            <div className="space-y-6">
              {/* Class Type Selection */}
              <div className="space-y-2">
                <Label htmlFor="classType" className="text-sm font-medium">
                  Class Type
                </Label>
                <div className="relative flex flex-col">
                  <select
                    {...register("classType")}
                    className="w-full border border-gray-300 rounded-lg py-2 px-3 text-sm"
                  >
                    <option value="">Select class type</option>
                    <option value="12-times-check">12 Times Check</option>
                    <option value="12-times-fixed">12 Times Fixed</option>
                    <option value="camp-class">Camp Class</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* 12 Times Check - Show start and end time */}
              {classType === "12-times-check" && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900">
                    12 Times Check Schedule
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label
                        htmlFor="checkStartTime"
                        className="text-xs text-gray-500"
                      >
                        Start Time
                      </Label>
                      <div
                        className="relative cursor-pointer"
                        onClick={() => checkStartTimeRef.current?.showPicker()}
                      >
                        <Input
                          {...register("checkStartTime")}
                          ref={(e) => {
                            register("checkStartTime").ref(e);
                            checkStartTimeRef.current = e;
                          }}
                          type="time"
                          className="border-gray-300 rounded-lg pr-10 cursor-pointer"
                        />
                        <Clock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label
                        htmlFor="checkEndTime"
                        className="text-xs text-gray-500"
                      >
                        End Time
                      </Label>
                      <div
                        className="relative cursor-pointer"
                        onClick={() => checkEndTimeRef.current?.showPicker()}
                      >
                        <Input
                          {...register("checkEndTime")}
                          ref={(e) => {
                            register("checkEndTime").ref(e);
                            checkEndTimeRef.current = e;
                          }}
                          type="time"
                          className="border-gray-300 rounded-lg pr-10 cursor-pointer"
                        />
                        <Clock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 12 Times Fixed - Show 12 sets of date, start time, end time */}
              {classType === "12-times-fixed" && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900">
                    12 Times Fixed Schedule
                  </h3>

                  <div className="space-y-4 max-h-60 overflow-y-auto">
                    {Array.from({ length: 12 }).map((_, index) => {
                      const { ref: dateRHFRef, ...dateProps } = register(
                        `fixedSessions.${index}.date` as const
                      );
                      const { ref: startTimeRHFRef, ...startTimeProps } =
                        register(`fixedSessions.${index}.startTime` as const);
                      const { ref: endTimeRHFRef, ...endTimeProps } = register(
                        `fixedSessions.${index}.endTime` as const
                      );

                      return (
                        <div
                          key={index}
                          className="p-3 bg-white rounded-lg border border-gray-200"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">
                              Session {index + 1}
                            </span>
                          </div>

                          <div className="grid grid-cols-3 gap-3">
                            <div className="space-y-1">
                              <Label className="text-xs text-gray-500">
                                Date
                              </Label>
                              <div
                                className="relative cursor-pointer"
                                onClick={() =>
                                  fixedDateRefs.current[index]?.showPicker()
                                }
                              >
                                <Input
                                  {...dateProps}
                                  ref={(e) => {
                                    dateRHFRef(e);
                                    fixedDateRefs.current[index] = e;
                                  }}
                                  type="date"
                                  className="border-gray-300 rounded-lg pr-8 text-xs cursor-pointer"
                                />
                                <Calendar className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400 pointer-events-none" />
                              </div>
                            </div>

                            <div className="space-y-1">
                              <Label className="text-xs text-gray-500">
                                Start
                              </Label>
                              <div
                                className="relative cursor-pointer"
                                onClick={() =>
                                  fixedStartTimeRefs.current[
                                    index
                                  ]?.showPicker()
                                }
                              >
                                <Input
                                  {...startTimeProps}
                                  ref={(e) => {
                                    startTimeRHFRef(e);
                                    fixedStartTimeRefs.current[index] = e;
                                  }}
                                  type="time"
                                  className="border-gray-300 rounded-lg pr-8 text-xs cursor-pointer"
                                />
                                <Clock className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400 pointer-events-none" />
                              </div>
                            </div>

                            <div className="space-y-1">
                              <Label className="text-xs text-gray-500">
                                End
                              </Label>
                              <div
                                className="relative cursor-pointer"
                                onClick={() =>
                                  fixedEndTimeRefs.current[index]?.showPicker()
                                }
                              >
                                <Input
                                  {...endTimeProps}
                                  ref={(e) => {
                                    endTimeRHFRef(e);
                                    fixedEndTimeRefs.current[index] = e;
                                  }}
                                  type="time"
                                  className="border-gray-300 rounded-lg pr-8 text-xs cursor-pointer"
                                />
                                <Clock className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400 pointer-events-none" />
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Camp Class - Dynamic sessions */}
              {classType === "camp-class" && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900">
                    Camp Class Schedule
                  </h3>

                  <div className="space-y-4">
                    {campFields.map((field, index) => {
                      const { ref: campDateRHFRef, ...campDateProps } =
                        register(`campSessions.${index}.date` as const);
                      const {
                        ref: campStartTimeRHFRef,
                        ...campStartTimeProps
                      } = register(`campSessions.${index}.startTime` as const);
                      const { ref: campEndTimeRHFRef, ...campEndTimeProps } =
                        register(`campSessions.${index}.endTime` as const);

                      return (
                        <div
                          key={field.id}
                          className="p-3 bg-white rounded-lg border border-gray-200"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">
                              Day {index + 1}
                            </span>
                            {index > 0 && (
                              <Button
                                type="button"
                                variant="ghost"
                                className="text-red-500 p-1 h-auto hover:bg-red-50"
                                onClick={() => removeCampSession(index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>

                          <div className="grid grid-cols-3 gap-3">
                            <div className="space-y-1">
                              <Label className="text-xs text-gray-500">
                                Date
                              </Label>
                              <div
                                className="relative cursor-pointer"
                                onClick={() =>
                                  campDateRefs.current[index]?.showPicker()
                                }
                              >
                                <Input
                                  {...campDateProps}
                                  ref={(e) => {
                                    campDateRHFRef(e);
                                    campDateRefs.current[index] = e;
                                  }}
                                  type="date"
                                  className="border-gray-300 rounded-lg pr-8 text-xs cursor-pointer"
                                />
                                <Calendar className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400 pointer-events-none" />
                              </div>
                            </div>

                            <div className="space-y-1">
                              <Label className="text-xs text-gray-500">
                                Start Time
                              </Label>
                              <div
                                className="relative cursor-pointer"
                                onClick={() =>
                                  campStartTimeRefs.current[index]?.showPicker()
                                }
                              >
                                <Input
                                  {...campStartTimeProps}
                                  ref={(e) => {
                                    campStartTimeRHFRef(e);
                                    campStartTimeRefs.current[index] = e;
                                  }}
                                  type="time"
                                  className="border-gray-300 rounded-lg pr-8 text-xs cursor-pointer"
                                />
                                <Clock className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400 pointer-events-none" />
                              </div>
                            </div>

                            <div className="space-y-1">
                              <Label className="text-xs text-gray-500">
                                End Time
                              </Label>
                              <div
                                className="relative cursor-pointer"
                                onClick={() =>
                                  campEndTimeRefs.current[index]?.showPicker()
                                }
                              >
                                <Input
                                  {...campEndTimeProps}
                                  ref={(e) => {
                                    campEndTimeRHFRef(e);
                                    campEndTimeRefs.current[index] = e;
                                  }}
                                  type="time"
                                  className="border-gray-300 rounded-lg pr-8 text-xs cursor-pointer"
                                />
                                <Clock className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400 pointer-events-none" />
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* Add Day Button */}
                    <div className="flex justify-start">
                      <Button
                        type="button"
                        variant="outline"
                        className="text-amber-500 border-amber-500 rounded-full text-sm px-4 py-1 h-auto"
                        onClick={addCampSession}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add Day
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="flex justify-between gap-4 mt-8 px-0">
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="text-red-500 border-red-500 hover:bg-red-50 hover:text-red-600 rounded-full flex-1"
                >
                  Cancel
                </Button>
              </DialogClose>
              <Button
                type="submit"
                className="bg-green-500 text-white hover:bg-green-600 rounded-full flex-1"
              >
                Create Schedule
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ClassScheduleForm;
