import { api, APIError } from "encore.dev/api";
import { courseDB } from "./db";
import { CreateCourseRequest, Course } from "./types";

// Creates a new course.
export const create = api<CreateCourseRequest, Course>(
  { expose: true, method: "POST", path: "/courses" },
  async (req) => {
    try {
      const row = await courseDB.queryRow<Course>`
        INSERT INTO courses (code, name, description, credits, department, professor_id, semester, year, max_students)
        VALUES (${req.code}, ${req.name}, ${req.description || null}, ${req.credits}, ${req.department}, 
                ${req.professorId || null}, ${req.semester}, ${req.year}, ${req.maxStudents || 50})
        RETURNING id, code, name, description, credits, department, professor_id as "professorId", 
                  semester, year, max_students as "maxStudents", created_at as "createdAt", updated_at as "updatedAt"
      `;
      
      if (!row) {
        throw APIError.internal("Failed to create course");
      }
      
      return row;
    } catch (error: any) {
      if (error.code === "23505") {
        throw APIError.alreadyExists("Course with this code already exists");
      }
      throw APIError.internal("Failed to create course", error);
    }
  }
);
