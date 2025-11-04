"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import NProgress from "nprogress";

export default function NProgressProvider() {
  const pathname = usePathname();

  useEffect(() => {
    NProgress.configure({
      showSpinner: false, 
      minimum: 0.15,
      trickleSpeed: 100,
      easing: "ease",
      speed: 200,
    });
    NProgress.start();
    const timer = setTimeout(() => {
      NProgress.done();
    }, 300);

    return () => {
      clearTimeout(timer);
      NProgress.done();
    };
  }, [pathname]);

  return null;
}


