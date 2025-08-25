import { api, APIError } from "encore.dev/api";
import { communicationDB } from "./db";
import { SendMessageRequest, Message } from "./types";

interface SendMessageWithSenderRequest extends SendMessageRequest {
  senderId: number;
}

// Sends a message from one user to another.
export const sendMessage = api<SendMessageWithSenderRequest, Message>(
  { expose: true, method: "POST", path: "/communication/messages" },
  async (req) => {
    try {
      const message = await communicationDB.queryRow<Message>`
        INSERT INTO messages (sender_id, recipient_id, subject, content)
        VALUES (${req.senderId}, ${req.recipientId}, ${req.subject}, ${req.content})
        RETURNING id, sender_id as "senderId", recipient_id as "recipientId", 
                  subject, content, is_read as "isRead", created_at as "createdAt", updated_at as "updatedAt"
      `;

      if (!message) {
        throw APIError.internal("Failed to send message");
      }

      return message;
    } catch (error: any) {
      throw APIError.internal("Failed to send message", error);
    }
  }
);
