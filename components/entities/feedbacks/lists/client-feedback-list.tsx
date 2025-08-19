"use client";

import React, { useState, useEffect } from "react";
import { FeedbackItem } from "@/app/types/feedback.type";
import FeedbackCard from "../cards/feedback-card";
import { CheckCircle, Check } from "lucide-react";

interface ClientFeedbackListProps {
  initialFeedbacks: FeedbackItem[];
}

export default function ClientFeedbackList({
  initialFeedbacks,
}: ClientFeedbackListProps) {
  const [feedbacks, setFeedbacks] = useState(initialFeedbacks);

  // Update feedbacks when initialFeedbacks prop changes (i.e., when filters change)
  useEffect(() => {
    setFeedbacks(initialFeedbacks);
  }, [initialFeedbacks]);

  const handleFeedbackUpdate = (updatedFeedback: FeedbackItem) => {
    // If feedback is now verified, remove it from the list with animation
    if (updatedFeedback.verifyFb === true) {
      setFeedbacks((prev) => {
        const newFeedbacks = prev.filter(
          (feedback) => feedback.id !== updatedFeedback.id
        );

        return newFeedbacks;
      });
    } else {
      // Otherwise, update the feedback in place (though this shouldn't happen with verification)
      setFeedbacks((prev) =>
        prev.map((feedback) =>
          feedback.id === updatedFeedback.id ? updatedFeedback : feedback
        )
      );
    }
  };

  // Show empty state if all feedbacks have been verified/removed
  if (feedbacks.length === 0) {
    return (
      <div className="text-center py-12">
        <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500 opacity-50" />
        <div className="text-green-600 text-lg mb-2">
          All feedbacks verified!
        </div>
        <div className="text-gray-400 text-sm">
          All feedbacks in this view have been processed and verified.
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {feedbacks.map((feedback) => (
          <FeedbackCard
            key={feedback.id}
            feedback={feedback}
            onFeedbackUpdate={handleFeedbackUpdate}
          />
        ))}
      </div>
    </div>
  );
}
