export type Student = {
  name: string;
  nickname: string;
  id: string;
  studentId?: string;
};

export type TeacherData = {
  teacherId: number;
  teacher: string;
  room: string;
  remark: string;
};

export type ComfirmClassScheduleData = {
  classType: ClassOption;
  // For 12 times fixed
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
  date?: string;
  starttime: string;
  endtime: string;
  course: string;
  teacher: string;
  teacherId?: number;
  student: string;
  room: string;
  nickname: string;
  studentId: string;
  studentIdDisplay?: string;
  remark: string;
  status?: string;
};

export type ComfirmScheduleRow = {
  date?: string;
  time: string;
  student: string;
  teacher: string;
  teacherId?: number;
  class?: string;
  room: string;
  remark: string;
  warning?: string;
  attendance?: string;
  studentId: number;
  studentIdDisplay?: string; 
};

export type ConflictDetail = {
  date: string;
  room: string;
  time: string;
  startTime: string;
  endTime: string;
  conflictType: string;
  courseTitle: string;
  teacherName: string;
  studentName: string;
};

export type ClassOption = {
  id: number;
  classMode: string;
  classLimit: number;
  tuitionFee: number;
  optionType?: 'camp' | 'fixed' | 'check';
};
