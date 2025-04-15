"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";
import MainLayout from "@/components/layout/main-layout";
import { getCourseById } from "@/lib/services/course-service";
import { createEnrollment, isUserEnrolledInCourse } from "@/lib/services/enrollment-service";
import type { Course } from "@/lib/types";
import { FaBook, FaCalendarAlt, FaClock, FaGraduationCap, FaMapMarkerAlt, FaUsers, FaCheck, FaStar, FaCertificate, FaRegPlayCircle, FaChalkboardTeacher, FaComments } from "react-icons/fa";

// Sample course images based on level
const COURSE_IMAGES = {
  "A1": "https://images.unsplash.com/photo-1505902987837-9e40ec37e607?q=80&w=1740&auto=format&fit=crop",
  "A2": "https://images.unsplash.com/photo-1549737221-bef65e2604a6?q=80&w=1740&auto=format&fit=crop",
  "B1": "https://images.unsplash.com/photo-1503917988258-f87a78e3c995?q=80&w=1740&auto=format&fit=crop",
  "B2": "https://images.unsplash.com/photo-1563293756-4ee5996e3a78?q=80&w=1740&auto=format&fit=crop",
  "C1": "https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?q=80&w=1740&auto=format&fit=crop",
  "C2": "https://images.unsplash.com/photo-1599753894977-834afcf35d32?q=80&w=1740&auto=format&fit=crop",
};

