"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import Link from "next/link";
import Image from "next/image";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { showToast } from "@/lib/toast";
import { UserRole, USER_ROLE_LABELS } from "@/app/types/auth.type";
import { requestPasswordReset, resetPassword, verifyResetToken } from "@/lib/api";
import { ArrowLeft, Mail, Lock, CheckCircle } from "lucide-react";

import logo from "@/public/logo.png";

type Step = "request" | "verify" | "reset" | "success";

interface RequestResetFormData {
  email: string;
  role: UserRole;
}

interface VerifyTokenFormData {
  token: string;
}

interface ResetPasswordFormData {
  newPassword: string;
  confirmPassword: string;
}

function ForgotPassword() {
  const [currentStep, setCurrentStep] = useState<Step>("request");
  const [email, setEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [role, setRole] = useState<UserRole | null>(null);

  const requestForm = useForm<RequestResetFormData>();
  const verifyForm = useForm<VerifyTokenFormData>();
  const resetForm = useForm<ResetPasswordFormData>();

  const onRequestReset = async (data: RequestResetFormData) => {
    try {
      await requestPasswordReset(data.email, data.role);
      setEmail(data.email);
      setRole(data.role);
      setCurrentStep("verify");
      showToast.success("Password reset code sent to your email!");
    } catch (error: any) {
      console.error("Password reset request failed:", error);
      const errorMessage = error?.response?.data?.message || "Failed to send reset code. Please try again.";
      showToast.error(errorMessage);
    }
  };

  const onVerifyToken = async (data: VerifyTokenFormData) => {
    try {
      await verifyResetToken(data.token, email, role!);
      setResetToken(data.token);
      setCurrentStep("reset");
      showToast.success("Code verified successfully!");
    } catch (error: any) {
      console.error("Token verification failed:", error);
      const errorMessage = error?.response?.data?.message || "Invalid or expired code. Please try again.";
      showToast.error(errorMessage);
    }
  };

  const onResetPassword = async (data: ResetPasswordFormData) => {
    if (data.newPassword !== data.confirmPassword) {
      showToast.error("Passwords do not match");
      return;
    }

    try {
      await resetPassword(resetToken, data.newPassword, email, role!);
      setCurrentStep("success");
      showToast.success("Password reset successfully!");
    } catch (error: any) {
      console.error("Password reset failed:", error);
      const errorMessage = error?.response?.data?.message || "Failed to reset password. Please try again.";
      showToast.error(errorMessage);
    }
  };

  const renderRequestStep = () => (
    <form onSubmit={requestForm.handleSubmit(onRequestReset)} className="space-y-6">
      <div className="text-center mb-6">
        <Mail className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
        <p className="text-gray-600 mt-2">
          Enter your email and role to receive a password reset code
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="email">Email Address</Label>
          <Input
            {...requestForm.register("email", { 
              required: "Email is required",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Invalid email address"
              }
            })}
            id="email"
            type="email"
            className="mt-1"
            placeholder="Enter your email"
          />
          {requestForm.formState.errors.email && (
            <p className="mt-1 text-sm text-red-600">
              {requestForm.formState.errors.email.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="role">Your Role</Label>
          <Select
            onValueChange={(value) => requestForm.setValue("role", value as UserRole)}
          >
            <SelectTrigger className="mt-1 w-full">
              <SelectValue placeholder="Select your role" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(USER_ROLE_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {requestForm.formState.errors.role && (
            <p className="mt-1 text-sm text-red-600">
              {requestForm.formState.errors.role.message}
            </p>
          )}
        </div>
      </div>

      <Button
        type="submit"
        disabled={requestForm.formState.isSubmitting}
        className="w-full bg-yellow-500 hover:bg-yellow-600 text-white"
      >
        {requestForm.formState.isSubmitting ? "Sending..." : "Send Reset Code"}
      </Button>

      <div className="text-center">
        <Link
          href="/login"
          className="text-sm text-yellow-600 hover:text-yellow-500  flex items-center justify-start  gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Login
        </Link>
      </div>
    </form>
  );

  const renderVerifyStep = () => (
    <form onSubmit={verifyForm.handleSubmit(onVerifyToken)} className="space-y-6">
      <div className="text-center mb-6">
        <Mail className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">Check Your Email</h2>
        <p className="text-gray-600 mt-2">
          We've sent a 6-digit code to <strong>{email}</strong>
        </p>
      </div>

      <div>
        <Label htmlFor="token">Verification Code</Label>
        <Input
          {...verifyForm.register("token", { 
            required: "Verification code is required",
            pattern: {
              value: /^\d{6}$/,
              message: "Code must be 6 digits"
            }
          })}
          id="token"
          type="text"
          maxLength={6}
          className="mt-1 text-center text-lg tracking-widest"
          placeholder="000000"
        />
        {verifyForm.formState.errors.token && (
          <p className="mt-1 text-sm text-red-600">
            {verifyForm.formState.errors.token.message}
          </p>
        )}
      </div>

      <Button
        type="submit"
        disabled={verifyForm.formState.isSubmitting}
        className="w-full bg-yellow-500 hover:bg-yellow-600 text-white"
      >
        {verifyForm.formState.isSubmitting ? "Verifying..." : "Verify Code"}
      </Button>

      <div className="text-center space-y-2">
        <button
          type="button"
          onClick={() => onRequestReset({ email, role: role! })}
          className="text-sm text-yellow-600 hover:text-yellow-500"
        >
          Resend code
        </button>
        <br />
        <button
          type="button"
          onClick={() => setCurrentStep("request")}
          className="text-sm text-gray-600 hover:text-gray-500 flex items-center justify-start gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          Change email
        </button>
      </div>
    </form>
  );

  const renderResetStep = () => (
    <form onSubmit={resetForm.handleSubmit(onResetPassword)} className="space-y-6">
      <div className="text-center mb-6">
        <Lock className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
        <p className="text-gray-600 mt-2">
          Enter your new password below
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="newPassword">New Password</Label>
          <Input
            {...resetForm.register("newPassword", { 
              required: "Password is required",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters"
              }
            })}
            id="newPassword"
            type="password"
            className="mt-1"
            placeholder="Enter new password"
          />
          {resetForm.formState.errors.newPassword && (
            <p className="mt-1 text-sm text-red-600">
              {resetForm.formState.errors.newPassword.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            {...resetForm.register("confirmPassword", { 
              required: "Please confirm your password"
            })}
            id="confirmPassword"
            type="password"
            className="mt-1"
            placeholder="Confirm new password"
          />
          {resetForm.formState.errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600">
              {resetForm.formState.errors.confirmPassword.message}
            </p>
          )}
        </div>
      </div>

      <Button
        type="submit"
        disabled={resetForm.formState.isSubmitting}
        className="w-full bg-yellow-500 hover:bg-yellow-600 text-white"
      >
        {resetForm.formState.isSubmitting ? "Resetting..." : "Reset Password"}
      </Button>
    </form>
  );

  const renderSuccessStep = () => (
    <div className="text-center space-y-6">
      <CheckCircle className="mx-auto h-16 w-16 text-yellow-500" />
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Password Reset Successful!</h2>
        <p className="text-gray-600 mt-2">
          Your password has been successfully reset. You can now log in with your new password.
        </p>
      </div>
      
      <Link href="/login">
        <Button className="bg-yellow-500 hover:bg-yellow-600 text-white">
          Go to Login
        </Button>
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Image
            src={logo}
            alt="Company Logo"
            width={120}
            height={120}
            className="mx-auto mb-4"
          />
        </div>

        <div className="bg-white py-8 px-6 shadow rounded-lg">
          {currentStep === "request" && renderRequestStep()}
          {currentStep === "verify" && renderVerifyStep()}
          {currentStep === "reset" && renderResetStep()}
          {currentStep === "success" && renderSuccessStep()}
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
