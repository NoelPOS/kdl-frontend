export interface Student {
    name: string;
    nickname: string;
    id: string;
  }
  
  export interface ClassSchedule {
    schedule_id: string;
    schedule_date: string;
    schedule_startTime: string;
    schedule_endTime: string;
    schedule_room: string;
    schedule_attendance: string;
    schedule_remark: string;
    schedule_classNumber: number;
    schedule_warning: string;
    course_id: string;
    course_title: string;
    session_mode: string;
    teacher_name: string;
    student_id: string;
    student_name: string;
    student_nickname: string;
    student_profilePicture: string;
    
  }
  
  export interface FilterFormData {
    startDate: string;
    endDate: string;
    studentName: string;
  }


  export type FormData = {
    scheduleId: number;
    date: string;
    starttime: string;
    endtime: string;
    course: string;
    teacher: string;
    student: string;
    room: string;
    nickname: string;
    remark: string;
    status?: string;
    courseId: number;
  };