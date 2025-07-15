"use client";

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import EditLesson from '@/components/teacher/EditLesson';
import { courseService } from '@/lib/firebase/courseService';
import { LessonContent } from '@/lib/firebase/courseService';

export default function LessonEditPage() {
  const params = useParams();
  const courseId = params.courseId as string;
  const lessonId = params.lessonId as string;
  
  const [lessonContent, setLessonContent] = useState<LessonContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const course = await courseService.getCourse(courseId);
        if (course && course.lessons[lessonId]) {
          setLessonContent(course.lessons[lessonId]);
        } else {
          // Initialize empty lesson
          setLessonContent({
            vocabulary: [],
            grammar: [],
            quizzes: []
          });
        }
      } catch (error) {
        console.error("Error loading lesson:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLesson();
  }, [courseId, lessonId]);

  const handleSave = async (content: LessonContent) => {
    try {
      await courseService.updateLesson(courseId, lessonId, content);
      alert('Lesson saved successfully!');
    } catch (error) {
      console.error("Error saving lesson:", error);
      alert('Failed to save lesson');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!lessonContent) {
    return <div>Lesson not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Edit Lesson Content</h1>
      <EditLesson 
        initialContent={lessonContent} 
        onSave={handleSave} 
      />
    </div>
  );
}
