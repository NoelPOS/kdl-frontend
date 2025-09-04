"use client";

import AuthLoadingPage from "@/components/auth/auth-loading";
import { useAuth } from "@/context/auth.context";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

const RootePage = () => {
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log("auth", auth);
    if (auth.user) {
      router.push("/today");
    } else {
      router.push("/login");
    }
  }, [auth, router]);

  return <AuthLoadingPage />;
};

export default RootePage;
