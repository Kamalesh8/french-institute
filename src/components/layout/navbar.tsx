"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useSession, signOut as nextAuthSignOut } from 'next-auth/react';
import NotificationCenter from "@/components/notifications/notification-center";
import { useAuth } from "@/context/auth-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FaBook, FaChartLine, FaUser } from "react-icons/fa";
import Image from "next/image";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { data: session } = useSession();
  // Prefer user from AuthContext; fallback to NextAuth session user
  const currentUser = user || (session?.user as any) || null;
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  const navigation = [
    { name: "Home", href: "/" },
    { name: "Courses", href: "/courses" },
    { name: "Messages", href: "/messages" },
  ];

  const adminNavigation = [
    { name: "Dashboard", href: "/admin", icon: FaChartLine },
    { name: "Users", href: "/admin/users", icon: FaUser },
    { name: "Courses", href: "/admin/courses", icon: FaBook },
  ];

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2 flex-shrink-0">
          <div className="w-5 h-5 rounded-full bg-primary/10 overflow-hidden">
            <Image
              src="/images/EB_LOGO_.jpg"
              alt="Logo"
              width={20}
              height={20}
              className="object-cover"
            />
          </div>
          <span className="font-bold hidden sm:inline">L'école&nbsp;Bibliothèque</span>
          <span className="font-bold sm:hidden">EB</span>
        </Link>

        <div className="hidden md:flex md:mx-6 md:gap-6">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive(item.href)
                  ? "text-foreground"
                  : "text-foreground/60"
              }`}
            >
              {item.name}
            </Link>
          ))}
          {(currentUser as any)?.role === "admin" && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  Admin
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {adminNavigation.map((item) => (
                  <DropdownMenuItem key={item.href} asChild>
                    <Link href={item.href} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      {item.name}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <div className="flex items-center gap-2 md:gap-4 ml-auto">
          <NotificationCenter />
          
          {currentUser ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={(currentUser as any)?.photoURL || ""} alt={(currentUser as any)?.displayName || ""} />
                    <AvatarFallback>
                      {(currentUser as any)?.displayName?.charAt(0) || (currentUser as any)?.email?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  // Call both logout methods to ensure full sign-out
                  logout().catch(() => {});
                  nextAuthSignOut({ callbackUrl: '/auth/login' });
                }}>
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild variant="default" className="whitespace-nowrap">
              <Link href="/auth/login">Sign in</Link>
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}

