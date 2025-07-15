"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import MainLayout from "@/components/layout/main-layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/context/auth-context";
import { db } from "@/config/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { toast } from "sonner";
import { FaArrowRight, FaArrowLeft, FaCheck, FaGraduationCap } from "react-icons/fa";

// Sample placement test questions
const placementTestQuestions = [
  {
    id: 1,
    question: "Comment allez-vous?",
    options: [
      { id: "a", text: "I'm going.", translation: "Je vais." },
      { id: "b", text: "How are you?", translation: "Comment allez-vous?" },
      { id: "c", text: "Where are you going?", translation: "OÃ¹ allez-vous?" },
      { id: "d", text: "I'm fine.", translation: "Je vais bien." }
    ],
    correctAnswer: "b",
    level: "A1"
  },
  {
    id: 2,
    question: "Je ___ Ã©tudiant.",
    options: [
      { id: "a", text: "suis", translation: "am" },
      { id: "b", text: "es", translation: "are (informal)" },
      { id: "c", text: "est", translation: "is" },
      { id: "d", text: "sommes", translation: "are (plural)" }
    ],
    correctAnswer: "a",
    level: "A1"
  },
  {
    id: 3,
    question: "Quelle heure est-il?",
    options: [
      { id: "a", text: "What day is it?", translation: "Quel jour sommes-nous?" },
      { id: "b", text: "What's the weather like?", translation: "Quel temps fait-il?" },
      { id: "c", text: "What time is it?", translation: "Quelle heure est-il?" },
      { id: "d", text: "What's your name?", translation: "Comment vous appelez-vous?" }
    ],
    correctAnswer: "c",
    level: "A1"
  },
  {
    id: 4,
    question: "Elle ___ au cinÃ©ma hier soir.",
    options: [
      { id: "a", text: "va", translation: "goes" },
      { id: "b", text: "est allÃ©e", translation: "went" },
      { id: "c", text: "ira", translation: "will go" },
      { id: "d", text: "allait", translation: "was going" }
    ],
    correctAnswer: "b",
    level: "A2"
  },
  {
    id: 5,
    question: "Si j'avais plus d'argent, je ___ en vacances.",
    options: [
      { id: "a", text: "vais", translation: "go" },
      { id: "b", text: "irai", translation: "will go" },
      { id: "c", text: "irais", translation: "would go" },
      { id: "d", text: "allais", translation: "was going" }
    ],
    correctAnswer: "c",
    level: "B1"
  },
  {
    id: 6,
    question: "Je doute qu'il ___ venir Ã  la fÃªte.",
    options: [
      { id: "a", text: "va", translation: "is going to" },
      { id: "b", text: "peut", translation: "can" },
      { id: "c", text: "puisse", translation: "can (subjunctive)" },
      { id: "d", text: "pourra", translation: "will be able to" }
    ],
    correctAnswer: "c",
    level: "B2"
  },
  {
    id: 7,
    question: "Avant qu'il ne ___ trop tard, nous devrions partir.",
    options: [
      { id: "a", text: "est", translation: "is" },
      { id: "b", text: "sera", translation: "will be" },
      { id: "c", text: "soit", translation: "is (subjunctive)" },
      { id: "d", text: "Ã©tait", translation: "was" }
    ],
    correctAnswer: "c",
    level: "C1"
  },
  {
    id: 8,
    question: "Quoi que vous ___, je ne changerai pas d'avis.",
    options: [
      { id: "a", text: "dites", translation: "say" },
      { id: "b", text: "direz", translation: "will say" },
      { id: "c", text: "disiez", translation: "say (subjunctive)" },
      { id: "d", text: "diriez", translation: "would say" }
    ],
    correctAnswer: "c",
    level: "C2"
  },
  {
    id: 9,
    question: "Il faut que tu ___ ce livre avant lundi.",
    options: [
      { id: "a", text: "lis", translation: "read" },
      { id: "b", text: "liras", translation: "will read" },
      { id: "c", text: "lises", translation: "read (subjunctive)" },
      { id: "d", text: "lisais", translation: "were reading" }
    ],
    correctAnswer: "c",
    level: "B1"
  },
  {
    id: 10,
    question: "AprÃ¨s ___ fini mon travail, je suis rentrÃ© chez moi.",
    options: [
      { id: "a", text: "avoir", translation: "to have" },
      { id: "b", text: "ayant", translation: "having" },
      { id: "c", text: "que j'ai", translation: "that I have" },
      { id: "d", text: "que j'avais", translation: "that I had" }
    ],
    correctAnswer: "a",
    level: "B2"
  },
  {
    id: 11,
    question: "Je ne pense pas qu'elle ___ raison.",
    options: [
      { id: "a", text: "a", translation: "has" },
      { id: "b", text: "aura", translation: "will have" },
      { id: "c", text: "ait", translation: "has (subjunctive)" },
      { id: "d", text: "avait", translation: "had" }
    ],
    correctAnswer: "c",
    level: "B2"
  },
  {
    id: 12,
    question: "AussitÃ´t qu'il ___, nous partirons.",
    options: [
      { id: "a", text: "arrive", translation: "arrives" },
      { id: "b", text: "arrivera", translation: "will arrive" },
      { id: "c", text: "est arrivÃ©", translation: "has arrived" },
      { id: "d", text: "arriverait", translation: "would arrive" }
    ],
    correctAnswer: "b",
    level: "B1"
  }
];

