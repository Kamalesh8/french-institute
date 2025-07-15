"use client";

import React from "react";
import Header from "./header";
import Footer from "./footer";
import { useAuth } from "@/context/auth-context";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FaTools } from "react-icons/fa";
import { usePathname } from 'next/navigation';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import Link from "next/link";

interface MainLayoutProps {
  children: React.ReactNode;
}

interface BreadcrumbItemType {
  label: string;
  href: string;
  isCurrent: boolean;
}

const getBreadcrumbItems = (pathname: string | null): BreadcrumbItemType[] => {
  if (!pathname) return [];
  
  const pathSegments = pathname.split('/').filter(segment => segment !== '');
  const items: BreadcrumbItemType[] = [];
  
  let currentPath = '';
  for (let i = 0; i < pathSegments.length; i++) {
    currentPath += `/${pathSegments[i]}`;
    const label = pathSegments[i].charAt(0).toUpperCase() + pathSegments[i].slice(1).replace(/-/g, ' ');
    
    items.push({
      label,
      href: currentPath,
      isCurrent: i === pathSegments.length - 1
    });
  }
  
  return items;
};

export default function MainLayout({ children }: MainLayoutProps) {
  const { isDemoMode } = useAuth() as { isDemoMode?: boolean };
  const pathname = usePathname();
  const breadcrumbItems = getBreadcrumbItems(pathname);
  const showBreadcrumb = pathname !== '/' && breadcrumbItems.length > 0;

  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden">
      <Header />

      {isDemoMode && (
        <Alert className="rounded-none border-primary/60 bg-primary/10 mb-0">
          <FaTools className="h-4 w-4 text-primary" />
          <AlertTitle>Development Mode</AlertTitle>
          <AlertDescription>
            Running with demo authentication. To use real functionality, create a Firebase project and update the environment variables.
          </AlertDescription>
        </Alert>
      )}

      {showBreadcrumb && (
        <div className="bg-muted/40 py-3 border-b">
          <div className="container">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href="/" className="hover:underline">
                      Home
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                {breadcrumbItems.map((item, index) => (
                  <React.Fragment key={index}>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      {item.isCurrent ? (
                        <BreadcrumbPage>{item.label}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink asChild>
                          <Link href={item.href} className="hover:underline">
                            {item.label}
                          </Link>
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                  </React.Fragment>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </div>
      )}

      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

