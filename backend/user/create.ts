import { api, APIError } from "encore.dev/api";
import { userDB } from "./db";
import { CreateUserRequest, User } from "./types";

// Creates a new user in the system.
export const create = api<CreateUserRequest, User>(
  { expose: true, method: "POST", path: "/users" },
  async (req) => {
    try {
      const row = await userDB.queryRow<User>`
        INSERT INTO users (email, name, user_type, student_id, department, phone, address)
        VALUES (${req.email}, ${req.name}, ${req.userType}, ${req.studentId || null}, ${req.department || null}, ${req.phone || null}, ${req.address || null})
        RETURNING id, email, name, user_type as "userType", student_id as "studentId", department, phone, address, created_at as "createdAt", updated_at as "updatedAt"
      `;
      
      if (!row) {
        throw APIError.internal("Failed to create user");
      }
      
      return row;
    } catch (error: any) {
      if (error.code === "23505") {
        throw APIError.alreadyExists("User with this email or student ID already exists");
      }
      throw APIError.internal("Failed to create user", error);
    }
  }
);
