"use client";
import React from "react";
import { ShieldX, ArrowLeft, Home, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth, SignOutButton } from "@clerk/nextjs";

interface UnauthorizedProps {
  title?: string;
  message?: string;
}

function Unauthorized({
  title = "Access Denied",
  message = "You don't have permission to access this area. Please contact an administrator if you believe this is an error.",
}: UnauthorizedProps) {
  const { isSignedIn } = useAuth();

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="text-center max-w-md mx-auto p-8"
      >
        <motion.div
          initial={{ rotate: -10 }}
          animate={{ rotate: 0 }}
          transition={{ duration: 0.5, type: "spring" }}
          className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 mb-6"
        >
          <ShieldX className="h-10 w-10 text-red-600" />
        </motion.div>

        <h1 className="text-2xl font-bold text-gray-800 mb-2">{title}</h1>
        <p className="text-gray-500 mb-8">{message}</p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/dashboard">
            <Button
              variant="outline"
              className="flex items-center gap-2 w-full sm:w-auto"
            >
              <Home className="h-4 w-4" />
              Go to Dashboard
            </Button>
          </Link>
          {isSignedIn ? (
            <SignOutButton>
              <Button className="flex items-center gap-2 bg-red-600 hover:bg-red-700 w-full sm:w-auto">
                <LogIn className="h-4 w-4" />
                Sign in as Different User
              </Button>
            </SignOutButton>
          ) : (
            <Link href="/admin/sign-in">
              <Button className="flex items-center gap-2 bg-red-600 hover:bg-red-700 w-full sm:w-auto">
                <LogIn className="h-4 w-4" />
                Admin Sign In
              </Button>
            </Link>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default Unauthorized;
