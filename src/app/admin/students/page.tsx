"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FaUserPlus } from "react-icons/fa";
import { useAuth } from "@/context/auth-context";
import { getUsersByRole } from "@/lib/services/user-service";

interface Student {
  uid: string;
  displayName: string;
  email: string;
  // can be millis number or Firestore Timestamp-like
  createdAt: any;
}

const safeDate = (value: any): Date | null => {
  if (!value) return null;
  try {
    if (value instanceof Date) return isNaN(value.getTime()) ? null : value;
    // Firestore Timestamp
    if (typeof value === "object" && "seconds" in value) {
      return new Date(value.seconds * 1000);
    }
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  } catch {
    return null;
  }
};

import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { FaDownload } from "react-icons/fa";

// helper to export csv
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

export default function AdminStudentsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  // table state
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<keyof Student | "createdAt">("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // fetch students (all users with role = "student")
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const list = await getUsersByRole("student");
        setStudents(list as unknown as Student[]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  // route-guard
  useEffect(() => {
    if (!user) return;
    if (user.role !== "admin") router.push("/dashboard");
  }, [user, router]);

  // sorting handler
  const handleSort = (field: keyof Student | "createdAt") => {
    if (sortBy === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortDir("asc");
    }
  };

  // filtered / paginated list
  const filtered = students.filter((s) => {
    const q = search.toLowerCase();
    return s.displayName.toLowerCase().includes(q) || s.email.toLowerCase().includes(q);
  });
  const sorted = [...filtered].sort((a, b) => {
    const dir = sortDir === "asc" ? 1 : -1;
    if (sortBy === "createdAt") return (a.createdAt - b.createdAt) * dir;
    return (a[sortBy] as string).localeCompare(b[sortBy] as string) * dir;
  });
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const paged = sorted.slice((page - 1) * pageSize, page * pageSize);

  // analytics data (sign-ups last 30 days)
  const today = new Date();
  const days = Array.from({ length: 30 }).map((_, idx) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (29 - idx));
    const key = d.toISOString().slice(0, 10);
    const count = students.filter((s) => {
      const sd = safeDate(s.createdAt);
      return sd ? sd.toISOString().slice(0, 10) === key : false;
    }).length;
    return { date: key, count };
  });





  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Analytics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded bg-secondary text-center">
          <p className="text-2xl font-bold">{students.length}</p>
          <p className="text-sm">Total Students</p>
        </div>
        {/* signups last 30 days chart card */}
        <div className="col-span-2 md:col-span-3 p-4 rounded bg-secondary h-40">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={days}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" hide />
              <YAxis hide />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Manage Students</h1>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="border rounded px-3 py-1 text-sm"
          />
          {filtered.length > 0 && (
            <button
              onClick={() => downloadCSV(filtered, "students.csv")}
              className="flex items-center gap-1 px-3 py-1 rounded bg-secondary text-sm"
            >
              <FaDownload /> CSV
            </button>
          )}
          <Button asChild variant="secondary">
            <Link href="/admin/students/create">
              <FaUserPlus className="mr-2 h-4 w-4" /> Add Student
            </Link>
          </Button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : students.length === 0 ? (
        <p className="text-muted-foreground">No students found.</p>
      ) : (
        <>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <input
                  type="checkbox"
                  checked={selected.size === paged.length && paged.length > 0}
                  onChange={(e) => {
                    if (e.target.checked) {
                      const newSet = new Set(selected);
                      paged.forEach((s) => newSet.add(s.uid));
                      setSelected(newSet);
                    } else {
                      const newSet = new Set(selected);
                      paged.forEach((s) => newSet.delete(s.uid));
                      setSelected(newSet);
                    }
                  }}
                />
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort("displayName")}>Name {sortBy==="displayName"? (sortDir==="asc"?"▲":"▼"):""}</TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort("email")}>Email {sortBy==="email"? (sortDir==="asc"?"▲":"▼"):""}</TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort("createdAt")}>Joined {sortBy==="createdAt"? (sortDir==="asc"?"▲":"▼"):""}</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paged.map((s) => (
              <TableRow key={s.uid}>
                <TableCell>
                  <input
                    type="checkbox"
                    checked={selected.has(s.uid)}
                    onChange={(e) => {
                      const newSet = new Set(selected);
                      e.target.checked ? newSet.add(s.uid) : newSet.delete(s.uid);
                      setSelected(newSet);
                    }}
                  />
                </TableCell>
                <TableCell>{s.displayName}</TableCell>
                <TableCell>{s.email}</TableCell>
                <TableCell>{(() => {
                    const d = safeDate(s.createdAt);
                    return d ? d.toLocaleDateString() : "-";
                  })()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-end items-center gap-2 mt-4 text-sm">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-2 py-1 border rounded disabled:opacity-50"
            >
              Prev
            </button>
            <span>
              Page {page} of {totalPages}
            </span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-2 py-1 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </>
      )}
    </div>
  );
}
