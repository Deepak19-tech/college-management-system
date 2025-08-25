import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import { communicationDB } from "./db";
import { ListAnnouncementsResponse, Announcement } from "./types";

interface ListAnnouncementsRequest {
  targetAudience?: Query<string>;
  courseId?: Query<number>;
  isActive?: Query<boolean>;
}

// Retrieves announcements, optionally filtered by audience, course, or active status.
export const listAnnouncements = api<ListAnnouncementsRequest, ListAnnouncementsResponse>(
  { expose: true, method: "GET", path: "/communication/announcements" },
  async (req) => {
    let query = `
      SELECT id, author_id as "authorId", title, content, target_audience as "targetAudience", 
             course_id as "courseId", is_active as "isActive", created_at as "createdAt", updated_at as "updatedAt"
      FROM announcements
    `;
    const params: any[] = [];
    const conditions: string[] = [];

    if (req.targetAudience) {
      conditions.push(`(target_audience = $${params.length + 1} OR target_audience = 'all')`);
      params.push(req.targetAudience);
    }

    if (req.courseId) {
      conditions.push(`course_id = $${params.length + 1}`);
      params.push(req.courseId);
    }

    if (req.isActive !== undefined) {
      conditions.push(`is_active = $${params.length + 1}`);
      params.push(req.isActive);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(" AND ")}`;
    }

    query += ` ORDER BY created_at DESC`;

    const announcements = await communicationDB.rawQueryAll<Announcement>(query, ...params);
    return { announcements };
  }
);
