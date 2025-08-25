import { api, APIError } from "encore.dev/api";
import { communicationDB } from "./db";

interface MarkReadRequest {
  messageId: number;
}

// Marks a message as read.
export const markRead = api<MarkReadRequest, void>(
  { expose: true, method: "PUT", path: "/communication/messages/:messageId/read" },
  async (req) => {
    const result = await communicationDB.queryRow`
      UPDATE messages 
      SET is_read = TRUE, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${req.messageId}
      RETURNING id
    `;

    if (!result) {
      throw APIError.notFound("Message not found");
    }
  }
);
