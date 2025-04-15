"use client";

import { Button } from "@/components/ui/button";
import MainLayout from "@/components/layout/main-layout";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FaBook,
  FaChalkboardTeacher,
  FaGraduationCap,
  FaLaptop,
  FaUserFriends,
  FaCertificate,
  FaPlay,
  FaArrowRight,
  FaCheckCircle,
  FaStar,
  FaMapMarkerAlt,
  FaUsers
} from "react-icons/fa";
import { useState } from "react";

export default function Home() {
  const [activeFAQ, setActiveFAQ] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    if (activeFAQ === index) {
      setActiveFAQ(null);
    } else {
      setActiveFAQ(index);
    }
  };

  const courseFeatures = [
    {
      title: "Expert Native Teachers",
      icon: <FaChalkboardTeacher className="h-10 w-10 text-white" />,
      description: "Learn from qualified native French teachers with years of experience."
    },
    {
      title: "Interactive Learning",
      icon: <FaLaptop className="h-10 w-10 text-white" />,
      description: "Engage with interactive lessons, quizzes, and exercises designed for effective learning."
    },
    {
      title: "Comprehensive Curriculum",
      icon: <FaBook className="h-10 w-10 text-white" />,
      description: "Follow structured courses aligned with CEFR standards from A1 to C2 levels."
    },
    {
      title: "Community Support",
      icon: <FaUserFriends className="h-10 w-10 text-white" />,
      description: "Join a community of learners for practice sessions and language exchange."
    },
    {
      title: "Flexible Learning",
      icon: <FaGraduationCap className="h-10 w-10 text-white" />,
      description: "Study at your own pace with flexible scheduling options for all lifestyles."
    },
    {
      title: "Official Certification",
      icon: <FaCertificate className="h-10 w-10 text-white" />,
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
      format: 'Online',
      image: 'https://images.unsplash.com/photo-1505902987837-9e40ec37e607?q=80&w=1740&auto=format&fit=crop'
    },
    {
      id: 'a2-elementary',
      title: 'A2 - Elementary French',
      description: 'Build on the basics and develop your ability to communicate in everyday situations.',
      price: 249,
      level: 'A2',
      duration: '10 weeks',
      format: 'Online',
      image: 'https://images.unsplash.com/photo-1549737221-bef65e2604a6?q=80&w=1740&auto=format&fit=crop'
    },
    {
      id: 'b1-intermediate',
      title: 'B1 - Intermediate French',
      description: 'Express yourself on a wider range of topics and handle most situations while traveling.',
      price: 299,
      level: 'B1',
      duration: '12 weeks',
      format: 'Online',
      image: 'https://images.unsplash.com/photo-1503917988258-f87a78e3c995?q=80&w=1740&auto=format&fit=crop'
    },
    {
      id: 'b2-upper-intermediate',
      title: 'B2 - Upper Intermediate French',
      description: 'Interact with native speakers fluently and discuss complex topics with confidence.',
      price: 349,
      level: 'B2',
      duration: '14 weeks',
      format: 'Online',
      image: 'https://images.unsplash.com/photo-1563293756-4ee5996e3a78?q=80&w=1740&auto=format&fit=crop'
    }
  ];

  const stats = [
    { value: "10,000+", label: "Students Worldwide", icon: <FaUsers /> },
    { value: "97%", label: "Success Rate", icon: <FaCheckCircle /> },
    { value: "100+", label: "Expert Instructors", icon: <FaChalkboardTeacher /> },
    { value: "25+", label: "Countries Served", icon: <FaMapMarkerAlt /> }
  ];

  const faqs = [
    {
      question: "How long does it take to learn French?",
      answer: "Learning time varies based on your starting level, learning intensity, and goals. Generally, it takes about 6 months to reach A1 level (beginner), and 2-3 years to reach fluency (B2/C1 level) with consistent practice."
    },
    {
      question: "Do I need previous French experience to enroll?",
      answer: "Not at all! We offer courses from absolute beginner (A1) to advanced (C2) levels. We'll help you determine the right starting point with a free placement test."
    },
    {
      question: "How are the online courses structured?",
      answer: "Our online courses include live instructor-led sessions, self-paced modules with video lessons, interactive exercises, assignments, and regular assessment. You'll also have access to our community for conversation practice."
    },
    {
      question: "Are the certificates internationally recognized?",
      answer: "Yes, our certificates follow the CEFR (Common European Framework of Reference for Languages) standards and are recognized internationally for academic and professional purposes."
    },
    {
      question: "What's the difference between online and hybrid courses?",
      answer: "Online courses are 100% virtual, with live sessions and self-paced learning. Hybrid courses combine online learning with occasional in-person sessions at our physical locations for immersive practice."
    },
    {
      question: "What happens if I miss a class?",
      answer: "All live sessions are recorded and available for review. You can also schedule a brief catch-up session with an instructor if needed."
    }
  ];

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="bg-gradient-purple relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=2073&auto=format&fit=crop')] bg-no-repeat bg-cover"></div>
        </div>
        <div className="container mx-auto px-4 py-20 lg:py-24 relative z-10">
          <div className="flex flex-col lg:flex-row items-center">
            <div className="lg:w-1/2 mb-12 lg:mb-0">
              <div className="flex items-center gap-2 mb-4 bg-white/20 text-white px-4 py-2 rounded-full w-fit">
                <FaStar className="text-yellow-300" /> Top-rated French courses by native speakers
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white leading-tight">
                Learn French with <span className="text-yellow-300">Expert Guidance</span>
              </h1>
              <p className="text-lg md:text-xl mb-8 text-white/90 max-w-xl">
                Join our comprehensive French language programs and learn from A1 to C2 level with native teachers, interactive lessons, and personalized learning paths.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" asChild className="bg-white text-primary hover:bg-white/90 hover-lift">
                  <Link href="/courses">Explore Courses</Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="border-white text-white hover:bg-white/20 gap-2 hover-lift">
                  <Link href="/about"><FaPlay className="h-4 w-4" /> Watch Demo</Link>
                </Button>
              </div>
              <div className="mt-8 flex flex-wrap gap-6 items-center">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className={`w-10 h-10 rounded-full border-2 border-white overflow-hidden bg-gradient-to-r from-violet-500 to-indigo-500 flex items-center justify-center text-white font-bold`}>
                      {i}
                    </div>
                  ))}
                </div>
                <div className="text-white">
                  <div className="flex mb-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <FaStar key={i} className="text-yellow-300 h-5 w-5" />
                    ))}
                  </div>
                  <p className="text-sm">Over 10,000 satisfied students</p>
                </div>
              </div>
            </div>
            <div className="lg:w-1/2 flex justify-center">
              <div className="relative rounded-lg w-full max-w-lg">
                <div className="rounded-xl overflow-hidden shadow-2xl animate-float">
                  <Image
                    src="https://images.unsplash.com/photo-1527891751199-7225231a68dd?q=80&w=1740&auto=format&fit=crop"
                    alt="Students learning French"
                    width={600}
                    height={400}
                    className="object-cover h-[500px]"
                  />
                </div>
                <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-lg p-4 max-w-xs animate-float" style={{ animationDelay: "1s" }}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <FaGraduationCap className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">CEFR Aligned</h4>
                      <p className="text-xs text-muted-foreground">Internationally recognized</p>
                    </div>
                  </div>
                </div>
                <div className="absolute -top-6 -right-6 bg-white rounded-xl shadow-lg p-4 animate-float" style={{ animationDelay: "1.5s" }}>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <FaUserFriends className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">1-on-1 Sessions</h4>
                      <p className="text-xs text-muted-foreground">Personalized attention</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4 mx-auto">
                  <div className="text-primary">{stat.icon}</div>
                </div>
                <h3 className="text-3xl md:text-4xl font-bold text-primary mb-1">{stat.value}</h3>
                <p className="text-muted-foreground text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-purple text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose French Institute</h2>
            <p className="text-white/80 max-w-2xl mx-auto">
              We provide comprehensive French language education with the right balance of structured learning and practical application.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courseFeatures.map((feature, index) => (
              <div key={index} className="p-6 rounded-xl bg-white/10 backdrop-blur hover:bg-white/20 transition-all hover:-translate-y-1 duration-300">
                <div className="mb-4 flex items-center justify-center w-16 h-16 rounded-full bg-white/10 mx-auto">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-2 text-center">{feature.title}</h3>
                <p className="text-white/80 text-center">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses Section */}
      <section className="py-20 bg-gray-50 dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-block text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full mb-4">
              Popular Programs
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Featured Courses</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explore our most popular French courses designed for learners at every level
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {featuredCourses.map((course) => (
              <Card key={course.id} className="overflow-hidden transition-all hover:shadow-lg border-0 rounded-xl card-hover">
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={course.image}
                    alt={course.title}
                    fill
                    className="object-cover transition-transform hover:scale-105 duration-500"
                  />
                  <div className="absolute top-4 left-4 bg-white rounded-full px-3 py-1 text-xs font-medium text-primary">
                    {course.level}
                  </div>
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">{course.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{course.description}</CardDescription>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="flex flex-wrap gap-2 text-sm text-muted-foreground mb-4">
                    <span className="flex items-center gap-1"><FaGraduationCap className="text-primary" /> {course.duration}</span>
                    <span className="flex items-center gap-1"><FaLaptop className="text-primary" /> {course.format}</span>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between bg-gray-50 dark:bg-slate-800/50 p-4 border-t">
                  <span className="font-bold text-lg">${course.price}</span>
                  <Button asChild variant="default" size="sm" className="gap-1">
                    <Link href={`/courses/${course.id}`}>
                      View Course <FaArrowRight className="h-3 w-3" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          <div className="flex justify-center">
            <Button asChild size="lg" className="gap-2 px-8 py-6 font-medium text-base hover-lift">
              <Link href="/courses">
                Browse All Courses <FaArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Learning Process Section */}
      <section className="py-20 bg-white dark:bg-black">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-block text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full mb-4">
              Our Methodology
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How Our Learning Process Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our proven methodology helps you achieve fluency through a structured and engaging process
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 dark:bg-slate-800 p-8 rounded-xl text-center hover-lift">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Assessment & Placement</h3>
              <p className="text-muted-foreground">
                Take our comprehensive placement test to determine your current level and get a personalized learning path.
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-slate-800 p-8 rounded-xl text-center hover-lift">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
                <span className="text-2xl font-bold text-primary">2</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Interactive Learning</h3>
              <p className="text-muted-foreground">
                Learn through live classes, self-paced modules, conversation practice, and regular assessments.
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-slate-800 p-8 rounded-xl text-center hover-lift">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
                <span className="text-2xl font-bold text-primary">3</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Certification & Beyond</h3>
              <p className="text-muted-foreground">
                Complete your level, earn your certification, and continue to the next level in your language journey.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-20 bg-gray-50 dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-block text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full mb-4">
              Student Success Stories
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Students Say</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Read testimonials from students who have successfully completed our French courses
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-white dark:bg-slate-800 border-0 shadow-md rounded-xl overflow-hidden">
              <CardContent className="pt-8 pb-6 relative">
                <div className="absolute top-4 right-4 text-4xl text-primary/20 font-serif">"</div>
                <div className="flex mb-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <FaStar key={i} className="text-yellow-400 h-5 w-5" />
                  ))}
                </div>
                <p className="italic text-muted-foreground mb-6">
                  "The French Institute's online course exceeded my expectations. I went from barely speaking a word to being able to hold conversations in just a few months. The teachers are wonderful!"
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mr-4">
                    <span className="font-bold text-primary">SM</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">Sarah Mitchell</h4>
                    <p className="text-muted-foreground text-sm">Completed B1 Course</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white dark:bg-slate-800 border-0 shadow-md rounded-xl overflow-hidden">
              <CardContent className="pt-8 pb-6 relative">
                <div className="absolute top-4 right-4 text-4xl text-primary/20 font-serif">"</div>
                <div className="flex mb-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <FaStar key={i} className="text-yellow-400 h-5 w-5" />
                  ))}
                </div>
                <p className="italic text-muted-foreground mb-6">
                  "I tried learning French through several apps before, but nothing compares to the structured approach of the French Institute. The interactive lessons and feedback from teachers made all the difference."
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mr-4">
                    <span className="font-bold text-primary">JD</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">James Davis</h4>
                    <p className="text-muted-foreground text-sm">Completed A2 Course</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white dark:bg-slate-800 border-0 shadow-md rounded-xl overflow-hidden">
              <CardContent className="pt-8 pb-6 relative">
                <div className="absolute top-4 right-4 text-4xl text-primary/20 font-serif">"</div>
                <div className="flex mb-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <FaStar key={i} className="text-yellow-400 h-5 w-5" />
                  ))}
                </div>
                <p className="italic text-muted-foreground mb-6">
                  "As a business professional who needed to relocate to Paris, the French Institute's C1 course prepared me perfectly for both professional and everyday communication. Highly recommended!"
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mr-4">
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

      {/* FAQ Section */}
      <section className="py-20 bg-white dark:bg-black">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-block text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full mb-4">
              Common Questions
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Find answers to common questions about our French courses and learning process
            </p>
          </div>
          <div className="max-w-3xl mx-auto">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="border-b border-gray-200 dark:border-gray-800 py-6 cursor-pointer"
                onClick={() => toggleFAQ(index)}
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">{faq.question}</h3>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    {activeFAQ === index ?
                      <span className="text-2xl font-light">−</span> :
                      <span className="text-2xl font-light">+</span>
                    }
                  </Button>
                </div>
                {activeFAQ === index && (
                  <p className="mt-4 text-muted-foreground">
                    {faq.answer}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-purple text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Begin Your French Journey?</h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of students already learning French with us. Start your language journey today!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="bg-white text-primary hover:bg-white/90 hover-lift">
              <Link href="/auth/register">Start Learning Now</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="border-white text-white hover:bg-white/20 hover-lift">
              <Link href="/contact">Get Course Advice</Link>
            </Button>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
