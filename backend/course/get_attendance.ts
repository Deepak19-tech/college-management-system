import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import { courseDB } from "./db";
import { ListAttendanceResponse, Attendance } from "./types";

interface GetAttendanceRequest {
  courseId?: Query<number>;
  studentId?: Query<number>;
  startDate?: Query<Date>;
  endDate?: Query<Date>;
}

// Retrieves attendance records, optionally filtered by course, student, or date range.
export const getAttendance = api<GetAttendanceRequest, ListAttendanceResponse>(
  { expose: true, method: "GET", path: "/courses/attendance" },
  async (req) => {
    let query = `
      SELECT id, student_id as "studentId", course_id as "courseId", 
             date, status, notes, created_at as "createdAt"
      FROM attendance
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

    if (req.startDate) {
      conditions.push(`date >= $${params.length + 1}`);
      params.push(req.startDate);
    }

    if (req.endDate) {
      conditions.push(`date <= $${params.length + 1}`);
      params.push(req.endDate);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(" AND ")}`;
    }

    query += ` ORDER BY date DESC, course_id, student_id`;

    const attendance = await courseDB.rawQueryAll<Attendance>(query, ...params);
    return { attendance };
  }
);
