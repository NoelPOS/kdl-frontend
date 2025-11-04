"use client";
import React from "react";
import { useForm } from "react-hook-form";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/auth.context";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { login } from "@/lib/api";
import { showToast } from "@/lib/toast";
import {
  LoginFormData,
  UserRole,
  USER_ROLE_LABELS,
} from "@/app/types/auth.type";

import logo from "@/public/logo.png"; // Adjust the path as necessary

const Login = () => {
  const auth = useAuth();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>();

  const selectedRole = watch("role");

  const onSubmit = async (data: LoginFormData) => {
    try {
      const response = await login(data);
      if (!response.accessToken || !response.user) {
        throw new Error("Invalid response from server");
      }
      auth.login(response);
      showToast.success("Login successful!");
    } catch (error) {
      console.error("Login failed:", error);
      let errorMessage = "Login failed. Please try again.";

      if (error && typeof error === "object" && "response" in error) {
        const apiError = error as any;
        if (apiError.response?.data?.message) {
          errorMessage = apiError.response.data.message;
        } else if (apiError.response?.data?.error) {
          errorMessage = apiError.response.data.error;
        } else if (apiError.response?.data) {
          // If response.data is a string
          errorMessage =
            typeof apiError.response.data === "string"
              ? apiError.response.data
              : errorMessage;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      showToast.error(errorMessage);
      
      // Prevent any navigation on error
      return false;
    }
  };

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
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>
        <form 
          className="mt-8 space-y-6" 
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit(onSubmit)();
          }}
          noValidate
        >
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                {...register("email", { required: "Email is required" })}
                id="email"
                type="email"
                className="mt-1"
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                {...register("password", { required: "Password is required" })}
                id="password"
                type="password"
                className="mt-1"
                placeholder="Enter your password"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="role">Sign in as</Label>
              <Select
                onValueChange={(value) => setValue("role", value as UserRole)}
                {...register("role", { required: "Please select a role" })}
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
              {errors.role && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.role.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link
                href="/forgot-password"
                className="font-medium text-yellow-600 hover:text-yellow-500"
              >
                Forgot your password?
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-500 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Signing in..." : "Sign in"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
