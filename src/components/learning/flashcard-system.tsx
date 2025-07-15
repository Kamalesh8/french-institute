"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/context/auth-context";
import { db } from "@/config/firebase";
import { collection, addDoc, getDocs, query, where, orderBy, doc, updateDoc, serverTimestamp, deleteDoc } from "firebase/firestore";
import { toast } from "sonner";
import { FaPlus, FaEdit, FaTrash, FaVolumeUp, FaCheck, FaTimes, FaRandom, FaSave } from "react-icons/fa";

interface Flashcard {
  id: string;
  userId: string;
  courseId?: string;
  french: string;
  english: string;
  example?: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  lastReviewed?: string;
  nextReview?: string;
  repetitions: number;
  easinessFactor: number;
  interval: number;
  createdAt: string;
}

interface FlashcardSystemProps {
  courseId?: string;
}

export function FlashcardSystem({ courseId }: FlashcardSystemProps) {
  const { user } = useAuth();
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [filteredFlashcards, setFilteredFlashcards] = useState<Flashcard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'study' | 'create'>('all');
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [categories, setCategories] = useState<string[]>([]);
  
  // New flashcard form state
  const [newCard, setNewCard] = useState({
    french: "",
    english: "",
    example: "",
    category: "",
    difficulty: "medium" as 'easy' | 'medium' | 'hard'
  });
  
  // Edit mode state
  const [isEditMode, setIsEditMode] = useState(false);
  const [editCardId, setEditCardId] = useState<string | null>(null);
  
  // Study session state
  const [studySessionCards, setStudySessionCards] = useState<Flashcard[]>([]);
  const [sessionProgress, setSessionProgress] = useState(0);
  const [sessionLength, setSessionLength] = useState(10); // Default study session length
  
  useEffect(() => {
    if (!user) return;
    
    const fetchFlashcards = async () => {
      setIsLoading(true);
      try {
        let flashcardsQuery;
        
        if (courseId) {
          flashcardsQuery = query(
            collection(db, "flashcards"),
            where("userId", "==", user.uid),
            where("courseId", "==", courseId),
            orderBy("createdAt", "desc")
          );
        } else {
          flashcardsQuery = query(
            collection(db, "flashcards"),
            where("userId", "==", user.uid),
            orderBy("createdAt", "desc")
          );
        }
        
        const flashcardsSnapshot = await getDocs(flashcardsQuery);
        const flashcardsData: Flashcard[] = [];
        const uniqueCategories = new Set<string>();
        
        flashcardsSnapshot.forEach((doc) => {
          const data = doc.data();
          const flashcard: Flashcard = {
            id: doc.id,
            userId: data.userId,
            courseId: data.courseId,
            french: data.french,
            english: data.english,
            example: data.example,
            category: data.category,
            difficulty: data.difficulty,
            lastReviewed: data.lastReviewed,
            nextReview: data.nextReview,
            repetitions: data.repetitions || 0,
            easinessFactor: data.easinessFactor || 2.5,
            interval: data.interval || 1,
            createdAt: data.createdAt?.toDate?.() 
              ? data.createdAt.toDate().toISOString() 
              : new Date().toISOString()
          };
          
          flashcardsData.push(flashcard);
          uniqueCategories.add(data.category);
        });
        
        setFlashcards(flashcardsData);
        setFilteredFlashcards(flashcardsData);
        setCategories(Array.from(uniqueCategories));
      } catch (error) {
        console.error("Error fetching flashcards:", error);
        toast.error("Failed to load flashcards");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchFlashcards();
  }, [user, courseId]);
  
  // Filter flashcards based on search query and category
  useEffect(() => {
    let filtered = [...flashcards];
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        card => 
          card.french.toLowerCase().includes(query) || 
          card.english.toLowerCase().includes(query) ||
          (card.example && card.example.toLowerCase().includes(query))
      );
    }
    
    if (categoryFilter) {
      filtered = filtered.filter(card => card.category === categoryFilter);
    }
    
    setFilteredFlashcards(filtered);
  }, [flashcards, searchQuery, categoryFilter]);
  
  const startStudySession = () => {
    // Get cards due for review or random cards if not enough due cards
    const now = new Date();
    const dueCards = flashcards.filter(card => {
      if (!card.nextReview) return true;
      return new Date(card.nextReview) <= now;
    });
    
    let studyCards;
    if (dueCards.length >= sessionLength) {
      studyCards = dueCards.slice(0, sessionLength);
    } else {
      // Add some random cards to reach the session length
      const nonDueCards = flashcards.filter(card => {
        if (!card.nextReview) return false;
        return new Date(card.nextReview) > now;
      });
      
      // Shuffle non-due cards
      const shuffled = [...nonDueCards].sort(() => 0.5 - Math.random());
      const additionalCards = shuffled.slice(0, sessionLength - dueCards.length);
      
      studyCards = [...dueCards, ...additionalCards];
    }
    
    // Shuffle the study cards
    studyCards = studyCards.sort(() => 0.5 - Math.random());
    
    setStudySessionCards(studyCards);
    setCurrentCardIndex(0);
    setShowAnswer(false);
    setSessionProgress(0);
    setActiveTab('study');
  };
  
  const handleCardRating = async (rating: 0 | 1 | 2 | 3) => {
    if (!studySessionCards.length) return;
    
    const currentCard = studySessionCards[currentCardIndex];
    
    // Apply spaced repetition algorithm (SuperMemo SM-2)
    let { repetitions, easinessFactor, interval } = currentCard;
    
    if (rating >= 3) { // Correct response
      if (repetitions === 0) {
        interval = 1;
      } else if (repetitions === 1) {
        interval = 6;
      } else {
        interval = Math.round(interval * easinessFactor);
      }
      repetitions += 1;
    } else { // Incorrect response
      repetitions = 0;
      interval = 1;
    }
    
    // Update easiness factor
    easinessFactor = Math.max(
      1.3,
      easinessFactor + (0.1 - (5 - rating) * (0.08 + (5 - rating) * 0.02))
    );
    
    // Calculate next review date
    const now = new Date();
    const nextReview = new Date(now);
    nextReview.setDate(now.getDate() + interval);
    
    // Update the card in Firestore
    try {
      await updateDoc(doc(db, "flashcards", currentCard.id), {
        lastReviewed: serverTimestamp(),
        nextReview: nextReview,
        repetitions,
        easinessFactor,
        interval
      });
      
      // Update the card in local state
      const updatedCards = flashcards.map(card => {
        if (card.id === currentCard.id) {
          return {
            ...card,
            lastReviewed: now.toISOString(),
            nextReview: nextReview.toISOString(),
            repetitions,
            easinessFactor,
            interval
          };
        }
        return card;
      });
      
      setFlashcards(updatedCards);
      
      // Move to next card or end session
      const newProgress = Math.round(((currentCardIndex + 1) / studySessionCards.length) * 100);
      setSessionProgress(newProgress);
      
      if (currentCardIndex < studySessionCards.length - 1) {
        setCurrentCardIndex(currentCardIndex + 1);
        setShowAnswer(false);
      } else {
        toast.success("Study session completed!");
        setTimeout(() => {
          setActiveTab('all');
        }, 1500);
      }
    } catch (error) {
      console.error("Error updating flashcard:", error);
      toast.error("Failed to update flashcard");
    }
  };
  
  const handleCreateFlashcard = async () => {
    if (!user) {
      toast.error("You must be logged in to create flashcards");
      return;
    }
    
    if (!newCard.french.trim() || !newCard.english.trim()) {
      toast.error("French and English fields are required");
      return;
    }
    
    try {
      const flashcardData = {
        userId: user.uid,
        courseId: courseId || null,
        french: newCard.french.trim(),
        english: newCard.english.trim(),
        example: newCard.example.trim() || null,
        category: newCard.category.trim() || "General",
        difficulty: newCard.difficulty,
        repetitions: 0,
        easinessFactor: 2.5,
        interval: 1,
        createdAt: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, "flashcards"), flashcardData);
      
      // Add the new flashcard to the state
      const newFlashcard: Flashcard = {
        id: docRef.id,
        ...flashcardData,
        createdAt: new Date().toISOString()
      };
      
      setFlashcards([newFlashcard, ...flashcards]);
      
      // Add category to categories list if it's new
      if (newCard.category && !categories.includes(newCard.category)) {
        setCategories([...categories, newCard.category]);
      }
      
      // Reset the form
      setNewCard({
        french: "",
        english: "",
        example: "",
        category: "",
        difficulty: "medium"
      });
      
      toast.success("Flashcard created successfully");
      setActiveTab('all');
    } catch (error) {
      console.error("Error creating flashcard:", error);
      toast.error("Failed to create flashcard");
    }
  };
  
  const handleEditFlashcard = (card: Flashcard) => {
    setNewCard({
      french: card.french,
      english: card.english,
      example: card.example || "",
      category: card.category,
      difficulty: card.difficulty
    });
    setEditCardId(card.id);
    setIsEditMode(true);
    setActiveTab('create');
  };
  
  const handleUpdateFlashcard = async () => {
    if (!editCardId) return;
    
    try {
      const flashcardRef = doc(db, "flashcards", editCardId);
      
      await updateDoc(flashcardRef, {
        french: newCard.french.trim(),
        english: newCard.english.trim(),
        example: newCard.example.trim() || null,
        category: newCard.category.trim() || "General",
        difficulty: newCard.difficulty
      });
      
      // Update the flashcard in state
      const updatedFlashcards = flashcards.map(card => {
        if (card.id === editCardId) {
          return {
            ...card,
            french: newCard.french.trim(),
            english: newCard.english.trim(),
            example: newCard.example.trim() || undefined,
            category: newCard.category.trim() || "General",
            difficulty: newCard.difficulty
          };
        }
        return card;
      });
      
      setFlashcards(updatedFlashcards);
      
      // Add category to categories list if it's new
      if (newCard.category && !categories.includes(newCard.category)) {
        setCategories([...categories, newCard.category]);
      }
      
      // Reset form and edit mode
      setNewCard({
        french: "",
        english: "",
        example: "",
        category: "",
        difficulty: "medium"
      });
      setEditCardId(null);
      setIsEditMode(false);
      
      toast.success("Flashcard updated successfully");
      setActiveTab('all');
    } catch (error) {
      console.error("Error updating flashcard:", error);
      toast.error("Failed to update flashcard");
    }
  };
  
  const handleDeleteFlashcard = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this flashcard?")) {
      return;
    }
    
    try {
      await deleteDoc(doc(db, "flashcards", id));
      
      // Remove the flashcard from state
      setFlashcards(flashcards.filter(card => card.id !== id));
      
      toast.success("Flashcard deleted successfully");
    } catch (error) {
      console.error("Error deleting flashcard:", error);
      toast.error("Failed to delete flashcard");
    }
  };
  
  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'fr-FR';
      window.speechSynthesis.speak(utterance);
    } else {
      toast.error("Text-to-speech is not supported in your browser");
    }
  };
  
  const shuffleFlashcards = () => {
    const shuffled = [...filteredFlashcards].sort(() => 0.5 - Math.random());
    setFilteredFlashcards(shuffled);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Vocabulary Flashcards</h2>
          <p className="text-muted-foreground">
            {flashcards.length} {flashcards.length === 1 ? 'card' : 'cards'} in your collection
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant={activeTab === 'all' ? 'default' : 'outline'} 
            onClick={() => setActiveTab('all')}
          >
            All Cards
          </Button>
          <Button 
            variant={activeTab === 'study' ? 'default' : 'outline'} 
            onClick={startStudySession}
          >
            Study
          </Button>
          <Button 
            variant={activeTab === 'create' ? 'default' : 'outline'} 
            onClick={() => {
              setActiveTab('create');
              setIsEditMode(false);
              setEditCardId(null);
              setNewCard({
                french: "",
                english: "",
                example: "",
                category: "",
                difficulty: "medium"
              });
            }}
          >
            <FaPlus className="mr-2" /> Add Card
          </Button>
        </div>
      </div>
      
      {activeTab === 'all' && (
        <div>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search cards..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="w-full md:w-64">
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <Button variant="outline" onClick={shuffleFlashcards}>
              <FaRandom className="mr-2" /> Shuffle
            </Button>
          </div>
          
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading flashcards...</p>
            </div>
          ) : filteredFlashcards.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredFlashcards.map((card) => (
                <Card key={card.id} className="overflow-hidden">
                  <CardHeader className="pb-2 flex flex-row justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{card.french}</CardTitle>
                      <p className="text-sm text-muted-foreground">{card.english}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => speakText(card.french)}>
                        <FaVolumeUp className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {card.example && (
                      <p className="text-sm italic mt-2">"{card.example}"</p>
                    )}
                    <div className="flex justify-between mt-4 text-xs">
                      <span className="px-2 py-1 bg-muted rounded-full">
                        {card.category}
                      </span>
                      <span className={`px-2 py-1 rounded-full ${
                        card.difficulty === 'easy' 
                          ? 'bg-green-100 text-green-800' 
                          : card.difficulty === 'medium'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                      }`}>
                        {card.difficulty}
                      </span>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t bg-muted/50 flex justify-end gap-2 py-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEditFlashcard(card)}>
                      <FaEdit className="mr-1 h-3 w-3" /> Edit
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteFlashcard(card.id)}>
                      <FaTrash className="mr-1 h-3 w-3" /> Delete
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground mb-4">No flashcards found. Create your first flashcard!</p>
                <Button onClick={() => setActiveTab('create')}>
                  <FaPlus className="mr-2" /> Add Card
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}
      
      {activeTab === 'study' && studySessionCards.length > 0 && (
        <div>
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">
                Card {currentCardIndex + 1} of {studySessionCards.length}
              </span>
              <span className="text-sm font-medium">{sessionProgress}% complete</span>
            </div>
            <Progress value={sessionProgress} className="h-2" />
          </div>
          
          <Card className="max-w-xl mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">
                {showAnswer 
                  ? studySessionCards[currentCardIndex].english 
                  : studySessionCards[currentCardIndex].french}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              {showAnswer && studySessionCards[currentCardIndex].example && (
                <p className="italic mt-2">"{studySessionCards[currentCardIndex].example}"</p>
              )}
              
              <div className="flex justify-center mt-6">
                <Button 
                  variant="outline" 
                  size="lg" 
                  onClick={() => speakText(studySessionCards[currentCardIndex].french)}
                  className="mx-2"
                >
                  <FaVolumeUp className="mr-2" /> Pronounce
                </Button>
                
                {!showAnswer && (
                  <Button 
                    size="lg" 
                    onClick={() => setShowAnswer(true)}
                    className="mx-2"
                  >
                    Show Answer
                  </Button>
                )}
              </div>
            </CardContent>
            
            {showAnswer && (
              <CardFooter className="flex justify-center gap-2 pt-2 pb-6">
                <Button 
                  variant="outline" 
                  className="bg-red-100 text-red-800 hover:bg-red-200 border-red-200"
                  onClick={() => handleCardRating(0)}
                >
                  <FaTimes className="mr-2" /> Hard
                </Button>
                <Button 
                  variant="outline" 
                  className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-200"
                  onClick={() => handleCardRating(1)}
                >
                  Difficult
                </Button>
                <Button 
                  variant="outline" 
                  className="bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200"
                  onClick={() => handleCardRating(2)}
                >
                  Good
                </Button>
                <Button 
                  variant="outline" 
                  className="bg-green-100 text-green-800 hover:bg-green-200 border-green-200"
                  onClick={() => handleCardRating(3)}
                >
                  <FaCheck className="mr-2" /> Easy
                </Button>
              </CardFooter>
            )}
          </Card>
        </div>
      )}
      
      {activeTab === 'create' && (
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>{isEditMode ? "Edit Flashcard" : "Create New Flashcard"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">French</label>
                <Input
                  placeholder="French word or phrase"
                  value={newCard.french}
                  onChange={(e) => setNewCard({...newCard, french: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">English</label>
                <Input
                  placeholder="English translation"
                  value={newCard.english}
                  onChange={(e) => setNewCard({...newCard, english: e.target.value})}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Example (optional)</label>
              <Input
                placeholder="Example sentence in French"
                value={newCard.example}
                onChange={(e) => setNewCard({...newCard, example: e.target.value})}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Input
                  placeholder="e.g., Greetings, Food, Travel"
                  value={newCard.category}
                  onChange={(e) => setNewCard({...newCard, category: e.target.value})}
                  list="categories"
                />
                <datalist id="categories">
                  {categories.map((category) => (
                    <option key={category} value={category} />
                  ))}
                </datalist>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Difficulty</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={newCard.difficulty}
                  onChange={(e) => setNewCard({
                    ...newCard, 
                    difficulty: e.target.value as 'easy' | 'medium' | 'hard'
                  })}
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={() => {
                setActiveTab('all');
                setIsEditMode(false);
                setEditCardId(null);
                setNewCard({
                  french: "",
                  english: "",
                  example: "",
                  category: "",
                  difficulty: "medium"
                });
              }}
            >
              Cancel
            </Button>
            <Button onClick={isEditMode ? handleUpdateFlashcard : handleCreateFlashcard}>
              <FaSave className="mr-2" />
              {isEditMode ? "Update Flashcard" : "Create Flashcard"}
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}

