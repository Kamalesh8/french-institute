"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { FaChevronDown, FaBook, FaGraduationCap, FaQuestionCircle, FaPhoneAlt, FaUserGraduate } from "react-icons/fa";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

const MainNav = () => {
  const pathname = usePathname();
  const { user } = useAuth();

  const routes = [
    {
      href: "/",
      label: "Home",
      active: pathname === "/",
      icon: <FaGraduationCap className="h-4 w-4 mr-2" />,
    },
    {
      href: "/courses",
      label: "Courses",
      active: pathname === "/courses" || pathname.startsWith("/courses/"),
      icon: <FaBook className="h-4 w-4 mr-2" />,
      children: [
        {
          href: "/courses?level=A1",
          label: "A1 - Beginner",
        },
        {
          href: "/courses?level=A2",
          label: "A2 - Elementary",
        },
        {
          href: "/courses?level=B1",
          label: "B1 - Intermediate",
        },
        {
          href: "/courses?level=B2",
          label: "B2 - Upper Intermediate",
        },
        {
          href: "/courses?level=C1",
          label: "C1 - Advanced",
        },
        {
          href: "/courses?level=C2",
          label: "C2 - Proficiency",
        },
        {
          href: "/courses?format=online",
          label: "Online Courses",
        },
        {
          href: "/courses?format=hybrid",
          label: "Hybrid Courses",
        },
      ],
    },
    {
      href: "/about",
      label: "About Us",
      active: pathname === "/about",
      icon: <FaUserGraduate className="h-4 w-4 mr-2" />,
    },
    {
      href: "/contact",
      label: "Contact",
      active: pathname === "/contact",
      icon: <FaPhoneAlt className="h-4 w-4 mr-2" />,
    },
    {
      href: "/faqs",
      label: "FAQs",
      active: pathname === "/faqs",
      icon: <FaQuestionCircle className="h-4 w-4 mr-2" />,
    },
  ];

  const navigationLinks = routes.map((route) => {
    if (route.children) {
      return (
        <DropdownMenu key={route.href}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className={`text-sm font-medium transition-colors hover:text-primary flex items-center gap-1 ${
                route.active
                  ? "text-primary"
                  : "text-muted-foreground"
              }`}
            >
              {route.label} <FaChevronDown size={12} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {route.children.map((child) => (
              <DropdownMenuItem key={child.href} asChild>
                <Link href={child.href} className="w-full">
                  {child.label}
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }

    return (
      <Link
        key={route.href}
        href={route.href}
        className={`text-sm font-medium transition-colors hover:text-primary ${
          route.active ? "text-primary" : "text-muted-foreground"
        }`}
      >
        {route.label}
      </Link>
    );
  });

  // Render the admin/student dashboard link only for desktop
  if (user && user.role === 'admin') {
    navigationLinks.push(
      <Link
        key="admin"
        href="/admin"
        className={`text-sm font-medium transition-colors hover:text-primary hidden md:inline-block ${
          pathname.startsWith("/admin") ? "text-primary" : "text-muted-foreground"
        }`}
      >
        Admin
      </Link>
    );
  } else if (user && user.role === 'student') {
    navigationLinks.push(
      <Link
        key="dashboard"
        href="/dashboard"
        className={`text-sm font-medium transition-colors hover:text-primary hidden md:inline-block ${
          pathname.startsWith("/dashboard") ? "text-primary" : "text-muted-foreground"
        }`}
      >
        Dashboard
      </Link>
    );
  }

  // Mobile navigation
  const mobileNav = (
    <Sheet>
      <SheetTrigger asChild className="md:hidden">
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[400px]">
        <div className="flex flex-col gap-4 py-4">
          {routes.map((route) => {
            if (route.children) {
              return (
                <div key={route.href} className="space-y-3">
                  <div className="font-medium flex items-center">
                    {route.icon}
                    {route.label}
                  </div>
                  <div className="pl-6 space-y-2">
                    {route.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className="block text-muted-foreground hover:text-primary"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                </div>
              );
            }

            return (
              <Link
                key={route.href}
                href={route.href}
                className={`font-medium flex items-center ${
                  route.active ? "text-primary" : "text-foreground"
                }`}
              >
                {route.icon}
                {route.label}
              </Link>
            );
          })}
          <DropdownMenuSeparator />
          {user && user.role === 'admin' && (
            <Link
              href="/admin"
              className="font-medium flex items-center"
            >
              <FaGraduationCap className="h-4 w-4 mr-2" />
              Admin Dashboard
            </Link>
          )}
          {user && user.role === 'student' && (
            <Link
              href="/dashboard"
              className="font-medium flex items-center"
            >
              <FaGraduationCap className="h-4 w-4 mr-2" />
              My Dashboard
            </Link>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );

  return (
    <nav className="flex-1 flex items-center">
      <div className="hidden md:flex mx-6 items-center space-x-4 lg:space-x-6">
        {navigationLinks}
      </div>
      <div className="ml-auto md:hidden flex items-center">
        {mobileNav}
      </div>
    </nav>
  );
};

export default MainNav;
