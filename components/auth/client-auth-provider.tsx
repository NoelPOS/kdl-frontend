"use client";
import dynamic from "next/dynamic";
import { ReactNode } from "react";
import AuthLoadingPage from "./auth-loading";

// Dynamically import AuthProvider to prevent SSR hydration issues
const AuthProvider = dynamic(() => import("@/context/auth.context"), {
  ssr: false,
  loading: () => <AuthLoadingPage />,
});

interface ClientAuthProviderProps {
  children: ReactNode;
}

const ClientAuthProvider = ({ children }: ClientAuthProviderProps) => {
  return <AuthProvider>{children}</AuthProvider>;
};

export default ClientAuthProvider;
