"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FaVolumeUp, FaCheck, FaEye, FaEyeSlash } from "react-icons/fa";

interface VocabularyItem {
  french: string;
  english: string;
  pronunciation: string;
}

interface VocabularyProps {
  vocabulary: VocabularyItem[];
}

export default function VocabularySection({ vocabulary }: VocabularyProps) {
  const [currentMode, setCurrentMode] = useState<"list" | "flashcards" | "practice">("list");
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [practiceInput, setPracticeInput] = useState("");
  const [checkResult, setCheckResult] = useState<"correct" | "incorrect" | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showEnglish, setShowEnglish] = useState(true);

  const filteredVocabulary = vocabulary.filter(
    (item) =>
      item.french.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.english.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleNextCard = () => {
    setCurrentCardIndex((prevIndex) => (prevIndex + 1) % vocabulary.length);
    setIsFlipped(false);
    setPracticeInput("");
    setCheckResult(null);
  };

  const handlePrevCard = () => {
    setCurrentCardIndex((prevIndex) => (prevIndex - 1 + vocabulary.length) % vocabulary.length);
    setIsFlipped(false);
    setPracticeInput("");
    setCheckResult(null);
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleCheckAnswer = () => {
    const isCorrect = practiceInput.toLowerCase().trim() === vocabulary[currentCardIndex].french.toLowerCase();
    setCheckResult(isCorrect ? "correct" : "incorrect");
  };

  const handlePlayPronunciation = (text: string) => {
    // This would use the Web Speech API in a real application
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "fr-FR";
    window.speechSynthesis?.speak(utterance);
  };

  if (currentMode === "flashcards") {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-x-2">
            <Button variant="outline" size="sm" onClick={() => setCurrentMode("list")}>
              List View
            </Button>
            <Button variant="default" size="sm">
              Flashcards
            </Button>
            <Button variant="outline" size="sm" onClick={() => setCurrentMode("practice")}>
              Practice
            </Button>
          </div>
          <div className="text-sm text-muted-foreground">
            Card {currentCardIndex + 1} of {vocabulary.length}
          </div>
        </div>

        <div
          className="h-60 relative cursor-pointer perspective-card"
          onClick={handleFlip}
        >
          <div className={`absolute inset-0 transition-transform duration-500 backface-hidden ${isFlipped ? 'rotate-y-180' : ''}`}>
            <Card className="w-full h-full border-0 shadow-md flex items-center justify-center text-center">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold mb-2">{vocabulary[currentCardIndex].french}</div>
                <div className="text-muted-foreground">[{vocabulary[currentCardIndex].pronunciation}]</div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-4"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlayPronunciation(vocabulary[currentCardIndex].french);
                  }}
                >
                  <FaVolumeUp className="mr-2" /> Listen
                </Button>
              </CardContent>
            </Card>
          </div>
          <div className={`absolute inset-0 transition-transform duration-500 backface-hidden rotate-y-180 ${isFlipped ? 'rotate-y-0' : ''}`}>
            <Card className="w-full h-full border-0 shadow-md flex items-center justify-center text-center">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold mb-2">{vocabulary[currentCardIndex].english}</div>
                <div className="text-muted-foreground">English translation</div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex justify-center space-x-4 mt-4">
          <Button variant="outline" onClick={handlePrevCard}>
            Previous
          </Button>
          <Button variant="outline" onClick={handleFlip}>
            Flip
          </Button>
          <Button variant="default" onClick={handleNextCard}>
            Next
          </Button>
        </div>
      </div>
    );
  }

  if (currentMode === "practice") {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-x-2">
            <Button variant="outline" size="sm" onClick={() => setCurrentMode("list")}>
              List View
            </Button>
            <Button variant="outline" size="sm" onClick={() => setCurrentMode("flashcards")}>
              Flashcards
            </Button>
            <Button variant="default" size="sm">
              Practice
            </Button>
          </div>
          <div className="text-sm text-muted-foreground">
            Word {currentCardIndex + 1} of {vocabulary.length}
          </div>
        </div>

        <Card className="border-0 shadow-md">
          <CardContent className="pt-6 pb-6">
            <div className="text-center mb-8">
              <div className="text-muted-foreground mb-2">Translate to French:</div>
              <div className="text-2xl font-bold">{vocabulary[currentCardIndex].english}</div>
            </div>

            <div className="max-w-md mx-auto space-y-4">
              <Input
                value={practiceInput}
                onChange={(e) => setPracticeInput(e.target.value)}
                placeholder="Type the French word..."
                className="text-center"
                disabled={checkResult !== null}
              />

              {checkResult === null ? (
                <Button
                  className="w-full"
                  onClick={handleCheckAnswer}
                  disabled={practiceInput.trim() === ""}
                >
                  Check Answer
                </Button>
              ) : (
                <div className="space-y-4">
                  <div
                    className={`p-4 rounded-lg text-center ${
                      checkResult === "correct" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                    }`}
                  >
                    {checkResult === "correct" ? (
                      <div className="flex items-center justify-center gap-2">
                        <FaCheck />
                        <span>Correct!</span>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div>Incorrect. The correct answer is:</div>
                        <div className="font-bold">{vocabulary[currentCardIndex].french}</div>
                        <div className="text-sm text-muted-foreground">[{vocabulary[currentCardIndex].pronunciation}]</div>
                      </div>
                    )}
                  </div>
                  <Button className="w-full" onClick={handleNextCard}>
                    Next Word
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Default list view
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="space-x-2">
          <Button variant="default" size="sm">
            List View
          </Button>
          <Button variant="outline" size="sm" onClick={() => setCurrentMode("flashcards")}>
            Flashcards
          </Button>
          <Button variant="outline" size="sm" onClick={() => setCurrentMode("practice")}>
            Practice
          </Button>
        </div>
        <div className="flex gap-2 items-center">
          <Input
            placeholder="Search vocabulary..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-xs"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowEnglish(!showEnglish)}
            title={showEnglish ? "Hide English" : "Show English"}
          >
            {showEnglish ? <FaEyeSlash /> : <FaEye />}
          </Button>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {filteredVocabulary.map((item, index) => (
          <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-6 flex justify-between items-start">
              <div>
                <div className="font-bold text-lg mb-1">{item.french}</div>
                <div className="text-muted-foreground text-sm">[{item.pronunciation}]</div>
                {showEnglish && <div className="mt-2">{item.english}</div>}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-primary"
                onClick={() => handlePlayPronunciation(item.french)}
              >
                <FaVolumeUp />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredVocabulary.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No vocabulary items match your search.
        </div>
      )}
    </div>
  );
}
