"use client";
import React from "react";
import Link from "next/link";
import { useAuth } from "@/context/auth.context";
import { Button } from "@/components/ui/button";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  const { user, logout } = useAuth();

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
                <FileQuestion className="h-12 w-12 text-yellow-600" />
              </div>
            </div>
            
            <div>
              <h2 className="text-3xl font-bold text-gray-900">
                404 - Page Not Found
              </h2>
              <p className="mt-3 text-base text-gray-600">
                The page you&apos;re looking for doesn&apos;t exist.
              </p>
              <p className="mt-2 text-sm text-gray-500">
                It might have been moved, deleted, or you entered the wrong URL.
              </p>
            </div>

            <div className="pt-4 space-y-3">
              {user ? (
                <>
                  <Link href="/today" className="block">
                    <Button className="w-full bg-yellow-500 hover:bg-yellow-600 text-white">
                      Go to Dashboard
                    </Button>
                  </Link>

                  <Button
                    onClick={handleBackToLogin}
                    variant="outline"
                    className="w-full border-yellow-300 text-yellow-700 hover:bg-yellow-50"
                  >
                    Back to Login
                  </Button>
                </>
              ) : (
                <Link href="/login" className="block">
                  <Button className="w-full bg-yellow-500 hover:bg-yellow-600 text-white">
                    Go to Login
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
