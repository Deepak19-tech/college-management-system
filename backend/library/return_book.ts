import { api, APIError } from "encore.dev/api";
import { libraryDB } from "./db";
import { ReturnBookRequest, BookBorrowing } from "./types";

// Processes the return of a borrowed book and calculates any fines.
export const returnBook = api<ReturnBookRequest, BookBorrowing>(
  { expose: true, method: "PUT", path: "/library/return" },
  async (req) => {
    try {
      await libraryDB.exec`BEGIN`;

      const returnDate = req.returnDate || new Date();

      // Get borrowing details
      const borrowing = await libraryDB.queryRow`
        SELECT book_id, due_date, status FROM book_borrowings WHERE id = ${req.borrowingId}
      `;

      if (!borrowing) {
        await libraryDB.exec`ROLLBACK`;
        throw APIError.notFound("Borrowing record not found");
      }

      if (borrowing.status === "returned") {
        await libraryDB.exec`ROLLBACK`;
        throw APIError.failedPrecondition("Book has already been returned");
      }

      // Calculate fine (assuming $1 per day late)
      const dueDate = new Date(borrowing.due_date);
      const daysDiff = Math.ceil((returnDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
      const fineAmount = daysDiff > 0 ? daysDiff * 1.0 : 0;

      // Update borrowing record
      const updatedBorrowing = await libraryDB.queryRow<BookBorrowing>`
        UPDATE book_borrowings 
        SET return_date = ${returnDate}, fine_amount = ${fineAmount}, status = 'returned', 
            notes = ${req.notes || null}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${req.borrowingId}
        RETURNING id, book_id as "bookId", student_id as "studentId", 
                  borrowed_date as "borrowedDate", due_date as "dueDate", return_date as "returnDate",
                  fine_amount as "fineAmount", status, notes, created_at as "createdAt", updated_at as "updatedAt"
      `;

      if (!updatedBorrowing) {
        await libraryDB.exec`ROLLBACK`;
        throw APIError.internal("Failed to update borrowing record");
      }

      // Update available copies
      await libraryDB.exec`
        UPDATE books 
        SET available_copies = available_copies + 1, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${borrowing.book_id}
      `;

      await libraryDB.exec`COMMIT`;
      return updatedBorrowing;
    } catch (error: any) {
      await libraryDB.exec`ROLLBACK`;
      throw APIError.internal("Failed to return book", error);
    }
  }
);
