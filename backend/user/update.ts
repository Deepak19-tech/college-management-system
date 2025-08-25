import { api, APIError } from "encore.dev/api";
import { userDB } from "./db";
import { UpdateUserRequest, User } from "./types";

// Updates an existing user.
export const update = api<UpdateUserRequest, User>(
  { expose: true, method: "PUT", path: "/users/:id" },
  async (req) => {
    const updates: string[] = [];
    const params: any[] = [];

    if (req.email !== undefined) {
      updates.push(`email = $${params.length + 1}`);
      params.push(req.email);
    }
    if (req.name !== undefined) {
      updates.push(`name = $${params.length + 1}`);
      params.push(req.name);
    }
    if (req.department !== undefined) {
      updates.push(`department = $${params.length + 1}`);
      params.push(req.department);
    }
    if (req.phone !== undefined) {
      updates.push(`phone = $${params.length + 1}`);
      params.push(req.phone);
    }
    if (req.address !== undefined) {
      updates.push(`address = $${params.length + 1}`);
      params.push(req.address);
    }

    if (updates.length === 0) {
      throw APIError.invalidArgument("No fields to update");
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    params.push(req.id);

    const query = `
      UPDATE users 
      SET ${updates.join(", ")}
      WHERE id = $${params.length}
      RETURNING id, email, name, user_type as "userType", student_id as "studentId", 
                department, phone, address, created_at as "createdAt", updated_at as "updatedAt"
    `;

    const user = await userDB.rawQueryRow<User>(query, ...params);

    if (!user) {
      throw APIError.notFound("User not found");
    }

    return user;
  }
);
