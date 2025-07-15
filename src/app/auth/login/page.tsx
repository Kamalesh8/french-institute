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
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";
import MainLayout from "@/components/layout/main-layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { FaEnvelope, FaLock } from "react-icons/fa";
import { signIn } from "next-auth/react";

const formSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email format"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters"),
});

export default function LoginPage() {
  const { login, user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  // Get redirect path from URL or default to dashboard
  const redirectTo = searchParams?.get('redirect') ?? '/dashboard';

  useEffect(() => {
    if (user && !loading) {
      let targetUrl = redirectTo;
      if (user.role === "admin" && !redirectTo.startsWith('/admin')) {
        targetUrl = '/admin';
      }
      router.push(targetUrl);
    }
  }, [user, loading, router, redirectTo]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    try {
      const { user: loggedInUser } = await login(values.email, values.password);
      
      if (!loggedInUser) {
        throw new Error("User data not found");
      }

      // Show success message
      toast({
        title: "Login successful",
        description: "Redirecting you...",
      });

      // Determine the target URL based on user role and redirect parameter
      let targetUrl = redirectTo;
      if (loggedInUser.role === "admin" && !redirectTo.startsWith('/admin')) {
        targetUrl = '/admin';
      }

      // Wait a short moment for the toast to show, then redirect
      setTimeout(() => {
        router.push(targetUrl);
      }, 1000);
    } catch (error) {
      console.error("Login error:", error);
      
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      
      toast({
        variant: "destructive",
        title: "Login failed",
        description: errorMessage.includes("wrong-password") 
          ? "Incorrect email or password. Please try again."
          : "Failed to log in. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <MainLayout>
      <div className="container min-h-[calc(100vh-64px)] py-10 md:py-20">
        <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-center justify-center">
          <div className="w-full md:w-1/2 lg:w-5/12 order-2 md:order-1">
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
                <CardTitle className="text-2xl font-bold text-center">Great to have you Back !</CardTitle>
                <CardDescription className="text-center text-base">
                  Sign in and keep the vibe alive...
                </CardDescription>
              </CardHeader>
              <CardContent className="px-6 md:px-8">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
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
                                className="pl-11 py-4 rounded-lg"
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
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex justify-between">
                            <FormLabel className="text-base">Password</FormLabel>
                            <Link href="/auth/forgot-password" className="text-sm text-primary hover:underline">
                              Forgot password?
                            </Link>
                          </div>
                          <FormControl>
                            <div className="relative">
                              <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                              <Input
                                type="password"
                                className="pl-11 py-4 rounded-lg"
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
                    <Button
                      type="submit"
                      className="w-full py-6 text-base font-medium rounded-lg hover-lift"
                      disabled={isLoading}
                    >
                      {isLoading ? "Signing in..." : "Sign In"}
                    </Button>
                  </form>
                </Form>
                <div className="mt-8 text-center">
                  <p className="text-muted-foreground mb-4">Or continue with</p>
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
                  Don&apos;t have an account?{" "}
                  <Link href="/auth/register" className="text-primary hover:underline font-medium">
                    Register Now
                  </Link>
                </div>
              </CardFooter>
            </Card>
          </div>
          <div className="w-full md:w-1/2 lg:w-5/12 text-center md:text-left order-1 md:order-2">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-primary">Ready to flex your French? </h1>
            <p className="text-muted-foreground mb-6 md:mb-8 max-w-md mx-auto md:mx-0">
              Sign in to continue your French learning journey. Access your courses, track your progress, and connect with native-speaking teachers.
            </p>
            <div className="hidden md:block relative h-64 md:h-80 w-full rounded-xl overflow-hidden">
              <Image
                src="/images/login-hero.jpg"
                alt="Learning French"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

