"use client";

import { useState, useEffect } from "react";
import { getPronunciationGuides, PronunciationGuide } from "@/lib/services/pronunciation-service";
import MainLayout from "@/components/layout/main-layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { FaVolumeUp, FaGraduationCap, FaLanguage, FaPlay, FaMicrophone, FaCheck } from "react-icons/fa";

export default function PronunciationPage() {
  const { user } = useAuth();
  const [pronunciationGuides, setPronunciationGuides] = useState<PronunciationGuide[]>([]);
  const [activeTab, setActiveTab] = useState<string>("loading");

  useEffect(() => {
    getPronunciationGuides().then((guides) => {
      setPronunciationGuides(guides);
      if (guides.length) setActiveTab(guides[0].id);
    });
  }, []);

  if (!pronunciationGuides.length) {
    return (
      <MainLayout>
        <div className="container py-10 text-center">Loading pronunciation guides...</div>
      </MainLayout>
    );
  }

  // Common pronunciation challenges
  const pronunciationChallenges = [
    {
      title: "The French R",
      description: "The French 'r' is pronounced in the back of the throat, unlike the English 'r'.",
      tip: "Try gargling water to feel the position of your throat for the French 'r'."
    },
    {
      title: "Nasal Vowels",
      description: "French has several nasal vowel sounds that don't exist in English.",
      tip: "Practice by holding your nose closed while saying the vowel - if the sound changes, you're not nasalizing correctly."
    },
    {
      title: "Silent Letters",
      description: "Many French words have silent letters, especially at the end of words.",
      tip: "As a general rule, final consonants are silent except for c, r, f, and l (CaReFuL)."
    },
    {
      title: "Liaisons",
      description: "French connects words in specific ways, pronouncing otherwise silent consonants.",
      tip: "Liaisons are mandatory between articles and nouns, adjectives and nouns, and after certain prepositions."
    },
    {
      title: "Stress Patterns",
      description: "Unlike English, French words are generally stressed on the last syllable.",
      tip: "Practice speaking with an even rhythm, giving slightly more emphasis to the final syllable."
    },
    {
      title: "The French U",
      description: "The French 'u' sound doesn't exist in English and is often confused with 'ou'.",
      tip: "Make an 'ee' sound, then round your lips as if saying 'oo' without changing the tongue position."
    }
  ];

  const handlePlayAudio = (text: string) => {
    alert(`Audio would play: ${text}`);
    try {
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = 'fr-FR';
      window.speechSynthesis?.speak(utter);
    } catch (e) {
      console.error('Speech synthesis failed:', e);
    }
  };

  return (
    <MainLayout>
      <div className="container py-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold">French Pronunciation</h1>
            <p className="text-muted-foreground">
              Perfect your French accent with audio guides and practice exercises
            </p>
          </div>
          {user && (
            <Button asChild>
              <Link href="/dashboard">Return to Dashboard</Link>
            </Button>
          )}
        </div>

        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="mb-10">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 p-1 h-auto mb-6">
            {pronunciationGuides.map(guide => (
              <TabsTrigger 
                key={guide.id} 
                value={guide.id} 
                className="py-2 data-[state=active]:bg-primary data-[state=active]:text-white"
              >
                {guide.title}
              </TabsTrigger>
            ))}
            <TabsTrigger value="practice" className="py-2 data-[state=active]:bg-primary data-[state=active]:text-white">
              Practice
            </TabsTrigger>
          </TabsList>

          {pronunciationGuides.map(guide => (
            <TabsContent key={guide.id} value={guide.id}>
              <Card>
                <CardHeader>
                  <CardTitle>{guide.title}</CardTitle>
                  <CardDescription>{guide.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {guide.examples.map((example, index) => (
                      <Card key={index} className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-center">
                            <div className="text-2xl font-bold">{example.text}</div>
                            <div className="text-sm text-muted-foreground">{example.phonetic}</div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="mb-1 font-medium">{example.example}</div>
                          <div className="text-sm text-muted-foreground">{example.translation}</div>
                        </CardContent>
                        <CardFooter className="pt-0">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full" 
                            onClick={() => handlePlayAudio(example.example)}
                          >
                            <FaVolumeUp className="mr-2 h-4 w-4" /> Listen
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}

          <TabsContent value="practice">
            <Card className="text-center p-12 bg-muted/10 border-dashed">
              <CardContent className="pt-0">
                <div className="mx-auto mb-4 h-20 w-20 text-muted">
                  <FaMicrophone className="h-full w-full" />
                </div>
                <h3 className="text-xl font-medium mb-2">Pronunciation Practice Coming Soon</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  We're developing an interactive pronunciation tool that will allow you to record your voice and receive feedback on your French pronunciation.
                </p>
                <Button asChild size="lg">
                  <Link href="/learn/pronunciation/vowels">Explore Pronunciation Guides</Link>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-10">
          <h2 className="text-2xl font-bold mb-6">Common Pronunciation Challenges</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pronunciationChallenges.map((challenge, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{challenge.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {challenge.description}
                  </p>
                  <div className="bg-primary/5 p-3 rounded-md">
                    <div className="flex items-start gap-2">
                      <FaCheck className="text-primary mt-1 h-4 w-4" />
                      <p className="text-sm"><span className="font-medium">Tip:</span> {challenge.tip}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {!user && (
          <Card className="mt-8 border-dashed">
            <CardContent className="py-8 text-center">
              <div className="mx-auto mb-4 h-16 w-16 text-muted">
                <FaGraduationCap className="h-full w-full" />
              </div>
              <h3 className="text-xl font-medium mb-2">Sign in to access all features</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Create an account or sign in to record your pronunciation and receive personalized feedback.
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
              <h3 className="font-medium mb-2">Grammar Guides</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Learn French grammar with clear explanations and interactive exercises.
              </p>
              <Button variant="outline" size="sm" asChild>
                <Link href="/learn/grammar">
                  Explore Grammar
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

