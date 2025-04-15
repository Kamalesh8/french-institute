"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getUserStatistics,
  getCourseStatistics,
  getEnrollmentStatistics,
  getSystemAnalytics,
} from "@/lib/services/admin-service";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";
import {
  FaUsers,
  FaGraduationCap,
  FaChartLine,
  FaMoneyBillWave,
  FaUserGraduate,
  FaBook,
  FaCertificate,
  FaChalkboardTeacher,
} from "react-icons/fa";

export default function AnalyticsDashboard() {
  const [userStats, setUserStats] = useState<any>(null);
  const [courseStats, setCourseStats] = useState<any>(null);
  const [enrollmentStats, setEnrollmentStats] = useState<any>(null);
  const [systemAnalytics, setSystemAnalytics] = useState<any>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<"week" | "month" | "year">("month");

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const [users, courses, enrollments, system] = await Promise.all([
          getUserStatistics(),
          getCourseStatistics(),
          getEnrollmentStatistics(selectedPeriod),
          getSystemAnalytics(),
        ]);

        setUserStats(users);
        setCourseStats(courses);
        setEnrollmentStats(Object.entries(enrollments).map(([date, count]) => ({
          date,
          enrollments: count,
        })));
        setSystemAnalytics(system);
      } catch (error) {
        console.error("Error loading analytics:", error);
      }
    };

    loadAnalytics();
  }, [selectedPeriod]);

  const StatCard = ({ title, value, icon: Icon, description }: any) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Students"
          value={userStats?.totalStudents || 0}
          icon={FaUserGraduate}
          description="Active enrolled students"
        />
        <StatCard
          title="Total Courses"
          value={courseStats?.totalCourses || 0}
          icon={FaBook}
          description="Available courses"
        />
        <StatCard
          title="Total Revenue"
          value={`$${(courseStats?.totalRevenue || 0).toLocaleString()}`}
          icon={FaMoneyBillWave}
          description="Total earnings"
        />
        <StatCard
          title="Active Users"
          value={systemAnalytics?.engagement?.activeUsers || 0}
          icon={FaUsers}
          description="Users active this month"
        />
      </div>

      <Tabs defaultValue="enrollments" className="space-y-4">
        <TabsList>
          <TabsTrigger value="enrollments">Enrollments</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
        </TabsList>

        <TabsContent value="enrollments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Enrollment Trends</CardTitle>
              <div className="flex gap-2">
                {["week", "month", "year"].map((period) => (
                  <button
                    key={period}
                    onClick={() => setSelectedPeriod(period as any)}
                    className={`px-3 py-1 rounded ${
                      selectedPeriod === period
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary"
                    }`}
                  >
                    {period.charAt(0).toUpperCase() + period.slice(1)}
                  </button>
                ))}
              </div>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={enrollmentStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(date) => format(new Date(date), "MMM d")}
                  />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(date) => format(new Date(date), "MMM d, yyyy")}
                  />
                  <Line
                    type="monotone"
                    dataKey="enrollments"
                    stroke="#2563eb"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Overview</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={enrollmentStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(date) => format(new Date(date), "MMM d")}
                  />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(date) => format(new Date(date), "MMM d, yyyy")}
                  />
                  <Bar dataKey="revenue" fill="#2563eb" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Course Completion Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">
                  {Math.round(systemAnalytics?.engagement?.averageCompletionRate || 0)}%
                </div>
                <p className="text-sm text-muted-foreground">
                  Average course completion rate
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Active Learning Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">
                  {Math.round((systemAnalytics?.engagement?.activeTime || 0) / 60)}h
                </div>
                <p className="text-sm text-muted-foreground">
                  Average time spent learning per user
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
