import { api, APIError } from "encore.dev/api";
import { userDB } from "./db";
import { GetUserResponse, User } from "./types";

interface GetUserRequest {
  id: number;
}

// Retrieves a user by ID.
export const get = api<GetUserRequest, GetUserResponse>(
  { expose: true, method: "GET", path: "/users/:id" },
  async (req) => {
    const user = await userDB.queryRow<User>`
      SELECT id, email, name, user_type as "userType", student_id as "studentId", 
             department, phone, address, created_at as "createdAt", updated_at as "updatedAt"
      FROM users 
      WHERE id = ${req.id}
    `;

    if (!user) {
      throw APIError.notFound("User not found");
    }

    return { user };
  }
);