export default function CourseDetailPage({ params }: { params: { courseId: string } }) {
  const { courseId } = params;
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [course, setCourse] = useState<Course | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrolling, setIsEnrolling] = useState(false);

  useEffect(() => {
    const fetchCourseAndEnrollmentStatus = async () => {
      setIsLoading(true);
      try {
        // Fetch course details
        const courseData = await getCourseById(courseId);
        setCourse(courseData as Course);

        // Check if user is enrolled in this course
        if (user) {
          const enrolled = await isUserEnrolledInCourse(user.uid, courseId);
          setIsEnrolled(enrolled);
        }
      } catch (error) {
        console.error("Error fetching course:", error);
        toast({
          variant: "destructive",
          title: "Error loading course",
          description: "Could not load course details. Please try again later.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourseAndEnrollmentStatus();
  }, [courseId, user, toast]);

  const handleEnroll = async () => {
    if (!user) {
      // Redirect to login if not authenticated
      router.push(`/auth/login?redirect=/courses/${courseId}`);
      return;
    }

    setIsEnrolling(true);
    try {
      // Create enrollment
      await createEnrollment(user.uid, courseId, course!.price);

      // Update UI state
      setIsEnrolled(true);

      toast({
        title: "Successfully enrolled!",
        description: `You are now enrolled in ${course!.title}.`,
      });

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (error) {
      console.error("Error enrolling in course:", error);

      toast({
        variant: "destructive",
        title: "Enrollment failed",
        description: "There was a problem enrolling in this course. Please try again.",
      });
    } finally {
      setIsEnrolling(false);
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container py-16 flex justify-center">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4"></div>
            <p className="text-muted-foreground">Loading course details...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!course) {
    return (
      <MainLayout>
        <div className="container py-16">
          <div className="text-center max-w-md mx-auto">
            <div className="mb-6 flex justify-center">
              <FaBook className="w-16 h-16 text-muted" />
            </div>
            <h1 className="text-2xl font-bold mb-4">Course Not Found</h1>
            <p className="mb-6 text-muted-foreground">The course you're looking for doesn't exist or has been removed.</p>
            <Button asChild size="lg">
              <Link href="/courses">Browse All Courses</Link>
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Determine level description
  const getLevelDescription = (level: string) => {
    switch(level) {
      case "A1": return "Beginner Level";
      case "A2": return "Elementary Level";
      case "B1": return "Intermediate Level";
      case "B2": return "Upper Intermediate Level";
      case "C1": return "Advanced Level";
      case "C2": return "Proficiency Level";
      default: return "";
    }
  };

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative">
        <div className="h-[350px] overflow-hidden relative">
          <div className="absolute inset-0 bg-black/40 z-10"></div>
          <Image
            src={COURSE_IMAGES[course.level] || COURSE_IMAGES.A1}
            alt={course.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 z-20 flex items-center">
            <div className="container">
              <div className="max-w-3xl">
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary text-white">
                    {course.level} - {getLevelDescription(course.level)}
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white text-gray-800">
                    {course.format}
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/80 text-gray-800">
                    {course.status}
                  </span>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold mb-4 text-white">{course.title}</h1>
                <p className="text-white/90 text-lg mb-6 max-w-2xl">{course.description}</p>
                <div className="flex flex-wrap gap-4 items-center">
                  <div className="flex items-center gap-1 text-white bg-white/20 px-3 py-2 rounded-lg">
                    <FaClock className="text-white/80" />
                    <span className="text-sm">{course.duration} weeks</span>
                  </div>
                  <div className="flex items-center gap-1 text-white bg-white/20 px-3 py-2 rounded-lg">
                    <FaBook className="text-white/80" />
                    <span className="text-sm">{course.hoursPerWeek} hours/week</span>
                  </div>
                  <div className="flex items-center gap-1 text-white bg-white/20 px-3 py-2 rounded-lg">
                    <FaUsers className="text-white/80" />
                    <span className="text-sm">{course.enrolledStudents}/{course.maxStudents} students</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Course Information */}
      <div className="container py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content - 2/3 width on desktop */}
          <div className="lg:col-span-2">
            {/* Key Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Card className="bg-primary/5 border-0">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 rounded-full p-3">
                      <FaCalendarAlt className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Course Dates</h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date(course.startDate).toLocaleDateString()} - {new Date(course.endDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-primary/5 border-0">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 rounded-full p-3">
                      <FaChalkboardTeacher className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Instructor</h3>
                      <p className="text-sm text-muted-foreground">
                        {course.instructor}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-primary/5 border-0">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 rounded-full p-3">
                      <FaComments className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Language</h3>
                      <p className="text-sm text-muted-foreground">
                        French, English
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="overview" className="mb-8">
              <TabsList className="grid w-full grid-cols-3 p-1 h-auto">
                <TabsTrigger value="overview" className="py-2 data-[state=active]:bg-primary data-[state=active]:text-white">Overview</TabsTrigger>
                <TabsTrigger value="syllabus" className="py-2 data-[state=active]:bg-primary data-[state=active]:text-white">Syllabus</TabsTrigger>
                <TabsTrigger value="instructor" className="py-2 data-[state=active]:bg-primary data-[state=active]:text-white">Instructor</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6">
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle>Course Overview</CardTitle>
                    <CardDescription>What you'll learn in this course</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-3">Course Description</h3>
                        <p className="text-muted-foreground">
                          {course.description}
                        </p>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold mb-3">Learning Outcomes</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {course.level === "A1" && (
                            <>
                              <div className="flex items-start gap-2">
                                <FaCheck className="text-primary mt-1 flex-shrink-0" />
                                <span>Understand and use familiar everyday expressions and basic phrases</span>
                              </div>
                              <div className="flex items-start gap-2">
                                <FaCheck className="text-primary mt-1 flex-shrink-0" />
                                <span>Introduce yourself and others</span>
                              </div>
                              <div className="flex items-start gap-2">
                                <FaCheck className="text-primary mt-1 flex-shrink-0" />
                                <span>Ask and answer questions about personal details</span>
                              </div>
                              <div className="flex items-start gap-2">
                                <FaCheck className="text-primary mt-1 flex-shrink-0" />
                                <span>Interact in a simple way when the other person talks slowly</span>
                              </div>
                            </>
                          )}
                          {/* Repeat with similar styling for other levels (removed for brevity) */}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold mb-3">Requirements</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {course.level === "A1" && (
                            <div className="flex items-start gap-2">
                              <FaCheck className="text-primary mt-1 flex-shrink-0" />
                              <span>No prior knowledge of French required</span>
                            </div>
                          )}
                          {course.level !== "A1" && (
                            <div className="flex items-start gap-2">
                              <FaCheck className="text-primary mt-1 flex-shrink-0" />
                              <span>
                                {course.level === "A2" && "A1 level knowledge of French required"}
                                {course.level === "B1" && "A2 level knowledge of French required"}
                                {course.level === "B2" && "B1 level knowledge of French required"}
                                {course.level === "C1" && "B2 level knowledge of French required"}
                                {course.level === "C2" && "C1 level knowledge of French required"}
                              </span>
                            </div>
                          )}
                          <div className="flex items-start gap-2">
                            <FaCheck className="text-primary mt-1 flex-shrink-0" />
                            <span>Reliable internet connection for online sessions</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <FaCheck className="text-primary mt-1 flex-shrink-0" />
                            <span>Laptop or desktop computer with audio capabilities</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <FaCheck className="text-primary mt-1 flex-shrink-0" />
                            <span>Commitment to complete assignments and participate in discussions</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-primary/5 p-6 rounded-xl">
                        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                          <FaCertificate className="text-primary" /> Course Certification
                        </h3>
                        <p className="mb-4">
                          Upon successful completion of this course, you will receive an official certificate that validates your proficiency at this level. Our certificates are recognized internationally and aligned with CEFR standards.
                        </p>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" className="gap-2">
                            <FaRegPlayCircle />
                            Watch Sample Lesson
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Other tabs with similar styling - keeping original content for brevity */}
              <TabsContent value="syllabus" className="mt-6">
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle>Course Syllabus</CardTitle>
                    <CardDescription>Weekly breakdown of topics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* Original syllabus content here */}
                    <div className="space-y-4">
                      {/* Sample syllabus - would be dynamic in a real app */}
                      <div className="border-b pb-4">
                        <h3 className="font-semibold mb-2">Week 1: Introduction to French</h3>
                        <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                          <li>Pronunciation basics and the French alphabet</li>
                          <li>Greetings and introductions</li>
                          <li>Basic phrases for everyday communication</li>
                          <li>Numbers and counting</li>
                        </ul>
                      </div>
                      <div className="border-b pb-4">
                        <h3 className="font-semibold mb-2">Week 2: Basic French Grammar</h3>
                        <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                          <li>Nouns and articles (le, la, les, un, une, des)</li>
                          <li>Subject pronouns (je, tu, il, elle, etc.)</li>
                          <li>Present tense of regular verbs</li>
                          <li>Question formation</li>
                        </ul>
                      </div>
                      <div className="border-b pb-4">
                        <h3 className="font-semibold mb-2">Week 3: Everyday Vocabulary</h3>
                        <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                          <li>Days, months, and seasons</li>
                          <li>Telling time</li>
                          <li>Family members and relationships</li>
                          <li>Basic adjectives for descriptions</li>
                        </ul>
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2">Week 4: Conversational Practice</h3>
                        <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                          <li>Ordering food and drinks</li>
                          <li>Shopping vocabulary and expressions</li>
                          <li>Asking for directions</li>
                          <li>Role-playing everyday scenarios</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="instructor" className="mt-6">
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle>Meet Your Instructor</CardTitle>
                    <CardDescription>Learn from experienced teachers</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center">
                        <FaGraduationCap className="h-12 w-12 text-primary" />
                      </div>
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-xl font-bold">{course.instructor}</h3>
                          <p className="text-muted-foreground">French Language Instructor</p>
                        </div>
                        <p className="text-muted-foreground">
                          Native French speaker with over 10 years of teaching experience. Specializes in
                          making language learning approachable and fun for students at all levels. Holds
                          a Master's degree in French Language Education from the University of Paris.
                        </p>
                        <div className="space-y-1">
                          <p className="text-sm flex items-center gap-2">
                            <FaCheck className="text-primary" />
                            Certified language examiner for DELF and DALF
                          </p>
                          <p className="text-sm flex items-center gap-2">
                            <FaCheck className="text-primary" />
                            Published author of French learning materials
                          </p>
                          <p className="text-sm flex items-center gap-2">
                            <FaCheck className="text-primary" />
                            Experienced in both group and individual instruction
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar - 1/3 width on desktop */}
          <div>
            <Card className="sticky top-20 border-0 shadow-lg rounded-xl overflow-hidden">
              <div className="bg-gradient-purple h-4"></div>
              <CardHeader>
                <CardTitle className="text-3xl font-bold">${course.price}</CardTitle>
                <CardDescription>
                  {course.duration} weeks, {course.hoursPerWeek} hours per week
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-5">
                  <div className="flex items-start gap-3">
                    <FaBook className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h3 className="font-medium">Course Level</h3>
                      <p className="text-sm text-muted-foreground">
                        {course.level === "A1" && "Beginner - No prior knowledge required"}
                        {course.level === "A2" && "Elementary - Basic knowledge required"}
                        {course.level === "B1" && "Intermediate - A2 level required"}
                        {course.level === "B2" && "Upper Intermediate - B1 level required"}
                        {course.level === "C1" && "Advanced - B2 level required"}
                        {course.level === "C2" && "Proficiency - C1 level required"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <FaCalendarAlt className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h3 className="font-medium">Schedule</h3>
                      <p className="text-sm text-muted-foreground capitalize">
                        {course.schedule} classes
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Starts {new Date(course.startDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <FaMapMarkerAlt className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h3 className="font-medium">Format</h3>
                      <p className="text-sm text-muted-foreground capitalize">
                        {course.format === "online" && "Fully online - Join from anywhere"}
                        {course.format === "hybrid" && "Hybrid - Online and in-person sessions"}
                        {course.format === "in-person" && "In-person - Physical classroom setting"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  {isEnrolled ? (
                    <div className="space-y-4">
                      <Button className="w-full" disabled>
                        Already Enrolled
                      </Button>
                      <Button
                        variant="secondary"
                        className="w-full"
                        asChild
                      >
                        <Link href="/dashboard">Go to Your Dashboard</Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Button
                        className="w-full py-6 hover-lift"
                        onClick={handleEnroll}
                        disabled={isEnrolling || course.enrolledStudents >= course.maxStudents}
                      >
                        {isEnrolling ? "Processing..." : "Enroll Now"}
                      </Button>
                      {course.enrolledStudents >= course.maxStudents && (
                        <p className="text-sm text-destructive text-center">
                          This course is currently full. Please check back later or browse other courses.
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground text-center">
                        {user ? "" : "You'll need to log in to enroll"}
                      </p>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t">
                  <p className="text-sm text-center mb-4">Share this course</p>
                  <div className="flex justify-center gap-3">
                    <Button variant="outline" size="icon" className="rounded-full w-9 h-9">
                      <FaFacebook className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="rounded-full w-9 h-9">
                      <FaTwitter className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="rounded-full w-9 h-9">
                      <FaLinkedin className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Student Reviews Section - we can add this in a future update */}
      </div>
    </MainLayout>
  );
}
