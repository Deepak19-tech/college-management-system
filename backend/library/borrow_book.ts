import { api, APIError } from "encore.dev/api";
import { libraryDB } from "./db";
import { BorrowBookRequest, BookBorrowing } from "./types";

// Allows a student to borrow a book from the library.
export const borrowBook = api<BorrowBookRequest, BookBorrowing>(
  { expose: true, method: "POST", path: "/library/borrow" },
  async (req) => {
    try {
      await libraryDB.exec`BEGIN`;

      // Check if book is available
      const book = await libraryDB.queryRow`
        SELECT available_copies FROM books WHERE id = ${req.bookId}
      `;

      if (!book) {
        await libraryDB.exec`ROLLBACK`;
        throw APIError.notFound("Book not found");
      }

      if (book.available_copies <= 0) {
        await libraryDB.exec`ROLLBACK`;
        throw APIError.failedPrecondition("Book is not available");
      }

      // Create borrowing record
      const borrowing = await libraryDB.queryRow<BookBorrowing>`
        INSERT INTO book_borrowings (book_id, student_id, due_date, notes)
        VALUES (${req.bookId}, ${req.studentId}, ${req.dueDate}, ${req.notes || null})
        RETURNING id, book_id as "bookId", student_id as "studentId", 
                  borrowed_date as "borrowedDate", due_date as "dueDate", return_date as "returnDate",
                  fine_amount as "fineAmount", status, notes, created_at as "createdAt", updated_at as "updatedAt"
      `;

      if (!borrowing) {
        await libraryDB.exec`ROLLBACK`;
        throw APIError.internal("Failed to create borrowing record");
      }

      // Update available copies
      await libraryDB.exec`
        UPDATE books 
        SET available_copies = available_copies - 1, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${req.bookId}
      `;

      await libraryDB.exec`COMMIT`;
      return borrowing;
    } catch (error: any) {
      await libraryDB.exec`ROLLBACK`;
      throw APIError.internal("Failed to borrow book", error);
    }
  }
);
