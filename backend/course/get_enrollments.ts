import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import { courseDB } from "./db";
import { ListEnrollmentsResponse, Enrollment } from "./types";

interface GetEnrollmentsRequest {
  courseId?: Query<number>;
  studentId?: Query<number>;
  status?: Query<string>;
}

// Retrieves enrollments, optionally filtered by course, student, or status.
export const getEnrollments = api<GetEnrollmentsRequest, ListEnrollmentsResponse>(
  { expose: true, method: "GET", path: "/courses/enrollments" },
  async (req) => {
    let query = `
      SELECT id, student_id as "studentId", course_id as "courseId", 
             enrollment_date as "enrollmentDate", status, grade
      FROM enrollments
    `;
    const params: any[] = [];
    const conditions: string[] = [];

    if (req.courseId) {
      conditions.push(`course_id = $${params.length + 1}`);
      params.push(req.courseId);
    }

    if (req.studentId) {
      conditions.push(`student_id = $${params.length + 1}`);
      params.push(req.studentId);
    }

    if (req.status) {
      conditions.push(`status = $${params.length + 1}`);
      params.push(req.status);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(" AND ")}`;
    }

    query += ` ORDER BY enrollment_date DESC`;

    const enrollments = await courseDB.rawQueryAll<Enrollment>(query, ...params);
    return { enrollments };
  }
);
