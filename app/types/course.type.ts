export type Student = {
  name: string;
  nickname: string;
  id: string;
};

export type TeacherData = {
  teacherId: number;
  teacher: string;
  room: string;
  remark: string;
};

export type ComfirmClassScheduleData = {
  classType: {
    id: number;
    classLimit: number;
    classMode: string;
    tuitionFee: number;
  };
  // For 12 times check
  checkStartTime?: string;
  checkEndTime?: string;
  // For 12 times fixed - new structure
  fixedDays?: string[];
  fixedStartTime?: string;
  fixedEndTime?: string;
  // For camp class - new structure
  campDates?: string[];
  campStartTime?: string;
  campEndTime?: string;
};

export type Course = {
  id: number;
  title: string;
  ageRange: string;
  description: string;
  medium: string;
};

export type EditScheduleFormData = {
  date: string;
  starttime: string;
  endtime: string;
  course: string;
  teacher: string;
  teacherId: number;
  student: string;
  room: string;
  nickname: string;
  class: string;
  studentId: string;
  remark: string;
  status?: string;
};

export type ComfirmScheduleRow = {
  date: string;
  time: string;
  student: string;
  teacher: string;
  teacherId: number;
  class: string;
  room: string;
  remark: string;
  warning?: string;
  attendance?: string;
  studentId: number;
};

export interface ConflictDetail {
  date: string;
  room: string;
  startTime: string;
  endTime: string;
  conflictType: string;
  courseTitle: string;
  teacherName: string;
  studentName: string;
}

export type ComfirmStudent = {
  name: string;
  nickname: string;
  id: string;
};

export type ComfirmClassSession = {
  date: string;
  startTime: string;
  endTime: string;
};

export type ComfirmTeacherData = {
  teacherId: number;
  teacher: string;
  room: string;
  remark: string;
};
