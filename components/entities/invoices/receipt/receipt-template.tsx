"use client";

import React from "react";
import { Invoice } from "@/app/types/invoice.type";

interface ReceiptTemplateProps {
  invoice: Invoice;
}

export const ReceiptTemplate = React.forwardRef<
  HTMLDivElement,
  ReceiptTemplateProps
>(({ invoice }, ref) => {
  return (
    <div
      ref={ref}
      className="bg-white p-8 max-w-2xl mx-auto"
      style={{ fontSize: "14px" }}
    >
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          KDL Learning Center
        </h1>
        <p className="text-gray-600">Payment Receipt</p>
        <div className="border-b-2 border-gray-300 mt-4"></div>
      </div>

      {/* Receipt Info */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="font-semibold text-gray-700 mb-2">Receipt Details</h3>
          <p>
            <span className="font-medium">Receipt ID:</span>{" "}
            {invoice.documentId}
          </p>
          <p>
            <span className="font-medium">Date:</span>{" "}
            {new Date(invoice.date).toLocaleDateString()}
          </p>
          <p>
            <span className="font-medium">Payment Method:</span>{" "}
            {invoice.paymentMethod}
          </p>
        </div>
        <div>
          <h3 className="font-semibold text-gray-700 mb-2">
            Student Information
          </h3>
          <p>
            <span className="font-medium">Student Name:</span>{" "}
            {invoice.studentName || "N/A"}
          </p>
          <p>
            <span className="font-medium">Course:</span>{" "}
            {invoice.courseName || "N/A"}
          </p>
        </div>
      </div>

      {/* Items Table */}
      <div className="mb-8">
        <h3 className="font-semibold text-gray-700 mb-4">Payment Details</h3>
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-50">
              <th className="border border-gray-300 px-4 py-2 text-left">
                Description
              </th>
              <th className="border border-gray-300 px-4 py-2 text-right">
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item) => (
              <tr key={item.id}>
                <td className="border border-gray-300 px-4 py-2">
                  {item.description}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-right">
                  ${item.amount}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-50 font-semibold">
              <td className="border border-gray-300 px-4 py-2">Total Amount</td>
              <td className="border border-gray-300 px-4 py-2 text-right">
                ${invoice.totalAmount}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Session Groups */}
      {invoice.sessionGroups && invoice.sessionGroups.length > 0 && (
        <div className="mb-8">
          <h3 className="font-semibold text-gray-700 mb-4">
            Session Information
          </h3>
          <div className="grid grid-cols-1 gap-2">
            {invoice.sessionGroups.map((group, index) => (
              <div key={index} className="bg-gray-50 p-3 rounded">
                <p>
                  <span className="font-medium">Session ID:</span>{" "}
                  {group.sessionId}
                </p>
                <p>
                  <span className="font-medium">Type:</span>{" "}
                  {group.transactionType}
                </p>
                <p>
                  <span className="font-medium">Reference ID:</span>{" "}
                  {group.actualId}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="border-t-2 border-gray-300 pt-4 mt-8">
        <div className="text-center text-gray-600">
          <p className="mb-2">Thank you for your payment!</p>
          <p className="text-sm">
            This is an official receipt from KDL Learning Center
          </p>
          <p className="text-sm">Generated on: {new Date().toLocaleString()}</p>
        </div>
      </div>

      {/* Contact Info */}
      <div className="text-center text-gray-500 text-xs mt-6">
        <p>
          KDL Learning Center | Contact: info@kdl.com | Phone: +1-234-567-8900
        </p>
      </div>
    </div>
  );
});

ReceiptTemplate.displayName = "ReceiptTemplate";
