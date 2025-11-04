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
    <div className="min-h-screen flex items-center justify-center bg-yellow-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white rounded-lg shadow-md border border-yellow-200 p-8">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="rounded-full bg-yellow-100 p-3">
                <ShieldX className="h-12 w-12 text-yellow-600" />
              </div>
            </div>
            
            <div>
              <h2 className="text-3xl font-bold text-gray-900">
                Access Denied
              </h2>
              <p className="mt-3 text-base text-gray-600">
                You don&apos;t have permission to access this page.
              </p>
              <p className="mt-2 text-sm text-gray-500">
                Your current role doesn&apos;t allow access to this section of the application.
              </p>
            </div>

            <div className="pt-4 space-y-3">
              <Button
                onClick={handleBackToLogin}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white"
              >
                Back to Login
              </Button>

              <Link href="/today" className="block">
                <Button 
                  variant="outline" 
                  className="w-full border-yellow-300 text-yellow-700 hover:bg-yellow-50"
                >
                  Go to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
