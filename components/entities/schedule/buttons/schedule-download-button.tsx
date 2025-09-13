"use client";

import { Button } from "@/components/ui/button";
import { FileSpreadsheet } from "lucide-react";
import { ClassSchedule } from "@/app/types/schedule.type";
import { exportSchedulesToExcel } from "@/lib/excel-utils";
import { useState } from "react";
import { showToast } from "@/lib/toast";

interface ScheduleDownloadButtonProps {
  schedules: ClassSchedule[];
  currentPage?: number;
  disabled?: boolean;
}

export function ScheduleDownloadButton({
  schedules,
  currentPage = 1,
  disabled = false,
}: ScheduleDownloadButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleDownload = async () => {
    if (schedules.length === 0) {
      showToast.error("No schedules to download");
      return;
    }

    setIsExporting(true);
    try {
      const filename = `schedules_page_${currentPage}`;
      exportSchedulesToExcel(schedules, filename);
      showToast.success(`Downloaded ${schedules.length} schedule(s) successfully`);
    } catch (error) {
      console.error("Error exporting schedules:", error);
      showToast.error("Failed to download schedules");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      onClick={handleDownload}
      disabled={disabled || isExporting || schedules.length === 0}
      className="bg-green-600 hover:bg-green-700 text-white"
      size="sm"
    >
      {isExporting ? (
        <>
          <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
          Downloading...
        </>
      ) : (
        <>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Download Excel 
        </>
      )}
    </Button>
  );
}
