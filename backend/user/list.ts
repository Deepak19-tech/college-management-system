import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import { userDB } from "./db";
import { ListUsersResponse, User, UserType } from "./types";

interface ListUsersRequest {
  userType?: Query<UserType>;
  department?: Query<string>;
}

// Retrieves all users, optionally filtered by type or department.
export const list = api<ListUsersRequest, ListUsersResponse>(
  { expose: true, method: "GET", path: "/users" },
  async (req) => {
    let query = `
      SELECT id, email, name, user_type as "userType", student_id as "studentId", 
             department, phone, address, created_at as "createdAt", updated_at as "updatedAt"
      FROM users
    `;
    const params: any[] = [];
    const conditions: string[] = [];

    if (req.userType) {
      conditions.push(`user_type = $${params.length + 1}`);
      params.push(req.userType);
    }

    if (req.department) {
      conditions.push(`department = $${params.length + 1}`);
      params.push(req.department);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(" AND ")}`;
    }

    query += ` ORDER BY name`;

    const users = await userDB.rawQueryAll<User>(query, ...params);
    return { users };
  }
);
