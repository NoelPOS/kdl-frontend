"use client";

import { Package2, Calendar, User, CheckCircle, XCircle } from "lucide-react";
import { Package } from "@/app/types/package.type";
import { ApplyPackageDialog } from "../dialogs/apply-package-dialog";

interface PackageCardProps {
  package: Package;
}

export function PackageCard({ package: pkg }: PackageCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "used":
        return "bg-green-100 text-green-800 border-green-200";
      case "not_used":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "used":
        return <CheckCircle className="h-4 w-4" />;
      case "not_used":
        return <XCircle className="h-4 w-4" />;
      default:
        return <XCircle className="h-4 w-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "used":
        return "Used";
      case "not_used":
        return "Not Used";
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Package2 className="h-5 w-5 text-yellow-500" />
          <h3 className="font-semibold text-gray-900">
            {pkg.classOptionTitle}
          </h3>
        </div>
        <div
          className={`px-2 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${getStatusColor(
            pkg.status
          )}`}
        >
          {getStatusIcon(pkg.status)}
          {getStatusText(pkg.status)}
        </div>
      </div>

      <div className="space-y-3">
        {/* Student Info */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <User className="h-4 w-4" />
          <span>{pkg.studentName}</span>
        </div>

        {/* Class Details */}
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Fee: ${pkg.tuitionFee}</span>
          <span>Limit: {pkg.classLimit} students</span>
        </div>

        {/* Purchase Date */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="h-4 w-4" />
          <span>Purchased: {formatDate(pkg.purchaseDate)}</span>
        </div>

        {/* Redeemed Info (if redeemed) */}
        {pkg.isRedeemed && pkg.redeemedCourseName && (
          <div className="bg-green-50 p-2 rounded border-l-4 border-green-400">
            <div className="text-xs text-green-600">Redeemed for</div>
            <div className="font-medium text-green-800">
              {pkg.redeemedCourseName}
            </div>
            {pkg.redeemedAt && (
              <div className="text-xs text-green-600">
                on {formatDate(pkg.redeemedAt)}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Apply Package Button - only show if package is not used */}
      {pkg.status === "not_used" && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <ApplyPackageDialog package={pkg} />
        </div>
      )}
    </div>
  );
}
