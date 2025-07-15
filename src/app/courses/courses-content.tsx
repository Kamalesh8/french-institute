"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FaSearch, FaChalkboardTeacher, FaBook, FaClock, FaCalendarAlt, FaCertificate } from 'react-icons/fa';
import { getCourses } from '@/lib/firebase/course-service';
import { CourseLevel } from '@/lib/types';
import Link from 'next/link';
import Image from 'next/image';

const COURSE_LEVELS: CourseLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

const COURSE_IMAGES = {
  A1: ' /images/course-default.jpg',
  A2: ' /images/course-default.jpg',
  B1: ' /images/course-default.jpg',
  B2: ' /images/course-default.jpg',
  C1: ' /images/course-default.jpg',
  C2: ' /images/course-default.jpg'
};

export default function CoursesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [hasMore, setHasMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  
  const level = (searchParams?.get('level') as CourseLevel) || 'A1';
  const [activeLevel, setActiveLevel] = useState<CourseLevel>(level);

  // Load courses on mount and whenever level changes
  useEffect(() => {
    setLastVisible(null);
    fetchCourses(activeLevel);
  }, [activeLevel]);
  // Fetch courses with filtering
  const fetchCourses = async (level: CourseLevel, loadMore = false) => {
    setIsLoading(true);

    try {
      // Prepare filter options
      const options: any = {
        pageSize: 12,
        level,
        format: 'online',
        sortBy: 'startDate',
        sortDirection: 'asc',
      };

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
    router.push(`/courses?level=${newLevel}`);
    // Fetch courses with new level
    fetchCourses(newLevel);
  };

  // Load more courses
  const handleLoadMore = () => {
    fetchCourses(activeLevel, true);
  };

  // Normalize search query once
  const normalizedQuery = searchQuery.trim().toLowerCase();

  // Filter courses based on the normalized search query, guarding against missing fields
  const filteredCourses = courses.filter(course => {
    if (!normalizedQuery) return true; // show all when query is empty
    const title = (course.title || '').toLowerCase();
    const description = (course.description || '').toLowerCase();
    return title.includes(normalizedQuery) || description.includes(normalizedQuery);
  });

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
    <>
      {/* Hero section */}
      <section className="bg-gradient-purple text-white py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">French Language Courses</h1>
            <p className="text-xl mb-8">
              Discover the perfect course to match your level and learning goals. Start your journey to fluency today!
            </p>
            <div className="flex justify-center">
              <div className="relative w-full max-w-md">
                <Input
                  type="text"
                  placeholder="Search courses..."
                  className="pl-12 pr-4 py-6 rounded-full text-lg"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Level Selector */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {COURSE_LEVELS.map((lvl) => (
              <Button
                key={lvl}
                variant={activeLevel === lvl ? "default" : "outline"}
                className={`px-8 py-6 text-lg font-medium rounded-full transition-all ${
                  activeLevel === lvl ? "scale-105 shadow-lg" : ""
                }`}
                onClick={() => handleLevelChange(lvl)}
              >
                {lvl}
              </Button>
            ))}
          </div>

          {/* Level Description */}
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">{getLevelDescription(activeLevel)}</h2>
            <p className="text-xl text-gray-600">
              {getLevelDetailDescription(activeLevel)}
            </p>
          </div>

          {/* Courses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map((course) => (
              <Card key={course.id} className="overflow-hidden hover-lift transition-all duration-300">
                <CardHeader className="p-0">
                  <div className="relative h-48 w-full">
                    <Image
                      src={COURSE_IMAGES[course.level as CourseLevel] || COURSE_IMAGES.A1}
                      alt={course.title}
                      layout="fill"
                      objectFit="cover"
                    />
                    <div className="absolute top-4 right-4 bg-primary text-white px-3 py-1 rounded-full font-bold">
                      {course.level}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <CardTitle className="text-2xl mb-2">{course.title}</CardTitle>
                  <CardDescription className="text-lg mb-4">
                    {course.description}
                  </CardDescription>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center">
                      <FaClock className="mr-2 text-gray-500" />
                      <span>{course.duration} weeks</span>
                    </div>
                    <div className="flex items-center">
                      <FaCalendarAlt className="mr-2 text-gray-500" />
                      <span>{course.schedule}</span>
                    </div>
                    <div className="flex items-center">
                      <FaChalkboardTeacher className="mr-2 text-gray-500" />
                      <span>{course.instructor}</span>
                    </div>
                    <div className="flex items-center">
                      <FaBook className="mr-2 text-gray-500" />
                      <span>{course.lessons} lessons</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold">${course.price}</span>
                    <Button asChild>
                      <Link href={`/courses/${course.id}`}>View Details</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Load More */}
          {hasMore && (
            <div className="text-center mt-12">
              <Button
                size="lg"
                variant="outline"
                onClick={handleLoadMore}
                disabled={isLoading}
                className="px-12 py-6 text-lg"
              >
                {isLoading ? "Loading..." : "Load More Courses"}
              </Button>
            </div>
          )}

          {/* Features Section */}
          <section className="mt-24">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-6 bg-white rounded-xl shadow-sm hover-lift">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
                  <FaChalkboardTeacher className="text-blue-600 text-2xl" />
                </div>
                <h3 className="text-xl font-bold mb-3">Expert Instructors</h3>
                <p className="text-muted-foreground">
                  Learn from native French speakers with years of teaching experience and passion for language education.
                </p>
              </div>
              <div className="text-center p-6 bg-white rounded-xl shadow-sm hover-lift">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
                  <FaBook className="text-green-600 text-2xl" />
                </div>
                <h3 className="text-xl font-bold mb-3">Comprehensive Curriculum</h3>
                <p className="text-muted-foreground">
                  Our structured curriculum follows CEFR guidelines to ensure you progress systematically through each level.
                </p>
              </div>
              <div className="text-center p-6 bg-white rounded-xl shadow-sm hover-lift">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-6">
                  <FaCertificate className="text-purple-600 text-2xl" />
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
      </section>
    </>
  );
}

