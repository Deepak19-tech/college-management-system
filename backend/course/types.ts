export interface Course {
  id: number;
  code: string;
  name: string;
  description?: string;
  credits: number;
  department: string;
  professorId?: number;
  semester: string;
  year: number;
  maxStudents: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCourseRequest {
  code: string;
  name: string;
  description?: string;
  credits: number;
  department: string;
  professorId?: number;
  semester: string;
  year: number;
  maxStudents?: number;
}

export interface UpdateCourseRequest {
  id: number;
  code?: string;
  name?: string;
  description?: string;
  credits?: number;
  department?: string;
  professorId?: number;
  semester?: string;
  year?: number;
  maxStudents?: number;
}

export interface Enrollment {
  id: number;
  studentId: number;
  courseId: number;
  enrollmentDate: Date;
  status: string;
  grade?: string;
}

export interface EnrollStudentRequest {
  studentId: number;
  courseId: number;
}

export interface UpdateGradeRequest {
  studentId: number;
  courseId: number;
  grade: string;
}

export type AttendanceStatus = "present" | "absent" | "late";

export interface Attendance {
  id: number;
  studentId: number;
  courseId: number;
  date: Date;
  status: AttendanceStatus;
  notes?: string;
  createdAt: Date;
}

export interface MarkAttendanceRequest {
  studentId: number;
  courseId: number;
  date: Date;
  status: AttendanceStatus;
  notes?: string;
}

export interface ListCoursesResponse {
  courses: Course[];
}

export interface ListEnrollmentsResponse {
  enrollments: Enrollment[];
}

export interface ListAttendanceResponse {
  attendance: Attendance[];
}
