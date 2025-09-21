"use client";
import React from "react";
import Image from "next/image";
import logo from "@/public/logo.png";

const AuthLoadingPage = ({ home }: { home?: boolean }) => {
  return (
    <div className={`${home ? "min-h-screen" : ""} flex items-center justify-center`}>
      <div className="text-center">
        <Image
          src={logo}
          alt="Company Logo"
          width={120}
          height={120}
          className="mx-auto mb-4"
        />
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  );
};

export default AuthLoadingPage;
