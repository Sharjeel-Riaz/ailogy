"use client";
import { SignIn } from "@clerk/nextjs";
import { Shield } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminSignInPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-900 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Admin Badge */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-600 mb-4"
          >
            <Shield className="h-8 w-8 text-white" />
          </motion.div>
          <h1 className="text-2xl font-bold text-white mb-2">Admin Portal</h1>
          <p className="text-gray-400">Sign in to access the admin dashboard</p>
        </div>

        {/* Clerk Sign In */}
        <div className="flex justify-center">
          <SignIn
            routing="path"
            path="/admin/sign-in"
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl",
                headerTitle: "text-white",
                headerSubtitle: "text-gray-300",
                socialButtonsBlockButton:
                  "bg-white/10 border-white/20 text-white hover:bg-white/20",
                socialButtonsBlockButtonText: "text-white",
                dividerLine: "bg-white/20",
                dividerText: "text-gray-400",
                formFieldLabel: "text-gray-300",
                formFieldInput:
                  "bg-white/10 border-white/20 text-white placeholder:text-gray-500",
                formButtonPrimary: "bg-red-600 hover:bg-red-700 text-white",
                footerActionLink: "text-red-400 hover:text-red-300",
                identityPreviewText: "text-white",
                identityPreviewEditButton: "text-red-400",
                formFieldInputShowPasswordButton: "text-gray-400",
                otpCodeFieldInput: "bg-white/10 border-white/20 text-white",
              },
              layout: {
                socialButtonsPlacement: "top",
                socialButtonsVariant: "blockButton",
              },
            }}
            forceRedirectUrl="/admin"
          />
        </div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-gray-500 text-sm mt-8"
        >
          Only authorized administrators can access this area
        </motion.p>
      </motion.div>
    </div>
  );
}
