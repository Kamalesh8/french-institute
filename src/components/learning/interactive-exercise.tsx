"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { FaCheck, FaTimes, FaRedo, FaCheckCircle } from "react-icons/fa";

interface Exercise {
  type: string;
  question: string;
  options?: string[];
  correctAnswer: string | string[] | boolean;
  items?: Array<{ item: string; match: string }>;
}

interface InteractiveExerciseProps {
  exercises: Exercise[];
  onComplete: (results: { correct: number; total: number }) => void;
}

export default function InteractiveExercise({ exercises, onComplete }: InteractiveExerciseProps) {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<(string | string[] | boolean)[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState<string | string[] | boolean>("");
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [matchingPairs, setMatchingPairs] = useState<Record<string, string>>({});

  const currentExercise = exercises[currentExerciseIndex];

  useEffect(() => {
    // Reset state when exercises change
    setCurrentExerciseIndex(0);
    setUserAnswers([]);
    setCurrentAnswer("");
    setIsAnswered(false);
    setIsCorrect(false);
    setShowResults(false);
    setMatchingPairs({});
  }, [exercises]);

  const checkAnswer = () => {
    let correct = false;

    if (currentExercise.type === "multiple-choice") {
      correct = currentAnswer === currentExercise.correctAnswer;
    } else if (currentExercise.type === "fill-in-blank") {
      // Case insensitive comparison for fill-in-blank
      correct = (currentAnswer as string).toLowerCase().trim() === (currentExercise.correctAnswer as string).toLowerCase().trim();
    } else if (currentExercise.type === "true-false") {
      correct = currentAnswer === currentExercise.correctAnswer;
    } else if (currentExercise.type === "matching") {
      // Check if all pairs are matched correctly
      const items = currentExercise.items || [];
      correct = items.every(item => matchingPairs[item.item] === item.match);
    }

    setIsCorrect(correct);
    setIsAnswered(true);

    // Update user answers array
    const newUserAnswers = [...userAnswers];
    newUserAnswers[currentExerciseIndex] = currentAnswer;
    setUserAnswers(newUserAnswers);
  };

  const handleNextExercise = () => {
    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
      setCurrentAnswer("");
      setIsAnswered(false);
      setIsCorrect(false);
      setMatchingPairs({});
    } else {
      // Calculate results
      const correctAnswers = userAnswers.filter((answer, index) => {
        const exercise = exercises[index];
        if (exercise.type === "multiple-choice" || exercise.type === "true-false") {
          return answer === exercise.correctAnswer;
        } else if (exercise.type === "fill-in-blank") {
          return (answer as string).toLowerCase().trim() === (exercise.correctAnswer as string).toLowerCase().trim();
        } else if (exercise.type === "matching") {
          const items = exercise.items || [];
          return items.every(item => matchingPairs[item.item] === item.match);
        }
        return false;
      });

      setShowResults(true);
      onComplete({
        correct: correctAnswers.length,
        total: exercises.length,
      });
    }
  };

  const handleRetry = () => {
    setCurrentExerciseIndex(0);
    setUserAnswers([]);
    setCurrentAnswer("");
    setIsAnswered(false);
    setIsCorrect(false);
    setShowResults(false);
    setMatchingPairs({});
  };

  const handleMatchingChange = (item: string, match: string) => {
    setMatchingPairs({
      ...matchingPairs,
      [item]: match,
    });
  };

  if (showResults) {
    // Show results summary
    const correctCount = userAnswers.filter((answer, index) => {
      const exercise = exercises[index];
      if (exercise.type === "multiple-choice" || exercise.type === "true-false") {
        return answer === exercise.correctAnswer;
      } else if (exercise.type === "fill-in-blank") {
        return (answer as string).toLowerCase().trim() === (exercise.correctAnswer as string).toLowerCase().trim();
      } else if (exercise.type === "matching") {
        const items = exercise.items || [];
        const matchPairs = matchingPairs;
        return items.every(item => matchPairs[item.item] === item.match);
      }
      return false;
    }).length;

    const percentage = Math.round((correctCount / exercises.length) * 100);

    return (
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl">Exercise Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <FaCheckCircle className={`h-10 w-10 ${percentage >= 70 ? 'text-green-500' : 'text-amber-500'}`} />
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-2">{percentage}% Correct</h3>
            <p className="text-muted-foreground mb-4">You got {correctCount} out of {exercises.length} questions correct.</p>

            {percentage >= 70 ? (
              <p className="text-green-600 font-medium">Congratulations! You've completed this exercise successfully.</p>
            ) : (
              <p className="text-amber-600 font-medium">Good effort! Try again to improve your score.</p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
              {exercises.map((exercise, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg ${
                    userAnswers[index] === exercise.correctAnswer ?
                    'bg-green-50 border border-green-200' :
                    'bg-red-50 border border-red-200'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {userAnswers[index] === exercise.correctAnswer ? (
                      <FaCheck className="text-green-500 mt-1 flex-shrink-0" />
                    ) : (
                      <FaTimes className="text-red-500 mt-1 flex-shrink-0" />
                    )}
                    <div>
                      <p className="font-medium">{exercise.question}</p>
                      <p className="text-sm mt-1">
                        <span className="text-muted-foreground">Your answer: </span>
                        <span className={userAnswers[index] === exercise.correctAnswer ? 'text-green-600' : 'text-red-600'}>
                          {userAnswers[index]?.toString() || "Not answered"}
                        </span>
                      </p>
                      {userAnswers[index] !== exercise.correctAnswer && (
                        <p className="text-sm mt-1">
                          <span className="text-muted-foreground">Correct answer: </span>
                          <span className="text-green-600">{exercise.correctAnswer.toString()}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button onClick={handleRetry} className="gap-2">
            <FaRedo /> Try Again
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Exercise {currentExerciseIndex + 1} of {exercises.length}</h2>
        <span className="text-muted-foreground text-sm">
          {currentExerciseIndex + 1} / {exercises.length}
        </span>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">{currentExercise.question}</CardTitle>
        </CardHeader>
        <CardContent>
          {currentExercise.type === "multiple-choice" && (
            <RadioGroup value={currentAnswer as string} onValueChange={setCurrentAnswer} className="space-y-3">
              {currentExercise.options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`option-${index}`} disabled={isAnswered} />
                  <Label htmlFor={`option-${index}`} className="cursor-pointer flex-1">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          )}

          {currentExercise.type === "fill-in-blank" && (
            <Input
              value={currentAnswer as string}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              placeholder="Your answer..."
              className="max-w-md"
              disabled={isAnswered}
            />
          )}

          {currentExercise.type === "true-false" && (
            <RadioGroup value={currentAnswer as string} onValueChange={(value) => setCurrentAnswer(value === "true")} className="space-y-3">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="true" id="true-option" disabled={isAnswered} />
                <Label htmlFor="true-option" className="cursor-pointer">True</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="false" id="false-option" disabled={isAnswered} />
                <Label htmlFor="false-option" className="cursor-pointer">False</Label>
              </div>
            </RadioGroup>
          )}

          {currentExercise.type === "matching" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                {currentExercise.items?.map((item, index) => (
                  <div key={index} className="p-3 border rounded-md">
                    {item.item}
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                {currentExercise.items?.map((item, index) => (
                  <select
                    key={index}
                    value={matchingPairs[item.item] || ""}
                    onChange={(e) => handleMatchingChange(item.item, e.target.value)}
                    className="w-full p-3 border rounded-md"
                    disabled={isAnswered}
                  >
                    <option value="">Select match...</option>
                    {currentExercise.items?.map((matchItem, matchIndex) => (
                      <option key={matchIndex} value={matchItem.match}>
                        {matchItem.match}
                      </option>
                    ))}
                  </select>
                ))}
              </div>
            </div>
          )}

          {isAnswered && (
            <div className={`mt-4 p-4 rounded-lg ${isCorrect ? 'bg-green-50' : 'bg-red-50'}`}>
              <div className="flex items-center gap-2">
                {isCorrect ? (
                  <FaCheck className="text-green-500" />
                ) : (
                  <FaTimes className="text-red-500" />
                )}
                <p className={isCorrect ? 'text-green-700' : 'text-red-700'}>
                  {isCorrect ? 'Correct!' : 'Incorrect. Try again!'}
                </p>
              </div>
              {!isCorrect && (
                <p className="mt-2 text-sm text-muted-foreground">
                  The correct answer is: {currentExercise.correctAnswer.toString()}
                </p>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentExerciseIndex(Math.max(0, currentExerciseIndex - 1))}
            disabled={currentExerciseIndex === 0}
          >
            Previous
          </Button>

          {!isAnswered ? (
            <Button onClick={checkAnswer} disabled={currentAnswer === "" && Object.keys(matchingPairs).length === 0}>
              Check Answer
            </Button>
          ) : (
            <Button onClick={handleNextExercise}>
              {currentExerciseIndex < exercises.length - 1 ? "Next Question" : "View Results"}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}

