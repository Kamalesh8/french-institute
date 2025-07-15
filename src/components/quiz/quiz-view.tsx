"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { getQuizById, startQuizAttempt, submitQuizAttempt } from "@/lib/services/quiz-service";
import type { Quiz, QuizQuestion, QuizAnswer } from "@/lib/types";
import { FaClock, FaCheck, FaTimes } from "react-icons/fa";

interface QuizViewProps {
  quizId: string;
  userId: string;
}

export default function QuizView({ quizId, userId }: QuizViewProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadQuiz = async () => {
      const quizData = await getQuizById(quizId);
      if (quizData) {
        setQuiz(quizData);
        setTimeLeft(quizData.timeLimit * 60); // Convert minutes to seconds
        const attempt = await startQuizAttempt(quizId, userId);
        setAttemptId(attempt);
      }
    };
    loadQuiz();
  }, [quizId, userId]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft]);

  const handleAnswer = (questionId: string, answer: string | string[]) => {
    setAnswers((prev) => {
      const existing = prev.findIndex((a) => a.questionId === questionId);
      if (existing !== -1) {
        const updated = [...prev];
        updated[existing] = { questionId, answer, isCorrect: false, points: 0 };
        return updated;
      }
      return [...prev, { questionId, answer, isCorrect: false, points: 0 }];
    });
  };

  const handleNext = () => {
    if (quiz && currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!quiz || !attemptId) return;

    setIsSubmitting(true);
    try {
      const result = await submitQuizAttempt(
        attemptId,
        answers,
        new Date().toISOString()
      );

      toast({
        title: "Quiz Submitted",
        description: `You scored ${result.score} out of ${result.maxScore} points${result.passed ? ' and passed!' : '.'}`,
      });

      router.push(`/courses/${quiz.courseId}/quizzes/${quizId}/result`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit quiz. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!quiz) return null;

  const question = quiz.questions[currentQuestion];
  const currentAnswer = answers.find((a) => a.questionId === question.id);

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>{quiz.title}</span>
          <div className="flex items-center gap-2 text-sm">
            <FaClock className="text-primary" />
            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
          </div>
        </CardTitle>
        <Progress
          value={(currentQuestion + 1) / quiz.questions.length * 100}
          className="w-full"
        />
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-lg font-medium">
          Question {currentQuestion + 1} of {quiz.questions.length}
        </div>
        <div className="text-xl">{question.question}</div>
        {question.type === "multiple-choice" ? (
          <RadioGroup
            value={currentAnswer?.answer as string}
            onValueChange={(value) => handleAnswer(question.id, value)}
          >
            {question.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`option-${index}`} />
                <Label htmlFor={`option-${index}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        ) : (
          <div className="space-y-2">
            {question.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Checkbox
                  id={`option-${index}`}
                  checked={(currentAnswer?.answer as string[])?.includes(option)}
                  onCheckedChange={(checked) => {
                    const current = (currentAnswer?.answer as string[]) || [];
                    const updated = checked
                      ? [...current, option]
                      : current.filter((o) => o !== option);
                    handleAnswer(question.id, updated);
                  }}
                />
                <Label htmlFor={`option-${index}`}>{option}</Label>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
        >
          Previous
        </Button>
        {currentQuestion < quiz.questions.length - 1 ? (
          <Button onClick={handleNext}>Next</Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-primary"
          >
            Submit Quiz
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

