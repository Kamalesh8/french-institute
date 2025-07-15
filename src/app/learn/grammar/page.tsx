"use client";

import { useState } from "react";
import MainLayout from "@/components/layout/main-layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { FaBook, FaGraduationCap, FaLanguage, FaCheck, FaArrowRight } from "react-icons/fa";

export default function GrammarPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("basics");

  // Sample grammar topics
  const grammarTopics = [
    {
      id: "articles",
      title: "Articles",
      description: "Learn about definite and indefinite articles in French",
      level: "A1",
      content: "In French, articles indicate the gender and number of nouns. The definite articles are 'le' (masculine singular), 'la' (feminine singular), and 'les' (plural). The indefinite articles are 'un' (masculine singular), 'une' (feminine singular), and 'des' (plural)."
    },
    {
      id: "present-tense",
      title: "Present Tense",
      description: "Conjugate regular and irregular verbs in the present tense",
      level: "A1",
      content: "The present tense in French is used to express current actions, habitual actions, and general truths. Regular verbs follow predictable patterns based on their endings (-er, -ir, -re), while irregular verbs have unique conjugation patterns."
    },
    {
      id: "adjectives",
      title: "Adjectives",
      description: "Learn how adjectives agree with nouns in gender and number",
      level: "A1",
      content: "In French, adjectives must agree in gender and number with the nouns they modify. Most adjectives add 'e' for feminine forms and 's' for plural forms. Some adjectives have irregular forms."
    },
    {
      id: "negation",
      title: "Negation",
      description: "Form negative sentences in French",
      level: "A1",
      content: "To form a negative sentence in French, place 'ne' before the verb and 'pas' after it. For example: 'Je ne parle pas franÃ§ais' (I don't speak French)."
    },
    {
      id: "questions",
      title: "Questions",
      description: "Different ways to ask questions in French",
      level: "A2",
      content: "There are three main ways to ask questions in French: inversion (changing the order of the subject and verb), using 'est-ce que', or simply raising your intonation at the end of a statement."
    },
    {
      id: "passe-compose",
      title: "PassÃ© ComposÃ©",
      description: "Form and use the most common past tense in French",
      level: "A2",
      content: "The passÃ© composÃ© is a compound past tense formed with an auxiliary verb (avoir or Ãªtre) and the past participle of the main verb. It's used to express completed actions in the past."
    }
  ];

  // Grammar levels with descriptions
  const grammarLevels = [
    {
      level: "A1",
      title: "Beginner Grammar",
      description: "Essential grammar concepts for absolute beginners",
      topics: ["Articles", "Present Tense", "Basic Adjectives", "Simple Negation"]
    },
    {
      level: "A2",
      title: "Elementary Grammar",
      description: "Foundational grammar for basic communication",
      topics: ["Past Tenses", "Future Tense", "Comparatives", "Pronouns"]
    },
    {
      level: "B1",
      title: "Intermediate Grammar",
      description: "More complex structures for everyday situations",
      topics: ["Conditional", "Subjunctive", "Relative Pronouns", "Adverbs"]
    },
    {
      level: "B2",
      title: "Upper Intermediate Grammar",
      description: "Advanced structures for fluent communication",
      topics: ["Complex Tenses", "Passive Voice", "Reported Speech", "Conjunctions"]
    }
  ];

  return (
    <MainLayout>
      <div className="container py-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold">French Grammar</h1>
            <p className="text-muted-foreground">
              Master French grammar with clear explanations and examples
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
            <TabsTrigger value="basics" className="py-2 data-[state=active]:bg-primary data-[state=active]:text-white">
              Grammar Basics
            </TabsTrigger>
            <TabsTrigger value="levels" className="py-2 data-[state=active]:bg-primary data-[state=active]:text-white">
              By Level
            </TabsTrigger>
            <TabsTrigger value="exercises" className="py-2 data-[state=active]:bg-primary data-[state=active]:text-white">
              Exercises
            </TabsTrigger>
            <TabsTrigger value="resources" className="py-2 data-[state=active]:bg-primary data-[state=active]:text-white">
              Resources
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basics">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {grammarTopics.map((topic) => (
                <Card key={topic.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <CardTitle className="text-lg">{topic.title}</CardTitle>
                      <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
                        {topic.level}
                      </Badge>
                    </div>
                    <CardDescription>{topic.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {topic.content}
                    </p>
                    <Button variant="outline" size="sm" className="w-full" asChild>
                      <Link href={`/learn/grammar/${topic.id}`}>
                        Learn More <FaArrowRight className="ml-2 h-3 w-3" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="levels">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {grammarLevels.map((level) => (
                <Card key={level.level} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <FaBook className="text-primary" />
                      <CardTitle className="text-lg">{level.title}</CardTitle>
                    </div>
                    <CardDescription>{level.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm font-medium mb-2">Key Topics:</p>
                    <ul className="text-sm text-muted-foreground mb-4 space-y-1">
                      {level.topics.map((topic, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <FaCheck className="text-green-500 h-3 w-3" /> {topic}
                        </li>
                      ))}
                    </ul>
                    <Button variant="outline" size="sm" className="w-full" asChild>
                      <Link href={`/learn/grammar?level=${level.level}`}>
                        View {level.level} Grammar
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="exercises">
            <Card className="text-center p-12 bg-muted/10 border-dashed">
              <CardContent className="pt-0">
                <div className="mx-auto mb-4 h-20 w-20 text-muted">
                  <FaBook className="h-full w-full" />
                </div>
                <h3 className="text-xl font-medium mb-2">Grammar Exercises Coming Soon</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  We're currently developing interactive grammar exercises to help you practice and master French grammar.
                </p>
                <Button asChild size="lg">
                  <Link href="/learn/grammar/basics">Explore Grammar Basics</Link>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resources">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Grammar Guides</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Comprehensive guides covering all aspects of French grammar from beginner to advanced levels.
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    Download PDF Guides
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Verb Conjugation Tables</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Complete conjugation tables for regular and irregular French verbs in all tenses.
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    View Conjugation Tables
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Grammar Cheat Sheets</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Quick reference sheets for common grammar rules, exceptions, and patterns.
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    Download Cheat Sheets
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {!user && (
          <Card className="mt-8 border-dashed">
            <CardContent className="py-8 text-center">
              <div className="mx-auto mb-4 h-16 w-16 text-muted">
                <FaGraduationCap className="h-full w-full" />
              </div>
              <h3 className="text-xl font-medium mb-2">Sign in to track your progress</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Create an account or sign in to save your grammar learning progress and access all features.
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
            <h2 className="text-xl font-bold">Related Learning Resources</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-2">Vocabulary Practice</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Expand your French vocabulary with our interactive flashcards and vocabulary tools.
              </p>
              <Button variant="outline" size="sm" asChild>
                <Link href="/learn/vocabulary">
                  Explore Vocabulary
                </Link>
              </Button>
            </div>
            <div>
              <h3 className="font-medium mb-2">Pronunciation Guides</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Perfect your French accent with our pronunciation guides and audio examples.
              </p>
              <Button variant="outline" size="sm" asChild>
                <Link href="/learn/pronunciation">
                  Explore Pronunciation
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

// Helper component for the badge
const Badge = ({ children, className, ...props }) => {
  return (
    <span 
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${className}`} 
      {...props}
    >
      {children}
    </span>
  );
};

