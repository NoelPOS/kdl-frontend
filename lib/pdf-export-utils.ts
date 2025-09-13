import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ClassSchedule } from '@/app/types/schedule.type';

export function exportSchedulesToPDF(schedules: ClassSchedule[], filename: string = 'schedules') {
  try {
    // Create new PDF document
    const doc = new jsPDF('landscape', 'mm', 'a4');
    
    // Add title
    const currentDate = new Date().toLocaleDateString();
    doc.setFontSize(16);
    doc.text('Schedule Report', 14, 15);
    doc.setFontSize(10);
    doc.text(`Generated on: ${currentDate}`, 14, 25);
    doc.text(`Total Records: ${schedules.length}`, 14, 30);

    // Prepare data for the table
    const tableData = schedules.map((schedule, index) => [
      index + 1, // No.
      schedule.schedule_date,
      schedule.schedule_startTime,
      schedule.schedule_endTime,
      schedule.schedule_room,
      schedule.course_title,
      schedule.student_name,
      schedule.student_nickname,
      schedule.teacher_name,
      schedule.schedule_attendance,
      schedule.schedule_remark || '',
    ]);

    // Define table headers
    const headers = [
      'No.',
      'Date',
      'Start Time',
      'End Time',
      'Room',
      'Course',
      'Student',
      'Nickname',
      'Teacher',
      'Attendance',
      'Remark',
    ];

    // Add table to PDF
    autoTable(doc, {
      head: [headers],
      body: tableData,
      startY: 35,
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [66, 139, 202], // Bootstrap blue
        textColor: 255,
        fontSize: 9,
        fontStyle: 'bold',
      },
      columnStyles: {
        0: { cellWidth: 10 }, // No.
        1: { cellWidth: 25 }, // Date
        2: { cellWidth: 20 }, // Start Time
        3: { cellWidth: 20 }, // End Time
        4: { cellWidth: 15 }, // Room
        5: { cellWidth: 40 }, // Course
        6: { cellWidth: 30 }, // Student
        7: { cellWidth: 25 }, // Nickname
        8: { cellWidth: 30 }, // Teacher
        9: { cellWidth: 25 }, // Attendance
        10: { cellWidth: 35 }, // Remark
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245], // Light gray for alternate rows
      },
      margin: { top: 35, right: 14, bottom: 20, left: 14 },
      tableLineColor: [200, 200, 200],
      tableLineWidth: 0.1,
    });

    // Add footer with page numbers
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(
        `Page ${i} of ${pageCount}`,
        doc.internal.pageSize.getWidth() - 30,
        doc.internal.pageSize.getHeight() - 10
      );
    }

    // Generate filename with current date
    const dateStr = new Date().toISOString().split('T')[0];
    const fullFilename = `${filename}_${dateStr}.pdf`;

    // Save the PDF
    doc.save(fullFilename);
  } catch (error) {
    console.error('Error in autoTable PDF generation, falling back to simple PDF:', error);
    // Fallback to simple PDF without table
    exportSchedulesToPDFSimple(schedules, filename);
  }
}

