"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { FaHome, FaBook, FaUser, FaGraduationCap, FaChartLine, FaCalendarAlt, FaCertificate, FaSignOutAlt, FaBars, FaTimes } from "react-icons/fa";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push("/auth/login");
    } else {
      setIsLoading(false);
    }
  }, [user, router]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const navItems = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: <FaHome className="h-5 w-5" />,
      active: pathname === "/dashboard"
    },
    {
      href: "/dashboard/enrollments",
      label: "My Courses",
      icon: <FaBook className="h-5 w-5" />,
      active: pathname === "/dashboard/enrollments"
    },
    {
      href: "/profile",
      label: "Profile",
      icon: <FaUser className="h-5 w-5" />,
      active: pathname === "/profile"
    },
    {
      href: "/learn/vocabulary",
      label: "Vocabulary",
      icon: <FaGraduationCap className="h-5 w-5" />,
      active: pathname === "/learn/vocabulary"
    },
    {
      href: "/learn/grammar",
      label: "Grammar",
      icon: <FaBook className="h-5 w-5" />,
      active: pathname === "/learn/grammar"
    },
    {
      href: "/learn/pronunciation",
      label: "Pronunciation",
      icon: <FaGraduationCap className="h-5 w-5" />,
      active: pathname === "/learn/pronunciation"
    },
    {
      href: "/dashboard/progress",
      label: "Progress",
      icon: <FaChartLine className="h-5 w-5" />,
      active: pathname === "/dashboard/progress"
    },
    {
      href: "/dashboard/schedule",
      label: "Schedule",
      icon: <FaCalendarAlt className="h-5 w-5" />,
      active: pathname === "/dashboard/schedule"
    },
    {
      href: "/dashboard/certificates",
      label: "Certificates",
      icon: <FaCertificate className="h-5 w-5" />,
      active: pathname === "/dashboard/certificates"
    },
    {
      href: "/resources",
      label: "Resources",
      icon: <FaBook className="h-5 w-5" />,
      active: pathname?.startsWith("/resources")
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container py-8">
          <div className="flex">
            <div className="hidden md:block w-64 mr-8">
              <Card className="p-4">
                <Skeleton className="h-12 w-12 rounded-full mb-4" />
                <Skeleton className="h-5 w-32 mb-2" />
                <Skeleton className="h-4 w-24 mb-6" />
                
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              </Card>
            </div>
            <div className="flex-1">
              <Skeleton className="h-12 w-64 mb-6" />
              <Skeleton className="h-64 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile menu button */}
      <div className="fixed top-4 left-4 z-50 md:hidden">
        <Button
          variant="outline"
          size="icon"
          className="rounded-full bg-white shadow-md"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
        </Button>
      </div>

      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`fixed top-0 left-0 z-40 h-screen transition-transform ${
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0 bg-white dark:bg-gray-800 w-64 border-r md:sticky md:top-0 overflow-y-auto`}
        >
          <div className="p-4">
            <div className="flex flex-col items-center mb-6 pt-4">
              <Avatar className="h-16 w-16 mb-2">
                <AvatarImage src={user?.photoURL || ""} alt={user?.displayName || ""} />
                <AvatarFallback className="bg-primary text-white text-xl">
                  {user?.displayName?.charAt(0) || user?.email?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-lg font-semibold mt-2">{user?.displayName || "Student"}</h2>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>

            <nav className="space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    item.active
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.label}
                </Link>
              ))}

              <button
                onClick={handleLogout}
                className="w-full flex items-center px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
              >
                <FaSignOutAlt className="mr-3 h-5 w-5" />
                Logout
              </button>
            </nav>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}

