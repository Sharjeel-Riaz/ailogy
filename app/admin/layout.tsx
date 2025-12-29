"use client";
import React, { useState } from "react";
import { usePathname } from "next/navigation";
import AdminSideNav from "./_components/AdminSideNav";
import AdminHeader from "./_components/AdminHeader";
import { Toaster } from "@/components/ui/toaster";
import NextTopLoader from "nextjs-toploader";

function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // Don't show admin layout on sign-in page
  if (pathname?.startsWith("/admin/sign-in")) {
    return <>{children}</>;
  }

  return (
    <div className="bg-slate-100 h-screen flex overflow-hidden relative">
      <NextTopLoader color="#dc2626" height={5} showSpinner={false} />

      {/* Desktop Sidebar */}
      <div className="w-64 flex-shrink-0 hidden lg:block relative">
        <AdminSideNav isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      </div>

      {/* Mobile Sidebar - Rendered outside the flex container */}
      <div className="lg:hidden">
        <AdminSideNav isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <AdminHeader isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        <main className="flex-1 overflow-y-auto relative">
          <div className="h-full mx-auto max-w-[1600px] p-5">{children}</div>
        </main>
        <Toaster />
      </div>
    </div>
  );
}

export default AdminLayout;
