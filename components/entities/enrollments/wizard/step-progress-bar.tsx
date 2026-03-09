"use client";

import { cn } from "@/lib/utils";

interface StepProgressBarProps {
  currentStep: number;
  totalSteps: number;
  stepLabels: string[];
}

export function StepProgressBar({
  currentStep,
  totalSteps,
  stepLabels,
}: StepProgressBarProps) {
  return (
    <div className="flex items-center w-full">
      {Array.from({ length: totalSteps }).map((_, i) => {
        const stepNum = i + 1;
        const isCompleted = stepNum < currentStep;
        const isCurrent = stepNum === currentStep;
        const isFuture = stepNum > currentStep;

        return (
          <div key={i} className="flex items-center flex-1 last:flex-none">
            {/* Step circle + label */}
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300",
                  isCompleted &&
                    "bg-primary text-primary-foreground",
                  isCurrent &&
                    "bg-primary text-primary-foreground ring-[3px] ring-primary/30",
                  isFuture &&
                    "bg-muted text-muted-foreground border border-border"
                )}
              >
                {isCompleted ? (
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  stepNum
                )}
              </div>
              <span
                className={cn(
                  "text-[10px] whitespace-nowrap max-w-[80px] text-center truncate",
                  isCurrent
                    ? "text-primary font-medium"
                    : "text-muted-foreground"
                )}
              >
                {stepLabels[i]}
              </span>
            </div>

            {/* Connector line */}
            {i < totalSteps - 1 && (
              <div className="flex-1 mx-2 h-0.5 rounded-full relative overflow-hidden bg-border">
                <div
                  className={cn(
                    "absolute inset-y-0 left-0 bg-primary rounded-full transition-[width] duration-500 ease-out",
                    isCompleted ? "w-full" : "w-0"
                  )}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
