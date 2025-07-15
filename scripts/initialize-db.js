const { initializeApp } = require('firebase/app');
const {
  getFirestore,
  collection,
  doc,
  setDoc,
  serverTimestamp
} = require('firebase/firestore');
const { getAuth, createUserWithEmailAndPassword, updateProfile } = require('firebase/auth');

// Load environment variables
require('dotenv').config({ path: require('path').join(__dirname, '../.env.local') });

// Configure your Firebase
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Validate configuration
Object.entries(firebaseConfig).forEach(([key, value]) => {
  if (!value && key !== 'measurementId') { // measurementId is optional
    console.error(`Firebase configuration missing: ${key}`);
    throw new Error(`Firebase configuration missing: ${key}`);
  }
});

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

/**
 * Initialize sample users
 */
async function createSampleUsers() {
  try {
    // Create admin user
    const adminEmail = 'admin@frenchinstitute.com';
    const adminPassword = 'Admin123!';
    
    // Check if admin user already exists
    const adminUser = await auth.fetchSignInMethodsForEmail(adminEmail);
    if (adminUser.length > 0) {
      console.log('Admin user already exists');
      return;
    }

    const adminCredential = await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);

    await updateProfile(adminCredential.user, { displayName: 'Admin User' });

    await setDoc(doc(db, 'users', adminCredential.user.uid), {
      uid: adminCredential.user.uid,
      email: adminEmail,
      displayName: 'Admin User',
      role: 'admin',
      createdAt: new Date().toISOString(),
    });

    console.log('Admin user created successfully');

    // Create student user
    const studentEmail = 'student@example.com';
    const studentPassword = 'Student123!';
    const studentCredential = await createUserWithEmailAndPassword(auth, studentEmail, studentPassword);

    await updateProfile(studentCredential.user, { displayName: 'Sample Student' });

    await setDoc(doc(db, 'users', studentCredential.user.uid), {
      uid: studentCredential.user.uid,
      email: studentEmail,
      displayName: 'Sample Student',
      role: 'student',
      createdAt: new Date().toISOString(),
    });

    console.log('Student user created successfully');

    return {
      adminUid: adminCredential.user.uid,
      studentUid: studentCredential.user.uid
    };
  } catch (error) {
    console.error('Error creating sample users:', error);
    throw error;
  }
}

/**
 * Initialize sample courses
 */
async function createSampleCourses() {
  try {
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
        enrolledStudents: 0,
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
        enrolledStudents: 0,
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

    // Add each course to Firestore
    for (const course of courses) {
      await setDoc(doc(db, 'courses', course.id), course);
      console.log(`Course "${course.title}" created successfully`);
    }

    return courses;
  } catch (error) {
    console.error('Error creating sample courses:', error);
    throw error;
  }
}

/**
 * Create a sample module and lessons for a course
 */
async function createSampleModuleAndLessons(courseId) {
  try {
    // First course module
    const moduleId = `${courseId}-module-1`;
    const module = {
      id: moduleId,
      courseId: courseId,
      title: 'Introduction to French',
      description: 'Learn the basics of French language, including greetings and simple phrases.',
      order: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await setDoc(doc(db, 'modules', moduleId), module);
    console.log(`Module for course ${courseId} created successfully`);

    // Create lessons for this module
    const lessons = [
      {
        id: `${moduleId}-lesson-1`,
        moduleId: moduleId,
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
        id: `${moduleId}-lesson-2`,
        moduleId: moduleId,
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
        id: `${moduleId}-lesson-3`,
        moduleId: moduleId,
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

    // Add each lesson to Firestore
    for (const lesson of lessons) {
      await setDoc(doc(db, 'lessons', lesson.id), lesson);
      console.log(`Lesson "${lesson.title}" created successfully`);
    }

    return { module, lessons };
  } catch (error) {
    console.error(`Error creating sample module and lessons for course ${courseId}:`, error);
    throw error;
  }
}

/**
 * Create sample quiz for a course module
 */
async function createSampleQuiz(moduleId, courseId) {
  try {
    const quizId = `${moduleId}-quiz`;
    const quiz = {
      id: quizId,
      courseId: courseId,
      moduleId: moduleId,
      title: 'Module 1 Assessment',
      description: 'Test your knowledge of basic French greetings, numbers, and dates.',
      timeLimit: 30, // minutes
      passingScore: 70, // percent
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await setDoc(doc(db, 'quizzes', quizId), quiz);
    console.log(`Quiz for module ${moduleId} created successfully`);

    // Quiz questions
    const questions = [
      {
        id: `${quizId}-q1`,
        quizId: quizId,
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
        id: `${quizId}-q2`,
        quizId: quizId,
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
        id: `${quizId}-q3`,
        quizId: quizId,
        type: 'true-false',
        question: 'In French, "mercredi" means Wednesday.',
        options: ['True', 'False'],
        correctAnswer: 'True',
        points: 10,
        order: 3,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: `${quizId}-q4`,
        quizId: quizId,
        type: 'fill-in-blank',
        question: 'Complete the following: "Je m\'appelle _____." (Enter your name)',
        correctAnswer: '[ANY]',  // This would need special handling in the app
        points: 10,
        order: 4,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: `${quizId}-q5`,
        quizId: quizId,
        type: 'multiple-choice',
        question: 'How do you say "Goodbye" in French?',
        options: ['Bonjour', 'Salut', 'Au revoir', 'Merci'],
        correctAnswer: 'Au revoir',
        points: 10,
        order: 5,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    // Add each question to Firestore
    for (const question of questions) {
      await setDoc(doc(db, 'quiz-questions', question.id), question);
    }

    console.log(`Quiz questions for quiz ${quizId} created successfully`);

    return { quiz, questions };
  } catch (error) {
    console.error(`Error creating sample quiz for module ${moduleId}:`, error);
    throw error;
  }
}

/**
 * Main initialization function
 */
async function initialize() {
  try {
    console.log('Starting database initialization...');

    // Create users
    const users = await createSampleUsers();
    console.log('Sample users created successfully');

    // Create courses
    const courses = await createSampleCourses();
    console.log('Sample courses created successfully');

    // Create modules, lessons, and quizzes for first course
    const firstCourse = courses[0];
    const moduleAndLessons = await createSampleModuleAndLessons(firstCourse.id);
    console.log(`Sample module and lessons for course ${firstCourse.id} created successfully`);

    // Create quiz for the first module
    const quiz = await createSampleQuiz(moduleAndLessons.module.id, firstCourse.id);
    console.log(`Sample quiz for module ${moduleAndLessons.module.id} created successfully`);

    console.log('Database initialization completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Initialization failed:', error);
    process.exit(1);
  }
}

// Run initialization
initialize();
