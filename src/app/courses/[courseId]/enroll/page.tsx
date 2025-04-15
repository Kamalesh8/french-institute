"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MainLayout from "@/components/layout/main-layout";
import { useAuth } from "@/context/auth-context";
import { getCourseById } from "@/lib/services/course-service";
import { createEnrollment } from "@/lib/services/enrollment-service";
import { updateCourseEnrollment } from "@/lib/services/course-service";
import { createPayment } from "@/lib/services/payment-service";
import { useToast } from "@/hooks/use-toast";
import type { Course } from "@/lib/types";
import {
  FaCalendarAlt,
  FaClock,
  FaGraduationCap,
  FaUsers,
  FaBook,
  FaLaptop,
  FaLanguage,
  FaGlobe,
  FaCheckCircle,
  FaLock,
  FaCreditCard,
  FaPaypal,
  FaApple,
  FaGoogle,
} from "react-icons/fa";

// Course level image mapping
const COURSE_IMAGES = {
  "A1": "https://images.unsplash.com/photo-1505902987837-9e40ec37e607?q=80&w=1740&auto=format&fit=crop",
  "A2": "https://images.unsplash.com/photo-1549737221-bef65e2604a6?q=80&w=1740&auto=format&fit=crop",
  "B1": "https://images.unsplash.com/photo-1503917988258-f87a78e3c995?q=80&w=1740&auto=format&fit=crop",
  "B2": "https://images.unsplash.com/photo-1563293756-4ee5996e3a78?q=80&w=1740&auto=format&fit=crop",
  "C1": "https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?q=80&w=1740&auto=format&fit=crop",
  "C2": "https://images.unsplash.com/photo-1599753894977-834afcf35d32?q=80&w=1740&auto=format&fit=crop",
};

