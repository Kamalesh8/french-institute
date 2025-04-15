"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import MainLayout from "@/components/layout/main-layout";
import { getCourses } from "@/lib/services/course-service";
import type { Course, CourseLevel } from "@/lib/types";
import type { DocumentSnapshot } from "firebase/firestore";
import { FaSearch, FaFilter, FaBook, FaClock, FaCalendarAlt, FaUsers, FaChalkboardTeacher, FaGraduationCap, FaLaptop, FaCertificate } from "react-icons/fa";

// Course levels in order
const COURSE_LEVELS: CourseLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

// Sample course images (in practice, these would come from Firebase)
const COURSE_IMAGES = {
  "A1": "https://images.unsplash.com/photo-1505902987837-9e40ec37e607?q=80&w=1740&auto=format&fit=crop",
  "A2": "https://images.unsplash.com/photo-1549737221-bef65e2604a6?q=80&w=1740&auto=format&fit=crop",
  "B1": "https://images.unsplash.com/photo-1503917988258-f87a78e3c995?q=80&w=1740&auto=format&fit=crop",
  "B2": "https://images.unsplash.com/photo-1563293756-4ee5996e3a78?q=80&w=1740&auto=format&fit=crop",
  "C1": "https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?q=80&w=1740&auto=format&fit=crop",
  "C2": "https://images.unsplash.com/photo-1599753894977-834afcf35d32?q=80&w=1740&auto=format&fit=crop",
};

