"use client";

import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { ClassSchedule } from "@/app/types/schedule.type";
import { exportSchedulesToPDF } from "@/lib/pdf-export-utils";
import { useState } from "react";
import { showToast } from "@/lib/toast";

interface SchedulePDFDownloadButtonProps {
  schedules: ClassSchedule[];
  currentPage?: number;
  disabled?: boolean;
}

export function SchedulePDFDownloadButton({
  schedules,
  currentPage = 1,
  disabled = false,
}: SchedulePDFDownloadButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleDownload = async () => {
    if (schedules.length === 0) {
      showToast.error("No schedules to download");
      return;
    }

    setIsExporting(true);
    try {
      const filename = `schedules_page_${currentPage}`;
      exportSchedulesToPDF(schedules, filename);
      showToast.success(`Downloaded ${schedules.length} schedule(s) as PDF successfully`);
    } catch (error) {
      console.error("Error exporting schedules to PDF:", error);
      showToast.error("Failed to download PDF");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      onClick={handleDownload}
      disabled={disabled || isExporting || schedules.length === 0}
      className="bg-red-600 hover:bg-red-700 text-white"
      size="sm"
    >
      {isExporting ? (
        <>
          <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
          Generating PDF...
        </>
      ) : (
        <>
          <FileText className="h-4 w-4 mr-2" />
          Download PDF 
        </>
      )}
    </Button>
  );
}