export default function CourseEnrollmentPage({ params }: { params: { courseId: string } }) {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string>("credit-card");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!user) {
      // Redirect to login if not authenticated
      router.push(`/auth/login?redirect=/courses/${params.courseId}/enroll`);
      return;
    }

    const fetchCourse = async () => {
      try {
        const courseData = await getCourseById(params.courseId);
        setCourse(courseData);
      } catch (error) {
        console.error("Error fetching course:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load course details. Please try again later.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [params.courseId, router, toast, user]);

  const handleEnrollment = async () => {
    if (!user || !course) return;

    setProcessing(true);
    try {
      // Create a mock payment
      const payment = await createPayment({
        userId: user.uid,
        courseId: course.id,
        amount: course.price,
        currency: course.currency,
        status: "completed", // In production, this would be handled by Stripe
        paymentMethod: paymentMethod,
        paymentDate: new Date().toISOString(),
        transactionId: `tr_${Date.now()}`, // Mocked transaction ID
      });

      // Create enrollment
      const enrollment = await createEnrollment({
        userId: user.uid,
        courseId: course.id,
        enrollmentDate: new Date().toISOString(),
        status: "active",
        paymentId: payment.id,
        paymentAmount: course.price,
        paymentDate: new Date().toISOString(),
        progress: 0,
        progressStatus: "not-started",
      });

      // Update course enrollment count
      await updateCourseEnrollment(course.id, true);

      toast({
        title: "Enrollment Successful",
        description: `You have successfully enrolled in ${course.title}. You can now start learning!`,
      });

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (error) {
      console.error("Error during enrollment:", error);
      toast({
        variant: "destructive",
        title: "Enrollment Failed",
        description: "There was an error processing your enrollment. Please try again later.",
      });
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="container py-12 min-h-[60vh] flex justify-center items-center">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4"></div>
            <p className="text-muted-foreground">Loading course details...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!course) {
    return (
      <MainLayout>
        <div className="container py-12 min-h-[60vh] flex justify-center items-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Course Not Found</h2>
            <p className="text-muted-foreground mb-6">The course you're looking for doesn't exist or has been removed.</p>
            <Button asChild>
              <Link href="/courses">Browse Courses</Link>
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container py-8">
        <div className="mb-8">
          <Link href={`/courses/${course.id}`} className="text-primary hover:underline flex items-center gap-1 mb-4">
            &larr; Back to course details
          </Link>
          <h1 className="text-3xl font-bold mb-2">Enroll in {course.title}</h1>
          <p className="text-muted-foreground">Complete your enrollment and get immediate access to the course materials.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Course Summary */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <Card className="border-0 shadow-md sticky top-20">
              <div className="relative h-48 w-full">
                <Image
                  src={COURSE_IMAGES[course.level] || COURSE_IMAGES.A1}
                  alt={course.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-4 left-4">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-primary text-white">
                    {course.level}
                  </span>
                </div>
              </div>
              <CardHeader className="pb-2">
                <CardTitle>{course.title}</CardTitle>
                <CardDescription className="line-clamp-2">{course.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <FaCalendarAlt className="text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Start Date</p>
                      <p className="text-sm font-medium">{new Date(course.startDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaClock className="text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Duration</p>
                      <p className="text-sm font-medium">{course.duration} weeks</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaBook className="text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Total Hours</p>
                      <p className="text-sm font-medium">{course.totalHours} hours</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaGraduationCap className="text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Level</p>
                      <p className="text-sm font-medium">{course.level}</p>
                    </div>
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-muted-foreground">Course Price:</span>
                    <span className="font-bold text-xl">{course.price} {course.currency}</span>
                  </div>
                  <div className="text-sm text-muted-foreground mb-4">
                    <p>Includes:</p>
                    <ul className="mt-2 space-y-1">
                      <li className="flex items-center gap-2">
                        <FaCheckCircle className="text-green-500 text-xs" />
                        Full course access
                      </li>
                      <li className="flex items-center gap-2">
                        <FaCheckCircle className="text-green-500 text-xs" />
                        Live sessions with instructor
                      </li>
                      <li className="flex items-center gap-2">
                        <FaCheckCircle className="text-green-500 text-xs" />
                        All course materials
                      </li>
                      <li className="flex items-center gap-2">
                        <FaCheckCircle className="text-green-500 text-xs" />
                        Certificate of completion
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full py-6"
                  disabled={processing}
                  onClick={handleEnrollment}
                >
                  {processing ? "Processing..." : "Complete Enrollment"}
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Payment form */}
          <div className="lg:col-span-2 order-1 lg:order-2">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle>Payment Information</CardTitle>
                <CardDescription>
                  Secure payment processing through our payment providers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue={paymentMethod} onValueChange={setPaymentMethod}>
                  <TabsList className="grid grid-cols-4 mb-6">
                    <TabsTrigger value="credit-card">
                      <FaCreditCard className="mr-2" /> Credit Card
                    </TabsTrigger>
                    <TabsTrigger value="paypal">
                      <FaPaypal className="mr-2" /> PayPal
                    </TabsTrigger>
                    <TabsTrigger value="apple-pay">
                      <FaApple className="mr-2" /> Apple Pay
                    </TabsTrigger>
                    <TabsTrigger value="google-pay">
                      <FaGoogle className="mr-2" /> Google Pay
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="credit-card">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Card Number</label>
                        <input
                          type="text"
                          placeholder="1234 5678 9012 3456"
                          className="w-full p-2 border rounded-md"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Expiration Date</label>
                          <input
                            type="text"
                            placeholder="MM/YY"
                            className="w-full p-2 border rounded-md"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">CVC</label>
                          <input
                            type="text"
                            placeholder="123"
                            className="w-full p-2 border rounded-md"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Cardholder Name</label>
                        <input
                          type="text"
                          placeholder="John Doe"
                          className="w-full p-2 border rounded-md"
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="paypal">
                    <div className="text-center py-8">
                      <FaPaypal className="text-blue-600 text-5xl mx-auto mb-4" />
                      <p className="text-muted-foreground mb-4">
                        Click the button below to complete payment with PayPal
                      </p>
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        Pay with PayPal
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="apple-pay">
                    <div className="text-center py-8">
                      <FaApple className="text-black text-5xl mx-auto mb-4" />
                      <p className="text-muted-foreground mb-4">
                        Click the button below to pay with Apple Pay
                      </p>
                      <Button className="bg-black hover:bg-black/90">
                        Pay with Apple Pay
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="google-pay">
                    <div className="text-center py-8">
                      <FaGoogle className="text-red-500 text-5xl mx-auto mb-4" />
                      <p className="text-muted-foreground mb-4">
                        Click the button below to pay with Google Pay
                      </p>
                      <Button className="bg-white text-black border border-gray-300 hover:bg-gray-50">
                        Pay with Google Pay
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="mt-8 pt-6 border-t">
                  <h3 className="font-medium mb-4">Billing Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">First Name</label>
                      <input
                        type="text"
                        className="w-full p-2 border rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Last Name</label>
                      <input
                        type="text"
                        className="w-full p-2 border rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Email</label>
                      <input
                        type="email"
                        defaultValue={user?.email || ""}
                        className="w-full p-2 border rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Phone</label>
                      <input
                        type="tel"
                        className="w-full p-2 border rounded-md"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t">
                  <h3 className="font-medium mb-4">Order Summary</h3>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between">
                      <span>Course Price</span>
                      <span>{course.price} {course.currency}</span>
                    </div>
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>0 {course.currency}</span>
                    </div>
                    <div className="flex justify-between font-bold pt-2 border-t">
                      <span>Total</span>
                      <span>{course.price} {course.currency}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full py-6"
                  disabled={processing}
                  onClick={handleEnrollment}
                >
                  {processing ? "Processing..." : `Pay ${course.price} ${course.currency}`}
                </Button>
              </CardFooter>
            </Card>

            <div className="mt-6">
              <div className="flex items-center gap-2 justify-center mb-4">
                <FaLock className="text-green-600" />
                <span className="text-sm text-muted-foreground">Secure payment processing</span>
              </div>
              <p className="text-xs text-center text-muted-foreground max-w-2xl mx-auto">
                By completing your purchase, you agree to our Terms of Service and Privacy Policy. Your payment information is processed securely. We do not store credit card details nor have access to your payment information.
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
