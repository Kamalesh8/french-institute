"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/auth-context";
import { useSession, signOut as nextAuthSignOut } from 'next-auth/react';
import MainNav from "./main-nav";
import { FaUser, FaBars, FaTimes } from "react-icons/fa";
import Image from "next/image";
import { ThemeSwitcher } from "@/components/ui/theme-switcher";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function Header() {
  const { user, logout } = useAuth();
  const { data: session } = useSession();
  const currentUser = user || (session?.user as any) || null;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container flex h-16 items-center">
        {/* Mobile menu button and logo */}
        <div className="flex items-center md:hidden mr-4">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-10 w-10">
                <FaBars className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px] p-0">
              <div className="flex flex-col h-full">
                <div className="p-6 border-b">
                  <Link href="/" className="flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                      <Image src="/images/EB_LOGO_.jpg" alt="Logo" width={24} height={24} className="object-contain" />
                    </div>
                    <span className="text-lg font-bold text-primary">L'école Bibliothèque</span>
                  </Link>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  <MainNav onNavigate={() => setMobileMenuOpen(false)} />
                  
                  <div className="pt-4 border-t">
                    <div className="space-y-4">
                      {currentUser ? (
                        <>
                          <Button variant="outline" className="w-full justify-start" asChild>
                            <Link href={currentUser.role === 'admin' ? '/admin' : '/dashboard'} onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
                          </Button>
                          <Button variant="outline" className="w-full justify-start" asChild>
                            <Link href="/profile" onClick={() => setMobileMenuOpen(false)}>Profile</Link>
                          </Button>
                          {currentUser.role === 'student' && (
                            <Button variant="outline" className="w-full justify-start" asChild>
                              <Link href="/dashboard/enrollments" onClick={() => setMobileMenuOpen(false)}>My Courses</Link>
                            </Button>
                          )}
                        </>
                      ) : (
                        <>
                          <Button className="w-full" asChild>
                            <Link href="/auth/register" onClick={() => setMobileMenuOpen(false)}>Get Started</Link>
                          </Button>
                          <Button variant="outline" className="w-full" asChild>
                            <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>Login</Link>
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <div className="flex justify-center">
                      <ThemeSwitcher />
                    </div>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Logo */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mr-2">
              <Image src="/images/EB_LOGO_.jpg" alt="Logo" width={24} height={24} className="object-contain" />
            </div>
            <span className="text-xl font-bold text-primary hidden md:inline-block">L'école Bibliothèque</span>
            <span className="text-xl font-bold text-primary md:hidden">L'école</span>
          </Link>
        </div>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center flex-1 mx-8">
          <MainNav />
        </div>
        
        {/* Desktop Actions */}
        <div className="ml-auto flex items-center gap-4">
          <ThemeSwitcher className="hidden md:block" />
          {!currentUser && (
            <Link href="/courses" className="text-sm font-medium text-muted-foreground hover:text-primary hidden md:inline-block">
              Explore Courses
            </Link>
          )}
          {currentUser ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={(currentUser as any)?.photoURL || ""}
                      alt={(currentUser as any)?.displayName || ""}
                    />
                    <AvatarFallback className="bg-primary/10">
                      <FaUser className="h-4 w-4 text-primary" />
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {(currentUser as any)?.displayName}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {(currentUser as any)?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={(currentUser as any)?.role === 'admin' ? "/admin" : "/dashboard"}>
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile">Profile</Link>
                </DropdownMenuItem>
                {(currentUser as any)?.role === 'student' && (
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/enrollments">My Courses</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer text-red-600 focus:text-red-600"
                  onClick={() => { logout().catch(()=>{}); nextAuthSignOut({ callbackUrl: '/auth/login' }); }}
                >
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {(currentUser as any)?.displayName}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {(currentUser as any)?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={(currentUser as any)?.role === 'admin' ? "/admin" : "/dashboard"}>
                  Dashboard
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/profile">Profile</Link>
              </DropdownMenuItem>
              {(currentUser as any)?.role === 'student' && (
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/enrollments">My Courses</Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer text-red-600 focus:text-red-600"
                onClick={() => { logout().catch(()=>{}); nextAuthSignOut({ callbackUrl: '/auth/login' }); }}
              >
                Log out
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/courses" className="text-sm font-medium text-muted-foreground hover:text-primary">
                  Explore Courses
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
