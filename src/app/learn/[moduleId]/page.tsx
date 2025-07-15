"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import MainLayout from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import Image from "next/image";
import InteractiveExercise from "@/components/learning/interactive-exercise";
import VocabularySection from "@/components/learning/vocabulary-section";
import GrammarExplanation from "@/components/learning/grammar-explanation";
import PronunciationGuide from "@/components/learning/pronunciation-guide";
import { FaArrowLeft, FaArrowRight, FaCheckCircle, FaHeadphones, FaBook, FaClipboardCheck, FaGraduationCap } from "react-icons/fa";
import { trackLessonCompletion } from "@/lib/services/progress-service";

// Mock lesson data - would come from Firebase in production
const getLessonData = (moduleId) => {
  const modules = {
    "a1-basics": {
      id: "a1-basics",
      courseId: "a1-beginner",
      title: "French Basics - Greetings and Introductions",
      description: "Learn essential French greetings and how to introduce yourself",
      order: 1,
      lessons: [
        {
          id: "greetings",
          title: "Common Greetings",
          description: "Learn the most common greetings in French",
          content: `
            <h2>Common French Greetings</h2>
            <p>Greetings are an essential part of French culture. Learning to greet someone appropriately is a great way to start a conversation.</p>
          `,
          vocabulary: [
            { french: "Bonjour", english: "Hello / Good day", pronunciation: "bohn-ZHOOR" },
            { french: "Salut", english: "Hi (informal)", pronunciation: "sah-LEW" },
            { french: "Bonsoir", english: "Good evening", pronunciation: "bohn-SWAHR" },
            { french: "Au revoir", english: "Goodbye", pronunciation: "oh ruh-VWAHR" },
            { french: "Ã€ bientÃ´t", english: "See you soon", pronunciation: "ah bee-yen-TOH" },
            { french: "Comment allez-vous?", english: "How are you? (formal)", pronunciation: "koh-mohn tah-lay VOO" },
            { french: "Ã‡a va?", english: "How are you? (informal)", pronunciation: "sah vah" },
            { french: "Bien, merci", english: "Well, thank you", pronunciation: "bee-yan, mare-SEE" }
          ],
          grammar: [
            {
              title: "Formal vs. Informal Greetings",
              explanation: "In French, it's important to distinguish between formal and informal situations. Use formal greetings (vous) with people you don't know well, elders, and in professional settings. Use informal greetings (tu) with friends, family, and children."
            },
            {
              title: "Basic Question Structure",
              explanation: "Questions in French can be formed by changing intonation: 'Ã‡a va.' (You're well.) vs 'Ã‡a va?' (Are you well?)"
            }
          ],
          exercises: [
            {
              type: "multiple-choice",
              question: "How would you say 'Hello' in French?",
              options: ["Bonjour", "Au revoir", "Merci", "Comment allez-vous"],
              correctAnswer: "Bonjour"
            },
            {
              type: "multiple-choice",
              question: "Which greeting would you use in the evening?",
              options: ["Bonjour", "Bonsoir", "Salut", "Au revoir"],
              correctAnswer: "Bonsoir"
            },
            {
              type: "fill-in-blank",
              question: "To ask 'How are you?' formally, you would say: '________ allez-vous?'",
              answer: "Comment"
            },
            {
              type: "true-false",
              question: "'Salut' is a formal greeting in French.",
              answer: false
            }
          ],
          audioSamples: [
            { text: "Bonjour", audioUrl: "/audio/bonjour.mp3" },
            { text: "Salut", audioUrl: "/audio/salut.mp3" },
            { text: "Comment allez-vous?", audioUrl: "/audio/comment-allez-vous.mp3" },
            { text: "Ã‡a va?", audioUrl: "/audio/ca-va.mp3" },
            { text: "Au revoir", audioUrl: "/audio/au-revoir.mp3" }
          ]
        },
        {
          id: "introductions",
          title: "Personal Introductions",
          description: "Learn how to introduce yourself in French",
          content: `
            <h2>Introducing Yourself in French</h2>
            <p>After greeting someone, it's natural to introduce yourself. Here's how to do it in French.</p>
          `,
          vocabulary: [
            { french: "Je m'appelle...", english: "My name is...", pronunciation: "zhuh mah-PELL" },
            { french: "Comment vous appelez-vous?", english: "What is your name? (formal)", pronunciation: "koh-mohn voo zah-play VOO" },
            { french: "Comment tu t'appelles?", english: "What is your name? (informal)", pronunciation: "koh-mohn tew tah-PELL" },
            { french: "EnchantÃ©(e)", english: "Pleased to meet you", pronunciation: "ahn-shahn-TAY" },
            { french: "Je suis...", english: "I am...", pronunciation: "zhuh SWEE" },
            { french: "J'habite Ã ...", english: "I live in...", pronunciation: "zhah-BEET ah" },
            { french: "Je viens de...", english: "I come from...", pronunciation: "zhuh vee-YEN duh" },
            { french: "Je parle franÃ§ais", english: "I speak French", pronunciation: "zhuh PAHRL frahn-SAY" }
          ],
          grammar: [
            {
              title: "First-Person Verbs",
              explanation: "In French, 'je' means 'I'. When 'je' is followed by a word that begins with a vowel, it becomes 'j'' (j'habite)."
            },
            {
              title: "Basic Sentence Structure",
              explanation: "French sentences typically follow a Subject-Verb-Object structure, similar to English: 'Je (subject) parle (verb) franÃ§ais (object)'."
            }
          ],
          exercises: [
            {
              type: "multiple-choice",
              question: "How do you say 'My name is...' in French?",
              options: ["Je suis...", "Je m'appelle...", "J'habite Ã ...", "Comment tu t'appelles?"],
              correctAnswer: "Je m'appelle..."
            },
            {
              type: "multiple-choice",
              question: "Which phrase means 'I come from...'?",
              options: ["Je suis...", "Je parle...", "Je viens de...", "J'habite Ã ..."],
              correctAnswer: "Je viens de..."
            },
            {
              type: "fill-in-blank",
              question: "To say 'I live in Paris', you would say: 'J'habite Ã  _____.'",
              answer: "Paris"
            },
            {
              type: "true-false",
              question: "'Je parle franÃ§ais' means 'I speak French'.",
              answer: true
            }
          ],
          audioSamples: [
            { text: "Je m'appelle Jean", audioUrl: "/audio/je-mappelle.mp3" },
            { text: "Comment vous appelez-vous?", audioUrl: "/audio/comment-vous-appelez-vous.mp3" },
            { text: "Je suis Ã©tudiant", audioUrl: "/audio/je-suis-etudiant.mp3" },
            { text: "J'habite Ã  Paris", audioUrl: "/audio/jhabite-a-paris.mp3" },
            { text: "Je viens des Ã‰tats-Unis", audioUrl: "/audio/je-viens-des-etats-unis.mp3" }
          ]
        }
      ]
    },
    "a1-numbers": {
      id: "a1-numbers",
      courseId: "a1-beginner",
      title: "French Numbers and Counting",
      description: "Learn to count in French and use numbers in everyday conversation",
      order: 2,
      lessons: [
        {
          id: "numbers-1-20",
          title: "Numbers 1-20",
          description: "Learn to count from one to twenty in French",
          content: `
            <h2>French Numbers 1-20</h2>
            <p>Learning to count is a fundamental skill in any language. In this lesson, you'll learn the numbers from 1 to 20 in French.</p>
          `,
          vocabulary: [
            { french: "Un", english: "One", pronunciation: "uhn" },
            { french: "Deux", english: "Two", pronunciation: "duh" },
            { french: "Trois", english: "Three", pronunciation: "twah" },
            { french: "Quatre", english: "Four", pronunciation: "katr" },
            { french: "Cinq", english: "Five", pronunciation: "sank" },
            { french: "Six", english: "Six", pronunciation: "sees" },
            { french: "Sept", english: "Seven", pronunciation: "set" },
            { french: "Huit", english: "Eight", pronunciation: "weet" },
            { french: "Neuf", english: "Nine", pronunciation: "nuhf" },
            { french: "Dix", english: "Ten", pronunciation: "dees" },
            { french: "Onze", english: "Eleven", pronunciation: "onz" },
            { french: "Douze", english: "Twelve", pronunciation: "dooz" },
            { french: "Treize", english: "Thirteen", pronunciation: "trez" },
            { french: "Quatorze", english: "Fourteen", pronunciation: "kah-torz" },
            { french: "Quinze", english: "Fifteen", pronunciation: "kanz" },
            { french: "Seize", english: "Sixteen", pronunciation: "sez" },
            { french: "Dix-sept", english: "Seventeen", pronunciation: "dee-set" },
            { french: "Dix-huit", english: "Eighteen", pronunciation: "deez-weet" },
            { french: "Dix-neuf", english: "Nineteen", pronunciation: "deez-nuhf" },
            { french: "Vingt", english: "Twenty", pronunciation: "van" }
          ],
          grammar: [
            {
              title: "Using Numbers in Sentences",
              explanation: "Numbers are placed before the noun in French, just like in English: 'deux livres' (two books)."
            },
            {
              title: "Compound Numbers",
              explanation: "Numbers 17, 18, and 19 are compound numbers in French: dix (10) + sept (7) = dix-sept (17)."
            }
          ],
          exercises: [
            {
              type: "multiple-choice",
              question: "How do you say 'five' in French?",
              options: ["Quatre", "Cinq", "Six", "Sept"],
              correctAnswer: "Cinq"
            },
            {
              type: "multiple-choice",
              question: "Which number is 'douze'?",
              options: ["2", "10", "12", "20"],
              correctAnswer: "12"
            },
            {
              type: "fill-in-blank",
              question: "16 in French is _____.",
              answer: "seize"
            },
            {
              type: "matching",
              question: "Match the numbers with their French equivalents",
              items: [
                { item: "7", match: "sept" },
                { item: "13", match: "treize" },
                { item: "19", match: "dix-neuf" },
                { item: "3", match: "trois" }
              ]
            }
          ],
          audioSamples: [
            { text: "Un, Deux, Trois", audioUrl: "/audio/un-deux-trois.mp3" },
            { text: "Quatre, Cinq, Six", audioUrl: "/audio/quatre-cinq-six.mp3" },
            { text: "Sept, Huit, Neuf, Dix", audioUrl: "/audio/sept-huit-neuf-dix.mp3" },
            { text: "Onze, Douze, Treize", audioUrl: "/audio/onze-douze-treize.mp3" },
            { text: "Quatorze, Quinze, Seize", audioUrl: "/audio/quatorze-quinze-seize.mp3" },
            { text: "Dix-sept, Dix-huit, Dix-neuf, Vingt", audioUrl: "/audio/dix-sept-a-vingt.mp3" }
          ]
        }
      ]
    }
  };

  return modules[moduleId] || null;
};

