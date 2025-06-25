export interface ClassSession {
  course_id: number;
  course_title: string;
  schedule_attendance: string;
  schedule_date: string;
  schedule_endTime: string;
  schedule_feedback: string;
  schedule_id: number;
  schedule_remark: string;
  schedule_room: string;
  schedule_startTime: string;
  schedule_verifyFb: boolean;
  student_id: number;
  student_name: string;
  teacher_id: number;
  teacher_name: string;
}

export interface ScheduleBlock {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  color: "blue" | "orange";
  course: string;
}