export default function PlacementTestPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [testResult, setTestResult] = useState<{
    level: string;
    score: number;
    maxScore: number;
    recommendation: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentQuestion = placementTestQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / placementTestQuestions.length) * 100;

  const handleOptionSelect = (optionId: string) => {
    setSelectedOption(optionId);
  };

  const handleNextQuestion = () => {
    if (selectedOption) {
      // Save the answer
      setAnswers(prev => ({
        ...prev,
        [currentQuestion.id]: selectedOption
      }));

      // Move to next question or show results
      if (currentQuestionIndex < placementTestQuestions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setSelectedOption(null);
      } else {
        calculateResults();
      }
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setSelectedOption(answers[placementTestQuestions[currentQuestionIndex - 1].id] || null);
    }
  };

  const calculateResults = () => {
    setShowResults(true);
    
    // Count correct answers by level
    const levelScores: Record<string, { correct: number, total: number }> = {
      "A1": { correct: 0, total: 0 },
      "A2": { correct: 0, total: 0 },
      "B1": { correct: 0, total: 0 },
      "B2": { correct: 0, total: 0 },
      "C1": { correct: 0, total: 0 },
      "C2": { correct: 0, total: 0 }
    };

    let totalCorrect = 0;

    placementTestQuestions.forEach(question => {
      const userAnswer = answers[question.id];
      const isCorrect = userAnswer === question.correctAnswer;
      
      levelScores[question.level].total += 1;
      
      if (isCorrect) {
        levelScores[question.level].correct += 1;
        totalCorrect += 1;
      }
    });

    // Determine recommended level
    let recommendedLevel = "A1";
    const levels = ["A1", "A2", "B1", "B2", "C1", "C2"];
    
    for (let i = levels.length - 1; i >= 0; i--) {
      const level = levels[i];
      const score = levelScores[level];
      
      // If they got at least 60% correct at this level, recommend it
      if (score.total > 0 && (score.correct / score.total) >= 0.6) {
        recommendedLevel = level;
        break;
      }
    }

    // Set the test result
    setTestResult({
      level: recommendedLevel,
      score: totalCorrect,
      maxScore: placementTestQuestions.length,
      recommendation: getRecommendation(recommendedLevel)
    });

    // Save result to database if user is logged in
    if (user) {
      saveResultToDatabase(recommendedLevel, totalCorrect);
    }
  };

  const getRecommendation = (level: string) => {
    switch (level) {
      case "A1":
        return "You're at the beginner level. We recommend starting with our A1 courses to build a solid foundation in French.";
      case "A2":
        return "You have some basic knowledge of French. Our A2 courses will help you develop your skills further.";
      case "B1":
        return "You have an intermediate level of French. Our B1 courses will help you become more independent in using the language.";
      case "B2":
        return "You have a good command of French. Our B2 courses will help you become more fluent and precise.";
      case "C1":
        return "You have an advanced level of French. Our C1 courses will help you use the language effectively for academic and professional purposes.";
      case "C2":
        return "You have a near-native level of French. Our C2 courses will help you perfect your skills.";
      default:
        return "Based on your results, we recommend exploring our courses to find the right fit for your level.";
    }
  };

  const saveResultToDatabase = async (level: string, score: number) => {
    setIsSubmitting(true);
    try {
      if (!user) return;
      
      await addDoc(collection(db, "placementTests"), {
        userId: user.uid,
        userName: user.displayName || "Anonymous",
        level,
        score,
        maxScore: placementTestQuestions.length,
        timestamp: serverTimestamp()
      });
      
      toast.success("Test result saved successfully");
    } catch (error) {
      console.error("Error saving test result:", error);
      toast.error("Failed to save test result");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewCourses = () => {
    if (testResult) {
      router.push(`/courses?level=${testResult.level}`);
    }
  };

  const handleRetakeTest = () => {
    setCurrentQuestionIndex(0);
    setAnswers({});
    setSelectedOption(null);
    setShowResults(false);
    setTestResult(null);
  };

  return (
    <MainLayout>
      <div className="container py-10">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold mb-2">French Placement Test</h1>
            <p className="text-muted-foreground">
              Determine your French proficiency level with our placement test
            </p>
          </div>

          {!showResults ? (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Question {currentQuestionIndex + 1} of {placementTestQuestions.length}</CardTitle>
                    <CardDescription>Select the best answer</CardDescription>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Progress: {Math.round(progress)}%
                  </div>
                </div>
                <Progress value={progress} className="h-2" />
              </CardHeader>
              <CardContent className="pt-6">
                <div className="mb-6">
                  <h3 className="text-xl font-medium mb-4">{currentQuestion.question}</h3>
                  <RadioGroup value={selectedOption || ""} className="space-y-3">
                    {currentQuestion.options.map((option) => (
                      <div key={option.id} className="flex items-center space-x-2">
                        <RadioGroupItem
                          value={option.id}
                          id={`option-${option.id}`}
                          onClick={() => handleOptionSelect(option.id)}
                        />
                        <Label htmlFor={`option-${option.id}`} className="flex-1 cursor-pointer">
                          <div className="font-medium">{option.text}</div>
                          <div className="text-sm text-muted-foreground">{option.translation}</div>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={handlePreviousQuestion}
                  disabled={currentQuestionIndex === 0}
                >
                  <FaArrowLeft className="mr-2 h-4 w-4" /> Previous
                </Button>
                <Button
                  onClick={handleNextQuestion}
                  disabled={!selectedOption}
                >
                  {currentQuestionIndex < placementTestQuestions.length - 1 ? (
                    <>Next <FaArrowRight className="ml-2 h-4 w-4" /></>
                  ) : (
                    <>Finish <FaCheck className="ml-2 h-4 w-4" /></>
                  )}
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Your Results</CardTitle>
                <CardDescription>Based on your answers, we've determined your French level</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {testResult && (
                  <div className="space-y-6">
                    <div className="flex flex-col items-center">
                      <div className="text-5xl font-bold text-primary mb-2">{testResult.level}</div>
                      <div className="text-xl font-medium mb-4">
                        {testResult.level === "A1" ? "Beginner" : 
                         testResult.level === "A2" ? "Elementary" :
                         testResult.level === "B1" ? "Intermediate" :
                         testResult.level === "B2" ? "Upper Intermediate" :
                         testResult.level === "C1" ? "Advanced" : "Proficiency"}
                      </div>
                      <div className="text-sm text-muted-foreground mb-4">
                        Score: {testResult.score} / {testResult.maxScore}
                      </div>
                    </div>
                    
                    <div className="bg-primary/5 p-4 rounded-lg">
                      <div className="flex items-start gap-3">
                        <FaGraduationCap className="text-primary h-5 w-5 mt-1" />
                        <div>
                          <h3 className="font-medium mb-1">Recommendation</h3>
                          <p className="text-muted-foreground">{testResult.recommendation}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
                      <Button className="flex-1" onClick={handleViewCourses}>
                        View Recommended Courses
                      </Button>
                      <Button variant="outline" className="flex-1" onClick={handleRetakeTest}>
                        Retake Test
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
          
          {!user && !showResults && (
            <div className="mt-8 text-center text-sm text-muted-foreground">
              <p>Sign in to save your test results and get personalized course recommendations.</p>
              <div className="flex justify-center gap-4 mt-4">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/auth/login">Sign In</Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/auth/register">Register</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}

