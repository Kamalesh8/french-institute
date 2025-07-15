"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getCourses } from "@/lib/services/course-service";
import type { User } from "@/lib/types";
import { collection, getDocs, query, where, limit, orderBy, CollectionReference } from "firebase/firestore";
import { FirebaseError } from "firebase/app";
import { db } from "@/config/firebase";
import { Firestore } from "firebase/firestore";
import MainLayout from "@/components/layout/main-layout";

// Define types for Firestore collections
interface FirestoreCourse {
  title: string;
  level: string;
  format: string;
  createdAt: string;
  enrolledStudents?: number;
  maxStudents?: number;
}

interface FirestoreUser {
  email: string;
  displayName: string;
  role: string;
  createdAt: string;
}
import { FaChalkboardTeacher, FaUsers, FaBookOpen, FaCertificate, FaChartBar, FaCalendarAlt } from "react-icons/fa";

interface Course {
  id: string;
  title: string;
  level: string;
  format: string;
  createdAt: string;
  status?: string;
  enrolledStudents?: { id: string; email: string }[];
}

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Show a page-level spinner until auth finishes
  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    router.push("/");
    return null;
  }

  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [totalCourses, setTotalCourses] = useState(0);
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalEnrollments, setTotalEnrollments] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const coursesCollection = collection(db, "courses") as CollectionReference<Course>;
    const usersCollection = collection(db, "users") as CollectionReference<User>;

    const fetchCourses = async () => {
      try {
        const coursesQuery = query(
          coursesCollection,
          orderBy("createdAt", "desc"),
          limit(10)
        );
        const coursesSnapshot = await getDocs(coursesQuery);
        const coursesData = coursesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));

        setCourses(coursesData);
        setTotalCourses(coursesSnapshot.size);
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };

    const fetchStudents = async () => {
      try {
        let studentsSnapshot;
        try {
          const studentsQuery = query(
            usersCollection,
            where("role", "==", "student"),
            orderBy("createdAt", "desc"),
            limit(10)
          );
          studentsSnapshot = await getDocs(studentsQuery);
        } catch (err) {
          if (err instanceof FirebaseError && err.code === "failed-precondition") {
            // Missing composite index – fallback to simple filter without orderBy
            const fallbackQuery = query(
              usersCollection,
              where("role", "==", "student"),
              limit(10)
            );
            studentsSnapshot = await getDocs(fallbackQuery);
          } else {
            throw err;
          }
        }

        const studentsData = studentsSnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            uid: doc.id,
            ...data,
            createdAt: (data.createdAt as any)?.toDate?.() ? (data.createdAt as any).toDate().toISOString() : data.createdAt,
          } as User;
        });

        setStudents(studentsData);
        setTotalStudents(studentsSnapshot.size);
      } catch (error) {
        console.error("Error fetching students:", error);
      }
    };

    const fetchEnrollments = async () => {
      try {
        const coursesSnapshot = await getDocs(coursesCollection);
        const totalEnrollments = coursesSnapshot.docs.reduce((sum, doc) => {
          const course = doc.data() as Course;
          return sum + (course.enrolledStudents?.length || 0);
        }, 0);

        setTotalEnrollments(totalEnrollments);
      } catch (error) {
        console.error("Error fetching enrollments:", error);
      }
    };

    setIsLoading(true);
    Promise.all([fetchCourses(), fetchStudents(), fetchEnrollments()])
      .finally(() => setIsLoading(false));
  }, []);

  return (
    
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
              <FaBookOpen className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCourses}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <FaUsers className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStudents}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Enrollments</CardTitle>
              <FaCertificate className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalEnrollments}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
              <FaChartBar className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{courses.length}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Recent Courses</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Format</TableHead>
                  <TableHead>Students</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courses.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell>{course.title}</TableCell>
                    <TableCell>{course.level}</TableCell>
                    <TableCell>{course.format}</TableCell>
                    <TableCell>{course.enrolledStudents?.length || 0}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Recent Students</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.uid}>
                    <TableCell>{student.displayName}</TableCell>
                    <TableCell>{student.email}</TableCell>
                    <TableCell>{new Date(student.createdAt).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center min-h-[300px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            <div className="mt-8">
              <Button asChild className="mr-4">
                <Link href="/admin/courses">Manage Courses</Link>
              </Button>
              <Button asChild>
                <Link href="/admin/students">Manage Students</Link>
              </Button>
            </div>

            <div className="mt-8">
              <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button asChild variant="outline" className="h-auto py-4 flex flex-col gap-2">
                  <Link href="/admin/courses/create">
                    <FaBookOpen className="h-5 w-5 mb-1" />
                    <span>Create New Course</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-auto py-4 flex flex-col gap-2">
                  <Link href="/admin/communications">
                    <FaUsers className="h-5 w-5 mb-1" />
                    <span>Send Communication</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-auto py-4 flex flex-col gap-2">
                  <Link href="/admin/reports">
                    <FaChalkboardTeacher className="h-5 w-5 mb-1" />
                    <span>View Reports</span>
                  </Link>
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    
  );
}

