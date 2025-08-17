"use client";
import React from "react";
import Link from "next/link";
import { useAuth } from "@/context/auth.context";
import { Button } from "@/components/ui/button";
import { ShieldX } from "lucide-react";

const UnauthorizedPage = () => {
  const { logout } = useAuth();

  const handleBackToLogin = () => {
    logout();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <ShieldX className="mx-auto h-16 w-16 text-red-500 mb-4" />
          <h2 className="text-3xl font-extrabold text-gray-900">
            Access Denied
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            You don&apos;t have permission to access this page.
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Your current role doesn&apos;t allow access to this section of the
            application.
          </p>
        </div>

        <div className="space-y-4">
          <Button
            onClick={handleBackToLogin}
            className="w-full"
            variant="default"
          >
            Back to Login
          </Button>

          <Link href="/today">
            <Button variant="outline" className="w-full">
              Go to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
