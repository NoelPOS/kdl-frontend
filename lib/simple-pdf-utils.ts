import { Invoice } from "@/app/types/invoice.type";

export const generateSimpleReceiptPDF = async (invoice: Invoice) => {
  try {
    // Check if we're in a browser environment
    if (typeof window === "undefined") {
      throw new Error(
        "PDF generation is only available in browser environment"
      );
    }

    // Dynamically import jsPDF
    const jsPDF = (await import("jspdf")).default;

    const pdf = new jsPDF("p", "mm", "a4");

    // Page dimensions
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    let yPos = margin;

    // Helper function to add text with automatic line breaks
    const addText = (text: string, x: number, y: number, options: any = {}) => {
      const fontSize = options.fontSize || 10;
      const maxWidth = options.maxWidth || pageWidth - 2 * margin;
      const lineHeight = options.lineHeight || fontSize * 0.5;

      pdf.setFontSize(fontSize);
      if (options.bold) pdf.setFont(undefined, "bold");
      else pdf.setFont(undefined, "normal");

      const splitText = pdf.splitTextToSize(text, maxWidth);
      pdf.text(splitText, x, y);

      return y + splitText.length * lineHeight;
    };

    // Header
    pdf.setFontSize(24);
    pdf.setFont(undefined, "bold");
    pdf.text("KDL Learning Center", pageWidth / 2, yPos, { align: "center" });
    yPos += 10;

    pdf.setFontSize(14);
    pdf.setFont(undefined, "normal");
    pdf.text("Payment Receipt", pageWidth / 2, yPos, { align: "center" });
    yPos += 15;

    // Draw line
    pdf.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 10;

    // Receipt details section
    pdf.setFontSize(12);
    pdf.setFont(undefined, "bold");
    pdf.text("Receipt Details", margin, yPos);
    yPos += 8;

    pdf.setFontSize(10);
    pdf.setFont(undefined, "normal");
    pdf.text(`Receipt ID: ${invoice.documentId}`, margin, yPos);
    yPos += 6;
    pdf.text(
      `Date: ${new Date(invoice.date).toLocaleDateString()}`,
      margin,
      yPos
    );
    yPos += 6;
    pdf.text(`Payment Method: ${invoice.paymentMethod}`, margin, yPos);
    yPos += 10;

    // Student information
    pdf.setFontSize(12);
    pdf.setFont(undefined, "bold");
    pdf.text("Student Information", margin, yPos);
    yPos += 8;

    pdf.setFontSize(10);
    pdf.setFont(undefined, "normal");
    pdf.text(`Student Name: ${invoice.studentName || "N/A"}`, margin, yPos);
    yPos += 6;
    pdf.text(`Course: ${invoice.courseName || "N/A"}`, margin, yPos);
    yPos += 15;

    // Payment details table
    pdf.setFontSize(12);
    pdf.setFont(undefined, "bold");
    pdf.text("Payment Details", margin, yPos);
    yPos += 10;

    // Table headers
    const tableStartY = yPos;
    const col1X = margin;
    const col2X = pageWidth - margin - 40;

    pdf.setFontSize(10);
    pdf.setFont(undefined, "bold");
    pdf.text("Description", col1X, yPos);
    pdf.text("Amount", col2X, yPos);
    yPos += 8;

    // Draw header line
    pdf.line(margin, yPos - 2, pageWidth - margin, yPos - 2);

    // Table rows
    pdf.setFont(undefined, "normal");
    invoice.items.forEach((item) => {
      pdf.text(item.description, col1X, yPos);
      pdf.text(`$${item.amount}`, col2X, yPos);
      yPos += 6;
    });

    // Draw separator line
    pdf.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 5;

    // Total
    pdf.setFont(undefined, "bold");
    pdf.text("Total Amount", col1X, yPos);
    pdf.text(`$${invoice.totalAmount}`, col2X, yPos);
    yPos += 15;

    // Session groups if available
    if (invoice.sessionGroups && invoice.sessionGroups.length > 0) {
      pdf.setFontSize(12);
      pdf.setFont(undefined, "bold");
      pdf.text("Session Information", margin, yPos);
      yPos += 8;

      pdf.setFontSize(10);
      pdf.setFont(undefined, "normal");

      invoice.sessionGroups.forEach((group, index) => {
        pdf.text(`Session ${index + 1}:`, margin, yPos);
        yPos += 6;
        pdf.text(`  ID: ${group.sessionId}`, margin + 5, yPos);
        yPos += 5;
        pdf.text(`  Type: ${group.transactionType}`, margin + 5, yPos);
        yPos += 5;
        pdf.text(`  Reference: ${group.actualId}`, margin + 5, yPos);
        yPos += 8;
      });
    }

    // Footer
    yPos = pageHeight - 40;
    pdf.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 8;

    pdf.setFontSize(12);
    pdf.text("Thank you for your payment!", pageWidth / 2, yPos, {
      align: "center",
    });
    yPos += 6;

    pdf.setFontSize(8);
    pdf.text(
      "This is an official receipt from KDL Learning Center",
      pageWidth / 2,
      yPos,
      { align: "center" }
    );
    yPos += 4;
    pdf.text(
      `Generated on: ${new Date().toLocaleString()}`,
      pageWidth / 2,
      yPos,
      { align: "center" }
    );
    yPos += 8;

    pdf.text(
      "KDL Learning Center | Contact: info@kdl.com | Phone: +1-234-567-8900",
      pageWidth / 2,
      yPos,
      { align: "center" }
    );

    // Download the PDF
    const fileName = `Receipt_${
      invoice.documentId
    }_${new Date().getTime()}.pdf`;
    pdf.save(fileName);

    return true;
  } catch (error) {
    console.error("Error generating simple PDF:", error);
    throw new Error("Failed to generate PDF receipt");
  }
};
