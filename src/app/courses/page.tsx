import { Suspense } from "react";
import MainLayout from "@/components/layout/main-layout";
import CoursesContent from "./courses-content";

export default function CoursesPage() {
  return (
    <MainLayout>
      <Suspense fallback={<div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>}>
        <CoursesContent />
      </Suspense>
    </MainLayout>
  );
}