export default function CoursesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeLevel, setActiveLevel] = useState<CourseLevel>("A1");
  const [activeFormat, setActiveFormat] = useState<string>("all");
  const [lastVisible, setLastVisible] = useState<DocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Get all courses on initial load, filtered by level if specified in URL
  useEffect(() => {
    const levelParam = searchParams.get("level") as CourseLevel | null;
    const level = levelParam && COURSE_LEVELS.includes(levelParam) ? levelParam : "A1";
    const formatParam = searchParams.get("format");
    const format = formatParam || "all";

    setActiveLevel(level);
    setActiveFormat(format);
    fetchCourses(level, format !== "all" ? format : undefined);
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

  // Filter courses based on search query
  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get level description
  const getLevelDescription = (level: CourseLevel) => {
    switch(level) {
      case "A1": return "A1 - Beginner Level";
      case "A2": return "A2 - Elementary Level";
      case "B1": return "B1 - Intermediate Level";
      case "B2": return "B2 - Upper Intermediate Level";
      case "C1": return "C1 - Advanced Level";
      case "C2": return "C2 - Proficiency Level";
      default: return "";
    }
  };

  // Get level detail description
  const getLevelDetailDescription = (level: CourseLevel) => {
    switch(level) {
      case "A1": return "Start your French journey with basic vocabulary, greetings, and simple phrases. Perfect for absolute beginners.";
      case "A2": return "Build on the basics and start expressing yourself in everyday situations. Learn to describe your environment and routine.";
      case "B1": return "Reach intermediate fluency by discussing familiar topics, travel experiences, and plans. Express opinions and explain viewpoints.";
      case "B2": return "Achieve upper intermediate skills. Interact with native speakers with fluency and spontaneity on a wide range of topics.";
      case "C1": return "Advance to a high level of language proficiency. Express ideas fluently and use the language effectively for social, academic, and professional purposes.";
      case "C2": return "Master the French language. At this level, you can understand virtually everything heard or read, and express yourself spontaneously with precision.";
      default: return "";
    }
  };

  return (
    <MainLayout>
      {/* Hero section */}
      <section className="bg-gradient-purple text-white py-12 md:py-16">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="w-full md:w-1/2">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">French Language Courses</h1>
              <p className="text-lg text-white/90 mb-6">
                Discover our comprehensive range of French courses designed for all proficiency levels, from complete beginners to advanced speakers. Learn with expert native teachers and achieve fluency faster.
              </p>
              <div className="relative max-w-md">
                <Input
                  type="text"
                  placeholder="Search courses..."
                  className="pl-10 py-6 rounded-full bg-white/10 text-white placeholder:text-white/60 border-white/20 focus-visible:border-white focus-visible:ring-white/30"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60" />
              </div>
            </div>
            <div className="w-full md:w-2/5 relative h-64 md:h-80">
              <Image
                src="https://images.unsplash.com/photo-1544703432-78fe9ba48d4a?q=80&w=1974&auto=format&fit=crop"
                alt="Learning French"
                fill
                className="object-cover rounded-lg shadow-lg"
              />
              <div className="absolute -bottom-5 -left-5 bg-white rounded-lg shadow-lg p-4 max-w-xs">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/90 flex items-center justify-center text-white">
                    <FaChalkboardTeacher className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-primary/80">Over</p>
                    <h4 className="font-semibold text-sm">100+ Expert Teachers</h4>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main content section */}
      <div className="container py-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex items-center">
            <Button
              variant="outline"
              size="sm"
              className="mr-2 md:hidden"
              onClick={() => setShowFilters(!showFilters)}
            >
              <FaFilter className="mr-2" />
              Filters
            </Button>
            <h2 className="text-2xl font-bold">{getLevelDescription(activeLevel)}</h2>
          </div>

          {/* Format filters - desktop */}
          <div className="hidden md:flex flex-wrap gap-2">
            <Button
              variant={activeFormat === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => handleFormatChange("all")}
              className="rounded-full"
            >
              All Formats
            </Button>
            <Button
              variant={activeFormat === "online" ? "default" : "outline"}
              size="sm"
              onClick={() => handleFormatChange("online")}
              className="rounded-full"
            >
              Online
            </Button>
            <Button
              variant={activeFormat === "hybrid" ? "default" : "outline"}
              size="sm"
              onClick={() => handleFormatChange("hybrid")}
              className="rounded-full"
            >
              Hybrid
            </Button>
            <Button
              variant={activeFormat === "in-person" ? "default" : "outline"}
              size="sm"
              onClick={() => handleFormatChange("in-person")}
              className="rounded-full"
            >
              In Person
            </Button>
          </div>
        </div>

        {/* Mobile filters */}
        {showFilters && (
          <div className="md:hidden mb-6 p-4 bg-muted rounded-lg">
            <h3 className="font-medium mb-3">Course Format</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              <Button
                variant={activeFormat === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => handleFormatChange("all")}
                className="rounded-full"
              >
                All Formats
              </Button>
              <Button
                variant={activeFormat === "online" ? "default" : "outline"}
                size="sm"
                onClick={() => handleFormatChange("online")}
                className="rounded-full"
              >
                Online
              </Button>
              <Button
                variant={activeFormat === "hybrid" ? "default" : "outline"}
                size="sm"
                onClick={() => handleFormatChange("hybrid")}
                className="rounded-full"
              >
                Hybrid
              </Button>
              <Button
                variant={activeFormat === "in-person" ? "default" : "outline"}
                size="sm"
                onClick={() => handleFormatChange("in-person")}
                className="rounded-full"
              >
                In Person
              </Button>
            </div>
          </div>
        )}

        {/* Level Tabs */}
        <Tabs value={activeLevel} onValueChange={handleLevelChange} className="mb-8">
          <TabsList className="grid grid-cols-3 md:grid-cols-6 mb-4 p-1 h-auto">
            {COURSE_LEVELS.map((level) => (
              <TabsTrigger key={level} value={level} className="py-2 data-[state=active]:bg-primary data-[state=active]:text-white">
                {level}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Tab content */}
          {COURSE_LEVELS.map((level) => (
            <TabsContent key={level} value={level} className="mt-0">
              <div className="flex flex-col space-y-4">
                <div className="bg-muted/50 p-6 rounded-xl mb-6">
                  <h2 className="text-xl font-bold mb-2">{getLevelDescription(level)}</h2>
                  <p className="text-muted-foreground">{getLevelDetailDescription(level)}</p>
                </div>

                {isLoading && filteredCourses.length === 0 ? (
                  <div className="flex justify-center p-12">
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4"></div>
                      <p>Loading courses...</p>
                    </div>
                  </div>
                ) : (
                  <>
                    {filteredCourses.length === 0 ? (
                      <div className="text-center p-16 border rounded-xl">
                        <FaBook className="w-12 h-12 text-muted mx-auto mb-4" />
                        <h3 className="text-xl font-medium mb-2">No courses found</h3>
                        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                          {searchQuery
                            ? "No courses match your search criteria. Try different keywords or clear your search."
                            : "No courses available for this level and format. Try a different level or format, or check back later."
                          }
                        </p>
                        {searchQuery && (
                          <Button onClick={() => setSearchQuery("")} variant="outline" className="mb-4">
                            Clear Search
                          </Button>
                        )}
                        <div>
                          <Button asChild>
                            <Link href="/contact">Request Course Information</Link>
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredCourses.map((course) => (
                          <Card key={course.id} className="overflow-hidden transition-all hover:shadow-lg card-hover">
                            <div className="relative h-48 overflow-hidden">
                              <Image
                                src={COURSE_IMAGES[course.level] || COURSE_IMAGES.A1}
                                alt={course.title}
                                fill
                                className="object-cover transition-transform hover:scale-105 duration-500"
                              />
                              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-black/30 to-transparent"></div>
                              <div className="absolute top-4 left-4 flex gap-2">
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-primary text-white">
                                  {course.level}
                                </span>
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-white/80 text-gray-800">
                                  {course.format}
                                </span>
                              </div>
                              <div className="absolute bottom-4 right-4 bg-white rounded-full px-3 py-1 text-xs font-medium text-primary">
                                {course.schedule}
                              </div>
                            </div>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-xl line-clamp-1">{course.title}</CardTitle>
                              <CardDescription className="line-clamp-2">{course.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="pb-4 space-y-3">
                              <div className="grid grid-cols-2 gap-3">
                                <div className="flex items-center text-sm text-muted-foreground">
                                  <FaClock className="mr-2 text-primary" /> {course.duration} weeks
                                </div>
                                <div className="flex items-center text-sm text-muted-foreground">
                                  <FaBook className="mr-2 text-primary" /> {course.hoursPerWeek}h/week
                                </div>
                                <div className="flex items-center text-sm text-muted-foreground">
                                  <FaCalendarAlt className="mr-2 text-primary" /> {new Date(course.startDate).toLocaleDateString()}
                                </div>
                                <div className="flex items-center text-sm text-muted-foreground">
                                  <FaUsers className="mr-2 text-primary" /> {course.enrolledStudents}/{course.maxStudents}
                                </div>
                              </div>
                            </CardContent>
                            <CardFooter className="flex justify-between bg-gray-50 dark:bg-slate-800/50 p-4 border-t">
                              <div className="flex flex-col">
                                <span className="text-sm text-muted-foreground">Price</span>
                                <span className="font-bold text-lg">${course.price}</span>
                              </div>
                              <Button asChild className="px-6 hover-lift gap-2">
                                <Link href={`/courses/${course.id}`}>
                                  Enroll Now
                                </Link>
                              </Button>
                            </CardFooter>
                          </Card>
                        ))}
                      </div>
                    )}

                    {hasMore && filteredCourses.length > 0 && searchQuery === "" && (
                      <div className="flex justify-center mt-8">
                        <Button
                          onClick={handleLoadMore}
                          disabled={isLoading}
                          className="px-8 py-6 hover-lift gap-2"
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

        {/* Why Learn With Us Section */}
        <section className="mt-20 mb-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Why Learn French with Us?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Experience the most effective and engaging way to master the French language
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-primary/5 p-8 rounded-xl text-center hover-lift">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <FaChalkboardTeacher className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Expert Native Teachers</h3>
              <p className="text-muted-foreground">
                Learn from qualified native French teachers with years of teaching experience and cultural insights.
              </p>
            </div>

            <div className="bg-primary/5 p-8 rounded-xl text-center hover-lift">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <FaLaptop className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Interactive Learning</h3>
              <p className="text-muted-foreground">
                Engage with interactive lessons, quizzes, and exercises designed for effective learning and retention.
              </p>
            </div>

            <div className="bg-primary/5 p-8 rounded-xl text-center hover-lift">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <FaCertificate className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Recognized Certification</h3>
              <p className="text-muted-foreground">
                Earn internationally recognized certificates that validate your French language proficiency at each level.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-purple text-white p-8 md:p-12 rounded-xl my-16">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="md:w-2/3">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Not sure which level is right for you?</h2>
              <p className="text-lg text-white/90">
                Take our free placement test to determine your current level and get personalized course recommendations.
              </p>
            </div>
            <div>
              <Button size="lg" asChild className="bg-white text-primary hover:bg-white/90 hover-lift px-8">
                <Link href="/placement-test">Take Placement Test</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  );
}
