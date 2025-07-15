"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";

import { createCourse } from "@/lib/services/course-service";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { format, addWeeks } from "date-fns";

// Define form schema with validation
const formSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(10).max(500),
  level: z.enum(["A1", "A2", "B1", "B2", "C1", "C2"]),
  format: z.enum(["online"]),
  schedule: z.enum(["flexible", "fixed"]),
  duration: z.number().min(1).max(52),
  hoursPerWeek: z.number().min(1).max(20),
  startDate: z.string().refine((value) => {
    const date = new Date(value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today;
  }, "Start date must be today or in the future"),
  price: z.number().min(0),
  currency: z.string().min(1, "Currency is required"),
  maxStudents: z.coerce.number().min(1, "Maximum students must be at least 1"),
  instructor: z.string().min(2, "Instructor name must be at least 2 characters"),
  syllabus: z.string().min(50, "Syllabus must be at least 50 characters"),
  imageURL: z.string().optional(),
});

export default function CreateCoursePage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize the form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      level: "A1",
      format: "online",
      schedule: "flexible",
      duration: 8,
      hoursPerWeek: 4,
      startDate: format(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"), // 2 weeks from now
      price: 199,
      currency: "USD",
      maxStudents: 20,
      instructor: "",
      syllabus: "",
      imageURL: "",
    },
  });

  useEffect(() => {
    // Redirect if not admin
    if (user && user.role !== "admin") {
      router.push("/dashboard");
    } else if (!user) {
      router.push("/auth/login");
    }
  }, [user, router]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      // Calculate total hours
      const totalHours = values.duration * values.hoursPerWeek;

      // Calculate end date
      const startDate = new Date(values.startDate);
      const endDate = addWeeks(startDate, values.duration);

      // Create the course
      const newCourse = await createCourse({
        ...values,
        totalHours,
        endDate: endDate.toISOString(),
        startDate: startDate.toISOString(),
        status: "upcoming",
        enrolledStudents: 0,
      });

      toast({
        title: "Course created!",
        description: `${values.title} has been successfully created.`,
      });

      // Redirect to course details
      router.push(`/admin/courses/${newCourse.id}`);
    } catch (error) {
      console.error("Error creating course:", error);
      toast({
        variant: "destructive",
        title: "Failed to create course",
        description: "There was an error creating the course. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user || user.role !== "admin") {
    return null; // Will redirect in useEffect
  }

  return (
    
      <div className="container py-10">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Create New Course</h1>
            <p className="text-muted-foreground">Add a new French language course to your catalog</p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/admin">Back to Dashboard</Link>
          </Button>
        </div>

        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle>Course Details</CardTitle>
            <CardDescription>
              Fill in all the required information to create a new course
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Information Section */}
                  <div className="space-y-4 md:col-span-2">
                    <h3 className="text-lg font-semibold border-b pb-2">Basic Information</h3>

                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Course Title</FormLabel>
                          <FormControl>
                            <Input placeholder="French for Beginners - A1 Level" {...field} />
                          </FormControl>
                          <FormDescription>
                            Give your course a clear and descriptive title
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Course Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="This comprehensive beginner French course will teach you the basics of French language..."
                              className="min-h-[120px]"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Describe what students will learn in this course
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Course Level and Format */}
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="level"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Course Level</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select level" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="A1">A1 - Beginner</SelectItem>
                              <SelectItem value="A2">A2 - Elementary</SelectItem>
                              <SelectItem value="B1">B1 - Intermediate</SelectItem>
                              <SelectItem value="B2">B2 - Upper Intermediate</SelectItem>
                              <SelectItem value="C1">C1 - Advanced</SelectItem>
                              <SelectItem value="C2">C2 - Proficiency</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            CEFR level of the course
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="format"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Course Format</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select format" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="online">Online</SelectItem>
                              
                              
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            How the course will be delivered
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="schedule"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Schedule</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select schedule" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="morning">Morning</SelectItem>
                              <SelectItem value="afternoon">Afternoon</SelectItem>
                              <SelectItem value="evening">Evening</SelectItem>
                              <SelectItem value="weekend">Weekend</SelectItem>
                              <SelectItem value="flexible">Flexible</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Preferred time for classes
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Duration and Timing */}
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="duration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Duration (weeks)</FormLabel>
                          <FormControl>
                            <Input type="number" min="1" {...field} />
                          </FormControl>
                          <FormDescription>
                            How many weeks the course will run
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="hoursPerWeek"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hours Per Week</FormLabel>
                          <FormControl>
                            <Input type="number" min="1" {...field} />
                          </FormControl>
                          <FormDescription>
                            Number of instruction hours per week
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormDescription>
                            When the course will begin
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Price and Enrollment */}
                  <div className="space-y-4 md:col-span-2">
                    <h3 className="text-lg font-semibold border-b pb-2">Price and Enrollment</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Price</FormLabel>
                            <FormControl>
                              <Input type="number" min="0" step="0.01" {...field} />
                            </FormControl>
                            <FormDescription>
                              Course price (without currency symbol)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="currency"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Currency</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select currency" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="USD">USD - US Dollar</SelectItem>
                                <SelectItem value="EUR">EUR - Euro</SelectItem>
                                <SelectItem value="GBP">GBP - British Pound</SelectItem>
                                <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                                <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                                <SelectItem value="INR">INR - Indian Rupee</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Currency for the course price
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="maxStudents"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Maximum Students</FormLabel>
                            <FormControl>
                              <Input type="number" min="1" {...field} />
                            </FormControl>
                            <FormDescription>
                              Maximum enrollment capacity
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="instructor"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Instructor</FormLabel>
                            <FormControl>
                              <Input placeholder="Jean Dupont" {...field} />
                            </FormControl>
                            <FormDescription>
                              Primary instructor for this course
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Course Content */}
                  <div className="space-y-4 md:col-span-2">
                    <h3 className="text-lg font-semibold border-b pb-2">Course Content</h3>

                    <FormField
                      control={form.control}
                      name="syllabus"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Course Syllabus</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Week 1: Introduction to French pronunciation...
Week 2: Basic vocabulary and greetings..."
                              className="min-h-[200px]"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Outline the weekly topics and learning objectives
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="imageURL"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Course Image URL (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="https://example.com/image.jpg" {...field} />
                          </FormControl>
                          <FormDescription>
                            URL to an image representing this course
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-4">
                  <Button variant="outline" type="button" asChild>
                    <Link href="/admin">Cancel</Link>
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Creating..." : "Create Course"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    
  );
}

