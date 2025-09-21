"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import NProgress from "nprogress";

export default function NProgressProvider() {
  const pathname = usePathname();

  useEffect(() => {
    // Configure nprogress options
    NProgress.configure({
      showSpinner: false, // Hide spinner
      minimum: 0.15, // Start at 15%
      trickleSpeed: 100, // Faster trickle
      easing: "ease",
      speed: 200, // Animation speed
    });
    NProgress.start();
    // Complete the progress bar after a short delay to simulate loading
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

// For custom nprogress color or height, add the CSS example (see documentation) to your globals.css file.
