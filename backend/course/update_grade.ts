import { api, APIError } from "encore.dev/api";
import { courseDB } from "./db";
import { UpdateGradeRequest, Enrollment } from "./types";

// Updates a student's grade for a course.
export const updateGrade = api<UpdateGradeRequest, Enrollment>(
  { expose: true, method: "PUT", path: "/courses/grade" },
  async (req) => {
    const enrollment = await courseDB.queryRow<Enrollment>`
      UPDATE enrollments 
      SET grade = ${req.grade}
      WHERE student_id = ${req.studentId} AND course_id = ${req.courseId}
      RETURNING id, student_id as "studentId", course_id as "courseId", 
                enrollment_date as "enrollmentDate", status, grade
    `;

    if (!enrollment) {
      throw APIError.notFound("Enrollment not found");
    }

    return enrollment;
  }
);
