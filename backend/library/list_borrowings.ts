import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import { libraryDB } from "./db";
import { ListBorrowingsResponse, BookBorrowing } from "./types";

interface ListBorrowingsRequest {
  studentId?: Query<number>;
  bookId?: Query<number>;
  status?: Query<string>;
  overdue?: Query<boolean>;
}

// Retrieves borrowing records, optionally filtered by student, book, status, or overdue status.
export const listBorrowings = api<ListBorrowingsRequest, ListBorrowingsResponse>(
  { expose: true, method: "GET", path: "/library/borrowings" },
  async (req) => {
    let query = `
      SELECT id, book_id as "bookId", student_id as "studentId", 
             borrowed_date as "borrowedDate", due_date as "dueDate", return_date as "returnDate",
             fine_amount as "fineAmount", status, notes, created_at as "createdAt", updated_at as "updatedAt"
      FROM book_borrowings
    `;
    const params: any[] = [];
    const conditions: string[] = [];

    if (req.studentId) {
      conditions.push(`student_id = $${params.length + 1}`);
      params.push(req.studentId);
    }

    if (req.bookId) {
      conditions.push(`book_id = $${params.length + 1}`);
      params.push(req.bookId);
    }

    if (req.status) {
      conditions.push(`status = $${params.length + 1}`);
      params.push(req.status);
    }

    if (req.overdue) {
      conditions.push(`due_date < CURRENT_DATE AND status = 'borrowed'`);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(" AND ")}`;
    }

    query += ` ORDER BY borrowed_date DESC`;

    const borrowings = await libraryDB.rawQueryAll<BookBorrowing>(query, ...params);
    return { borrowings };
  }
);
