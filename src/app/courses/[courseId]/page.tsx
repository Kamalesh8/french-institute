"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";
import MainLayout from "@/components/layout/main-layout";
import { getCourseById } from "@/lib/services/course-service";
import { createEnrollment, isUserEnrolledInCourse } from "@/lib/services/enrollment-service";
import type { Course } from "@/lib/types";
import { FaBook, FaCalendarAlt, FaClock, FaGraduationCap, FaMapMarkerAlt, FaUsers } from "react-icons/fa";

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
        <div className="container py-10 flex justify-center">
          <p>Loading course details...</p>
        </div>
      </MainLayout>
    );
  }

  if (!course) {
    return (
      <MainLayout>
        <div className="container py-10">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Course Not Found</h1>
            <p className="mb-6">The course you're looking for doesn't exist or has been removed.</p>
            <Button asChild>
              <Link href="/courses">Browse All Courses</Link>
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content - 2/3 width on desktop */}
          <div className="lg:col-span-2">
            <div className="mb-8">
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                  {course.level}
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                  {course.format}
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                  {course.status}
                </span>
              </div>

              <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
              <p className="text-muted-foreground mb-6">{course.description}</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="flex items-center gap-2">
                  <FaCalendarAlt className="text-primary" />
                  <span className="text-sm">
                    {new Date(course.startDate).toLocaleDateString()} - {new Date(course.endDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <FaClock className="text-primary" />
                  <span className="text-sm">{course.hoursPerWeek} hours/week</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaUsers className="text-primary" />
                  <span className="text-sm">
                    {course.enrolledStudents}/{course.maxStudents} students
                  </span>
                </div>
              </div>
            </div>

            <Tabs defaultValue="overview" className="mb-8">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="syllabus">Syllabus</TabsTrigger>
                <TabsTrigger value="instructor">Instructor</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Course Overview</CardTitle>
                    <CardDescription>What you'll learn in this course</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold mb-2">Course Description</h3>
                        <p className="text-muted-foreground">
                          {course.description}
                        </p>
                      </div>

                      <div>
                        <h3 className="font-semibold mb-2">Learning Outcomes</h3>
                        <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                          {course.level === "A1" && (
                            <>
                              <li>Understand and use familiar everyday expressions and basic phrases</li>
                              <li>Introduce yourself and others</li>
                              <li>Ask and answer questions about personal details</li>
                              <li>Interact in a simple way when the other person talks slowly</li>
                            </>
                          )}
                          {course.level === "A2" && (
                            <>
                              <li>Understand sentences and frequently used expressions</li>
                              <li>Communicate about routine and familiar tasks</li>
                              <li>Describe aspects of your background and environment</li>
                              <li>Express immediate needs in simple terms</li>
                            </>
                          )}
                          {course.level === "B1" && (
                            <>
                              <li>Understand the main points on familiar matters regularly encountered</li>
                              <li>Deal with most situations while traveling in French-speaking areas</li>
                              <li>Produce simple connected text on familiar topics</li>
                              <li>Describe experiences, events, dreams, and ambitions</li>
                            </>
                          )}
                          {course.level === "B2" && (
                            <>
                              <li>Understand complex texts on both concrete and abstract topics</li>
                              <li>Interact with native speakers fluently and spontaneously</li>
                              <li>Produce clear, detailed text on a wide range of subjects</li>
                              <li>Explain a viewpoint on a topical issue</li>
                            </>
                          )}
                          {course.level === "C1" && (
                            <>
                              <li>Understand a wide range of demanding, longer texts</li>
                              <li>Express ideas fluently and spontaneously</li>
                              <li>Use language flexibly and effectively for social, academic and professional purposes</li>
                              <li>Produce clear, well-structured, detailed text on complex subjects</li>
                            </>
                          )}
                          {course.level === "C2" && (
                            <>
                              <li>Understand virtually everything heard or read</li>
                              <li>Summarize information from different spoken and written sources</li>
                              <li>Express yourself spontaneously with great fluency and precision</li>
                              <li>Differentiate finer shades of meaning even in complex situations</li>
                            </>
                          )}
                        </ul>
                      </div>

                      <div>
                        <h3 className="font-semibold mb-2">Requirements</h3>
                        <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                          {course.level === "A1" && (
                            <li>No prior knowledge of French required</li>
                          )}
                          {course.level === "A2" && (
                            <li>A1 level knowledge of French required</li>
                          )}
                          {course.level === "B1" && (
                            <li>A2 level knowledge of French required</li>
                          )}
                          {course.level === "B2" && (
                            <li>B1 level knowledge of French required</li>
                          )}
                          {course.level === "C1" && (
                            <li>B2 level knowledge of French required</li>
                          )}
                          {course.level === "C2" && (
                            <li>C1 level knowledge of French required</li>
                          )}
                          <li>Reliable internet connection for online sessions</li>
                          <li>Laptop or desktop computer with audio capabilities</li>
                          <li>Commitment to complete assignments and participate in discussions</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="syllabus" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Course Syllabus</CardTitle>
                    <CardDescription>Weekly breakdown of topics</CardDescription>
                  </CardHeader>
                  <CardContent>
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

              <TabsContent value="instructor" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Meet Your Instructor</CardTitle>
                    <CardDescription>Learn from experienced teachers</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center">
                        <FaGraduationCap className="h-12 w-12 text-muted-foreground" />
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
                          <p className="text-sm">• Certified language examiner for DELF and DALF</p>
                          <p className="text-sm">• Published author of French learning materials</p>
                          <p className="text-sm">• Experienced in both group and individual instruction</p>
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
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle className="text-2xl font-bold">${course.price}</CardTitle>
                <CardDescription>
                  {course.duration} weeks, {course.hoursPerWeek} hours per week
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
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
                        className="w-full"
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
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
