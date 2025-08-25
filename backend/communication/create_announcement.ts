import { api, APIError } from "encore.dev/api";
import { communicationDB } from "./db";
import { CreateAnnouncementRequest, Announcement } from "./types";

interface CreateAnnouncementWithAuthorRequest extends CreateAnnouncementRequest {
  authorId: number;
}

// Creates a new announcement.
export const createAnnouncement = api<CreateAnnouncementWithAuthorRequest, Announcement>(
  { expose: true, method: "POST", path: "/communication/announcements" },
  async (req) => {
    try {
      const announcement = await communicationDB.queryRow<Announcement>`
        INSERT INTO announcements (author_id, title, content, target_audience, course_id)
        VALUES (${req.authorId}, ${req.title}, ${req.content}, ${req.targetAudience}, ${req.courseId || null})
        RETURNING id, author_id as "authorId", title, content, target_audience as "targetAudience", 
                  course_id as "courseId", is_active as "isActive", created_at as "createdAt", updated_at as "updatedAt"
      `;

      if (!announcement) {
        throw APIError.internal("Failed to create announcement");
      }

      return announcement;
    } catch (error: any) {
      throw APIError.internal("Failed to create announcement", error);
    }
  }
);
