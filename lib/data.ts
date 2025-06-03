import type {
  Student,
  Teacher,
  Course,
  ClassSession,
  ScheduleBlock,
} from "./types";

export const students: Student[] = [
  {
    id: "1",
    nickname: "Jane",
    fullName: "Jane Doe",
    age: 10,
    phone: "0123456789",
    hasConsent: true,
  },
  {
    id: "2",
    nickname: "John",
    fullName: "John Smith",
    age: 9,
    phone: "0123456789",
    hasConsent: true,
  },
  {
    id: "3",
    nickname: "Layla",
    fullName: "Layla Johnson",
    age: 11,
    phone: "0123456789",
    hasConsent: true,
  },
  {
    id: "4",
    nickname: "Claude",
    fullName: "Claude Wilson",
    age: 8,
    phone: "0123456789",
    hasConsent: true,
  },
  {
    id: "5",
    nickname: "Lucy",
    fullName: "Lucy Brown",
    age: 10,
    phone: "0123456789",
    hasConsent: false,
  },
];

export const teachers: Teacher[] = [
  {
    id: "1",
    fullName: "Ms. Daisy",
  },
  {
    id: "2",
    fullName: "Mr. Smith",
  },
];

export const courses: Course[] = [
  {
    id: "1",
    name: "Tinkamo Tinkerer Beginner",
    ageRange: "5-6 yrs",
    device: "iPad",
    price: 14700,
    currency: "THB",
  },
  {
    id: "2",
    name: "Tinkermo",
    ageRange: "7-9 yrs",
    device: "iPad",
    price: 15000,
    currency: "THB",
  },
  {
    id: "3",
    name: "NSC",
    ageRange: "10-12 yrs",
    device: "Laptop",
    price: 16000,
    currency: "THB",
  },
  {
    id: "4",
    name: "Tinkamo Tinkerer Advanced",
    ageRange: "5-6 yrs",
    device: "iPad",
    price: 14700,
    currency: "THB",
  },
  {
    id: "5",
    name: "Tinkamo Tinkerer Intermediate",
    ageRange: "5-6 yrs",
    device: "iPad",
    price: 14700,
    currency: "THB",
  },
  {
    id: "6",
    name: "Tinkamo Tinkerer Expert",
    ageRange: "5-6 yrs",
    device: "iPad",
    price: 14700,
    currency: "THB",
  },
  {
    id: "7",
    name: "Tinkamo Tinkerer Master",
    ageRange: "5-6 yrs",
    device: "iPad",
    price: 14700,
    currency: "THB",
  },
  {
    id: "8",
    name: "Tinkamo Tinkerer Grandmaster",
    ageRange: "5-6 yrs",
    device: "iPad",
    price: 14700,
    currency: "THB",
  },
  {
    id: "9",
    name: "Tinkamo Tinkerer Supreme",
    ageRange: "5-6 yrs",
    device: "iPad",
    price: 14700,
    currency: "THB",
  },
  {
    id: "10",
    name: "Tinkamo Tinkerer Ultimate",
    ageRange: "5-6 yrs",
    device: "iPad",
    price: 14700,
    currency: "THB",
  },
];

export const classSessions: ClassSession[] = [
  {
    id: "1",
    date: "2025/06/3",
    time: "11:30",
    student: students[0],
    teacher: teachers[0],
    course: courses[1],
    class: "1,2,3",
    room: "Room 101",
    status: "Completed",
    remark: "No Remark",
    nickname: "Jane",
  },
  {
    id: "2",
    date: "12 Mar 25",
    time: "10:00 - 14:30",
    student: students[1],
    teacher: teachers[1],
    course: courses[1],
    class: "1,2,3",
    room: "Online",
    status: "Completed",
    remark: "No Remark",
    nickname: "John",
  },
  {
    id: "3",
    date: "12 Mar 25",
    time: "10:00 - 14:30",
    student: students[2],
    teacher: teachers[1],
    course: courses[1],
    class: "1,2,3",
    room: "Online",
    status: "Completed",
    remark: "No Remark",
    nickname: "Layla",
  },
  {
    id: "4",
    date: "12 Mar 25",
    time: "10:00 - 11:30",
    student: students[3],
    teacher: teachers[0],
    course: courses[2],
    class: "1",
    room: "Online",
    status: "Cancelled",
    remark: "Sick Leave",
    nickname: "Claude",
  },
  {
    id: "5",
    date: "13 Mar 25",
    time: "10:00 - 14:30",
    student: students[0],
    teacher: teachers[0],
    course: courses[1],
    class: "4,5,6",
    room: "Online",
    status: "Confirmed",
    remark: "No Remark",
    nickname: "Jane",
  },
];

export const scheduleBlocks: ScheduleBlock[] = [
  {
    id: "1",
    title: "Tinkermo",
    startTime: "10:00",
    endTime: "14:30",
    color: "blue",
    course: "Tinkermo",
  },
  {
    id: "2",
    title: "NSC",
    startTime: "10:00",
    endTime: "11:30",
    color: "orange",
    course: "NSC",
  },
];

export const timeSlots = [
  "10:00",
  "11:30",
  "13:00",
  "14:30",
  "16:00",
  "17:30",
  "19:00",
];

// Sample course description - replace with actual course.description
export const courseDescription = `This is a comprehensive course designed forstudents. The course covers fundamental concepts and practical applications using . Students will learn through interactive lessons, hands-on projects, and collaborative activities. 

The curriculum is structured to build upon previous knowledge while introducing new concepts at an appropriate pace. Each lesson includes practice exercises and real-world examples to help students understand how to apply what they've learned.

Key features of this course include:
- Interactive learning materials
- Step-by-step tutorials
- Practice projects
- Progress tracking
- Certificate upon completion

Prerequisites: Basic computer skills and familiarity with the recommended device. No prior programming experience required.

Course Duration: 8-12 weeks depending on student pace
Class Size: Maximum 12 students for personalized attention
Materials Included: All necessary software and learning resources provided

Upon completion, students will have gained practical skills they can immediately apply and will be prepared for more advanced courses in the series.`;
