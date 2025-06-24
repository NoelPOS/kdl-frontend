"use client";

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

  return <div>Loading...</div>;
};

export default RootePage;
