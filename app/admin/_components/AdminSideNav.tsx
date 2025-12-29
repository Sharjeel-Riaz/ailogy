"use client";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  BookOpen,
  BarChart3,
  Home,
  PanelLeftClose,
  Shield,
  FolderOpen,
  FileText,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { v4 as uuidv4 } from "uuid";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

interface AdminSideNavProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

function AdminSideNav({ isOpen, toggleSidebar }: AdminSideNavProps) {
  const path = usePathname();

  const MenuList = [
    {
      section: "OVERVIEW",
      items: [
        {
          name: "Dashboard",
          icon: LayoutDashboard,
          path: "/admin",
        },
        {
          name: "Analytics",
          icon: BarChart3,
          path: "/admin/analytics",
        },
      ],
    },
    {
      section: "CONTENT",
      items: [
        {
          name: "Subjects",
          icon: FolderOpen,
          path: "/admin/subjects",
        },
        {
          name: "Coursework",
          icon: FileText,
          path: "/admin/coursework",
        },
        {
          name: "Tutors",
          icon: BookOpen,
          path: "/admin/tutors",
        },
        
      ],
    },
    {
      section: "USERS & BILLING",
      items: [
        {
          name: "Users",
          icon: Users,
          path: "/admin/users",
        },
        {
          name: "Subscriptions",
          icon: CreditCard,
          path: "/admin/subscriptions",
        },
      ],
    },
  ];

  const sidebarVariants = {
    hidden: {
      x: "-100%",
      borderRadius: "0 100% 100% 0",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 40,
      },
    },
    visible: {
      x: 0,
      borderRadius: "0%",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 40,
      },
    },
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3,
      },
    },
  };

  // Common sidebar content that will be used for both mobile and desktop
  const renderSidebarContent = (isMobile?: boolean) => (
    <div className="flex flex-col h-full">
      {/* Logo section */}
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <Image src="/logo.svg" alt="logo" width={120} height={120} />
          <div className="flex items-center gap-1 bg-red-100 px-2 py-1 rounded-full">
            <Shield className="h-3 w-3 text-red-600" />
            <span className="text-xs font-semibold text-red-600">Admin</span>
          </div>
        </div>
        {isMobile && (
          <button
            onClick={toggleSidebar}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close sidebar"
          >
            <PanelLeftClose className="h-6 w-6" />
          </button>
        )}
      </div>
      <hr className="mb-4 border" />

      {/* Menu sections */}
      <div className="flex-1">
        {MenuList.map((section) => (
          <div key={uuidv4()} className="mb-4">
            <h3 className="text-xs font-medium tracking-wide text-gray-500 mb-3">
              {section.section}
            </h3>
            {section.items.map((menu) => (
              <Link
                href={menu.path}
                key={uuidv4()}
                onClick={isMobile ? toggleSidebar : undefined}
                className="block"
              >
                <div
                  className={`flex gap-2 mb-3 p-2 hover:bg-red-600 hover:text-white
                    rounded-lg cursor-pointer items-center transition-all hover-parent
                    ${path === menu.path ? "bg-red-600 text-white" : ""}`}
                >
                  <menu.icon className="h-5 w-5 icon-bounce" />
                  <h2 className="text-lg">{menu.name}</h2>
                </div>
              </Link>
            ))}
          </div>
        ))}
      </div>

      {/* Footer section */}
      <div className="mt-auto pt-4">
        <Link href="/dashboard">
          <div className="flex gap-2 p-2 hover:bg-gray-100 rounded-lg cursor-pointer items-center transition-all mb-3">
            <Home className="h-5 w-5" />
            <h2 className="text-lg">Back to Dashboard</h2>
          </div>
        </Link>
        <hr className="my-3 border" />
        <p className="text-xs text-center text-gray-500">
          © {new Date().getFullYear()} StudyStudio Admin
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block h-full">
        <div className="h-full flex flex-col p-5 shadow-sm border bg-white">
          {renderSidebarContent()}
        </div>
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <motion.div
              className="fixed inset-0 bg-black/50 z-[998] lg:hidden"
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={overlayVariants}
              onClick={toggleSidebar}
            />

            {/* Mobile Sidebar */}
            <motion.div
              className="fixed inset-0 w-full max-w-[300px] z-[999] lg:hidden"
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={sidebarVariants}
            >
              <div className="h-full bg-white p-5">
                {renderSidebarContent(true)}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export default AdminSideNav;
