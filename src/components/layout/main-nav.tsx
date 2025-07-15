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
import Image from "next/image";
import { ThemeSwitcher } from "@/components/ui/theme-switcher";

interface MainNavProps {
  onNavigate?: () => void;
}

const MainNav = ({ onNavigate }: MainNavProps) => {
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
      active: pathname ? (pathname === "/courses" || pathname.startsWith("/courses/")) : false,
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
      ],
    },
    {
      href: "/learn",
      label: "Learn",
      active: pathname ? pathname.startsWith("/learn") : false,
      icon: <FaGraduationCap className="h-4 w-4 mr-2" />,
      children: [
        {
          href: "/learn/vocabulary",
          label: "Vocabulary",
        },
        {
          href: "/learn/grammar",
          label: "Grammar",
        },
        {
          href: "/learn/pronunciation",
          label: "Pronunciation",
        },
        {
          href: "/placement-test",
          label: "Placement Test",
        },
      ],
    },
    ...(user ? [{
      href: "/resources",
      label: "Resources",
      active: pathname ? pathname.startsWith("/resources") : false,
      icon: <FaBook className="h-4 w-4 mr-2" />,
    }] : []),
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
              className={`text-sm font-medium transition-colors hover:text-primary hover-lift flex items-center gap-1 ${
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
              <DropdownMenuItem
                  key={child.href}
                  asChild
                  className="focus:bg-primary focus:text-white hover:bg-primary hover:text-white"
                >
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
        className={`text-sm font-medium transition-colors hover:text-primary hover-lift ${
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
        className={`text-sm font-medium transition-colors hover:text-primary hover-lift hidden md:inline-block ${
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
        className={`text-sm font-medium transition-colors hover:text-primary hover-lift hidden md:inline-block ${
          pathname.startsWith("/dashboard") ? "text-primary" : "text-muted-foreground"
        }`}
      >
        Dashboard
      </Link>
    );
  }

  return (
    <nav className="flex-1 flex items-center overflow-x-auto whitespace-nowrap">
      {/* Desktop Navigation */}
      <div className="hidden md:flex mx-4 items-center space-x-3 lg:space-x-6">
        {navigationLinks}
      </div>
      
      {/* Mobile Navigation Toggle */}
      <div className="md:hidden ml-auto">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="h-10 w-10">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] sm:w-[400px] p-0">
            <div className="flex flex-col h-full">
              <div className="p-6 border-b">
                <Link href="/" className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <Image 
                      src="/images/EB_LOGO_.jpg" 
                      alt="Logo" 
                      width={24} 
                      height={24} 
                      className="object-contain" 
                    />
                  </div>
                  <span className="text-lg font-bold text-primary">L'école Bibliothèque</span>
                </Link>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {routes.map((route) => (
                  <div key={route.href} className="space-y-2">
                    {route.children ? (
                      <div className="space-y-2">
                        <div className="font-medium text-foreground/80 flex items-center">
                          {route.icon}
                          {route.label}
                        </div>
                        <div className="pl-6 space-y-3">
                          {route.children.map((child) => (
                            <Link
                              key={child.href}
                              href={child.href}
                              onClick={onNavigate}
                              className={cn(
                                "block py-1.5 text-sm",
                                pathname === child.href
                                  ? "text-primary font-medium"
                                  : "text-muted-foreground hover:text-foreground"
                              )}
                            >
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <Link
                        href={route.href}
                        className={`flex items-center py-2 text-sm font-medium ${
                          route.active 
                            ? 'text-primary' 
                            : 'text-foreground/80 hover:text-foreground'
                        }`}
                      >
                        {route.icon}
                        <span className="ml-2">{route.label}</span>
                      </Link>
                    )}
                  </div>
                ))}

                {(user?.role === 'admin' || user?.role === 'student') && (
                  <div className="pt-4 border-t mt-4">
                    <Link
                      href={user.role === 'admin' ? '/admin' : '/dashboard'}
                      className={`flex items-center py-2 text-sm font-medium ${
                        pathname.startsWith(user.role === 'admin' ? '/admin' : '/dashboard')
                          ? 'text-primary'
                          : 'text-foreground/80 hover:text-foreground'
                      }`}
                    >
                      <FaGraduationCap className="h-4 w-4" />
                      <span className="ml-2">
                        {user.role === 'admin' ? 'Admin Dashboard' : 'My Dashboard'}
                      </span>
                    </Link>
                  </div>
                )}
              </div>
              
              <div className="p-6 border-t">
                <ThemeSwitcher />
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
};

export default MainNav;

