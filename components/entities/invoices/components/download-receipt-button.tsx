"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Invoice } from "@/app/types/invoice.type";
import { generateReceiptPDF } from "@/lib/pdf-utils";
import { showToast } from "@/lib/toast";
import { generateSimpleReceiptPDF } from "@/lib/simple-pdf-utils";

interface DownloadReceiptButtonProps {
  invoice: Invoice;
}

export function DownloadReceiptButton({ invoice }: DownloadReceiptButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadReceipt = async () => {
    if (isDownloading) return; // Prevent multiple downloads

    setIsDownloading(true);

    try {
      await generateReceiptPDF(invoice);
      showToast.success("Receipt downloaded successfully!");
    } catch (error) {
      await generateSimpleReceiptPDF(invoice);
      console.error("Error downloading receipt:", error);
      showToast.error("Failed to download receipt. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Button
      onClick={handleDownloadReceipt}
      disabled={isDownloading}
      className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-1 rounded-lg disabled:opacity-50"
    >
      {isDownloading ? (
        <>
          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
          Downloading...
        </>
      ) : (
        "Download Receipt"
      )}
    </Button>
  );
}
