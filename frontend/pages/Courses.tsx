import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Users, Calendar, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import backend from "~backend/client";
import CourseDialog from "../components/CourseDialog";
import EnrollmentDialog from "../components/EnrollmentDialog";
import AttendanceDialog from "../components/AttendanceDialog";
import GradeDialog from "../components/GradeDialog";

export default function Courses() {
  const [searchTerm, setSearchTerm] = useState("");
  const [courseDialogOpen, setCourseDialogOpen] = useState(false);
  const [enrollmentDialogOpen, setEnrollmentDialogOpen] = useState(false);
  const [attendanceDialogOpen, setAttendanceDialogOpen] = useState(false);
  const [gradeDialogOpen, setGradeDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);

  const { data: coursesData, isLoading } = useQuery({
    queryKey: ["courses"],
    queryFn: () => backend.course.list({}),
  });

  const { data: enrollmentsData } = useQuery({
    queryKey: ["enrollments"],
    queryFn: () => backend.course.getEnrollments({}),
  });

  const { data: usersData } = useQuery({
    queryKey: ["users"],
    queryFn: () => backend.user.list({}),
  });

  const filteredCourses = coursesData?.courses.filter(course =>
    course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.department.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const professors = usersData?.users.filter(u => u.userType === "professor") || [];
  const students = usersData?.users.filter(u => u.userType === "student") || [];

  const getProfessorName = (professorId?: number) => {
    if (!professorId) return "Not assigned";
    const professor = professors.find(p => p.id === professorId);
    return professor?.name || "Unknown";
  };

  const getEnrollmentCount = (courseId: number) => {
    return enrollmentsData?.enrollments.filter(e => e.courseId === courseId && e.status === "active").length || 0;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Courses</h1>
          <p className="mt-2 text-gray-600">Manage courses, enrollments, and attendance</p>
        </div>
        <Button onClick={() => setCourseDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Course
        </Button>
      </div>

      <Tabs defaultValue="courses" className="space-y-6">
        <TabsList>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="enrollments">Enrollments</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="grades">Grades</TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="space-y-6">
          <div className="flex gap-4">
            <Input
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          {isLoading ? (
            <div className="text-center py-8">Loading courses...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => (
                <Card key={course.id}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{course.name}</CardTitle>
                        <p className="text-sm text-gray-600">{course.code}</p>
                      </div>
                      <Badge variant="outline">{course.credits} Credits</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <p className="text-sm"><span className="font-medium">Department:</span> {course.department}</p>
                      <p className="text-sm"><span className="font-medium">Professor:</span> {getProfessorName(course.professorId)}</p>
                      <p className="text-sm"><span className="font-medium">Semester:</span> {course.semester} {course.year}</p>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{getEnrollmentCount(course.id)}/{course.maxStudents} students</span>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedCourse(course);
                          setEnrollmentDialogOpen(true);
                        }}
                      >
                        Enroll
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedCourse(course);
                          setAttendanceDialogOpen(true);
                        }}
                      >
                        Attendance
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="enrollments">
          <div className="text-center py-8 text-gray-500">
            Enrollment management interface would go here
          </div>
        </TabsContent>

        <TabsContent value="attendance">
          <div className="text-center py-8 text-gray-500">
            Attendance tracking interface would go here
          </div>
        </TabsContent>

        <TabsContent value="grades">
          <div className="text-center py-8 text-gray-500">
            Grade management interface would go here
          </div>
        </TabsContent>
      </Tabs>

      <CourseDialog
        open={courseDialogOpen}
        onClose={() => setCourseDialogOpen(false)}
        professors={professors}
      />

      <EnrollmentDialog
        open={enrollmentDialogOpen}
        onClose={() => setEnrollmentDialogOpen(false)}
        course={selectedCourse}
        students={students}
      />

      <AttendanceDialog
        open={attendanceDialogOpen}
        onClose={() => setAttendanceDialogOpen(false)}
        course={selectedCourse}
        students={students}
      />

      <GradeDialog
        open={gradeDialogOpen}
        onClose={() => setGradeDialogOpen(false)}
        course={selectedCourse}
        students={students}
      />
    </div>
  );
}