export default function LearningModulePage({ params }: { params: { moduleId: string } }) {
  const { moduleId } = params;
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [moduleData, setModuleData] = useState<any>(null);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [currentTabIndex, setCurrentTabIndex] = useState(0);
  const [exerciseResults, setExerciseResults] = useState<{correct: number, total: number}>({ correct: 0, total: 0 });
  const [isLessonCompleted, setIsLessonCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [timeSpent, setTimeSpent] = useState(0);
  const [timerInterval, setTimerInterval] = useState<any>(null);

  // Tabs for the learning content
  const contentTabs = ["Overview", "Vocabulary", "Grammar", "Exercises", "Pronunciation"];

  useEffect(() => {
    if (!user) {
      router.push("/auth/login");
      return;
    }

    // Load module data
    const data = getLessonData(moduleId);
    setModuleData(data);
    setIsLoading(false);

    // Start timer for tracking time spent
    const interval = setInterval(() => {
      setTimeSpent(prev => prev + 1);
    }, 1000);
    setTimerInterval(interval);

    return () => {
      clearInterval(interval);
    };
  }, [moduleId, user, router]);

  useEffect(() => {
    // Reset exercise results when changing lessons
    setExerciseResults({ correct: 0, total: 0 });
    setIsLessonCompleted(false);
  }, [currentLessonIndex]);

  const handleExerciseComplete = (results: {correct: number, total: number}) => {
    setExerciseResults(results);

    // If the user got at least 70% correct, consider the lesson completed
    if (results.correct / results.total >= 0.7) {
      setIsLessonCompleted(true);
      toast({
        title: "Lesson Completed!",
        description: `You got ${results.correct} out of ${results.total} correct. Great job!`,
      });

      // Track lesson completion
      if (user && moduleData) {
        const currentLesson = moduleData.lessons[currentLessonIndex];
        trackLessonCompletion({
          userId: user.uid,
          courseId: moduleData.courseId,
          moduleId: moduleData.id,
          lessonId: currentLesson.id,
          enrollmentId: "mock-enrollment-id", // In a real app, get from context or props
          timeSpent: timeSpent,
        })
        .catch(error => {
          console.error("Error tracking lesson completion:", error);
        });
      }
    } else {
      toast({
        title: "Keep Practicing",
        description: `You got ${results.correct} out of ${results.total} correct. Try again to complete the lesson.`,
        variant: "destructive"
      });
    }
  };

  const goToNextLesson = () => {
    if (currentLessonIndex < moduleData.lessons.length - 1) {
      setCurrentLessonIndex(currentLessonIndex + 1);
      setCurrentTabIndex(0);
      setTimeSpent(0);
    } else {
      // Navigate to module completion page or back to course
      router.push(`/courses/${moduleData.courseId}`);
    }
  };

  const goToPreviousLesson = () => {
    if (currentLessonIndex > 0) {
      setCurrentLessonIndex(currentLessonIndex - 1);
      setCurrentTabIndex(0);
      setTimeSpent(0);
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container py-10 flex justify-center">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4"></div>
            <p className="text-muted-foreground">Loading learning materials...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!moduleData) {
    return (
      <MainLayout>
        <div className="container py-10">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle>Module Not Found</CardTitle>
              <CardDescription>The learning module you're looking for doesn't exist or has been removed.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Please check the URL or return to the course page.</p>
            </CardContent>
            <CardFooter>
              <Button asChild>
                <Link href="/courses">Back to Courses</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </MainLayout>
    );
  }

  const currentLesson = moduleData.lessons[currentLessonIndex];

  return (
    <MainLayout>
      <div className="container py-8">
        {/* Module and Lesson Navigation */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            <div>
              <Link href={`/courses/${moduleData.courseId}`} className="text-primary hover:underline flex items-center gap-1 mb-2">
                <FaArrowLeft size={12} /> Back to Course
              </Link>
              <h1 className="text-2xl md:text-3xl font-bold mb-1">{moduleData.title}</h1>
              <p className="text-muted-foreground">{moduleData.description}</p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={goToPreviousLesson}
                disabled={currentLessonIndex === 0}
              >
                <FaArrowLeft className="mr-2" /> Previous
              </Button>
              <Button
                onClick={goToNextLesson}
                disabled={!isLessonCompleted && currentLessonIndex !== moduleData.lessons.length - 1}
              >
                Next <FaArrowRight className="ml-2" />
              </Button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-2">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Lesson Progress</span>
              <span className="font-medium">{currentLessonIndex + 1} of {moduleData.lessons.length}</span>
            </div>
            <Progress
              value={(currentLessonIndex + 1) / moduleData.lessons.length * 100}
              className="h-2"
            />
          </div>
        </div>

        {/* Lesson Content */}
        <Card className="border-0 shadow-md mb-8">
          <CardHeader className="border-b">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>{currentLesson.title}</CardTitle>
                <CardDescription>{currentLesson.description}</CardDescription>
              </div>
              {isLessonCompleted && (
                <div className="flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                  <FaCheckCircle /> Completed
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Tabs
              defaultValue={contentTabs[currentTabIndex]}
              onValueChange={(value) => setCurrentTabIndex(contentTabs.indexOf(value))}
              className="mt-0"
            >
              <TabsList className="m-4 grid grid-cols-2 md:grid-cols-5">
                {contentTabs.map((tab) => (
                  <TabsTrigger key={tab} value={tab}>
                    {tab}
                  </TabsTrigger>
                ))}
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="Overview" className="p-4 md:p-6">
                <div dangerouslySetInnerHTML={{ __html: currentLesson.content }} className="prose max-w-none" />
              </TabsContent>

              {/* Vocabulary Tab */}
              <TabsContent value="Vocabulary" className="p-4 md:p-6">
                <VocabularySection vocabulary={currentLesson.vocabulary} />
              </TabsContent>

              {/* Grammar Tab */}
              <TabsContent value="Grammar" className="p-4 md:p-6">
                <GrammarExplanation grammar={currentLesson.grammar} />
              </TabsContent>

              {/* Exercises Tab */}
              <TabsContent value="Exercises" className="p-4 md:p-6">
                <InteractiveExercise
                  exercises={currentLesson.exercises}
                  onComplete={handleExerciseComplete}
                />
              </TabsContent>

              {/* Pronunciation Tab */}
              <TabsContent value="Pronunciation" className="p-4 md:p-6">
                <PronunciationGuide audioSamples={currentLesson.audioSamples} />
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="border-t p-4 md:p-6 flex justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <FaBook className="text-primary" />
                <span className="text-sm text-muted-foreground">Lesson {currentLessonIndex + 1}/{moduleData.lessons.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <FaClipboardCheck className="text-primary" />
                <span className="text-sm text-muted-foreground">
                  {exerciseResults.total > 0 ?
                    `${exerciseResults.correct}/${exerciseResults.total} correct` :
                    "Not attempted"}
                </span>
              </div>
            </div>

            {!isLessonCompleted ? (
              <Button
                onClick={() => setCurrentTabIndex(3)} // Go to Exercises tab
                className="gap-2"
              >
                <FaGraduationCap /> Complete Exercises
              </Button>
            ) : (
              <Button
                onClick={goToNextLesson}
                className="gap-2"
                variant="default"
              >
                Continue <FaArrowRight />
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </MainLayout>
  );
}

