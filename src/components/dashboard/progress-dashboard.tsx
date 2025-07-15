"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { db } from "@/config/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { getCourseById } from "@/lib/services/course-service";
import type { Enrollment, Course } from "@/lib/types";
import { FaTrophy, FaBook, FaClock } from "react-icons/fa";

interface EnrollmentWithCourse extends Enrollment {
  course: Course;
}

export function ProgressDashboard() {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState<EnrollmentWithCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCourses: 0,
    completedCourses: 0,
    averageProgress: 0,
    totalHoursLearned: 0,
  });

  useEffect(() => {
    const fetchEnrollments = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        const enrollmentsQuery = query(
          collection(db, "enrollments"),
          where("userId", "==", user.uid)
        );
        
        const enrollmentsSnapshot = await getDocs(enrollmentsQuery);
        const enrollmentsData: EnrollmentWithCourse[] = [];
        
        for (const doc of enrollmentsSnapshot.docs) {
          const enrollment = { id: doc.id, ...doc.data() } as Enrollment;
          const course = await getCourseById(enrollment.courseId);
          
          if (course) {
            enrollmentsData.push({
              ...enrollment,
              course
            });
          }
        }
        
        setEnrollments(enrollmentsData);
        
        // Calculate stats
        const totalCourses = enrollmentsData.length;
        const completedCourses = enrollmentsData.filter(e => e.progressStatus === 'completed').length;
        const totalProgress = enrollmentsData.reduce((sum, e) => sum + e.progress, 0);
        const averageProgress = totalCourses > 0 ? totalProgress / totalCourses : 0;
        
        // Calculate total hours learned based on course progress and total hours
        const totalHoursLearned = enrollmentsData.reduce((sum, e) => {
          return sum + (e.course.totalHours * (e.progress / 100));
        }, 0);
        
        setStats({
          totalCourses,
          completedCourses,
          averageProgress,
          totalHoursLearned: Math.round(totalHoursLearned),
        });
        
      } catch (error) {
        console.error("Error fetching enrollments:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEnrollments();
  }, [user]);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <p>Loading your progress...</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Your Learning Progress</h2>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <FaBook className="mr-2 h-4 w-4 text-primary" />
              <span className="text-2xl font-bold">{stats.totalCourses}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {stats.completedCourses} completed
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Average Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <FaTrophy className="mr-2 h-4 w-4 text-primary" />
              <span className="text-2xl font-bold">{Math.round(stats.averageProgress)}%</span>
            </div>
            <Progress value={stats.averageProgress} className="h-2 mt-2" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Hours Learned</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <FaClock className="mr-2 h-4 w-4 text-primary" />
              <span className="text-2xl font-bold">{stats.totalHoursLearned}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Total learning time
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Course Progress Cards */}
      <h3 className="text-xl font-semibold mt-8 mb-4">Your Courses</h3>
      
      {enrollments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {enrollments.map((enrollment) => (
            <Card key={enrollment.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle>{enrollment.course.title}</CardTitle>
                <CardDescription>Level: {enrollment.course.level}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Progress</span>
                      <span className="text-sm font-medium">{enrollment.progress}%</span>
                    </div>
                    <Progress value={enrollment.progress} className="h-2" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Status</p>
                      <p className="font-medium capitalize">{enrollment.progressStatus.replace('-', ' ')}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Enrolled on</p>
                      <p className="font-medium">
                        {new Date(enrollment.enrollmentDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-muted/50 px-6 py-3">
                <Button asChild variant="default" size="sm" className="w-full">
                  <Link href={`/learn/${enrollment.courseId}`}>
                    {enrollment.progressStatus === 'not-started' 
                      ? 'Start Learning' 
                      : enrollment.progressStatus === 'completed' 
                        ? 'Review Course' 
                        : 'Continue Learning'}
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="mb-4">You haven't enrolled in any courses yet.</p>
            <Button asChild>
              <Link href="/courses">Browse Courses</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

