import { api, APIError } from "encore.dev/api";
import { userDB } from "./db";

interface DeleteUserRequest {
  id: number;
}

// Deletes a user from the system.
export const deleteUser = api<DeleteUserRequest, void>(
  { expose: true, method: "DELETE", path: "/users/:id" },
  async (req) => {
    const result = await userDB.queryRow`
      DELETE FROM users WHERE id = ${req.id} RETURNING id
    `;

    if (!result) {
      throw APIError.notFound("User not found");
    }
  }
);
