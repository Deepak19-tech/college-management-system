export type UserType = "student" | "professor" | "admin";

export interface User {
  id: number;
  email: string;
  name: string;
  userType: UserType;
  studentId?: string;
  department?: string;
  phone?: string;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserRequest {
  email: string;
  name: string;
  userType: UserType;
  studentId?: string;
  department?: string;
  phone?: string;
  address?: string;
}

export interface UpdateUserRequest {
  id: number;
  email?: string;
  name?: string;
  department?: string;
  phone?: string;
  address?: string;
}

export interface ListUsersResponse {
  users: User[];
}

export interface GetUserResponse {
  user: User;
}
