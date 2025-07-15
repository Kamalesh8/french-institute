"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";
import MainLayout from "@/components/layout/main-layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { FaEnvelope, FaLock, FaUser, FaCheckCircle } from "react-icons/fa";
import { signIn } from "next-auth/react";

const formSchema = z.object({
  name: z
    .string()
    .min(1, "Full name is required")
    .max(100, "Full name must be less than 100 characters"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email format"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters"),
  confirmPassword: z
    .string()
    .min(1, "Confirm password is required"),
  termsAccepted: z
    .boolean()
    .refine((value) => value === true, {
      message: "You must accept the terms and conditions",
    }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export default function RegisterPage() {
  const { register, user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  // Determine redirect target (defaults to dashboard after login/registration)
  const redirectTo = searchParams?.get('redirect') ?? '/dashboard';
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user && !loading) {
      // Redirect to dashboard after successful registration
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      termsAccepted: false,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    try {
      await register(values.email, values.password, values.name, 'student');

      toast({
        title: "Registration successful!",
        description: "Your account has been created successfully. Redirecting to dashboard...",
      });

      // Use a small timeout to ensure the toast is visible before redirecting
      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    } catch (error) {
      console.error("Registration error:", error);
      
      let errorMessage = "There was a problem creating your account. Please try again.";
      
      if (error instanceof Error) {
        if (error.message.includes("email-already-in-use")) {
          errorMessage = "This email is already registered. Please use a different email or log in.";
        } else if (error.message.includes("weak-password")) {
          errorMessage = "Please choose a stronger password (at least 6 characters).";
        } else if (error.message.includes("invalid-email")) {
          errorMessage = "Please enter a valid email address.";
        }
      }

      toast({
        variant: "destructive",
        title: "Registration failed",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <MainLayout>
      <div className="container min-h-[calc(100vh-64px)] py-10 md:py-16">
        <div className="flex flex-col md:flex-row gap-8 lg:gap-12 items-center justify-center">
          <div className="w-full md:w-1/2 lg:w-5/12 text-center md:text-left order-1 lg:order-1">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-primary">Start Your French Journey</h1>
            <p className="text-muted-foreground mb-6 md:mb-8 max-w-md mx-auto md:mx-0">
              Join thousands of students learning French with our comprehensive courses and expert native teachers.
            </p>
            <div className="hidden md:block">
              <div className="space-y-4">
                <div className="flex gap-3 items-start">
                  <div className="mt-1">
                    <FaCheckCircle className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-base">Comprehensive Learning</h3>
                    <p className="text-muted-foreground text-sm">Learn French from A1 to C2 — Online or In-Person</p>
                  </div>
                </div>
                
                <div className="flex gap-3 items-start">
                  <div className="mt-1">
                    <FaCheckCircle className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-base">Expert Instructors</h3>
                    <p className="text-muted-foreground text-sm">Courses led by native speakers with cultural expertise</p>
                  </div>
                </div>
                
                <div className="flex gap-3 items-start">
                  <div className="mt-1">
                    <FaCheckCircle className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-base">Flexible Learning</h3>
                    <p className="text-muted-foreground text-sm">Schedule that adapts to your pace and availability</p>
                  </div>
                </div>
                
                <div className="flex gap-3 items-start">
                  <div className="mt-1">
                    <FaCheckCircle className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-base">Global Recognition</h3>
                    <p className="text-muted-foreground text-sm">Achieve internationally recognized French fluency goals</p>
                  </div>
                </div>
                
                <div className="flex gap-3 items-start">
                  <div className="mt-1">
                    <FaCheckCircle className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-base">24/7 Access</h3>
                    <p className="text-muted-foreground text-sm">Unlimited access to immersive learning tools</p>
                  </div>
                </div>
                
                <div className="flex gap-3 items-start">
                  <div className="mt-1">
                    <FaCheckCircle className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-base">Immersive Experience</h3>
                    <p className="text-muted-foreground text-sm">Explore language through sight, sound, and culture</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="hidden lg:block relative h-64 w-full rounded-xl overflow-hidden">
              <Image
                src="/images/register-hero.jpg"
                alt="Students learning French"
                fill
                className="object-cover"
              />
            </div>
          </div>
          <div className="w-full md:w-1/2 lg:w-6/12 order-2 lg:order-2">
            <Card className="w-full border-0 shadow-lg rounded-xl overflow-hidden">
              <div className="bg-gradient-purple h-4"></div>
              <CardHeader className="space-y-2 pt-8">
                <div className="flex justify-center mb-2">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <div className="w-16 h-16 relative rounded-full overflow-hidden">
                      <Image src="/images/EB_LOGO_.jpg" alt="Logo" fill sizes="64px" className="object-cover" />
                    </div>
                  </div>
                </div>
                <CardTitle className="text-2xl font-bold text-center">Join the French Flow</CardTitle>
                <CardDescription className="text-center text-base">
                Create your account and step ito a vibrant community of learners mastering French.
                </CardDescription>
              </CardHeader>
              <CardContent className="px-6 md:px-8">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base">Full Name</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                              <Input
                                className="pl-10 py-4 rounded-lg"
                                placeholder="John Doe"
                                {...field}
                                disabled={isLoading}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base">Email</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                              <Input
                                type="email"
                                className="pl-10 py-4 rounded-lg"
                                placeholder="you@example.com"
                                {...field}
                                disabled={isLoading}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base">Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <Input
                                  type="password"
                                  className="pl-10 py-4 rounded-lg"
                                  placeholder="••••••••"
                                  {...field}
                                  disabled={isLoading}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base">Confirm Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <Input
                                  type="password"
                                  className="pl-10 py-4 rounded-lg"
                                  placeholder="••••••••"
                                  {...field}
                                  disabled={isLoading}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="termsAccepted"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-4 border">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              disabled={isLoading}
                              className="mt-1"
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              I accept the{" "}
                              <Link href="/terms" className="text-primary hover:underline">
                                Terms and Conditions
                              </Link>{" "}
                              and{" "}
                              <Link href="/privacy" className="text-primary hover:underline">
                                Privacy Policy
                              </Link>
                            </FormLabel>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      className="w-full py-4 text-base font-medium rounded-lg hover-lift"
                      disabled={isLoading}
                    >
                      {isLoading ? "Creating account..." : "Register Now"}
                    </Button>
                  </form>
                </Form>
                <div className="mt-8 text-center">
                  <p className="text-muted-foreground mb-4">Or register with</p>
                  <div className="flex justify-center">
                    <Button
                      variant="outline"
                      onClick={() => signIn('google', { callbackUrl: `/auth/handle-callback?redirect=${encodeURIComponent(redirectTo)}` })}
                      className="flex items-center gap-3 px-6 py-3 rounded-full border border-gray-300 bg-white text-gray-900 shadow-sm hover:bg-gray-50 hover-lift"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#4285F4"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#4285F4" /></svg>
                      <span className="font-medium">Continue with Google</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col pb-8">
                <div className="text-center text-sm">
                  Already have an account?{" "}
                  <Link href="/auth/login" className="text-primary hover:underline font-medium">
                    Sign In
                  </Link>
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

