// User types
export type UserRole = 'student' | 'admin';

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
  role: UserRole;
  createdAt: string;
  phoneNumber?: string;
  address?: string;
  bio?: string;
}

// French course level types according to CEFR
export type CourseLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

// Course format types
export type CourseFormat = 'online' | 'hybrid' | 'in-person';

// Course schedule types
export type CourseSchedule = 'morning' | 'afternoon' | 'evening' | 'weekend' | 'flexible';

// Course status
export type CourseStatus = 'upcoming' | 'ongoing' | 'completed' | 'canceled';

// Course interface
export interface Course {
  id: string;
  title: string;
  description: string;
  level: CourseLevel;
  format: CourseFormat;
  schedule: CourseSchedule;
  duration: number; // in weeks
  hoursPerWeek: number;
  totalHours: number;
  startDate: string;
  endDate: string;
  price: number;
  currency: string;
  maxStudents: number;
  enrolledStudents: number;
  instructor: string;
  status: CourseStatus;
  syllabus: string;
  imageURL?: string;
  createdAt: string;
  updatedAt: string;
}

// Module within a course
export interface CourseModule {
  id: string;
  courseId: string;
  title: string;
  description: string;
  order: number;
  lessons: Lesson[];
  createdAt: string;
  updatedAt: string;
}

// Lesson within a module
export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  content: string;
  order: number;
  duration: number; // in minutes
  videoURL?: string;
  materials: string[];
  createdAt: string;
  updatedAt: string;
}

// Enrollment status
export type EnrollmentStatus = 'pending' | 'active' | 'completed' | 'cancelled' | 'refunded';

// Progress status
export type ProgressStatus = 'not-started' | 'in-progress' | 'completed';

// Enrollment interface
export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  enrollmentDate: string;
  status: EnrollmentStatus;
  paymentId?: string;
  paymentAmount: number;
  paymentDate?: string;
  completionDate?: string;
  progress: number; // percentage completed
  progressStatus: ProgressStatus;
  certificate?: string;
  certificateIssueDate?: string;
  createdAt: string;
  updatedAt: string;
}

// Assignment interface
export interface Assignment {
  id: string;
  courseId: string;
  moduleId?: string;
  lessonId?: string;
  title: string;
  description: string;
  dueDate: string;
  points: number;
  createdAt: string;
  updatedAt: string;
}

// Assignment submission
export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  userId: string;
  content: string;
  attachmentURLs: string[];
  submissionDate: string;
  grade?: number;
  feedback?: string;
  gradedBy?: string;
  gradedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Quiz interface
export interface Quiz {
  id: string;
  courseId: string;
  moduleId?: string;
  lessonId?: string;
  title: string;
  description: string;
  timeLimit: number; // in minutes
  passingScore: number;
  questions: QuizQuestion[];
  createdAt: string;
  updatedAt: string;
}

// Quiz question types
export type QuestionType = 'multiple-choice' | 'true-false' | 'fill-in-blank' | 'matching' | 'short-answer';

// Quiz question
export interface QuizQuestion {
  id: string;
  quizId: string;
  type: QuestionType;
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  points: number;
  order: number;
  createdAt: string;
  updatedAt: string;
}

// Quiz attempt
export interface QuizAttempt {
  id: string;
  quizId: string;
  userId: string;
  startTime: string;
  endTime?: string;
  score: number;
  maxScore: number;
  passed: boolean;
  answers: QuizAnswer[];
  createdAt: string;
  updatedAt: string;
}

// Quiz answer
export interface QuizAnswer {
  questionId: string;
  answer: string | string[];
  isCorrect: boolean;
  points: number;
}

// Notification types
export type NotificationType = 'course' | 'assignment' | 'quiz' | 'message' | 'system';

// Notification
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  link?: string;
  createdAt: string;
}

// Message interface for communication
export interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  courseId?: string;
  content: string;
  attachmentURLs?: string[];
  read: boolean;
  createdAt: string;
}

// Certificate interface
export interface Certificate {
  id: string;
  userId: string;
  courseId: string;
  issueDate: string;
  certificateURL: string;
  createdAt: string;
}

// Payment interface for tracking course payments
export interface Payment {
  id: string;
  userId: string;
  courseId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: string;
  paymentDate: string;
  transactionId: string;
  receiptURL?: string;
  createdAt: string;
  updatedAt: string;
}
