"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { FaEnvelope, FaLock, FaUser, FaUserGraduate, FaGraduationCap, FaCheckCircle } from "react-icons/fa";

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
  const { register } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

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
        title: "Registration successful",
        description: "Your account has been created successfully!",
      });

      router.push("/dashboard");
    } catch (error) {
      console.error("Registration error:", error);

      toast({
        variant: "destructive",
        title: "Registration failed",
        description: "There was a problem creating your account. Please try again.",
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
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-primary">Begin Your French Journey</h1>
            <p className="text-muted-foreground mb-6 md:mb-8 max-w-md mx-auto md:mx-0">
              Join thousands of students learning French with our comprehensive courses and expert native teachers.
            </p>
            <div className="hidden md:block">
              <div className="mb-8 space-y-4">
                <div className="flex gap-3 items-start">
                  <div className="mt-1">
                    <FaCheckCircle className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-base">Flexible Learning Schedule</h3>
                    <p className="text-muted-foreground text-sm">Learn at your own pace with 24/7 access to course materials</p>
                  </div>
                </div>
                <div className="flex gap-3 items-start">
                  <div className="mt-1">
                    <FaCheckCircle className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-base">Native French Teachers</h3>
                    <p className="text-muted-foreground text-sm">All our instructors are experienced native speakers</p>
                  </div>
                </div>
                <div className="flex gap-3 items-start">
                  <div className="mt-1">
                    <FaCheckCircle className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-base">Internationally Recognized</h3>
                    <p className="text-muted-foreground text-sm">Earn certificates aligned with CEFR standards</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="hidden lg:block relative h-64 w-full rounded-xl overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1491841550275-ad7854e35ca6?q=80&w=1974&auto=format&fit=crop"
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
                    <FaUserGraduate className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <CardTitle className="text-2xl font-bold text-center">Create Your Account</CardTitle>
                <CardDescription className="text-center text-base">
                  Join our community of French language learners
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
                              <FaUser className="absolute left-3 top-3 text-gray-400" />
                              <Input
                                className="pl-10 py-6 rounded-lg"
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
                              <FaEnvelope className="absolute left-3 top-3 text-gray-400" />
                              <Input
                                type="email"
                                className="pl-10 py-6 rounded-lg"
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
                                <FaLock className="absolute left-3 top-3 text-gray-400" />
                                <Input
                                  type="password"
                                  className="pl-10 py-6 rounded-lg"
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
                                <FaLock className="absolute left-3 top-3 text-gray-400" />
                                <Input
                                  type="password"
                                  className="pl-10 py-6 rounded-lg"
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
                      className="w-full py-6 text-base font-medium rounded-lg hover-lift"
                      disabled={isLoading}
                    >
                      {isLoading ? "Creating account..." : "Register Now"}
                    </Button>
                  </form>
                </Form>
                <div className="mt-8 text-center">
                  <p className="text-muted-foreground mb-4">Or register with</p>
                  <div className="flex justify-center gap-4">
                    <Button variant="outline" className="w-12 h-12 rounded-full p-0 hover-lift">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#4285F4"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                    </Button>
                    <Button variant="outline" className="w-12 h-12 rounded-full p-0 hover-lift">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                    </Button>
                    <Button variant="outline" className="w-12 h-12 rounded-full p-0 hover-lift">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></svg>
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
