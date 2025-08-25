import { api, APIError } from "encore.dev/api";
import { courseDB } from "./db";
import { MarkAttendanceRequest, Attendance } from "./types";

// Marks attendance for a student in a course.
export const markAttendance = api<MarkAttendanceRequest, Attendance>(
  { expose: true, method: "POST", path: "/courses/attendance" },
  async (req) => {
    try {
      const attendance = await courseDB.queryRow<Attendance>`
        INSERT INTO attendance (student_id, course_id, date, status, notes)
        VALUES (${req.studentId}, ${req.courseId}, ${req.date}, ${req.status}, ${req.notes || null})
        ON CONFLICT (student_id, course_id, date)
        DO UPDATE SET status = ${req.status}, notes = ${req.notes || null}
        RETURNING id, student_id as "studentId", course_id as "courseId", 
                  date, status, notes, created_at as "createdAt"
      `;

      if (!attendance) {
        throw APIError.internal("Failed to mark attendance");
      }

      return attendance;
    } catch (error: any) {
      throw APIError.internal("Failed to mark attendance", error);
    }
  }
);
