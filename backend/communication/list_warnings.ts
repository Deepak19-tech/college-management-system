import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import { communicationDB } from "./db";
import { ListWarningsResponse, Warning } from "./types";

interface ListWarningsRequest {
  studentId?: Query<number>;
  courseId?: Query<number>;
  warningType?: Query<string>;
  isResolved?: Query<boolean>;
}

// Retrieves warnings, optionally filtered by student, course, type, or resolution status.
export const listWarnings = api<ListWarningsRequest, ListWarningsResponse>(
  { expose: true, method: "GET", path: "/communication/warnings" },
  async (req) => {
    let query = `
      SELECT id, student_id as "studentId", issued_by as "issuedBy", course_id as "courseId",
             warning_type as "warningType", description, severity, is_resolved as "isResolved",
             created_at as "createdAt", updated_at as "updatedAt"
      FROM warnings
    `;
    const params: any[] = [];
    const conditions: string[] = [];

    if (req.studentId) {
      conditions.push(`student_id = $${params.length + 1}`);
      params.push(req.studentId);
    }

    if (req.courseId) {
      conditions.push(`course_id = $${params.length + 1}`);
      params.push(req.courseId);
    }

    if (req.warningType) {
      conditions.push(`warning_type = $${params.length + 1}`);
      params.push(req.warningType);
    }

    if (req.isResolved !== undefined) {
      conditions.push(`is_resolved = $${params.length + 1}`);
      params.push(req.isResolved);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(" AND ")}`;
    }

    query += ` ORDER BY created_at DESC`;

    const warnings = await communicationDB.rawQueryAll<Warning>(query, ...params);
    return { warnings };
  }
);
