"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/auth-context";
import MainLayout from "@/components/layout/main-layout";
import ProtectedRoute from "@/components/auth/protected-route";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getUserEnrollments } from "@/lib/services/enrollment-service";
import { getCourseById } from "@/lib/services/course-service";
import type { Course, Enrollment } from "@/lib/types";
import {
  FaBook,
  FaCalendarAlt,
  FaCertificate,
  FaGraduationCap,
  FaChartLine,
  FaTrophy,
  FaCheckCircle,
  FaArrowRight,
  FaClock,
  FaUser,
  FaStar,
  FaPlayCircle,
  FaBell,
  FaRocket
} from "react-icons/fa";
import { ProgressDashboard } from "@/components/dashboard/progress-dashboard";

// Course level image mapping
const COURSE_IMAGES = {
  "A1": "/images/a1-beginner.jpg",
  "A2": "/images/a2-elementary.jpg",
  "B1": "/images/b1-intermediate.jpg",
  "B2": "/images/b2-upper-intermediate.jpg",
  "C1": "/images/c1-advanced.jpg",
  "C2": "/images/c2-proficient.jpg",
};

function DashboardContent() {
  const { user } = useAuth();
  const { data: session, status } = useSession();

  // Build a unified user object from Firebase or NextAuth session
  const currentUser = user || (status === "authenticated" ? {
    // note: NextAuth users are not authenticated with Firebase so Firestore client calls may fail

    uid: (session.user as any).id,
    email: session.user.email,
    displayName: session.user.name,
    role: (session.user as any).role || "student",
    photoURL: session.user.image
  } : null);
  const router = useRouter();
  const [enrollments, setEnrollments] = useState<Array<Enrollment & { course: Course }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("courses");
  
  // Show nothing only when we truly have no authenticated context
  if (status === "unauthenticated" && !user) {
    return null; // ProtectedRoute will handle redirection
  }

  useEffect(() => {
    if (status === "authenticated" && session.user.role === "admin") {
      router.push("/admin");
      return;
    }

    if (!user) {
      // If we're not signed into Firebase, skip Firestore client queries
      setIsLoading(false);
      return;
    }
    const fetchEnrollments = async () => {
      setIsLoading(true);
      try {
        // Get all enrollments for the current user
        const userEnrollments = await getUserEnrollments(currentUser.uid);

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
  }, [user, currentUser, status, router]);

  // Mock data for the dashboard
  const upcomingLessons = [
    {
      id: "lesson-1",
      title: "French Greetings and Introductions",
      date: "Monday, April 15, 2024",
      time: "10:00 AM - 11:30 AM",
      course: "A1 - Beginner French",
      image: "/images/lesson-1.jpg"
    },
    {
      id: "lesson-2",
      title: "Basic French Vocabulary",
      date: "Wednesday, April 17, 2024",
      time: "10:00 AM - 11:30 AM",
      course: "A1 - Beginner French",
      image: "/images/lesson-2.jpg"
    },
    {
      id: "lesson-3",
      title: "French Numbers and Counting",
      date: "Friday, April 19, 2024",
      time: "10:00 AM - 11:30 AM",
      course: "A1 - Beginner French",
      image: "/images/lesson-3.jpg"
    }
  ];

  // Mock achievements data
  const achievements = [
    {
      id: "achievement-1",
      title: "First Lesson Completed",
      description: "Completed your first lesson",
      icon: <FaCheckCircle className="text-green-500" />,
      earned: true,
      date: "April 10, 2024"
    },
    {
      id: "achievement-2",
      title: "Perfect Quiz Score",
      description: "Score 100% on a quiz",
      icon: <FaTrophy className="text-yellow-500" />,
      earned: true,
      date: "April 12, 2024"
    },
    {
      id: "achievement-3",
      title: "Fast Learner",
      description: "Complete 5 lessons in a week",
      icon: <FaRocket className="text-blue-500" />,
      earned: false
    }
  ];

  // Mock announcements
  const announcements = [
    {
      id: "announcement-1",
      title: "New French Culture Course Coming Soon",
      date: "April 10, 2024",
      description: "We're excited to announce a new course on French culture and traditions launching next month!"
    },
    {
      id: "announcement-2",
      title: "Website Maintenance This Weekend",
      date: "April 12, 2024",
      description: "Our platform will be undergoing maintenance this Saturday from 2 AM to 5 AM UTC."
    }
  ];

  if (!currentUser) {
    return null; // Will redirect in useEffect
  }

  // Get average progress
  const averageProgress = enrollments.length > 0
    ? Math.round(
        enrollments.reduce(
          (acc, enrollment) => acc + enrollment.progress,
          0
        ) / enrollments.length
      )
    : 0;

  // Get progress status
  const getProgressStatus = (progress: number) => {
    if (progress < 25) return "Just Started";
    if (progress < 50) return "Making Progress";
    if (progress < 75) return "Well Underway";
    if (progress < 100) return "Almost Complete";
    return "Completed";
  };

  // Generate student greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <MainLayout>
      {/* Hero section */}
      <section className="bg-gradient-purple text-white py-8">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">{getGreeting()}, {currentUser.displayName?.split(' ')[0] || 'Student'}</h1>
              <p className="text-white/80">
                {enrollments.length > 0
                  ? `You're making great progress! Continue your French learning journey.`
                  : `Welcome to your learning dashboard. Start your French learning journey today!`
                }
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20" asChild>
                <Link href="/courses">Browse Courses</Link>
              </Button>
              <Button className="bg-white text-primary hover:bg-white/90" asChild>
                <Link href="/profile">My Profile</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="container py-8">
        {isLoading ? (
          <div className="flex justify-center items-center min-h-[300px]">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4"></div>
              <p className="text-muted-foreground">Loading your dashboard...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Stats overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              <Card className="bg-primary/5 border-none shadow-sm hover-lift">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-full bg-primary/10">
                      <FaBook className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-muted-foreground text-sm">Enrolled Courses</p>
                      <h3 className="text-3xl font-bold">{enrollments.length}</h3>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-primary/5 border-none shadow-sm hover-lift">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-full bg-primary/10">
                      <FaChartLine className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-muted-foreground text-sm">Overall Progress</p>
                      <h3 className="text-3xl font-bold">{averageProgress}%</h3>
                      <p className="text-xs text-muted-foreground">{getProgressStatus(averageProgress)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-primary/5 border-none shadow-sm hover-lift">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-full bg-primary/10">
                      <FaCalendarAlt className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-muted-foreground text-sm">Upcoming Lessons</p>
                      <h3 className="text-3xl font-bold">{upcomingLessons.length}</h3>
                      {upcomingLessons.length > 0 && (
                        <p className="text-xs text-primary">Next: {new Date(upcomingLessons[0].date).toLocaleDateString()}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-primary/5 border-none shadow-sm hover-lift">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-full bg-primary/10">
                      <FaCertificate className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-muted-foreground text-sm">Certificates</p>
                      <h3 className="text-3xl font-bold">
                        {enrollments.filter(e => e.certificate).length}
                      </h3>
                      {enrollments.some(e => e.certificate) ? (
                        <p className="text-xs text-primary">View Certificates</p>
                      ) : (
                        <p className="text-xs text-muted-foreground">Complete courses to earn</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Next lesson - prominent call to action */}
            {upcomingLessons.length > 0 && (
              <div className="mb-10 relative overflow-hidden rounded-xl bg-gradient-to-r from-primary/90 to-secondary/90 shadow-md">
                <div className="absolute inset-0 opacity-20">
                  <Image
                    src={upcomingLessons[0].image}
                    alt="Upcoming lesson"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="relative z-10 p-6 md:p-8 text-white">
                  <div className="flex flex-col md:flex-row justify-between gap-6">
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <FaClock className="h-4 w-4" />
                        <p className="text-sm font-medium">Upcoming Lesson</p>
                      </div>
                      <h2 className="text-xl md:text-2xl font-bold mb-2">{upcomingLessons[0].title}</h2>
                      <p className="mb-4">{upcomingLessons[0].course}</p>
                      <div className="flex flex-wrap items-center gap-4 text-sm">
                        <span className="flex items-center gap-1">
                          <FaCalendarAlt />
                          {upcomingLessons[0].date}
                        </span>
                        <span className="flex items-center gap-1">
                          <FaClock />
                          {upcomingLessons[0].time}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Button size="lg" className="bg-white text-primary hover:bg-white/90 gap-2 hover-lift">
                        <FaPlayCircle />
                        Join Lesson
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Main dashboard content */}
            <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="mb-10">
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 p-1 h-auto mb-6">
                <TabsTrigger value="courses" className="py-2 data-[state=active]:bg-primary data-[state=active]:text-white">
                  My Courses
                </TabsTrigger>
                <TabsTrigger value="schedule" className="py-2 data-[state=active]:bg-primary data-[state=active]:text-white">
                  Schedule
                </TabsTrigger>
                <TabsTrigger value="progress" className="py-2 data-[state=active]:bg-primary data-[state=active]:text-white">
                  Progress
                </TabsTrigger>
                <TabsTrigger value="achievements" className="py-2 data-[state=active]:bg-primary data-[state=active]:text-white">
                  Achievements
                </TabsTrigger>
                <TabsTrigger value="announcements" className="py-2 data-[state=active]:bg-primary data-[state=active]:text-white">
                  Announcements
                </TabsTrigger>
              </TabsList>

              {/* Courses tab */}
              <TabsContent value="courses">
                <div>
                  <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Your Courses</h2>
                    <Button asChild variant="outline" className="mt-2 md:mt-0">
                      <Link href="/courses">Browse More Courses</Link>
                    </Button>
                  </div>

                  {enrollments.length === 0 ? (
                    <Card className="text-center p-12 bg-muted/10 border-dashed">
                      <CardContent className="pt-0">
                        <div className="mx-auto mb-4 h-20 w-20 text-muted">
                          <FaBook className="h-full w-full" />
                        </div>
                        <h3 className="text-xl font-medium mb-2">No courses enrolled yet</h3>
                        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                          Browse our catalog and enroll in a course to begin your French learning journey.
                        </p>
                        <Button asChild size="lg">
                          <Link href="/courses">Explore Courses</Link>
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {enrollments.map((enrollment) => (
                        <Card key={enrollment.id} className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-all rounded-xl">
                          <div className="relative h-40">
                            <Image
                              src={COURSE_IMAGES[enrollment.course.level] || COURSE_IMAGES.A1}
                              alt={enrollment.course.title}
                              fill
                              className="object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                            <div className="absolute bottom-4 left-4 right-4 text-white">
                              <div className="flex justify-between items-center">
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-primary/80 text-white">
                                  {enrollment.course.level}
                                </span>
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-white/80 text-gray-800">
                                  {enrollment.course.format}
                                </span>
                              </div>
                            </div>
                          </div>
                          <CardHeader className="pb-2">
                            <CardTitle className="line-clamp-1">{enrollment.course.title}</CardTitle>
                            <CardDescription className="line-clamp-2">
                              {enrollment.course.description}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="mb-4">
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-muted-foreground">Progress</span>
                                <span className="font-medium">{enrollment.progress}%</span>
                              </div>
                              <Progress value={enrollment.progress} className="h-2" />
                            </div>
                            <div className="flex flex-wrap justify-between text-sm text-muted-foreground gap-y-1">
                              <div className="flex items-center gap-1">
                                <FaCalendarAlt className="text-primary h-3 w-3" />
                                <span>Enrolled on: {new Date(enrollment.enrollmentDate).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <FaUser className="text-primary h-3 w-3" />
                                <span>Instructor: {enrollment.course.instructor}</span>
                              </div>
                            </div>
                          </CardContent>
                          <CardFooter>
                            <Button className="w-full gap-2 hover-lift" asChild>
                              <Link href={`/dashboard/course/${enrollment.courseId}`}>
                                Continue Learning
                                <FaArrowRight className="h-3 w-3" />
                              </Link>
                            </Button>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Progress tab */}
              <TabsContent value="progress">
                <ProgressDashboard />
              </TabsContent>

              {/* Schedule tab */}
              <TabsContent value="schedule">
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Upcoming Lessons</h2>
                    <Button variant="outline" size="sm">View Full Calendar</Button>
                  </div>

                  <div className="space-y-4">
                    {upcomingLessons.map((lesson) => (
                      <Card key={lesson.id} className="overflow-hidden border-0 shadow-sm">
                        <div className="flex flex-col md:flex-row">
                          <div className="relative w-full md:w-48 h-40 md:h-auto">
                            <Image
                              src={lesson.image}
                              alt={lesson.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1 p-6">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                              <div>
                                <h3 className="text-lg font-medium mb-1">{lesson.title}</h3>
                                <p className="text-sm text-muted-foreground mb-2">{lesson.course}</p>
                                <div className="flex items-center gap-4 text-sm">
                                  <span className="flex items-center gap-1 text-muted-foreground">
                                    <FaCalendarAlt className="h-3 w-3" />
                                    {lesson.date}
                                  </span>
                                  <span className="flex items-center gap-1 text-muted-foreground">
                                    <FaClock className="h-3 w-3" />
                                    {lesson.time}
                                  </span>
                                </div>
                              </div>
                              <div className="flex gap-2 self-end md:self-auto mt-4 md:mt-0">
                                <Button variant="outline" size="sm">Add to Calendar</Button>
                                <Button className="gap-1" size="sm">
                                  <FaPlayCircle className="h-3 w-3" />
                                  Join
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* Achievements tab */}
              <TabsContent value="achievements">
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Your Achievements</h2>
                    <Button variant="outline" size="sm">View All</Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {achievements.map((achievement) => (
                      <Card
                        key={achievement.id}
                        className={`border-0 ${achievement.earned ? 'bg-primary/5' : 'bg-muted/40'} hover-lift`}
                      >
                        <CardContent className="pt-6">
                          <div className="flex justify-between mb-4">
                            <div className="p-3 rounded-full bg-white">
                              {achievement.icon}
                            </div>
                            {achievement.earned && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <FaCheckCircle className="text-green-500" />
                                Earned on {achievement.date}
                              </div>
                            )}
                          </div>
                          <h3 className="font-medium mb-1">{achievement.title}</h3>
                          <p className="text-sm text-muted-foreground">{achievement.description}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* Announcements tab */}
              <TabsContent value="announcements">
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Announcements</h2>
                  </div>

                  <div className="space-y-4">
                    {announcements.map((announcement) => (
                      <Card key={announcement.id} className="overflow-hidden border-0 shadow-sm">
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <div className="p-3 rounded-full bg-primary/10 text-primary">
                              <FaBell />
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between mb-1">
                                <h3 className="font-medium">{announcement.title}</h3>
                                <span className="text-xs text-muted-foreground">{announcement.date}</span>
                              </div>
                              <p className="text-sm text-muted-foreground">{announcement.description}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {/* Learning statistics - we can add later */}
          </>
        )}
      </div>
    </MainLayout>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}

