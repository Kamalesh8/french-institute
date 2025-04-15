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
} from "@/components/ui/dropdown-menu";
import { FaChevronDown } from "react-icons/fa";

const MainNav = () => {
  const pathname = usePathname();
  const { user } = useAuth();

  const routes = [
    {
      href: "/",
      label: "Home",
      active: pathname === "/",
    },
    {
      href: "/courses",
      label: "Courses",
      active: pathname === "/courses",
      children: [
        {
          href: "/courses/a1",
          label: "A1 - Beginner",
        },
        {
          href: "/courses/a2",
          label: "A2 - Elementary",
        },
        {
          href: "/courses/b1",
          label: "B1 - Intermediate",
        },
        {
          href: "/courses/b2",
          label: "B2 - Upper Intermediate",
        },
        {
          href: "/courses/c1",
          label: "C1 - Advanced",
        },
        {
          href: "/courses/c2",
          label: "C2 - Proficiency",
        },
      ],
    },
    {
      href: "/about",
      label: "About Us",
      active: pathname === "/about",
    },
    {
      href: "/contact",
      label: "Contact",
      active: pathname === "/contact",
    },
  ];

  return (
    <nav className="mx-6 flex items-center space-x-4 lg:space-x-6">
      {routes.map((route) => {
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
              <DropdownMenuContent align="end">
                {route.children.map((child) => (
                  <DropdownMenuItem key={child.href}>
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
      })}

      {user && user.role === 'admin' && (
        <Link
          href="/admin"
          className={`text-sm font-medium transition-colors hover:text-primary ${
            pathname.startsWith("/admin") ? "text-primary" : "text-muted-foreground"
          }`}
        >
          Admin Dashboard
        </Link>
      )}

      {user && user.role === 'student' && (
        <Link
          href="/dashboard"
          className={`text-sm font-medium transition-colors hover:text-primary ${
            pathname.startsWith("/dashboard") ? "text-primary" : "text-muted-foreground"
          }`}
        >
          My Dashboard
        </Link>
      )}
    </nav>
  );
};

export default MainNav;
