"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/auth-context";
import { db } from "@/config/firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { getCourseById } from "@/lib/services/course-service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import { FaBook, FaCalendarAlt, FaCertificate, FaClock, FaDownload, FaGraduationCap, FaPlay, FaRegClock } from "react-icons/fa";

// Course level images
const COURSE_IMAGES = {
  "A1": "/images/a1-beginner.jpg",
  "A2": "/images/a2-elementary.jpg",
  "B1": "/images/b1-intermediate.jpg",
  "B2": "/images/b2-upper-intermediate.jpg",
  "C1": "/images/c1-advanced.jpg",
  "C2": "/images/c2-proficient.jpg",
};

interface Enrollment {
  id: string;
  courseId: string;
  userId: string;
  enrollmentDate: string;
  progress: number;
  progressStatus: 'not-started' | 'in-progress' | 'completed';
  lastAccessDate?: string;
  completionDate?: string;
  certificateUrl?: string;
}

interface Course {
  id: string;
  title: string;
  description: string;
  level: string;
  price: number;
  duration: string;
  format: string;
  startDate: string;
  schedule: string;
  instructor: string;
  maxStudents: number;
  enrolledStudents: number;
  syllabus?: string[];
  prerequisites?: string[];
  hoursPerWeek: number;
}

interface EnrollmentWithCourse extends Enrollment {
  course: Course;
}

export default function EnrollmentsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [enrollments, setEnrollments] = useState<EnrollmentWithCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("all");

  useEffect(() => {
    if (!user) {
      router.push("/auth/login");
      return;
    }

    const fetchEnrollments = async () => {
      try {
        const enrollmentsQuery = query(
          collection(db, "enrollments"),
          where("userId", "==", user.uid),
          orderBy("enrollmentDate", "desc")
        );

        const enrollmentsSnapshot = await getDocs(enrollmentsQuery);
        const enrollmentsData: Enrollment[] = [];

        enrollmentsSnapshot.forEach((doc) => {
          enrollmentsData.push({
            id: doc.id,
            ...doc.data() as Omit<Enrollment, 'id'>
          });
        });

        // Fetch course details for each enrollment
        const enrollmentsWithCourses = await Promise.all(
          enrollmentsData.map(async (enrollment) => {
            const course = await getCourseById(enrollment.courseId);
            return {
              ...enrollment,
              course
            };
          })
        );

        setEnrollments(enrollmentsWithCourses);
      } catch (error) {
        console.error("Error fetching enrollments:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEnrollments();
  }, [user, router]);

  const filteredEnrollments = enrollments.filter(enrollment => {
    if (activeTab === "all") return true;
    if (activeTab === "in-progress") return enrollment.progressStatus === "in-progress";
    if (activeTab === "completed") return enrollment.progressStatus === "completed";
    if (activeTab === "not-started") return enrollment.progressStatus === "not-started";
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "in-progress":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "not-started":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <DashboardLayout>
      <div className="container py-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold">My Enrollments</h1>
            <p className="text-muted-foreground">
              Manage and track your course enrollments
            </p>
          </div>
          <Button asChild>
            <Link href="/courses">Browse More Courses</Link>
          </Button>
        </div>

        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid grid-cols-4 w-full md:w-auto">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="in-progress">In Progress</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="not-started">Not Started</TabsTrigger>
          </TabsList>
        </Tabs>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="overflow-hidden">
                <div className="h-48 bg-muted relative">
                  <Skeleton className="h-full w-full" />
                </div>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-4" />
                  <div className="grid grid-cols-2 gap-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            {filteredEnrollments.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <div className="mx-auto mb-4 h-16 w-16 text-muted">
                    <FaBook className="h-full w-full" />
                  </div>
                  <h3 className="text-xl font-medium mb-2">No enrollments found</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    {activeTab === "all" 
                      ? "You haven't enrolled in any courses yet." 
                      : `You don't have any ${activeTab.replace('-', ' ')} courses.`}
                  </p>
                  <Button asChild>
                    <Link href="/courses">Browse Courses</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredEnrollments.map((enrollment) => (
                  <Card key={enrollment.id} className="overflow-hidden">
                    <div className="h-48 relative">
                      <Image
                        src={COURSE_IMAGES[enrollment.course.level as keyof typeof COURSE_IMAGES] || COURSE_IMAGES.A1}
                        alt={enrollment.course.title}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                      <div className="absolute top-4 left-4 flex gap-2">
                        <Badge className="bg-primary text-white border-none">
                          {enrollment.course.level}
                        </Badge>
                        <Badge className="bg-white text-primary border-none">
                          {enrollment.course.format}
                        </Badge>
                      </div>
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-xl font-bold text-white mb-1">{enrollment.course.title}</h3>
                        <div className="flex items-center text-white/80 text-sm">
                          <FaCalendarAlt className="mr-1" /> Enrolled: {formatDate(enrollment.enrollmentDate)}
                        </div>
                      </div>
                    </div>
                    <CardContent className="pt-4">
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">Progress</span>
                            <span className="text-sm font-medium">{enrollment.progress}%</span>
                          </div>
                          <Progress value={enrollment.progress} className="h-2" />
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <Badge className={`${getStatusColor(enrollment.progressStatus)} capitalize`}>
                            {enrollment.progressStatus.replace('-', ' ')}
                          </Badge>
                          
                          <div className="flex items-center text-sm text-muted-foreground">
                            <FaRegClock className="mr-1" />
                            {enrollment.lastAccessDate 
                              ? `Last accessed: ${formatDate(enrollment.lastAccessDate)}` 
                              : "Not started yet"}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center">
                            <FaClock className="mr-2 text-primary" /> {enrollment.course.duration}
                          </div>
                          <div className="flex items-center">
                            <FaBook className="mr-2 text-primary" /> {enrollment.course.hoursPerWeek}h/week
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between bg-muted/30 border-t">
                      {enrollment.progressStatus === "completed" && enrollment.certificateUrl ? (
                        <Button variant="outline" size="sm" className="gap-2">
                          <FaDownload className="h-4 w-4" /> Certificate
                        </Button>
                      ) : (
                        <div></div>
                      )}
                      <Button asChild className="gap-2">
                        <Link href={`/learn/${enrollment.courseId}`}>
                          <FaPlay className="h-3 w-3" />
                          {enrollment.progressStatus === "not-started" 
                            ? "Start Course" 
                            : enrollment.progressStatus === "completed" 
                              ? "Review Course" 
                              : "Continue"}
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

