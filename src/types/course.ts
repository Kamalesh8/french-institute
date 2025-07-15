export interface Course {
  id: string;
  title: string;
  description: string;
  level: string;
  duration: string;
  format: string;
  price: number;
  image: string;
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  title: string;
  content: string;
  duration: number;
  quizId: string;
  order: number;
  resources: Resource[];
}

export interface Resource {
  id: string;
  type: 'video' | 'document' | 'audio';
  url: string;
  title: string;
  description: string;
}

export interface CourseProgress {
  userId: string;
  courseId: string;
  completedLessons: number;
  totalLessons: number;
  lastUpdated: Date;
  currentLesson: string;
  quizScores: Record<string, number>;
}

