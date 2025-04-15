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
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";
import MainLayout from "@/components/layout/main-layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { FaEnvelope, FaLock, FaGraduationCap } from "react-icons/fa";

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
  const { login } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

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
      await login(values.email, values.password);

      toast({
        title: "Login successful",
        description: "You have been logged in successfully!",
      });

      router.push("/dashboard");
    } catch (error) {
      console.error("Login error:", error);

      toast({
        variant: "destructive",
        title: "Login failed",
        description: "Please check your credentials and try again.",
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
                    <FaGraduationCap className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <CardTitle className="text-2xl font-bold text-center">Welcome Back</CardTitle>
                <CardDescription className="text-center text-base">
                  Sign in to continue your French learning journey
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
                  <div className="flex justify-center gap-4">
                    <Button variant="outline" className="w-12 h-12 rounded-full p-0 hover-lift">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#4285F4"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                    </Button>
                    <Button variant="outline" className="w-12 h-12 rounded-full p-0 hover-lift">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                    </Button>
                    <Button variant="outline" className="w-12 h-12 rounded-full p-0 hover-lift">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#000000"><path d="M22.2125 5.65605C21.4491 5.99375 20.6395 6.21555 19.8106 6.31411C20.6839 5.79132 21.3374 4.9689 21.6493 4.00005C20.8287 4.48761 19.9305 4.83077 18.9938 5.01461C18.2031 4.17106 17.098 3.66505 15.9418 3.66505C13.6326 3.66505 11.7597 5.52702 11.7597 7.82333C11.7597 8.14518 11.7973 8.45577 11.8676 8.75147C8.39047 8.58262 5.31007 6.93843 3.24678 4.43268C2.87529 5.03394 2.68005 5.72323 2.68005 6.4503C2.68005 7.8238 3.41533 9.02988 4.54159 9.74301C3.87772 9.7231 3.25729 9.55273 2.71758 9.27171V9.32232C2.71758 11.3361 4.14350 13.0204 6.04769 13.3971C5.21347 13.5979 4.33625 13.5434 3.52991 13.3084C3.34372 13.2534 3.16281 13.1864 2.9889 13.108C2.98907 13.1093 2.98926 13.1107 2.98926 13.1118C2.98926 13.1302 2.99044 13.1486 2.99044 13.167C2.99044 14.1559 3.36577 15.1382 4.02123 15.9158C4.67669 16.6935 5.58172 17.2251 6.56506 17.4242C5.31201 17.8907 3.93988 18.0187 2.59506 17.792C3.11161 18.4938 3.7586 19.074 4.4907 19.4979C5.22279 19.9217 6.0275 20.1784 6.84876 20.2461C9.20121 21.8320 12.9602 21.3533 15.1562 19.1592C16.8201 17.4962 17.6169 15.2301 17.6169 12.9957C17.6169 12.8146 17.6137 12.6346 17.6074 12.4557C18.4332 11.8544 19.15 11.1045 19.7204 10.2482C19.1847 10.4914 18.6159 10.6652 18.027 10.7626C18.6735 10.3419 19.1609 9.71859 19.3862 8.99996C18.8221 9.36594 18.2075 9.63267 17.5638 9.78981C17.2989 9.49844 16.978 9.26944 16.6223 9.11462C16.2665 8.95979 15.8836 8.88238 15.4973 8.88697C15.1111 8.89155 14.7301 8.97805 14.3783 9.14089C14.0265 9.30372 13.712 9.53967 13.4548 9.83733C13.1976 10.135 12.9938 10.4886 12.8565 10.8779C12.7191 11.2672 12.6512 11.6845 12.6571 12.1047C12.6571 12.4119 12.6932 12.7139 12.7624 13.0054C11.2484 12.9297 9.77026 12.5197 8.43054 11.8078C7.09082 11.0958 5.92151 10.0995 5.00788 8.89203C4.52146 9.67902 4.31731 10.5945 4.43207 11.4975C4.54684 12.4006 4.97525 13.227 5.64452 13.8334C5.07015 13.8138 4.50799 13.6491 4.00788 13.352V13.4038C4.00788 14.7055 5.01113 15.7881 6.32637 16.0994C5.93799 16.2063 5.53591 16.2598 5.13142 16.2585C4.84356 16.2599 4.55641 16.233 4.27361 16.1783C4.85608 17.2557 5.94828 17.9853 7.16963 18.0054C6.13331 18.7876 4.88115 19.2152 3.59142 19.2309C3.39472 19.2297 3.19814 19.2198 3.00244 19.2012C4.30553 20.0207 5.80294 20.4607 7.33081 20.4517C15.8973 20.4517 20.5514 13.2553 20.5514 6.94691C20.5514 6.7711 20.5474 6.59528 20.5393 6.42368C21.3607 5.83594 22.0502 5.09417 22.5611 4.25074C21.811 4.58238 21.0191 4.81141 20.2126 4.93003C20.2157 4.92789 20.2157 4.92358 20.2188 4.92144C21.0251 4.28868 21.5918 3.36506 21.8446 2.32484C21.0351 2.8501 20.1445 3.23189 19.2123 3.45465C18.4451 2.64036 17.3938 2.14258 16.2794 2.07331C15.165 2.00404 14.0645 2.36791 13.2166 3.0897C12.3687 3.81148 11.8429 4.83261 11.7538 5.93406C11.6646 7.03551 12.0178 8.12511 12.7365 8.9619C10.9943 8.88564 9.29346 8.40535 7.74403 7.55933C6.1946 6.7133 4.83179 5.52313 3.75336 4.08515C3.06638 5.1685 2.83625 6.46553 3.11212 7.70616C3.38799 8.94678 4.14621 10.0398 5.24085 10.7578C4.56073 10.7393 3.89727 10.5578 3.29495 10.2287V10.2785C3.29426 11.2459 3.65204 12.1817 4.30193 12.9124C4.95183 13.6431 5.85122 14.1211 6.82331 14.2606C6.19793 14.4264 5.54405 14.4498 4.90753 14.3294C5.18673 15.1525 5.72313 15.8724 6.44037 16.3831C7.15762 16.8937 8.02323 17.1738 8.91345 17.1892C7.61612 18.193 6.02388 18.7378 4.38764 18.735C4.13163 18.735 3.87624 18.7219 3.62209 18.6958C5.29217 19.7483 7.22034 20.3106 9.19098 20.3078C15.9221 20.3078 19.5701 14.7137 19.5701 9.85396C19.5701 9.67813 19.5668 9.50231 19.5603 9.32648C20.3608 8.74271 21.0615 8.0183 21.6379 7.18946C20.9126 7.51977 20.1414 7.74145 19.3488 7.84501C20.1688 7.34001 20.7823 6.58615 21.0768 5.6988C20.3011 6.13193 19.4565 6.43254 18.5848 6.58834C17.8782 5.82646 16.9311 5.37505 15.9177 5.34283C14.9042 5.31061 13.9328 5.69978 13.1877 6.42968C12.4426 7.15959 11.9811 8.17546 11.9064 9.25689C11.8317 10.3383 12.1493 11.4034 12.7989 12.2464C10.9008 12.1498 9.06629 11.6117 7.43253 10.6801C5.79878 9.74841 4.41738 8.45376 3.40481 6.8981C2.67869 8.0837 2.44577 9.52646 2.75525 10.895C3.06472 12.2636 3.88635 13.4467 5.04856 14.2106C4.37837 14.1898 3.7234 14.0095 3.13251 13.6842V13.7389C3.13193 14.8135 3.51147 15.8503 4.21017 16.6582C4.90886 17.4662 5.87911 18.0011 6.93835 18.1628C6.31994 18.3244 5.67332 18.3468 5.04644 18.2288C5.35947 19.145 5.97657 19.936 6.79942 20.4964C7.62228 21.0567 8.60425 21.358 9.61343 21.3588C8.61403 22.1478 7.47652 22.73 6.26567 23.0742C5.05482 23.4184 3.79292 23.5184 2.54529 23.3684C5.61493 25.0692 9.17607 25.8636 12.7115 25.5933C16.247 25.323 19.5709 24.0042 22.2127 21.8444C24.8545 19.6845 26.6839 16.7924 27.4426 13.5679C28.2013 10.3435 27.8471 6.98521 26.433 3.96912C25.019 0.953025 22.6207 -0.599227 19.6953 -0.599999C19.2576 -0.599999 18.8217 -0.571417 18.3907 -0.514252C19.9529 -0.134869 21.2743 0.841125 22.0989 2.21232C21.3271 2.54019 20.5152 2.77225 19.6848 2.90312C17.8008 1.52978 15.4059 1.22272 13.2584 2.07317C11.111 2.92363 9.45471 4.83015 8.76874 7.15911C7.70496 6.25335 6.84315 5.1367 6.24531 3.88306C5.64747 2.62942 5.32957 1.26526 5.31182 -0.0859985C5.31182 -0.0859985 5.31182 -0.0859985 5.31182 -0.0859985C3.591 0.95444 3.1341 3.00363 3.00115 3.91339C2.13471 4.28835 1.33683 4.79789 0.641312 5.42123C-0.0541895 6.04457 -0.633981 6.77376 -1.06994 7.57588C-1.5059 8.378 -1.79085 9.23991 -1.91322 10.1299C-2.0356 11.0199 -1.99347 11.925 -1.78891 12.7994C-1.58435 13.6738 -1.22109 14.5016 -0.716209 15.241C-0.211324 15.9804 0.429574 16.6175 1.17086 17.1209C1.91214 17.6243 2.74017 17.9857 3.61203 18.1881C1.45431 20.6352 0.31051 23.8413 0.456776 27.1226C0.603041 30.4039 2.02516 33.4953 4.38721 35.7329C6.74926 37.9705 9.87753 39.1828 13.1533 39.0901C16.4291 38.9974 19.4813 37.6071 21.7177 35.2367C23.9541 32.8663 25.1895 29.6942 25.2039 26.4179C25.2182 23.1416 24.0106 19.9596 21.7963 17.5704C19.582 15.1812 16.5437 13.7656 13.2686 13.6463C9.9935 13.527 6.85849 14.7138 4.48452 16.9312" /></svg>
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
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-primary">Sign in to Your Account</h1>
            <p className="text-muted-foreground mb-6 md:mb-8 max-w-md mx-auto md:mx-0">
              Continue your French learning journey. Access your courses, track your progress, and connect with native-speaking teachers.
            </p>
            <div className="hidden md:block relative h-64 md:h-80 w-full rounded-xl overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1599753894977-834afcf35d32?q=80&w=1974&auto=format&fit=crop"
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
