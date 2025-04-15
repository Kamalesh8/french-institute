"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import MainLayout from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getUserEnrollments } from "@/lib/services/enrollment-service";
import { getCourseById } from "@/lib/services/course-service";
import type { Course, Enrollment } from "@/lib/types";
import { FaBook, FaCalendarAlt, FaCertificate, FaGraduationCap } from "react-icons/fa";

export default function StudentDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [enrollments, setEnrollments] = useState<Array<Enrollment & { course: Course }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push("/auth/login");
      return;
    }

    if (user.role === "admin") {
      router.push("/admin");
      return;
    }

    const fetchEnrollments = async () => {
      setIsLoading(true);
      try {
        // Get all enrollments for the current user
        const userEnrollments = await getUserEnrollments(user.uid);

        // Get the course details for each enrollment
        const enrollmentsWithCourses = await Promise.all(
          userEnrollments.map(async (enrollment) => {
            const course = await getCourseById(enrollment.courseId);
            return { ...enrollment, course: course as Course };
          })
        );

        setEnrollments(enrollmentsWithCourses.filter(
          (enrollment): enrollment is Enrollment & { course: Course } =>
            enrollment.course !== null
        ));
      } catch (error) {
        console.error("Error fetching enrollments:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEnrollments();
  }, [user, router]);

  // Mock data for the dashboard
  const upcomingLessons = [
    {
      id: "lesson-1",
      title: "French Greetings and Introductions",
      date: "Monday, April 15, 2024",
      time: "10:00 AM - 11:30 AM",
      course: "A1 - Beginner French"
    },
    {
      id: "lesson-2",
      title: "Basic French Vocabulary",
      date: "Wednesday, April 17, 2024",
      time: "10:00 AM - 11:30 AM",
      course: "A1 - Beginner French"
    },
    {
      id: "lesson-3",
      title: "French Numbers and Counting",
      date: "Friday, April 19, 2024",
      time: "10:00 AM - 11:30 AM",
      course: "A1 - Beginner French"
    }
  ];

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <MainLayout>
      <div className="container py-10">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Student Dashboard</h1>
          <Button asChild>
            <Link href="/courses">Browse Courses</Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center min-h-[300px]">
            <p>Loading your courses...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Enrolled Courses</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <FaBook className="mr-2 h-4 w-4 text-primary" />
                    <span className="text-2xl font-bold">{enrollments.length}</span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Overall Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <FaGraduationCap className="mr-2 h-4 w-4 text-primary" />
                    <span className="text-2xl font-bold">
                      {enrollments.length > 0
                        ? Math.round(
                            enrollments.reduce(
                              (acc, enrollment) => acc + enrollment.progress,
                              0
                            ) / enrollments.length
                          )
                        : 0}%
                    </span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Upcoming Lessons</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <FaCalendarAlt className="mr-2 h-4 w-4 text-primary" />
                    <span className="text-2xl font-bold">{upcomingLessons.length}</span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Certificates</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <FaCertificate className="mr-2 h-4 w-4 text-primary" />
                    <span className="text-2xl font-bold">
                      {enrollments.filter(e => e.certificate).length}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Your Courses</h2>
              {enrollments.length === 0 ? (
                <Card>
                  <CardContent className="py-8">
                    <div className="text-center">
                      <h3 className="text-lg font-medium mb-2">No courses enrolled yet</h3>
                      <p className="text-muted-foreground mb-4">
                        Browse our catalog and enroll in a course to get started.
                      </p>
                      <Button asChild>
                        <Link href="/courses">Browse Courses</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {enrollments.map((enrollment) => (
                    <Card key={enrollment.id} className="overflow-hidden">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                            {enrollment.course.level}
                          </span>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                            {enrollment.course.format}
                          </span>
                        </div>
                        <CardTitle className="mt-2">{enrollment.course.title}</CardTitle>
                        <CardDescription>
                          {enrollment.course.description.length > 100
                            ? `${enrollment.course.description.substring(0, 100)}...`
                            : enrollment.course.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="mb-2">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Progress</span>
                            <span>{enrollment.progress}%</span>
                          </div>
                          <Progress value={enrollment.progress} className="h-2" />
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <div className="flex justify-between mb-1">
                            <span>Enrolled on:</span>
                            <span>{new Date(enrollment.enrollmentDate).toLocaleDateString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Status:</span>
                            <span className="capitalize">{enrollment.status}</span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="pt-2">
                        <Button asChild variant="outline" size="sm" className="w-full">
                          <Link href={`/dashboard/course/${enrollment.courseId}`}>
                            Continue Learning
                          </Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4">Upcoming Lessons</h2>
              <Card>
                <CardContent className="py-6">
                  <div className="space-y-4">
                    {upcomingLessons.map((lesson) => (
                      <div
                        key={lesson.id}
                        className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border rounded-lg"
                      >
                        <div>
                          <h3 className="font-medium">{lesson.title}</h3>
                          <p className="text-sm text-muted-foreground">{lesson.course}</p>
                        </div>
                        <div className="mt-2 md:mt-0 text-right">
                          <p className="text-sm">{lesson.date}</p>
                          <p className="text-sm text-muted-foreground">{lesson.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
}
