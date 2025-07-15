"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FaVolumeUp, FaCheck, FaEye, FaEyeSlash, FaInfoCircle, FaBookOpen, FaMars, FaVenus, FaRandom } from "react-icons/fa";

interface VocabularyItem {
  french: string;
  english: string;
  pronunciation: string;
  gender?: 'masculine' | 'feminine' | 'neutral'; // For nouns
  type?: 'noun' | 'verb' | 'adjective' | 'adverb' | 'phrase' | 'other';
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  example?: string; // Example sentence
  exampleTranslation?: string; // Translation of example
  conjugation?: {
    present?: string[];
    past?: string[];
    future?: string[];
  }; // For verbs
  relatedWords?: string[]; // Related vocabulary
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
  const [showDetails, setShowDetails] = useState<Record<string, boolean>>({});
  const [filterType, setFilterType] = useState<string>("all");
  const [filterDifficulty, setFilterDifficulty] = useState<string>("all");
  const [conjugationTab, setConjugationTab] = useState<string>("present");

  const filteredVocabulary = vocabulary.filter(
    (item) => {
      const matchesSearch = item.french.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.english.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = filterType === "all" || item.type === filterType;
      const matchesDifficulty = filterDifficulty === "all" || item.difficulty === filterDifficulty;
      
      return matchesSearch && matchesType && matchesDifficulty;
    }
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

  const toggleDetails = (index: number) => {
    setShowDetails(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const shuffleCards = () => {
    // Fisher-Yates shuffle algorithm
    setCurrentCardIndex(0);
    setIsFlipped(false);
  };

  const renderGenderBadge = (gender?: 'masculine' | 'feminine' | 'neutral') => {
    if (!gender) return null;
    
    return (
      <Badge variant="outline" className={
        gender === 'masculine' ? 'bg-blue-50 text-blue-700 border-blue-200' :
        gender === 'feminine' ? 'bg-pink-50 text-pink-700 border-pink-200' :
        'bg-gray-50 text-gray-700 border-gray-200'
      }>
        {gender === 'masculine' ? <FaMars className="mr-1 h-3 w-3" /> : 
         gender === 'feminine' ? <FaVenus className="mr-1 h-3 w-3" /> : null}
        {gender === 'masculine' ? 'le' : gender === 'feminine' ? 'la' : 'l\''}
      </Badge>
    );
  };

  const renderDifficultyBadge = (difficulty?: 'beginner' | 'intermediate' | 'advanced') => {
    if (!difficulty) return null;
    
    return (
      <Badge variant="outline" className={
        difficulty === 'beginner' ? 'bg-green-50 text-green-700 border-green-200' :
        difficulty === 'intermediate' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
        'bg-red-50 text-red-700 border-red-200'
      }>
        {difficulty}
      </Badge>
    );
  };

  const renderTypeBadge = (type?: string) => {
    if (!type) return null;
    
    return (
      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
        {type}
      </Badge>
    );
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
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={shuffleCards}>
              <FaRandom className="mr-2 h-3 w-3" /> Shuffle
            </Button>
            <div className="text-sm text-muted-foreground">
              Card {currentCardIndex + 1} of {vocabulary.length}
            </div>
          </div>
        </div>

        <div
          className="h-80 relative cursor-pointer perspective-card"
          onClick={handleFlip}
        >
          <div className={`absolute inset-0 transition-transform duration-500 backface-hidden ${isFlipped ? 'rotate-y-180' : ''}`}>
            <Card className="w-full h-full border-0 shadow-md flex items-center justify-center text-center">
              <CardContent className="pt-6">
                <div className="flex justify-center items-center gap-2 mb-2">
                  <div className="text-2xl font-bold">{vocabulary[currentCardIndex].french}</div>
                  {vocabulary[currentCardIndex].gender && renderGenderBadge(vocabulary[currentCardIndex].gender)}
                </div>
                <div className="text-muted-foreground mb-4">[{vocabulary[currentCardIndex].pronunciation}]</div>
                {vocabulary[currentCardIndex].type && (
                  <div className="flex justify-center mb-4">
                    {renderTypeBadge(vocabulary[currentCardIndex].type)}
                    {vocabulary[currentCardIndex].difficulty && (
                      <div className="ml-2">{renderDifficultyBadge(vocabulary[currentCardIndex].difficulty)}</div>
                    )}
                  </div>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlayPronunciation(vocabulary[currentCardIndex].french);
                  }}
                >
                  <FaVolumeUp className="mr-2" /> Listen
                </Button>
                <div className="text-xs text-muted-foreground mt-4">Click to flip</div>
              </CardContent>
            </Card>
          </div>
          <div className={`absolute inset-0 transition-transform duration-500 backface-hidden rotate-y-180 ${isFlipped ? 'rotate-y-0' : ''}`}>
            <Card className="w-full h-full border-0 shadow-md flex items-center justify-center">
              <CardContent className="pt-6 w-full">
                <div className="text-2xl font-bold mb-2 text-center">{vocabulary[currentCardIndex].english}</div>
                <div className="text-muted-foreground text-center mb-4">English translation</div>
                
                {vocabulary[currentCardIndex].example && (
                  <div className="mt-4 text-sm border-t pt-4">
                    <div className="font-medium mb-1">Example:</div>
                    <div className="italic">{vocabulary[currentCardIndex].example}</div>
                    {vocabulary[currentCardIndex].exampleTranslation && (
                      <div className="text-muted-foreground mt-1">{vocabulary[currentCardIndex].exampleTranslation}</div>
                    )}
                  </div>
                )}
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
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={shuffleCards}>
              <FaRandom className="mr-2 h-3 w-3" /> Shuffle
            </Button>
            <div className="text-sm text-muted-foreground">
              Word {currentCardIndex + 1} of {vocabulary.length}
            </div>
          </div>
        </div>

        <Card className="border-0 shadow-md">
          <CardContent className="pt-6 pb-6">
            <div className="text-center mb-8">
              <div className="text-muted-foreground mb-2">Translate to French:</div>
              <div className="text-2xl font-bold">{vocabulary[currentCardIndex].english}</div>
              {vocabulary[currentCardIndex].type && (
                <div className="flex justify-center mt-2">
                  {renderTypeBadge(vocabulary[currentCardIndex].type)}
                  {vocabulary[currentCardIndex].difficulty && (
                    <div className="ml-2">{renderDifficultyBadge(vocabulary[currentCardIndex].difficulty)}</div>
                  )}
                </div>
              )}
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
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handlePlayPronunciation(vocabulary[currentCardIndex].french)}
                          className="mt-2"
                        >
                          <FaVolumeUp className="mr-2" /> Listen
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  {vocabulary[currentCardIndex].example && checkResult === "correct" && (
                    <div className="p-4 rounded-lg bg-blue-50">
                      <div className="font-medium mb-1">Example usage:</div>
                      <div className="italic">{vocabulary[currentCardIndex].example}</div>
                      {vocabulary[currentCardIndex].exampleTranslation && (
                        <div className="text-sm text-muted-foreground mt-1">{vocabulary[currentCardIndex].exampleTranslation}</div>
                      )}
                    </div>
                  )}
                  
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
      
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="flex items-center">
          <span className="text-sm mr-2">Type:</span>
          <select 
            className="text-sm border rounded px-2 py-1"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">All</option>
            <option value="noun">Nouns</option>
            <option value="verb">Verbs</option>
            <option value="adjective">Adjectives</option>
            <option value="adverb">Adverbs</option>
            <option value="phrase">Phrases</option>
          </select>
        </div>
        
        <div className="flex items-center ml-4">
          <span className="text-sm mr-2">Difficulty:</span>
          <select 
            className="text-sm border rounded px-2 py-1"
            value={filterDifficulty}
            onChange={(e) => setFilterDifficulty(e.target.value)}
          >
            <option value="all">All</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {filteredVocabulary.map((item, index) => (
          <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="font-bold text-lg">{item.french}</div>
                    {item.gender && renderGenderBadge(item.gender)}
                  </div>
                  <div className="text-muted-foreground text-sm">[{item.pronunciation}]</div>
                  {showEnglish && <div className="mt-2">{item.english}</div>}
                  
                  <div className="flex flex-wrap gap-2 mt-2">
                    {item.type && renderTypeBadge(item.type)}
                    {item.difficulty && renderDifficultyBadge(item.difficulty)}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-primary"
                    onClick={() => handlePlayPronunciation(item.french)}
                  >
                    <FaVolumeUp />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-primary"
                    onClick={() => toggleDetails(index)}
                  >
                    <FaInfoCircle />
                  </Button>
                </div>
              </div>
              
              {showDetails[index] && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  {item.example && (
                    <div className="mb-3">
                      <div className="font-medium text-sm mb-1">Example:</div>
                      <div className="italic text-sm">{item.example}</div>
                      {item.exampleTranslation && (
                        <div className="text-muted-foreground text-xs mt-1">{item.exampleTranslation}</div>
                      )}
                    </div>
                  )}
                  
                  {item.type === 'verb' && item.conjugation && (
                    <div className="mt-3">
                      <div className="font-medium text-sm mb-2">Conjugation:</div>
                      <Tabs defaultValue="present" value={conjugationTab} onValueChange={setConjugationTab}>
                        <TabsList className="grid w-full grid-cols-3">
                          <TabsTrigger value="present">Present</TabsTrigger>
                          <TabsTrigger value="past">Past</TabsTrigger>
                          <TabsTrigger value="future">Future</TabsTrigger>
                        </TabsList>
                        <TabsContent value="present" className="text-sm">
                          {item.conjugation.present?.map((form, i) => (
                            <div key={i}>{form}</div>
                          ))}
                        </TabsContent>
                        <TabsContent value="past" className="text-sm">
                          {item.conjugation.past?.map((form, i) => (
                            <div key={i}>{form}</div>
                          ))}
                        </TabsContent>
                        <TabsContent value="future" className="text-sm">
                          {item.conjugation.future?.map((form, i) => (
                            <div key={i}>{form}</div>
                          ))}
                        </TabsContent>
                      </Tabs>
                    </div>
                  )}
                  
                  {item.relatedWords && item.relatedWords.length > 0 && (
                    <div className="mt-3">
                      <div className="font-medium text-sm mb-1">Related Words:</div>
                      <div className="flex flex-wrap gap-2">
                        {item.relatedWords.map((word, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {word}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
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

