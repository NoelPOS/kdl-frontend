import type { Invoice } from "@/app/types/invoice.type";

export const generateReceiptPDF = async (invoice: Invoice) => {
  try {
    // Check if we're in a browser environment
    if (typeof window === "undefined") {
      throw new Error(
        "PDF generation is only available in browser environment"
      );
    }

    // Dynamically import the libraries to avoid SSR issues
    const html2canvas = (await import("html2canvas")).default;
    const jsPDF = (await import("jspdf")).default;

    // Create a temporary container
    const tempContainer = document.createElement("div");
    tempContainer.style.position = "absolute";
    tempContainer.style.left = "-9999px";
    tempContainer.style.top = "-9999px";
    tempContainer.style.width = "800px";
    tempContainer.style.backgroundColor = "#ffffff";

    tempContainer.innerHTML = `
      <div style="background: #ffffff; padding: 40px; max-width: 800px; font-family: 'TH Sarabun New', 'Tahoma', 'Arial Unicode MS', sans-serif; font-size: 14px; line-height: 1.4; color: #000000;">
        <!-- Header with Logo and Company Info -->
        <div style="display: flex; align-items: flex-start; margin-bottom: 30px;">
          <!-- Logo Section -->
          <div style="margin-right: 30px; flex-shrink: 0;">
            <div style="width: 100px; height: 100px; border: 2px solid #333333; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: #ffffff;">
              <img src="/receipt_logo.png" alt="Logo" style="width: 100px; height: 100px; border-radius: 50%;" />
            </div>
          </div>
          
          <!-- Company Information -->
          <div style="flex: 1;">
            <h2 style="font-size: 16px; font-weight: bold; margin: 0 0 8px 0; text-align: center; color: #000000;">โรงเรียนเสริมทักษะสตีมคิดดีแล็บ</h2>
            <div style="text-align: center; font-size: 12px; line-height: 2; margin-bottom: 20px; color: #000000;">
              <p style="margin: 2px 0;">อาคารโครงการลาซาล อเวนิว ชั้น 2 ห้องเลขที่ H-209</p>
              <p style="margin: 2px 0;">549, 549/1 ถนนลาซาล-แบริ่ง แขวงบางนาใต้ เขตบางนา กรุงเทพฯ 10260</p>
              <p style="margin: 2px 0;"> โทรศัพท์ 083 887 1199     เลขประจำตัวผู้เสียภาษี 0105561131663</p>
            </div>
          </div>
        </div>

        <!-- Receipt Title -->
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="font-size: 18px; font-weight: bold; margin: 0; text-decoration: underline; color: #000000;">ใบเสร็จรับเงิน</h1>
        </div>

        <!-- Receipt Details -->
        <div style="margin-bottom: 25px;">
          <table style="width: 100%; font-size: 14px;">
            <tr>
              <td style="width: 120px; padding: 4px 0; color: #000000;"><strong>เอกสารเลขที่</strong></td>
              <td style="padding: 4px 0; color: #000000;">${
                invoice.documentId
              }</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; color: #000000;"><strong>วันที่ </strong></td>
              <td style="padding: 4px 0; color: #000000;">${new Date(
                invoice.date
              ).toLocaleDateString("en-US", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
              })}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; color: #000000;"><strong>ชื่อลูกค้า</strong></td>
              <td style="padding: 4px 0; color: #000000;">${
                invoice.studentName || "N/A"
              }</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; color: #000000;"><strong>ที่อยู่</strong></td>
              <td style="padding: 4px 0; color: #000000;">-</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; color: #000000;"><strong>เลขประจำตัวผู้เสียภาษีอากร  </strong></td>
              <td style="padding: 4px 0; color: #000000;">-</td>
            </tr>
          </table>
        </div>

        <!-- Items Table -->
        <div style="margin-bottom: 30px;">
          <table style="width: 100%; border-collapse: collapse; border: 2px solid #000000;">
            <thead>
              <tr>
                <th style="border: 1px solid #000000; padding: 8px; text-align: center; background: #e9ecef; width: 60px; color: #000000;"><strong>ลำดับ</strong></th>
                <th style="border: 1px solid #000000; padding: 8px; text-align: center; background: #e9ecef; color: #000000;"><strong>รายละเอียด</strong></th>
                <th style="border: 1px solid #000000; padding: 8px; text-align: center; background: #e9ecef; width: 120px; color: #000000;"><strong>จำนวนเงิน (บาท)</strong></th>
              </tr>
            </thead>
            <tbody>
              ${invoice.items
                .map(
                  (item, index) => `
                <tr>
                  <td style="border: 1px solid #000000; padding: 8px; text-align: center; color: #000000;">${
                    index + 1
                  }</td>
                  <td style="border: 1px solid #000000; padding: 8px; color: #000000;">${
                    item.description
                  }</td>
                  <td style="border: 1px solid #000000; padding: 8px; text-align: right; color: #000000;">${Number.parseFloat(
                    item.amount
                  ).toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
                </tr>
              `
                )
                .join("")}
              <!-- Empty rows to match template -->
              ${Array.from(
                { length: Math.max(0, 6 - invoice.items.length) },
                (_, i) => `
                <tr>
                  <td style="border: 1px solid #000000; padding: 8px; height: 30px; background: #ffffff;"></td>
                  <td style="border: 1px solid #000000; padding: 8px; background: #ffffff;"></td>
                  <td style="border: 1px solid #000000; padding: 8px; background: #ffffff;"></td>
                </tr>
              `
              ).join("")}
              <!-- Subtotal row -->
              <tr>
                <td style="border: 1px solid #000000; padding: 8px; background: #ffffff;"></td>
                <td style="border: 1px solid #000000; padding: 8px; text-align: right; color: #000000; background: #ffffff;"><strong>รวมจำนวนเงินทั้งสิ้น</strong></td>
                <td style="border: 1px solid #000000; padding: 8px; text-align: right; background: #e9ecef; color: #000000;"><strong>${Number.parseFloat(
                  invoice.totalAmount
                ).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}</strong></td>
              </tr>
              <!-- Payment method -->
              <tr>
                <td style="border: 1px solid #000000; padding: 8px; background: #ffffff;"></td>
                <td style="border: 1px solid #000000; padding: 8px; color: #000000; background: #ffffff;"><strong>วิธีการชำระเงิน (${
                  invoice.paymentMethod
                })</strong></td>
                <td style="border: 1px solid #000000; padding: 8px; background: #ffffff;"></td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Tax Info -->
        <div style="text-align: start; font-size: 12px; margin-bottom: 30px;">
          <p style="margin: 0; color: #000000;">Note: for bank transfer, please use SCB:4321254904.</p>
        </div>

        <!-- Signatures -->
        <div style="display: flex; justify-content: space-between; margin-top: 40px;">
          <div style="text-align: center; width: 200px;">
            <p style="margin-bottom: 60px; color: #000000;"><strong>ผู้รับเงิน</strong></p>
            <div style="border-bottom: 1px solid #000000; margin-bottom: 8px;"></div>
            <p style="margin: 0; font-size: 12px; color: #000000;">ลงชื่อ _________________ วันที่. _______</p>
          </div>
          <div style="text-align: center; width: 200px;">
            <p style="margin-bottom: 60px; color: #000000;"><strong>ผู้ปกครอง</strong></p>
            <div style="border-bottom: 1px solid #000000; margin-bottom: 8px;"></div>
            <p style="margin: 0; font-size: 12px; color: #000000;">ลงชื่อ _________________ วันที่. _______</p>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(tempContainer);

    // Generate canvas from HTML
    const canvas = await html2canvas(tempContainer, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      width: 800,
      height: tempContainer.scrollHeight,
      ignoreElements: (element) => {
        // Skip elements that might have unsupported styles
        return false;
      },
      onclone: (clonedDoc) => {
        // Override any potentially problematic styles in the cloned document
        const style = clonedDoc.createElement("style");
        style.textContent = `
          * {
            color: #000000 !important;
            background-color: transparent !important;
            border-color: #000000 !important;
          }
          div, p, h1, h2, h3, table, tr, td, th {
            background-color: #ffffff !important;
          }
          th {
            background-color: #e9ecef !important;
          }
          .total-row {
            background-color: #e9ecef !important;
          }
        `;
        clonedDoc.head.appendChild(style);
      },
    });

    // Remove temp container
    document.body.removeChild(tempContainer);

    // Create PDF with better sizing
    const imgData = canvas.toDataURL("image/png", 1.0);
    const pdf = new jsPDF("p", "mm", "a4");

    // Calculate dimensions to fit content properly
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    // Scale to fit width with some margins
    const margin = 10;
    const availableWidth = pdfWidth - 2 * margin;
    const scale = availableWidth / (canvasWidth / 2); // Divide by 2 because we scale 2x in html2canvas
    const scaledHeight = (canvasHeight / 2) * scale;

    // If content is too tall, we might need multiple pages
    if (scaledHeight > pdfHeight - 2 * margin) {
      // For now, just fit to page - in future could add multi-page support
      const availableHeight = pdfHeight - 2 * margin;
      const heightScale = availableHeight / (canvasHeight / 2);
      const finalScale = Math.min(scale, heightScale);
      const finalWidth = (canvasWidth / 2) * finalScale;
      const finalHeight = (canvasHeight / 2) * finalScale;

      pdf.addImage(imgData, "PNG", margin, margin, finalWidth, finalHeight);
    } else {
      pdf.addImage(
        imgData,
        "PNG",
        margin,
        margin,
        availableWidth,
        scaledHeight
      );
    }

    // Download the PDF
    const fileName = `Receipt_${
      invoice.documentId || "UNKNOWN"
    }_${new Date().getTime()}.pdf`;
    pdf.save(fileName);

    return true;
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw new Error("Failed to generate PDF receipt");
  }
};
