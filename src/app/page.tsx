"use client";

import { Button } from "@/components/ui/button";
import MainLayout from "@/components/layout/main-layout";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { FaBook, FaChalkboardTeacher, FaGraduationCap, FaLaptop, FaUserFriends, FaCertificate } from "react-icons/fa";

export default function Home() {
  const courseFeatures = [
    {
      title: "Expert Native Teachers",
      icon: <FaChalkboardTeacher className="h-6 w-6 text-primary" />,
      description: "Learn from qualified native French teachers with years of experience."
    },
    {
      title: "Interactive Learning",
      icon: <FaLaptop className="h-6 w-6 text-primary" />,
      description: "Engage with interactive lessons, quizzes, and exercises designed for effective learning."
    },
    {
      title: "Comprehensive Curriculum",
      icon: <FaBook className="h-6 w-6 text-primary" />,
      description: "Follow structured courses aligned with CEFR standards from A1 to C2 levels."
    },
    {
      title: "Community Support",
      icon: <FaUserFriends className="h-6 w-6 text-primary" />,
      description: "Join a community of learners for practice sessions and language exchange."
    },
    {
      title: "Flexible Learning",
      icon: <FaGraduationCap className="h-6 w-6 text-primary" />,
      description: "Study at your own pace with flexible scheduling options for all lifestyles."
    },
    {
      title: "Official Certification",
      icon: <FaCertificate className="h-6 w-6 text-primary" />,
      description: "Earn recognized certificates that validate your French language proficiency."
    }
  ];

  const featuredCourses = [
    {
      id: 'a1-beginner',
      title: 'A1 - Beginner French',
      description: 'Start your French journey with the basics of vocabulary, grammar, and simple conversations.',
      price: 199,
      level: 'A1',
      duration: '8 weeks',
      format: 'Online'
    },
    {
      id: 'a2-elementary',
      title: 'A2 - Elementary French',
      description: 'Build on the basics and develop your ability to communicate in everyday situations.',
      price: 249,
      level: 'A2',
      duration: '10 weeks',
      format: 'Online'
    },
    {
      id: 'b1-intermediate',
      title: 'B1 - Intermediate French',
      description: 'Express yourself on a wider range of topics and handle most situations while traveling.',
      price: 299,
      level: 'B1',
      duration: '12 weeks',
      format: 'Online'
    },
    {
      id: 'b2-upper-intermediate',
      title: 'B2 - Upper Intermediate French',
      description: 'Interact with native speakers fluently and discuss complex topics with confidence.',
      price: 349,
      level: 'B2',
      duration: '14 weeks',
      format: 'Online'
    }
  ];

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-violet-600 to-indigo-600 text-white py-24">
        <div className="container mx-auto px-4 flex flex-col lg:flex-row items-center">
          <div className="lg:w-1/2 mb-10 lg:mb-0">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Master French with Expert Guidance
            </h1>
            <p className="text-lg mb-8 text-white/90">
              Join our comprehensive online French courses and learn from A1 to C2 level.
              Start your journey to fluency with native teachers and interactive lessons.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" asChild className="bg-white text-violet-700 hover:bg-white/90">
                <Link href="/courses">Explore Courses</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="border-white text-white hover:bg-white/20">
                <Link href="/auth/register">Register Now</Link>
              </Button>
            </div>
          </div>
          <div className="lg:w-1/2 flex justify-center lg:justify-end">
            <div className="relative rounded-lg overflow-hidden shadow-2xl w-full max-w-md h-[400px]">
              <Image
                src="https://images.unsplash.com/photo-1551704862-66d2abe3f94f?q=80&w=1740&auto=format&fit=crop"
                alt="French learning"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Why Choose French Institute</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We provide comprehensive French language education with the right balance of structured learning and practical application.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courseFeatures.map((feature, index) => (
              <div key={index} className="p-6 rounded-lg border bg-card text-card-foreground shadow">
                <div className="mb-4 flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses Section */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Our Featured Courses</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explore our most popular French courses designed for learners at every level
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredCourses.map((course) => (
              <Card key={course.id} className="overflow-hidden transition-all hover:shadow-lg">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                      {course.level}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                      {course.format}
                    </span>
                  </div>
                  <CardTitle>{course.title}</CardTitle>
                  <CardDescription>{course.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between text-sm text-muted-foreground mb-4">
                    <span>Duration: {course.duration}</span>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between border-t bg-slate-50 dark:bg-slate-800/50 p-4">
                  <span className="font-bold text-lg">${course.price}</span>
                  <Button asChild variant="default" size="sm">
                    <Link href={`/courses/${course.id}`}>View Course</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          <div className="flex justify-center mt-12">
            <Button asChild size="lg">
              <Link href="/courses">View All Courses</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">What Our Students Say</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Read testimonials from students who have successfully completed our French courses
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-card">
              <CardContent className="pt-6">
                <p className="italic text-muted-foreground mb-6">
                  "The French Institute's online course exceeded my expectations. I went from barely speaking a word to being able to hold conversations in just a few months. The teachers are wonderful!"
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mr-4">
                    <span className="font-bold text-primary">SM</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">Sarah Mitchell</h4>
                    <p className="text-muted-foreground text-sm">Completed B1 Course</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card">
              <CardContent className="pt-6">
                <p className="italic text-muted-foreground mb-6">
                  "I tried learning French through several apps before, but nothing compares to the structured approach of the French Institute. The interactive lessons and feedback from teachers made all the difference."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mr-4">
                    <span className="font-bold text-primary">JD</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">James Davis</h4>
                    <p className="text-muted-foreground text-sm">Completed A2 Course</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card">
              <CardContent className="pt-6">
                <p className="italic text-muted-foreground mb-6">
                  "As a business professional who needed to relocate to Paris, the French Institute's C1 course prepared me perfectly for both professional and everyday communication. Highly recommended!"
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mr-4">
                    <span className="font-bold text-primary">AL</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">Amanda Lee</h4>
                    <p className="text-muted-foreground text-sm">Completed C1 Course</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Begin Your French Journey?</h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of students already learning French with us. Start your language journey today!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="bg-white text-violet-700 hover:bg-white/90">
              <Link href="/auth/register">Start Learning Now</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="border-white text-white hover:bg-white/20">
              <Link href="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
