import * as XLSX from 'xlsx';
import { ClassSchedule } from '@/app/types/schedule.type';

export function exportSchedulesToExcel(schedules: ClassSchedule[], filename: string = 'schedules') {
  // Transform schedule data for Excel export
  const excelData = schedules.map((schedule, index) => ({
    'No.': index + 1,
    'Date': schedule.schedule_date,
    'Start Time': schedule.schedule_startTime,
    'End Time': schedule.schedule_endTime,
    'Room': schedule.schedule_room,
    'Course': schedule.course_title,
    'Session Mode': schedule.session_mode,
    'Student Name': schedule.student_name,
    'Student Nickname': schedule.student_nickname,
    'Teacher': schedule.teacher_name,
    'Class Number': schedule.schedule_classNumber,
    'Attendance': schedule.schedule_attendance,
    'Remark': schedule.schedule_remark || '',
    'Feedback': schedule.schedule_feedback || '',
    'Feedback Date': schedule.schedule_feedbackDate || '',
    'Warning': schedule.schedule_warning || '',
  }));

  // Create workbook and worksheet
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(excelData);

  // Set column widths for better readability
  const columnWidths = [
    { wch: 5 },  // No.
    { wch: 12 }, // Date
    { wch: 10 }, // Start Time
    { wch: 10 }, // End Time
    { wch: 8 },  // Room
    { wch: 20 }, // Course
    { wch: 12 }, // Session Mode
    { wch: 15 }, // Student Name
    { wch: 12 }, // Student Nickname
    { wch: 15 }, // Teacher
    { wch: 8 },  // Class Number
    { wch: 12 }, // Attendance
    { wch: 20 }, // Remark
    { wch: 30 }, // Feedback
    { wch: 12 }, // Feedback Date
    { wch: 15 }, // Warning
  ];
  worksheet['!cols'] = columnWidths;

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Schedules');

  // Generate filename with current date
  const currentDate = new Date().toISOString().split('T')[0];
  const fullFilename = `${filename}_${currentDate}.xlsx`;

  // Write and download the file
  XLSX.writeFile(workbook, fullFilename);
}

export function exportSchedulesToCSV(schedules: ClassSchedule[], filename: string = 'schedules') {
  // Transform schedule data for CSV export
  const csvData = schedules.map((schedule, index) => ({
    'No.': index + 1,
    'Date': schedule.schedule_date,
    'Start Time': schedule.schedule_startTime,
    'End Time': schedule.schedule_endTime,
    'Room': schedule.schedule_room,
    'Course': schedule.course_title,
    'Session Mode': schedule.session_mode,
    'Student Name': schedule.student_name,
    'Student Nickname': schedule.student_nickname,
    'Teacher': schedule.teacher_name,
    'Class Number': schedule.schedule_classNumber,
    'Attendance': schedule.schedule_attendance,
    'Remark': schedule.schedule_remark || '',
    'Feedback': schedule.schedule_feedback || '',
    'Feedback Date': schedule.schedule_feedbackDate || '',
    'Warning': schedule.schedule_warning || '',
  }));

  // Create workbook and worksheet
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(csvData);

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Schedules');

  // Generate filename with current date
  const currentDate = new Date().toISOString().split('T')[0];
  const fullFilename = `${filename}_${currentDate}.csv`;

  // Write and download the file as CSV
  XLSX.writeFile(workbook, fullFilename, { bookType: 'csv' });
}
