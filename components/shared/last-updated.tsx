"use client";

import { formatLastUpdated } from "@/lib/utils";
import { useEffect, useState } from "react";

interface LastUpdatedProps {
  timestamp?: Date;
  className?: string;
  label?: string;
}

export default function LastUpdated({ 
  timestamp, 
  className = "",
  label = "Last updated"
}: LastUpdatedProps) {
  const [formattedTime, setFormattedTime] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      setFormattedTime(formatLastUpdated(timestamp));
    };

    // Update immediately
    updateTime();

    // Update every minute to keep the relative time current
    const interval = setInterval(updateTime, 60000);

    return () => clearInterval(interval);
  }, [timestamp]);

  if (!timestamp) return null;

  return (
    <div className={`text-xs text-gray-500 ${className}`}>
      {label}: {formattedTime}
    </div>
  );
}
