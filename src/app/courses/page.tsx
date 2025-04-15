"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MainLayout from "@/components/layout/main-layout";
import { getCourses } from "@/lib/services/course-service";
import type { Course, CourseLevel } from "@/lib/types";
import type { DocumentSnapshot } from "firebase/firestore";

// Course levels in order
const COURSE_LEVELS: CourseLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

export default function CoursesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeLevel, setActiveLevel] = useState<CourseLevel>("A1");
  const [activeFormat, setActiveFormat] = useState<string>("all");
  const [lastVisible, setLastVisible] = useState<DocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(true);

  // Get all courses on initial load, filtered by level if specified in URL
  useEffect(() => {
    const levelParam = searchParams.get("level") as CourseLevel | null;
    const level = levelParam && COURSE_LEVELS.includes(levelParam) ? levelParam : "A1";

    setActiveLevel(level);
    fetchCourses(level);
  }, [searchParams]);

  // Fetch courses with filtering
  const fetchCourses = async (level: CourseLevel, format?: string, loadMore = false) => {
    setIsLoading(true);

    try {
      // Prepare filter options
      const options: any = {
        pageSize: 12,
        level,
        sortBy: 'startDate',
        sortDirection: 'asc',
      };

      // Add format filter if not "all"
      if (format && format !== "all") {
        options.format = format;
      }

      // Add pagination if loading more
      if (loadMore && lastVisible) {
        options.lastVisible = lastVisible;
      } else if (!loadMore) {
        // Reset courses if not loading more
        setCourses([]);
      }

      // Fetch courses
      const result = await getCourses(options);

      // Update courses state
      setCourses(prev => loadMore ? [...prev, ...result.courses] : result.courses);

      // Update pagination state
      setLastVisible(result.lastVisible);
      setHasMore(result.courses.length >= options.pageSize);
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle level change
  const handleLevelChange = (level: string) => {
    const newLevel = level as CourseLevel;
    setActiveLevel(newLevel);
    // Reset pagination
    setLastVisible(null);
    // Update URL
    router.push(`/courses?level=${newLevel}${activeFormat !== 'all' ? `&format=${activeFormat}` : ''}`);
    // Fetch courses with new level
    fetchCourses(newLevel, activeFormat !== 'all' ? activeFormat : undefined);
  };

  // Handle format change
  const handleFormatChange = (format: string) => {
    setActiveFormat(format);
    // Reset pagination
    setLastVisible(null);
    // Update URL
    router.push(`/courses?level=${activeLevel}${format !== 'all' ? `&format=${format}` : ''}`);
    // Fetch courses with new format
    fetchCourses(activeLevel, format !== 'all' ? format : undefined);
  };

  // Load more courses
  const handleLoadMore = () => {
    fetchCourses(activeLevel, activeFormat !== 'all' ? activeFormat : undefined, true);
  };

  return (
    <MainLayout>
      <div className="container py-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <h1 className="text-3xl font-bold">French Language Courses</h1>

          {/* Format filters */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={activeFormat === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => handleFormatChange("all")}
            >
              All Formats
            </Button>
            <Button
              variant={activeFormat === "online" ? "default" : "outline"}
              size="sm"
              onClick={() => handleFormatChange("online")}
            >
              Online
            </Button>
            <Button
              variant={activeFormat === "hybrid" ? "default" : "outline"}
              size="sm"
              onClick={() => handleFormatChange("hybrid")}
            >
              Hybrid
            </Button>
            <Button
              variant={activeFormat === "in-person" ? "default" : "outline"}
              size="sm"
              onClick={() => handleFormatChange("in-person")}
            >
              In Person
            </Button>
          </div>
        </div>

        {/* Level Tabs */}
        <Tabs value={activeLevel} onValueChange={handleLevelChange} className="mb-8">
          <TabsList className="grid grid-cols-3 md:grid-cols-6 mb-4">
            {COURSE_LEVELS.map((level) => (
              <TabsTrigger key={level} value={level} className="relative">
                {level}
                <span className="absolute top-0 right-2 text-xs font-semibold text-primary">
                  {level === "A1" && "Beginner"}
                  {level === "C2" && "Advanced"}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Tab content */}
          {COURSE_LEVELS.map((level) => (
            <TabsContent key={level} value={level} className="mt-0">
              <div className="flex flex-col space-y-4">
                <div className="bg-muted p-4 rounded-lg mb-4">
                  <h2 className="text-xl font-bold mb-2">
                    {level === "A1" && "A1 - Beginner Level"}
                    {level === "A2" && "A2 - Elementary Level"}
                    {level === "B1" && "B1 - Intermediate Level"}
                    {level === "B2" && "B2 - Upper Intermediate Level"}
                    {level === "C1" && "C1 - Advanced Level"}
                    {level === "C2" && "C2 - Proficiency Level"}
                  </h2>
                  <p className="text-muted-foreground">
                    {level === "A1" && "Start your French journey with basic vocabulary, greetings, and simple phrases. Perfect for absolute beginners."}
                    {level === "A2" && "Build on the basics and start expressing yourself in everyday situations. Learn to describe your environment and routine."}
                    {level === "B1" && "Reach intermediate fluency by discussing familiar topics, travel experiences, and plans. Express opinions and explain viewpoints."}
                    {level === "B2" && "Achieve upper intermediate skills. Interact with native speakers with fluency and spontaneity on a wide range of topics."}
                    {level === "C1" && "Advance to a high level of language proficiency. Express ideas fluently and use the language effectively for social, academic, and professional purposes."}
                    {level === "C2" && "Master the French language. At this level, you can understand virtually everything heard or read, and express yourself spontaneously with precision."}
                  </p>
                </div>

                {isLoading && courses.length === 0 ? (
                  <div className="flex justify-center p-8">
                    <p>Loading courses...</p>
                  </div>
                ) : (
                  <>
                    {courses.length === 0 ? (
                      <div className="text-center p-8 border rounded-lg">
                        <h3 className="text-lg font-medium mb-2">No courses found for this level and format</h3>
                        <p className="text-muted-foreground mb-4">
                          Try a different level or format, or check back later.
                        </p>
                        <Button asChild variant="outline">
                          <Link href="/contact">Contact Us for Information</Link>
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {courses.map((course) => (
                          <Card key={course.id} className="flex flex-col h-full">
                            <CardHeader className="pb-3">
                              <div className="flex justify-between items-center">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                                  {course.level}
                                </span>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                                  {course.format}
                                </span>
                              </div>
                              <CardTitle className="mt-2">{course.title}</CardTitle>
                              <CardDescription>{course.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="pb-3 flex-grow">
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Duration:</span>
                                  <span>{course.duration} weeks</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Hours:</span>
                                  <span>{course.hoursPerWeek} hours/week</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Schedule:</span>
                                  <span className="capitalize">{course.schedule}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Start Date:</span>
                                  <span>{new Date(course.startDate).toLocaleDateString()}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Students:</span>
                                  <span>{course.enrolledStudents}/{course.maxStudents}</span>
                                </div>
                              </div>
                            </CardContent>
                            <CardFooter className="pt-0 border-t mt-auto">
                              <div className="w-full flex justify-between items-center">
                                <span className="text-lg font-bold">${course.price}</span>
                                <Button asChild>
                                  <Link href={`/courses/${course.id}`}>View Details</Link>
                                </Button>
                              </div>
                            </CardFooter>
                          </Card>
                        ))}
                      </div>
                    )}

                    {hasMore && (
                      <div className="flex justify-center mt-6">
                        <Button
                          variant="outline"
                          onClick={handleLoadMore}
                          disabled={isLoading}
                        >
                          {isLoading ? "Loading..." : "Load More Courses"}
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        <div className="bg-muted p-6 rounded-lg mt-12">
          <h2 className="text-2xl font-bold mb-4">Why Learn French with Us?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Expert Native Teachers</h3>
              <p className="text-muted-foreground">Learn from qualified native French teachers with years of experience.</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Interactive Learning</h3>
              <p className="text-muted-foreground">Engage with interactive lessons, quizzes, and exercises designed for effective learning.</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Recognized Certification</h3>
              <p className="text-muted-foreground">Earn certificates that validate your French language proficiency at each level.</p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
