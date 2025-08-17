"use client";
import React from "react";
import Link from "next/link";
import { useAuth } from "@/context/auth.context";
import { Button } from "@/components/ui/button";
import { FileQuestion } from "lucide-react";

const NotFoundPage = () => {
  const { user, logout } = useAuth();

  const handleBackToLogin = () => {
    logout();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <FileQuestion className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h2 className="text-3xl font-extrabold text-gray-900">
            404 - Page Not Found
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            The page you&apos;re looking for doesn&apos;t exist.
          </p>
          <p className="mt-2 text-sm text-gray-500">
            It might have been moved, deleted, or you entered the wrong URL.
          </p>
        </div>

        <div className="space-y-4">
          {user ? (
            <>
              <Link href="/today">
                <Button className="w-full" variant="default">
                  Go to Dashboard
                </Button>
              </Link>

              <Button
                onClick={handleBackToLogin}
                variant="outline"
                className="w-full"
              >
                Back to Login
              </Button>
            </>
          ) : (
            <Link href="/login">
              <Button className="w-full" variant="default">
                Go to Login
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
