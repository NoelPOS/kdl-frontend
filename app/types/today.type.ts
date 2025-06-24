import { ClassSchedule } from "./schedule.type";

// export interface Student {
//   schedule_id: string;
//   schedule_date: string;
//   schedule_startTime: string;
//   schedule_endTime: string;
//   schedule_room: string;
//   schedule_attendance: string;
//   schedule_remark: string;
//   schedule_classNumber: number;
//   schedule_warning: string;
//   course_id: string;
//   course_title: string;
//   session_mode: string;
//   teacher_name: string;
//   student_id: string;
//   student_name: string;
//   student_nickname: string;
//   student_profilePicture: string;
//   }
  
  export interface Course {
    id: number;
    title: string;
    startTime: string;
    endTime: string;
    color: string;
    teacher: string;
    room: string;
    fullTime: string;
    students: ClassSchedule[];
  }
  
  export interface ScheduleData {
    date: string;
    courses: Course[];
  }