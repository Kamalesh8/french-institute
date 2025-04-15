"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import MainLayout from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getCourses } from "@/lib/services/course-service";
import type { User } from "@/lib/types";
import { collection, getDocs, query, where, limit, orderBy } from "firebase/firestore";
import { db } from "@/config/firebase";
import { FaChalkboardTeacher, FaUsers, FaBookOpen, FaCertificate } from "react-icons/fa";

export default function AdminDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [courses, setCourses] = useState<any[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [totalCourses, setTotalCourses] = useState(0);
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalEnrollments, setTotalEnrollments] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push("/auth/login");
      return;
    }

    if (user.role !== "admin") {
      router.push("/dashboard");
      return;
    }

    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // Fetch recent courses
        const coursesData = await getCourses({ pageSize: 5, sortBy: 'createdAt', sortDirection: 'desc' });
        setCourses(coursesData.courses);

        // Get total courses count
        const coursesCollection = collection(db, "courses");
        const coursesSnapshot = await getDocs(coursesCollection);
        setTotalCourses(coursesSnapshot.size);

        // Fetch recent students
        const studentsQuery = query(
          collection(db, "users"),
          where("role", "==", "student"),
          orderBy("createdAt", "desc"),
          limit(5)
        );

        const studentsSnapshot = await getDocs(studentsQuery);
        const studentsData: User[] = [];
        studentsSnapshot.forEach((doc) => {
          studentsData.push({ id: doc.id, ...doc.data() } as User);
        });
        setStudents(studentsData);

        // Get total students count
        const studentsCountQuery = query(
          collection(db, "users"),
          where("role", "==", "student")
        );
        const studentsCountSnapshot = await getDocs(studentsCountQuery);
        setTotalStudents(studentsCountSnapshot.size);

        // Get total enrollments count
        const enrollmentsCollection = collection(db, "enrollments");
        const enrollmentsSnapshot = await getDocs(enrollmentsCollection);
        setTotalEnrollments(enrollmentsSnapshot.size);
      } catch (error) {
        console.error("Error fetching admin dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, router]);

  if (!user || user.role !== "admin") {
    return null; // Will redirect in useEffect
  }

  return (
    <MainLayout>
      <div className="container py-10">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <Button asChild>
            <Link href="/admin/courses/create">Create New Course</Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center min-h-[300px]">
            <p>Loading dashboard data...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Total Courses</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <FaBookOpen className="mr-2 h-4 w-4 text-primary" />
                    <span className="text-2xl font-bold">{totalCourses}</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" size="sm" asChild className="w-full">
                    <Link href="/admin/courses">Manage Courses</Link>
                  </Button>
                </CardFooter>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Total Students</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <FaUsers className="mr-2 h-4 w-4 text-primary" />
                    <span className="text-2xl font-bold">{totalStudents}</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" size="sm" asChild className="w-full">
                    <Link href="/admin/students">Manage Students</Link>
                  </Button>
                </CardFooter>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Total Enrollments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <FaChalkboardTeacher className="mr-2 h-4 w-4 text-primary" />
                    <span className="text-2xl font-bold">{totalEnrollments}</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" size="sm" asChild className="w-full">
                    <Link href="/admin/enrollments">View Enrollments</Link>
                  </Button>
                </CardFooter>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Certificates Issued</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <FaCertificate className="mr-2 h-4 w-4 text-primary" />
                    <span className="text-2xl font-bold">
                      {/* This would be calculated from actual certificate data */}
                      {Math.floor(totalEnrollments * 0.4)}
                    </span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" size="sm" asChild className="w-full">
                    <Link href="/admin/certificates">Manage Certificates</Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div>
                <h2 className="text-2xl font-bold mb-4">Recent Courses</h2>
                <Card>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Course Title</TableHead>
                          <TableHead>Level</TableHead>
                          <TableHead>Format</TableHead>
                          <TableHead>Students</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {courses.length > 0 ? (
                          courses.map((course) => (
                            <TableRow key={course.id}>
                              <TableCell className="font-medium">
                                <Link
                                  href={`/admin/courses/${course.id}`}
                                  className="hover:underline text-primary"
                                >
                                  {course.title}
                                </Link>
                              </TableCell>
                              <TableCell>{course.level}</TableCell>
                              <TableCell>{course.format}</TableCell>
                              <TableCell>{course.enrolledStudents}/{course.maxStudents}</TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center py-4">
                              No courses found.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                  <CardFooter className="flex justify-center border-t py-2">
                    <Button asChild variant="link">
                      <Link href="/admin/courses">View All Courses</Link>
                    </Button>
                  </CardFooter>
                </Card>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">Recent Students</h2>
                <Card>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Registration Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {students.length > 0 ? (
                          students.map((student) => (
                            <TableRow key={student.uid}>
                              <TableCell className="font-medium">
                                <Link
                                  href={`/admin/students/${student.uid}`}
                                  className="hover:underline text-primary"
                                >
                                  {student.displayName}
                                </Link>
                              </TableCell>
                              <TableCell>{student.email}</TableCell>
                              <TableCell>
                                {new Date(student.createdAt).toLocaleDateString()}
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={3} className="text-center py-4">
                              No students found.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                  <CardFooter className="flex justify-center border-t py-2">
                    <Button asChild variant="link">
                      <Link href="/admin/students">View All Students</Link>
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>

            <div>
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
    </MainLayout>
  );
}
