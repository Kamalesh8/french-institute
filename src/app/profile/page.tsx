"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from 'next-auth/react';
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
import { Textarea } from "@/components/ui/textarea"; // Fixed import for Textarea
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";
import MainLayout from "@/components/layout/main-layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/config/firebase";

const formSchema = z.object({
  displayName: z
    .string()
    .min(1, "Display name is required"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email format")
    .optional(),
  phoneNumber: z
    .string()
    .optional(),
  address: z
    .string()
    .optional(),
  bio: z
    .string()
    .max(300, "Bio must be less than 300 characters")
    .optional(),
});

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const { user, updateUserProfile } = useAuth();
  const currentUser: any = user || (status === 'authenticated' ? { ...session.user, uid: (session.user as any).id, role: (session.user as any).role } : null);
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      displayName: "",
      email: "",
      phoneNumber: "",
      address: "",
      bio: "",
    },
  });

  useEffect(() => {
    if (!user) {
      router.push("/auth/login");
      return;
    }

    // Load user data from Firestore
    const fetchUserData = async () => {
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();

          form.reset({
            displayName: user.displayName || "",
            email: user.email || "",
            phoneNumber: userData.phoneNumber || "",
            address: userData.address || "",
            bio: userData.bio || "",
          });
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast({
          variant: "destructive",
          title: "Error loading profile",
          description: "Failed to load your profile information.",
        });
      }
    };

    fetchUserData();
  }, [currentUser, router, form, toast]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) return;

    setIsLoading(true);

    try {
      // Update user profile in Firebase Auth
      if (updateUserProfile) {
        await updateUserProfile(values.displayName);
      }

      // Update additional user data in Firestore
      const userRef = doc(db, "users", currentUser.uid);
      await updateDoc(userRef, {
        phoneNumber: values.phoneNumber,
        address: values.address,
        bio: values.bio,
        updatedAt: new Date().toISOString(),
      });

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully!",
      });
    } catch (error) {
      console.error("Profile update error:", error);

      toast({
        variant: "destructive",
        title: "Update failed",
        description: "There was a problem updating your profile. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <MainLayout>
      <div className="container py-10">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Your Profile</h1>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={user.photoURL || ""} alt={user.displayName || "User"} />
                  <AvatarFallback>{user.displayName?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle>{user.displayName}</CardTitle>
                  <CardDescription>{user.email}</CardDescription>
                  <CardDescription>
                    Role: <span className="capitalize">{user.role}</span>
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="displayName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Display Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Your name"
                            {...field}
                            disabled={isLoading}
                          />
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
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="you@example.com"
                            {...field}
                            disabled={true} // Email cannot be changed
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="+1 (555) 123-4567"
                            {...field}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Your address"
                            {...field}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bio</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Tell us a bit about yourself"
                            className="resize-none min-h-[100px]"
                            {...field}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    disabled={isLoading}
                  >
                    {isLoading ? "Saving..." : "Save Changes"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}

