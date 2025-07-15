"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import QuizView from "@/components/quiz/quiz-view";
import { getQuizById } from "@/lib/services/quiz-service";
import type { Quiz } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function QuizPage() {
  const { user } = useAuth();
  const params = useParams();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const loadQuiz = async () => {
      if (params.quizId) {
        const quizData = await getQuizById(params.quizId as string);
        setQuiz(quizData);
      }
    };
    loadQuiz();
  }, [params.quizId]);

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Authentication Required</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Please sign in to take this quiz.</p>
        </CardContent>
      </Card>
    );
  }

  if (!quiz) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (!hasStarted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{quiz.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">Instructions:</h3>
              <ul className="list-disc list-inside space-y-1 mt-2">
                <li>This quiz contains {quiz.questions.length} questions</li>
                <li>Time limit: {quiz.timeLimit} minutes</li>
                <li>You need {quiz.passingScore}% to pass</li>
                {quiz.allowRetake && (
                  <li>You can retake this quiz if you don't pass</li>
                )}
              </ul>
            </div>
            <Button onClick={() => setHasStarted(true)}>Start Quiz</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return <QuizView quizId={params.quizId as string} userId={user.uid} />;
}

