"use client";

import { useState } from "react";
import MainLayout from "@/components/layout/main-layout";
import { FlashcardSystem } from "@/components/learning/flashcard-system";
import VocabularySection from "@/components/learning/vocabulary-section";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { FaBook, FaGraduationCap, FaLightbulb, FaRegLightbulb, FaVolumeUp, FaLanguage } from "react-icons/fa";
import vocabularyData from "@/data/vocabulary-data";

export default function VocabularyPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("vocabulary");

  // Sample vocabulary tips
  const vocabularyTips = [
    {
      title: "Learn in Context",
      description: "Instead of memorizing isolated words, learn vocabulary in phrases or sentences to better understand usage."
    },
    {
      title: "Use Spaced Repetition",
      description: "Review words at increasing intervals to optimize long-term retention. Our flashcard system implements this automatically."
    },
    {
      title: "Group by Theme",
      description: "Organize vocabulary by themes or categories to create meaningful connections between words."
    },
    {
      title: "Practice Active Recall",
      description: "Test yourself regularly by trying to recall words before checking the answer."
    },
    {
      title: "Use Mnemonics",
      description: "Create mental associations or stories to help remember challenging words."
    },
    {
      title: "Pay Attention to Gender",
      description: "In French, all nouns have a gender (masculine or feminine). Learn the gender along with the word."
    },
    {
      title: "Focus on Pronunciation",
      description: "French pronunciation can be challenging. Use our audio feature to practice the correct sounds."
    },
    {
      title: "Learn Verb Conjugations",
      description: "French verbs change form based on who is performing the action. Learn the patterns to make conjugation easier."
    }
  ];

  // Sample common word categories
  const commonCategories = [
    { name: "Greetings", count: 25 },
    { name: "Food & Dining", count: 42 },
    { name: "Travel", count: 38 },
    { name: "Family", count: 20 },
    { name: "Numbers & Time", count: 35 },
    { name: "Daily Activities", count: 30 }
  ];

  return (
    <MainLayout>
      <div className="container py-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold">French Vocabulary</h1>
            <p className="text-muted-foreground">
              Build your French vocabulary with our interactive tools
            </p>
          </div>
          {user && (
            <Button asChild>
              <Link href="/dashboard">Return to Dashboard</Link>
            </Button>
          )}
        </div>

        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="mb-10">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 p-1 h-auto mb-6">
            <TabsTrigger value="vocabulary" className="py-2 data-[state=active]:bg-primary data-[state=active]:text-white">
              Vocabulary
            </TabsTrigger>
            <TabsTrigger value="flashcards" className="py-2 data-[state=active]:bg-primary data-[state=active]:text-white">
              Flashcards
            </TabsTrigger>
            <TabsTrigger value="tips" className="py-2 data-[state=active]:bg-primary data-[state=active]:text-white">
              Learning Tips
            </TabsTrigger>
            <TabsTrigger value="categories" className="py-2 data-[state=active]:bg-primary data-[state=active]:text-white">
              Word Categories
            </TabsTrigger>
          </TabsList>

          <TabsContent value="vocabulary">
            <VocabularySection vocabulary={vocabularyData} />
          </TabsContent>

          <TabsContent value="flashcards">
            <FlashcardSystem />
          </TabsContent>

          <TabsContent value="tips">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vocabularyTips.map((tip, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <FaLightbulb className="text-yellow-500" />
                      <CardTitle className="text-lg">{tip.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{tip.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="categories">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {commonCategories.map((category, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <FaBook className="text-primary" />
                      <CardTitle className="text-lg">{category.name}</CardTitle>
                    </div>
                    <CardDescription>{category.count} common words</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Essential vocabulary for everyday conversations about {category.name.toLowerCase()}.
                    </p>
                    <Button variant="outline" size="sm" className="w-full" asChild>
                      <Link href={`/learn/vocabulary?category=${category.name.toLowerCase()}`}>
                        Browse Words
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {!user && (
          <Card className="mt-8 border-dashed">
            <CardContent className="py-8 text-center">
              <div className="mx-auto mb-4 h-16 w-16 text-muted">
                <FaGraduationCap className="h-full w-full" />
              </div>
              <h3 className="text-xl font-medium mb-2">Sign in to save your progress</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Create an account or sign in to save your vocabulary progress and track your learning journey.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button asChild size="lg">
                  <Link href="/auth/login">Sign In</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/auth/register">Create Account</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="mt-12 bg-primary/5 p-6 rounded-lg">
          <div className="flex items-center gap-3 mb-4">
            <FaLanguage className="text-primary h-6 w-6" />
            <h2 className="text-xl font-bold">French Language Learning Resources</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-2">Pronunciation Guides</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Master French pronunciation with our comprehensive audio guides and practice exercises.
              </p>
              <Button variant="outline" size="sm" asChild>
                <Link href="/learn/pronunciation">
                  <FaVolumeUp className="mr-2 h-4 w-4" /> Explore Pronunciation
                </Link>
              </Button>
            </div>
            <div>
              <h3 className="font-medium mb-2">Grammar Essentials</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Learn French grammar rules through clear explanations and interactive exercises.
              </p>
              <Button variant="outline" size="sm" asChild>
                <Link href="/learn/grammar">
                  <FaBook className="mr-2 h-4 w-4" /> Explore Grammar
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

