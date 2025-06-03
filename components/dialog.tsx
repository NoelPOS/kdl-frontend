import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Search, Calendar, Clock } from "lucide-react"; // Added Calendar and Clock for icons
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // For dropdowns
import { useRef } from "react";

export function AddSchedule() {
  const dateRef = useRef<HTMLInputElement>(null);
  const timeRef = useRef<HTMLInputElement>(null);
  const courseRef = useRef<HTMLInputElement>(null);
  const teacherRef = useRef<HTMLSelectElement>(null);
  const studentRef = useRef<HTMLInputElement>(null);
  const roomRef = useRef<HTMLSelectElement>(null);
  const nicknameRef = useRef<HTMLInputElement>(null);
  const classRef = useRef<HTMLInputElement>(null);
  const studentIdRef = useRef<HTMLInputElement>(null);
  const remarkRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    // Handle form submission logic here
    const scheduleData = {
      date: dateRef.current?.value,
      time: timeRef.current?.value,
      course: courseRef.current?.value,
      teacher: teacherRef.current?.value,
      student: studentRef.current?.value,
      room: roomRef.current?.value,
      nickname: nicknameRef.current?.value,
      class: classRef.current?.value,
      studentId: studentIdRef.current?.value,
      remark: remarkRef.current?.value,
    };
    console.log("Schedule Data:", scheduleData);
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
        {" "}
        {/* Increased max-width for better layout */}
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Add New Class Schedule
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-x-8 gap-y-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="date">Date</Label>
            <div className="relative">
              <Input
                id="date"
                defaultValue="13 March 2025"
                className="pr-10"
                type="date"
                ref={dateRef}
              />
              <Calendar
                className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
                onClick={() => dateRef.current?.showPicker()} // Show date picker on icon click
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="course">Course</Label>
            <div className="relative">
              <Input
                id="course"
                defaultValue="NSC"
                className="pr-10"
                ref={courseRef}
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
          </div>
          {/* Row 2 */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="time">Time</Label>
            <div className="relative">
              <Input
                id="time"
                defaultValue="10:00 - 14:30"
                className="pr-10"
                type="time"
                ref={timeRef}
              />
              <Clock
                className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
                onClick={
                  () => timeRef.current?.showPicker() // Show time picker on icon click
                }
              />
            </div>
          </div>
          <div className="flex flex-col gap-2 ">
            <Label htmlFor="teacher">Teacher</Label>

            <Select defaultValue="mr-smith">
              <SelectTrigger id="teacher" className="w-full">
                <SelectValue placeholder="Select a teacher" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mr-smith">Mr. Smith</SelectItem>
                <SelectItem value="ms-jones">Ms. Jones</SelectItem>
                <SelectItem value="dr-brown">Dr. Brown</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* Row 3 */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="student">Student</Label>
            <div className="relative">
              <Input
                id="student"
                defaultValue="John Snow"
                className="pr-10"
                ref={studentRef}
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="room">Room</Label>
            <Select defaultValue="online">
              <SelectTrigger id="room" className="w-full">
                <SelectValue placeholder="Select a room" ref={roomRef} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="room-101">Room 101</SelectItem>
                <SelectItem value="auditorium">Auditorium</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* Row 4 */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="nickname">Nickname</Label>
            <Input id="nickname" defaultValue="John" ref={nicknameRef} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="class">Class</Label>
            <Input id="class" defaultValue="1" ref={classRef} />
          </div>
          {/* Row 5 */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="student-id">Student ID</Label>
            <Input
              id="student-id"
              defaultValue="202501001"
              ref={studentIdRef}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="remark">Remark</Label>
            <Input
              id="remark"
              ref={remarkRef}
              placeholder="Enter any remarks or notes"
            />
          </div>
        </div>
        <DialogFooter className="flex justify-end gap-2 mt-8">
          <DialogClose asChild>
            <Button
              type="button"
              variant="outline"
              className="text-red-600 border-red-600 hover:bg-red-500 hover:text-white rounded-2xl w-[5rem] flex items-center justify-center"
            >
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="submit"
            className="bg-yellow-500 text-white hover:bg-yellow-400 rounded-2xl w-[5rem] flex items-center justify-center"
            onClick={handleSubmit}
          >
            Add
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
