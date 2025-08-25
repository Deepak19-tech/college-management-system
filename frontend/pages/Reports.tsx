import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, TrendingUp, Users, AlertTriangle } from "lucide-react";
import backend from "~backend/client";

export default function Reports() {
  const { data: usersData } = useQuery({
    queryKey: ["users"],
    queryFn: () => backend.user.list({}),
  });

  const { data: coursesData } = useQuery({
    queryKey: ["courses"],
    queryFn: () => backend.course.list({}),
  });

  const { data: enrollmentsData } = useQuery({
    queryKey: ["enrollments"],
    queryFn: () => backend.course.getEnrollments({}),
  });

  const { data: attendanceData } = useQuery({
    queryKey: ["attendance"],
    queryFn: () => backend.course.getAttendance({}),
  });

  const { data: libraryStats } = useQuery({
    queryKey: ["library-stats"],
    queryFn: () => backend.library.getStats(),
  });

  const { data: warningsData } = useQuery({
    queryKey: ["warnings"],
    queryFn: () => backend.communication.listWarnings({}),
  });

  const students = usersData?.users.filter(u => u.userType === "student") || [];
  const professors = usersData?.users.filter(u => u.userType === "professor") || [];
  const courses = coursesData?.courses || [];
  const enrollments = enrollmentsData?.enrollments || [];
  const attendance = attendanceData?.attendance || [];
  const warnings = warningsData?.warnings || [];

  const getStudentName = (studentId: number) => {
    const student = students.find(s => s.id === studentId);
    return student?.name || "Unknown Student";
  };

  const getCourseName = (courseId: number) => {
    const course = courses.find(c => c.id === courseId);
    return course?.name || "Unknown Course";
  };

  const getStudentGrades = (studentId: number) => {
    return enrollments.filter(e => e.studentId === studentId && e.grade);
  };

  const getStudentAttendance = (studentId: number) => {
    const studentAttendance = attendance.filter(a => a.studentId === studentId);
    const totalClasses = studentAttendance.length;
    const presentClasses = studentAttendance.filter(a => a.status === "present").length;
    return totalClasses > 0 ? (presentClasses / totalClasses) * 100 : 0;
  };

  const getStudentWarnings = (studentId: number) => {
    return warnings.filter(w => w.studentId === studentId && !w.isResolved);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
        <p className="mt-2 text-gray-600">Academic progress and performance reports</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
            <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{courses.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Enrollments</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enrollments.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Warnings</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {warnings.filter(w => !w.isResolved).length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="progress" className="space-y-6">
        <TabsList>
          <TabsTrigger value="progress">Student Progress</TabsTrigger>
          <TabsTrigger value="attendance">Attendance Report</TabsTrigger>
          <TabsTrigger value="grades">Grade Report</TabsTrigger>
          <TabsTrigger value="library">Library Report</TabsTrigger>
        </TabsList>

        <TabsContent value="progress" className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {students.map((student) => {
              const grades = getStudentGrades(student.id);
              const attendanceRate = getStudentAttendance(student.id);
              const studentWarnings = getStudentWarnings(student.id);

              return (
                <Card key={student.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{student.name}</CardTitle>
                        <p className="text-sm text-gray-600">ID: {student.studentId}</p>
                      </div>
                      <div className="flex gap-2">
                        {studentWarnings.length > 0 && (
                          <Badge variant="destructive">
                            {studentWarnings.length} Warning{studentWarnings.length > 1 ? 's' : ''}
                          </Badge>
                        )}
                        <Badge variant={attendanceRate >= 75 ? "default" : "destructive"}>
                          {attendanceRate.toFixed(1)}% Attendance
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Current Grades</h4>
                      {grades.length === 0 ? (
                        <p className="text-sm text-gray-500">No grades recorded</p>
                      ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {grades.map((enrollment) => (
                            <div key={enrollment.id} className="flex justify-between text-sm">
                              <span>{getCourseName(enrollment.courseId)}</span>
                              <span className="font-medium">{enrollment.grade}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {studentWarnings.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2 text-red-600">Active Warnings</h4>
                        <div className="space-y-1">
                          {studentWarnings.map((warning) => (
                            <div key={warning.id} className="text-sm text-red-600">
                              • {warning.warningType}: {warning.description}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="attendance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Attendance Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {students.map((student) => {
                  const attendanceRate = getStudentAttendance(student.id);
                  return (
                    <div key={student.id} className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{student.name}</p>
                        <p className="text-sm text-gray-600">ID: {student.studentId}</p>
                      </div>
                      <Badge variant={attendanceRate >= 75 ? "default" : "destructive"}>
                        {attendanceRate.toFixed(1)}%
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="grades" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Grade Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {courses.map((course) => {
                  const courseEnrollments = enrollments.filter(e => e.courseId === course.id && e.grade);
                  if (courseEnrollments.length === 0) return null;

                  return (
                    <div key={course.id} className="border-b pb-4">
                      <h4 className="font-medium mb-2">{course.name} ({course.code})</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {courseEnrollments.map((enrollment) => (
                          <div key={enrollment.id} className="flex justify-between text-sm">
                            <span>{getStudentName(enrollment.studentId)}</span>
                            <span className="font-medium">{enrollment.grade}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="library" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Library Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{libraryStats?.totalBooks || 0}</div>
                  <div className="text-sm text-gray-600">Total Books</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{libraryStats?.activeBorrowings || 0}</div>
                  <div className="text-sm text-gray-600">Active Borrowings</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{libraryStats?.overdueBorrowings || 0}</div>
                  <div className="text-sm text-gray-600">Overdue Books</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">${libraryStats?.totalFines?.toFixed(2) || "0.00"}</div>
                  <div className="text-sm text-gray-600">Total Fines</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
