"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/auth.context";
import { useRouter } from "next/navigation";

const withProtectedRoute = <P extends object>(
  WrappedComponent: React.ComponentType<P>
) => {
  const WithProtectedRoute: React.FC<P> = (props) => {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
      if (user === null) {
        router.push("/login");
      } else {
        setIsLoading(false);
      }
    }, [user, router]);

    if (isLoading) {
      return <div>Loading...</div>;
    }

    return <WrappedComponent {...props} />;
  };

  WithProtectedRoute.displayName = `WithProtectedRoute(${getDisplayName(
    WrappedComponent
  )})`;
  return WithProtectedRoute;
};

function getDisplayName<P extends object>(
  WrappedComponent: React.ComponentType<P>
): string {
  return WrappedComponent.displayName || WrappedComponent.name || "Component";
}

export default withProtectedRoute;