// Fallback function for simple PDF without autoTable
export function exportSchedulesToPDFSimple(schedules: ClassSchedule[], filename: string = 'schedules') {
  const doc = new jsPDF('portrait', 'mm', 'a4');
  
  // Add title
  const currentDate = new Date().toLocaleDateString();
  doc.setFontSize(16);
  doc.text('Schedule Report', 14, 20);
  doc.setFontSize(10);
  doc.text(`Generated on: ${currentDate}`, 14, 30);
  doc.text(`Total Records: ${schedules.length}`, 14, 35);

  let yPosition = 45;
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginBottom = 20;

  schedules.forEach((schedule, index) => {
    // Check if we need a new page
    if (yPosition > pageHeight - marginBottom - 60) {
      doc.addPage();
      yPosition = 20;
    }

    // Schedule header
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`${index + 1}. ${schedule.course_title}`, 14, yPosition);
    yPosition += 8;

    // Schedule details
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    const details = [
      `Date: ${schedule.schedule_date}`,
      `Time: ${schedule.schedule_startTime} - ${schedule.schedule_endTime}`,
      `Room: ${schedule.schedule_room}`,
      `Student: ${schedule.student_name} (${schedule.student_nickname})`,
      `Teacher: ${schedule.teacher_name}`,
      `Class Number: ${schedule.schedule_classNumber}`,
      `Attendance: ${schedule.schedule_attendance}`,
    ];

    details.forEach(detail => {
      doc.text(detail, 20, yPosition);
      yPosition += 5;
    });

    // Add remark if exists
    if (schedule.schedule_remark) {
      doc.text(`Remark: ${schedule.schedule_remark}`, 20, yPosition);
      yPosition += 5;
    }

    // Add feedback if exists
    if (schedule.schedule_feedback) {
      doc.text(`Feedback: ${schedule.schedule_feedback}`, 20, yPosition);
      yPosition += 5;
    }

    // Add separator line
    yPosition += 3;
    doc.setDrawColor(200, 200, 200);
    doc.line(14, yPosition, 196, yPosition);
    yPosition += 8;
  });

  // Add footer with page numbers
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.getWidth() - 30,
      doc.internal.pageSize.getHeight() - 10
    );
  }

  // Generate filename with current date
  const dateStr = new Date().toISOString().split('T')[0];
  const fullFilename = `${filename}_${dateStr}.pdf`;

  // Save the PDF
  doc.save(fullFilename);
}

export function exportSchedulesToPDFDetailed(schedules: ClassSchedule[], filename: string = 'schedules_detailed') {
  // Create new PDF document
  const doc = new jsPDF('portrait', 'mm', 'a4');
  
  // Add title
  const currentDate = new Date().toLocaleDateString();
  doc.setFontSize(16);
  doc.text('Detailed Schedule Report', 14, 20);
  doc.setFontSize(10);
  doc.text(`Generated on: ${currentDate}`, 14, 30);
  doc.text(`Total Records: ${schedules.length}`, 14, 35);

  let yPosition = 45;
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginBottom = 20;

  schedules.forEach((schedule, index) => {
    // Check if we need a new page
    if (yPosition > pageHeight - marginBottom - 50) {
      doc.addPage();
      yPosition = 20;
    }

    // Schedule header
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`${index + 1}. ${schedule.course_title}`, 14, yPosition);
    yPosition += 8;

    // Schedule details
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    const details = [
      `Date: ${schedule.schedule_date}`,
      `Time: ${schedule.schedule_startTime} - ${schedule.schedule_endTime}`,
      `Room: ${schedule.schedule_room}`,
      `Student: ${schedule.student_name} (${schedule.student_nickname})`,
      `Teacher: ${schedule.teacher_name}`,
      `Session Mode: ${schedule.session_mode}`,
      `Class Number: ${schedule.schedule_classNumber}`,
      `Attendance: ${schedule.schedule_attendance}`,
    ];

    details.forEach(detail => {
      doc.text(detail, 20, yPosition);
      yPosition += 6;
    });

    // Add remark if exists
    if (schedule.schedule_remark) {
      doc.text(`Remark: ${schedule.schedule_remark}`, 20, yPosition);
      yPosition += 6;
    }

    // Add feedback if exists
    if (schedule.schedule_feedback) {
      doc.text(`Feedback: ${schedule.schedule_feedback}`, 20, yPosition);
      yPosition += 6;
    }

    // Add separator line
    yPosition += 5;
    doc.setDrawColor(200, 200, 200);
    doc.line(14, yPosition, 196, yPosition);
    yPosition += 10;
  });

  // Add footer with page numbers
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.getWidth() - 30,
      doc.internal.pageSize.getHeight() - 10
    );
  }

  // Generate filename with current date
  const dateStr = new Date().toISOString().split('T')[0];
  const fullFilename = `${filename}_${dateStr}.pdf`;

  // Save the PDF
  doc.save(fullFilename);
}
