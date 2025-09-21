"use client";

import AuthLoadingPage from "@/components/auth/auth-loading";
import { useAuth } from "@/context/auth.context";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

const RootePage = () => {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only redirect when auth is not loading
    if (!isLoading) {
      if (user) {
        router.push("/today");
      } else {
        router.push("/login");
      }
    }
  }, [user, isLoading, router]);

  return <AuthLoadingPage home={true} />;
};

export default RootePage;
