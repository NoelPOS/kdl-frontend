export type Teacher = {
  id: number;
  name: string;
  email: string;
  contactNo: string;
  lineId: string;
  address: string;
  profilePicture: string;
  profileKey: string;
  password: string;
  role?: string;
  teacherType?: 'full-time' | 'part-time';
  workingDays?: string[];
};

export type TeacherAbsence = {
  id: number;
  teacherId: number;
  absenceDate: string;
  reason?: string;
  createdAt: string;
  updatedAt: string;
};

export type TeacherAvailability = {
  available: boolean;
  reason?: string;
};

export type TeacherAvailabilitySlot = {
  id: number;
  teacherId: number;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  createdAt: string;
};
