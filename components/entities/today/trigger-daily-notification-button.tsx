"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { showToast } from "@/lib/toast";
import { triggerDailyNotifications } from "@/lib/api";
import { Bell } from "lucide-react";

export default function TriggerDailyNotificationButton() {
  const [isLoadingToday, setIsLoadingToday] = useState(false);
  const [isLoadingThreeDays, setIsLoadingThreeDays] = useState(false);

  const handleTrigger = async (daysOffset: number) => {
    const isToday = daysOffset === 0;
    const setIsLoading = isToday ? setIsLoadingToday : setIsLoadingThreeDays;
    setIsLoading(true);
    let toastId: string | number | undefined;

    try {
      const label = isToday ? "today" : "3 days from now";
      toastId = showToast.loading(`Triggering notifications for ${label}...`);
      
      const result = await triggerDailyNotifications(daysOffset);
      
      showToast.dismiss(toastId);
      
      if (result.success) {
        const dateLabel = result.targetDate 
          ? new Date(result.targetDate).toLocaleDateString("en-TH", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })
          : label;
        showToast.success(
          `Notifications triggered successfully for ${label}`,
          `Target date: ${dateLabel}`
        );
      } else {
        showToast.error(
          `Failed to trigger notifications for ${label}`,
          result.message || "Unknown error occurred"
        );
      }
    } catch (error) {
      showToast.dismiss(toastId);
      const errorMsg =
        typeof error === "object" && error && "message" in error
          ? (error as any).message
          : `Failed to trigger notifications for ${isToday ? "today" : "3 days from now"}`;
      showToast.error("Error", errorMsg);
      console.error("Error triggering daily notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        onClick={() => handleTrigger(0)}
        disabled={isLoadingToday || isLoadingThreeDays}
        variant="outline"
        size="sm"
        className="gap-2"
      >
        <Bell className="size-4" />
        {isLoadingToday ? "Triggering..." : "Notify Today"}
      </Button>
      <Button
        onClick={() => handleTrigger(3)}
        disabled={isLoadingToday || isLoadingThreeDays}
        variant="outline"
        size="sm"
        className="gap-2"
      >
        <Bell className="size-4" />
        {isLoadingThreeDays ? "Triggering..." : "Notify 3 Days"}
      </Button>
    </div>
  );
}
