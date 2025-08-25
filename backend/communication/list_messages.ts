import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import { communicationDB } from "./db";
import { ListMessagesResponse, Message } from "./types";

interface ListMessagesRequest {
  userId: Query<number>;
  type?: Query<string>;
  isRead?: Query<boolean>;
}

// Retrieves messages for a user, optionally filtered by type or read status.
export const listMessages = api<ListMessagesRequest, ListMessagesResponse>(
  { expose: true, method: "GET", path: "/communication/messages" },
  async (req) => {
    let query = `
      SELECT id, sender_id as "senderId", recipient_id as "recipientId", 
             subject, content, is_read as "isRead", created_at as "createdAt", updated_at as "updatedAt"
      FROM messages
    `;
    const params: any[] = [];
    const conditions: string[] = [];

    if (req.type === "sent") {
      conditions.push(`sender_id = $${params.length + 1}`);
      params.push(req.userId);
    } else {
      conditions.push(`recipient_id = $${params.length + 1}`);
      params.push(req.userId);
    }

    if (req.isRead !== undefined) {
      conditions.push(`is_read = $${params.length + 1}`);
      params.push(req.isRead);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(" AND ")}`;
    }

    query += ` ORDER BY created_at DESC`;

    const messages = await communicationDB.rawQueryAll<Message>(query, ...params);
    return { messages };
  }
);
