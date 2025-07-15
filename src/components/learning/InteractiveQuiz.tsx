import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle } from 'lucide-react';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

interface InteractiveQuizProps {
  questions: QuizQuestion[];
  onCompletion: (score: number) => void;
}

export function InteractiveQuiz({ questions, onCompletion }: InteractiveQuizProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);

  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
    setShowResult(true);
    if (answer === currentQuestion.correctAnswer) {
      setScore(prev => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      onCompletion(score);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Interactive Quiz</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-lg font-semibold">
            {currentQuestionIndex + 1}. {currentQuestion.question}
          </div>
          
          {currentQuestion.options.map((option, index) => (
            <Button
              key={index}
              variant={selectedAnswer === option ? 'default' : 'outline'}
              onClick={() => handleAnswerSelect(option)}
              className={`w-full justify-start ${
                showResult
                  ? selectedAnswer === option
                    ? selectedAnswer === currentQuestion.correctAnswer
                      ? 'bg-green-500 hover:bg-green-600'
                      : 'bg-red-500 hover:bg-red-600'
                    : 'bg-gray-200'
                  : ''
              }`}
              disabled={showResult}
            >
              {option}
            </Button>
          ))}

          {showResult && (
            <div className="mt-4 p-4 rounded-lg bg-gray-50">
              <div className="flex items-center mb-2">
                {selectedAnswer === currentQuestion.correctAnswer ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500 mr-2" />
                )}
                <span className={selectedAnswer === currentQuestion.correctAnswer ? 'text-green-500' : 'text-red-500'}>
                  {selectedAnswer === currentQuestion.correctAnswer 
                    ? 'Correct!' 
                    : `Incorrect. The correct answer was: ${currentQuestion.correctAnswer}`}
                </span>
              </div>
              <p className="text-sm text-gray-600">
                {currentQuestion.explanation}
              </p>
            </div>
          )}

          <div className="mt-4 flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setShowResult(false)}
              disabled={!showResult}
            >
              Try Again
            </Button>
            <Button
              onClick={handleNextQuestion}
              disabled={!showResult}
            >
              {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

