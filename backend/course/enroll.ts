import { api, APIError } from "encore.dev/api";
import { courseDB } from "./db";
import { EnrollStudentRequest, Enrollment } from "./types";

// Enrolls a student in a course.
export const enroll = api<EnrollStudentRequest, Enrollment>(
  { expose: true, method: "POST", path: "/courses/enroll" },
  async (req) => {
    try {
      // Check if course exists and has capacity
      const course = await courseDB.queryRow`
        SELECT max_students, 
               (SELECT COUNT(*) FROM enrollments WHERE course_id = ${req.courseId} AND status = 'active') as current_enrollment
        FROM courses WHERE id = ${req.courseId}
      `;

      if (!course) {
        throw APIError.notFound("Course not found");
      }

      if (course.current_enrollment >= course.max_students) {
        throw APIError.failedPrecondition("Course is full");
      }

      const enrollment = await courseDB.queryRow<Enrollment>`
        INSERT INTO enrollments (student_id, course_id)
        VALUES (${req.studentId}, ${req.courseId})
        RETURNING id, student_id as "studentId", course_id as "courseId", 
                  enrollment_date as "enrollmentDate", status, grade
      `;

      if (!enrollment) {
        throw APIError.internal("Failed to enroll student");
      }

      return enrollment;
    } catch (error: any) {
      if (error.code === "23505") {
        throw APIError.alreadyExists("Student is already enrolled in this course");
      }
      throw APIError.internal("Failed to enroll student", error);
    }
  }
);
