import React from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientAuthProvider from "@/components/auth/client-auth-provider";
import AuthGuard from "@/components/auth/auth-guard";
import NProgressProvider from "@/components/layout/nprogress-provider";
import { Toaster } from "@/components/ui/sonner";
import { QueryProvider } from "@/components/providers/query-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kiddee Lab - Learning Management System",
  description: "Learning Management System ",
};

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NProgressProvider />
        <QueryProvider>
          <ClientAuthProvider>
            <AuthGuard>{children}</AuthGuard>
          </ClientAuthProvider>
        </QueryProvider>
        <Toaster />
      </body>
    </html>
  );
};

export default RootLayout;
