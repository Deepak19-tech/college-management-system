import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import { courseDB } from "./db";
import { ListCoursesResponse, Course } from "./types";

interface ListCoursesRequest {
  department?: Query<string>;
  semester?: Query<string>;
  year?: Query<number>;
  professorId?: Query<number>;
}

// Retrieves all courses, optionally filtered by department, semester, year, or professor.
export const list = api<ListCoursesRequest, ListCoursesResponse>(
  { expose: true, method: "GET", path: "/courses" },
  async (req) => {
    let query = `
      SELECT id, code, name, description, credits, department, professor_id as "professorId", 
             semester, year, max_students as "maxStudents", created_at as "createdAt", updated_at as "updatedAt"
      FROM courses
    `;
    const params: any[] = [];
    const conditions: string[] = [];

    if (req.department) {
      conditions.push(`department = $${params.length + 1}`);
      params.push(req.department);
    }

    if (req.semester) {
      conditions.push(`semester = $${params.length + 1}`);
      params.push(req.semester);
    }

    if (req.year) {
      conditions.push(`year = $${params.length + 1}`);
      params.push(req.year);
    }

    if (req.professorId) {
      conditions.push(`professor_id = $${params.length + 1}`);
      params.push(req.professorId);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(" AND ")}`;
    }

    query += ` ORDER BY code`;

    const courses = await courseDB.rawQueryAll<Course>(query, ...params);
    return { courses };
  }
);
