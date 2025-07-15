"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FaPlus } from "react-icons/fa";
import { useAuth } from "@/context/auth-context";
import { getCourses } from "@/lib/services/course-service";

interface Course {
  id: string;
  title: string;
  level: string;
  format: string;
  enrolledStudents?: number;
  status?: string;
}

export default function AdminCoursesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.role !== "admin") {
      router.push("/dashboard");
    } else if (!user) {
      router.push("/auth/login");
    }
  }, [user, router]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const result = await getCourses();
        console.log('getCourses result', result);
        const list = Array.isArray(result) ? result : result?.courses ?? [];
        setCourses(list);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Manage Courses</h1>
        <Button asChild>
          <Link href="/admin/courses/create">
            <FaPlus className="mr-2 h-4 w-4" /> New Course
          </Link>
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : courses.length === 0 ? (
        <p className="text-muted-foreground">No courses found.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Level</TableHead>
              <TableHead>Format</TableHead>
              <TableHead>Enrolled</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courses.map((course) => (
              <TableRow key={course.id}>
                <TableCell>{course.title}</TableCell>
                <TableCell>{course.level}</TableCell>
                <TableCell className="capitalize">{course.format}</TableCell>
                <TableCell>{course.enrolledStudents ?? 0}</TableCell>
                <TableCell className="capitalize">{course.status ?? "upcoming"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
