/**
 * This script simulates data that will be used in demo mode.
 * It doesn't actually connect to Firebase but creates JSON files
 * that can be used by the mock services.
 */

const fs = require('fs');
const path = require('path');

const DEMO_DATA_DIR = path.join(__dirname, '../src/data');

// Ensure the data directory exists
if (!fs.existsSync(DEMO_DATA_DIR)) {
  fs.mkdirSync(DEMO_DATA_DIR, { recursive: true });
}

// Sample users
const users = [
  {
    uid: 'demo-admin-123',
    email: 'admin@frenchinstitute.com',
    displayName: 'Admin User',
    role: 'admin',
    createdAt: new Date().toISOString(),
  },
  {
    uid: 'demo-student-123',
    email: 'student@example.com',
    displayName: 'Demo Student',
    role: 'student',
    createdAt: new Date().toISOString(),
    phoneNumber: '+1 (555) 123-4567',
    address: '123 Main St, Anytown, USA',
    bio: 'I am a student learning French to prepare for a trip to Paris next year.'
  }
];

// Sample courses
const courses = [
  {
    id: 'a1-beginner',
    title: 'A1 - Beginner French',
    description: 'Start your French journey with the basics of vocabulary, grammar, and simple conversations.',
    level: 'A1',
    format: 'online',
    schedule: 'flexible',
    duration: 8, // weeks
    hoursPerWeek: 5,
    totalHours: 40,
    startDate: new Date(2025, 5, 1).toISOString(),
    endDate: new Date(2025, 6, 26).toISOString(),
    price: 199,
    currency: 'USD',
    maxStudents: 20,
    enrolledStudents: 3,
    instructor: 'Sophie Martin',
    status: 'upcoming',
    syllabus: 'Introduction to French, Basic greetings, Numbers 1-100, Days and months, Simple present tense, Basic questions',
    imageURL: 'https://images.unsplash.com/photo-1505902987837-9e40ec37e607?q=80&w=1740&auto=format&fit=crop',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'a2-elementary',
    title: 'A2 - Elementary French',
    description: 'Build on the basics and develop your ability to communicate in everyday situations.',
    level: 'A2',
    format: 'online',
    schedule: 'evening',
    duration: 10, // weeks
    hoursPerWeek: 5,
    totalHours: 50,
    startDate: new Date(2025, 5, 15).toISOString(),
    endDate: new Date(2025, 7, 24).toISOString(),
    price: 249,
    currency: 'USD',
    maxStudents: 20,
    enrolledStudents: 2,
    instructor: 'Jean Dupont',
    status: 'upcoming',
    syllabus: 'Past tense, Future tense, More complex grammar, Travel vocabulary, Food and dining, Making appointments',
    imageURL: 'https://images.unsplash.com/photo-1549737221-bef65e2604a6?q=80&w=1740&auto=format&fit=crop',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'b1-intermediate',
    title: 'B1 - Intermediate French',
    description: 'Express yourself on a wider range of topics and handle most situations while traveling.',
    level: 'B1',
    format: 'hybrid',
    schedule: 'weekend',
    duration: 12, // weeks
    hoursPerWeek: 6,
    totalHours: 72,
    startDate: new Date(2025, 6, 1).toISOString(),
    endDate: new Date(2025, 8, 23).toISOString(),
    price: 299,
    currency: 'USD',
    maxStudents: 15,
    enrolledStudents: 0,
    instructor: 'Marie Leclerc',
    status: 'upcoming',
    syllabus: 'Conditional tense, Subjunctive mood, Complex sentence structures, Business French, Cultural topics, Debates and discussions',
    imageURL: 'https://images.unsplash.com/photo-1503917988258-f87a78e3c995?q=80&w=1740&auto=format&fit=crop',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'b2-upper-intermediate',
    title: 'B2 - Upper Intermediate French',
    description: 'Interact with native speakers fluently and discuss complex topics with confidence.',
    level: 'B2',
    format: 'online',
    schedule: 'morning',
    duration: 14, // weeks
    hoursPerWeek: 6,
    totalHours: 84,
    startDate: new Date(2025, 6, 15).toISOString(),
    endDate: new Date(2025, 9, 21).toISOString(),
    price: 349,
    currency: 'USD',
    maxStudents: 15,
    enrolledStudents: 0,
    instructor: 'Philippe Rousseau',
    status: 'upcoming',
    syllabus: 'Advanced grammar, Literary analysis, Current affairs, Professional communication, Presentation skills, French cinema and literature',
    imageURL: 'https://images.unsplash.com/photo-1563293756-4ee5996e3a78?q=80&w=1740&auto=format&fit=crop',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// First course module
const modules = [
  {
    id: 'a1-beginner-module-1',
    courseId: 'a1-beginner',
    title: 'Introduction to French',
    description: 'Learn the basics of French language, including greetings and simple phrases.',
    order: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Create lessons for this module
const lessons = [
  {
    id: 'a1-beginner-module-1-lesson-1',
    moduleId: 'a1-beginner-module-1',
    title: 'Greetings and Introductions',
    description: 'Learn basic greetings and how to introduce yourself in French.',
    content: 'In this lesson, you will learn how to say hello, goodbye, and introduce yourself in French.',
    order: 1,
    duration: 30, // minutes
    videoURL: 'https://example.com/videos/greetings.mp4',
    materials: ['Basic French Vocabulary Sheet', 'Greetings Practice Audio'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'a1-beginner-module-1-lesson-2',
    moduleId: 'a1-beginner-module-1',
    title: 'Numbers and Counting',
    description: 'Learn to count from 1 to 100 in French.',
    content: 'This lesson covers the numbers 1-100 and how to use them in conversation.',
    order: 2,
    duration: 45, // minutes
    videoURL: 'https://example.com/videos/numbers.mp4',
    materials: ['Numbers Worksheet', 'Practice Exercises'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'a1-beginner-module-1-lesson-3',
    moduleId: 'a1-beginner-module-1',
    title: 'Days, Months, and Dates',
    description: 'Learn to express dates and time in French.',
    content: 'In this lesson, you will learn the days of the week, months of the year, and how to express dates in French.',
    order: 3,
    duration: 45, // minutes
    videoURL: 'https://example.com/videos/dates.mp4',
    materials: ['Calendar Vocabulary', 'Date Practice Worksheet'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Sample quiz
const quiz = {
  id: 'a1-beginner-module-1-quiz',
  courseId: 'a1-beginner',
  moduleId: 'a1-beginner-module-1',
  title: 'Module 1 Assessment',
  description: 'Test your knowledge of basic French greetings, numbers, and dates.',
  timeLimit: 30, // minutes
  passingScore: 70, // percent
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

// Quiz questions
const questions = [
  {
    id: 'a1-beginner-module-1-quiz-q1',
    quizId: 'a1-beginner-module-1-quiz',
    type: 'multiple-choice',
    question: 'How do you say "Hello" in French?',
    options: ['Bonjour', 'Au revoir', 'Merci', 'S\'il vous plaît'],
    correctAnswer: 'Bonjour',
    points: 10,
    order: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'a1-beginner-module-1-quiz-q2',
    quizId: 'a1-beginner-module-1-quiz',
    type: 'multiple-choice',
    question: 'What is "42" in French?',
    options: ['Vingt-deux', 'Quarante-deux', 'Cinquante-deux', 'Quatorze'],
    correctAnswer: 'Quarante-deux',
    points: 10,
    order: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'a1-beginner-module-1-quiz-q3',
    quizId: 'a1-beginner-module-1-quiz',
    type: 'true-false',
    question: 'In French, "mercredi" means Wednesday.',
    options: ['True', 'False'],
    correctAnswer: 'True',
    points: 10,
    order: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Enrollments
const enrollments = [
  {
    id: 'enrollment-1',
    userId: 'demo-student-123',
    courseId: 'a1-beginner',
    enrollmentDate: new Date(2025, 4, 15).toISOString(),
    status: 'active',
    paymentId: 'payment-123',
    paymentAmount: 199,
    paymentDate: new Date(2025, 4, 15).toISOString(),
    progress: 15, // percentage completed
    progressStatus: 'in-progress',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Write data to JSON files
fs.writeFileSync(path.join(DEMO_DATA_DIR, 'users.json'), JSON.stringify(users, null, 2));
fs.writeFileSync(path.join(DEMO_DATA_DIR, 'courses.json'), JSON.stringify(courses, null, 2));
fs.writeFileSync(path.join(DEMO_DATA_DIR, 'modules.json'), JSON.stringify(modules, null, 2));
fs.writeFileSync(path.join(DEMO_DATA_DIR, 'lessons.json'), JSON.stringify(lessons, null, 2));
fs.writeFileSync(path.join(DEMO_DATA_DIR, 'quizzes.json'), JSON.stringify(quiz, null, 2));
fs.writeFileSync(path.join(DEMO_DATA_DIR, 'questions.json'), JSON.stringify(questions, null, 2));
fs.writeFileSync(path.join(DEMO_DATA_DIR, 'enrollments.json'), JSON.stringify(enrollments, null, 2));

console.log('Demo data files created successfully in', DEMO_DATA_DIR);
console.log('These files will be used when running the application in demo mode.');
