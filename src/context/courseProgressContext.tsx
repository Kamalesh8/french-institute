"use client";

import { createContext, useContext, useState, ReactNode } from 'react';
import { Course } from '@/types/course';

interface CourseProgress {
  courseId: string;
  completedLessons: number;
  totalLessons: number;
  lastUpdated: Date;
}

interface CourseProgressContextType {
  progress: Record<string, CourseProgress>;
  updateProgress: (courseId: string, completedLessons: number, totalLessons: number) => void;
  getProgress: (courseId: string) => CourseProgress | undefined;
}

const CourseProgressContext = createContext<CourseProgressContextType | undefined>(undefined);

export function CourseProgressProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<Record<string, CourseProgress>>({});

  const updateProgress = (courseId: string, completedLessons: number, totalLessons: number) => {
    setProgress(prev => ({
      ...prev,
      [courseId]: {
        courseId,
        completedLessons,
        totalLessons,
        lastUpdated: new Date()
      }
    }));
  };

  const getProgress = (courseId: string) => progress[courseId];

  return (
    <CourseProgressContext.Provider value={{ progress, updateProgress, getProgress }}>
      {children}
    </CourseProgressContext.Provider>
  );
}

export function useCourseProgress() {
  const context = useContext(CourseProgressContext);
  if (!context) {
    throw new Error('useCourseProgress must be used within a CourseProgressProvider');
  }
  return context;
}

