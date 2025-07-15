"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getEnrollmentStatistics,
  getStudentLevelDistribution,
  getPopularCourses,
} from "@/lib/services/admin-service";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { format } from "date-fns";
import { FaDownload } from "react-icons/fa";

// Data types
interface EnrollmentPoint {
  date: string;
  enrollments: number;
}
interface StudentLevel {
  level: string;
  count: number;
}
interface PopularCourse {
  id: string;
  title: string;
  enrollments: number;
  level: string;
  instructor: string;
}

// Quick CSV export helper
const downloadCSV = (rows: any[], filename: string) => {
  if (!rows.length) return;
  const header = Object.keys(rows[0]).join(",");
  const csv = header + "\n" + rows.map((r) => Object.values(r).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
};

export default function AdminReportsPage() {
  const [period, setPeriod] = useState<"week" | "month" | "year">("month");
  const [enrollmentData, setEnrollmentData] = useState<EnrollmentPoint[]>([]);
  const [studentLevels, setStudentLevels] = useState<StudentLevel[]>([]);
  const [popularCourses, setPopularCourses] = useState<PopularCourse[]>([]);

  useEffect(() => {
    const load = async () => {
      const [enrollmentsObj, levels, popular] = await Promise.all([
        getEnrollmentStatistics(period),
        getStudentLevelDistribution(),
        getPopularCourses(10),
      ]);

      const enrollArr: EnrollmentPoint[] = Object.entries(enrollmentsObj).map(
        ([date, count]) => ({ date, enrollments: count as number })
      );
      setEnrollmentData(enrollArr);
      setStudentLevels(levels as StudentLevel[]);
      setPopularCourses(popular as PopularCourse[]);
    };
    load();
  }, [period]);

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 space-y-8">
      <h1 className="text-3xl font-bold">Admin Reports</h1>

      <Tabs defaultValue="enrollment">
        <TabsList>
          <TabsTrigger value="enrollment">Enrollment</TabsTrigger>
          <TabsTrigger value="course">Course Performance</TabsTrigger>
          <TabsTrigger value="student">Student Progress</TabsTrigger>
        </TabsList>

        {/* Enrollment */}
        <TabsContent value="enrollment" className="space-y-4">
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Enrollment Trend</CardTitle>
              <div className="flex gap-2">
                {(["week", "month", "year"] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={`px-3 py-1 rounded text-sm ${
                      period === p ? "bg-primary text-primary-foreground" : "bg-secondary"
                    }`}
                  >
                    {p[0].toUpperCase() + p.slice(1)}
                  </button>
                ))}
                {enrollmentData.length > 0 && (
                  <button
                    onClick={() => downloadCSV(enrollmentData, "enrollment-report.csv")}
                    className="flex items-center gap-1 px-3 py-1 rounded bg-secondary text-sm"
                  >
                    <FaDownload /> CSV
                  </button>
                )}
              </div>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={enrollmentData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(d) => format(new Date(d), "MMM d")}
                  />
                  <YAxis />
                  <Tooltip labelFormatter={(d) => format(new Date(d), "PPP")} />
                  <Line type="monotone" dataKey="enrollments" stroke="#2563eb" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Course performance */}
        <TabsContent value="course" className="space-y-4">
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Top Courses by Enrollments</CardTitle>
              {popularCourses.length > 0 && (
                <button
                  onClick={() => downloadCSV(popularCourses, "popular-courses.csv")}
                  className="flex items-center gap-1 px-3 py-1 rounded bg-secondary text-sm"
                >
                  <FaDownload /> CSV
                </button>
              )}
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="table-auto w-full text-sm">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left">Title</th>
                    <th className="px-4 py-2 text-left">Enrollments</th>
                    <th className="px-4 py-2 text-left">Level</th>
                    <th className="px-4 py-2 text-left">Instructor</th>
                  </tr>
                </thead>
                <tbody>
                  {popularCourses.map((c) => (
                    <tr key={c.id} className="border-t">
                      <td className="px-4 py-2 whitespace-nowrap">{c.title}</td>
                      <td className="px-4 py-2">{c.enrollments}</td>
                      <td className="px-4 py-2">{c.level}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{c.instructor}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Student progress */}
        <TabsContent value="student" className="space-y-4">
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Student Level Distribution</CardTitle>
              {studentLevels.length > 0 && (
                <button
                  onClick={() => downloadCSV(studentLevels, "student-levels.csv")}
                  className="flex items-center gap-1 px-3 py-1 rounded bg-secondary text-sm"
                >
                  <FaDownload /> CSV
                </button>
              )}
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={studentLevels}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="level" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#2563eb" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}