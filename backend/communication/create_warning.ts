import { api, APIError } from "encore.dev/api";
import { communicationDB } from "./db";
import { CreateWarningRequest, Warning } from "./types";

interface CreateWarningWithIssuerRequest extends CreateWarningRequest {
  issuedBy: number;
}

// Creates a warning for a student.
export const createWarning = api<CreateWarningWithIssuerRequest, Warning>(
  { expose: true, method: "POST", path: "/communication/warnings" },
  async (req) => {
    try {
      const warning = await communicationDB.queryRow<Warning>`
        INSERT INTO warnings (student_id, issued_by, course_id, warning_type, description, severity)
        VALUES (${req.studentId}, ${req.issuedBy}, ${req.courseId || null}, ${req.warningType}, 
                ${req.description}, ${req.severity || 'medium'})
        RETURNING id, student_id as "studentId", issued_by as "issuedBy", course_id as "courseId",
                  warning_type as "warningType", description, severity, is_resolved as "isResolved",
                  created_at as "createdAt", updated_at as "updatedAt"
      `;

      if (!warning) {
        throw APIError.internal("Failed to create warning");
      }

      return warning;
    } catch (error: any) {
      throw APIError.internal("Failed to create warning", error);
    }
  }
);
