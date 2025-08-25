import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, Library, AlertTriangle } from "lucide-react";
import backend from "~backend/client";

export default function Dashboard() {
  const { data: userStats } = useQuery({
    queryKey: ["users"],
    queryFn: () => backend.user.list({}),
  });

  const { data: courseStats } = useQuery({
    queryKey: ["courses"],
    queryFn: () => backend.course.list({}),
  });

  const { data: libraryStats } = useQuery({
    queryKey: ["library-stats"],
    queryFn: () => backend.library.getStats(),
  });

  const { data: warnings } = useQuery({
    queryKey: ["warnings"],
    queryFn: () => backend.communication.listWarnings({ isResolved: false }),
  });

  const students = userStats?.users.filter(u => u.userType === "student") || [];
  const professors = userStats?.users.filter(u => u.userType === "professor") || [];
  const courses = courseStats?.courses || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">Welcome to the College Management System</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{students.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Professors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{professors.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{courses.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Library Books</CardTitle>
            <Library className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{libraryStats?.totalBooks || 0}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Library Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Active Borrowings</span>
              <span className="font-medium">{libraryStats?.activeBorrowings || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Overdue Books</span>
              <span className="font-medium text-red-600">{libraryStats?.overdueBorrowings || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Total Fines</span>
              <span className="font-medium">${libraryStats?.totalFines?.toFixed(2) || "0.00"}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Recent Warnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            {warnings?.warnings.length === 0 ? (
              <p className="text-sm text-gray-500">No active warnings</p>
            ) : (
              <div className="space-y-3">
                {warnings?.warnings.slice(0, 5).map((warning) => (
                  <div key={warning.id} className="flex items-start space-x-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      warning.severity === "high" ? "bg-red-500" :
                      warning.severity === "medium" ? "bg-yellow-500" : "bg-blue-500"
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{warning.warningType}</p>
                      <p className="text-sm text-gray-500 truncate">{warning.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
