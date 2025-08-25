import { api } from "encore.dev/api";
import { libraryDB } from "./db";
import { LibraryStatsResponse } from "./types";

// Retrieves library statistics including total books, borrowings, and fines.
export const getStats = api<void, LibraryStatsResponse>(
  { expose: true, method: "GET", path: "/library/stats" },
  async () => {
    const stats = await libraryDB.queryRow`
      SELECT 
        (SELECT COUNT(*) FROM books) as total_books,
        (SELECT COUNT(*) FROM book_borrowings) as total_borrowings,
        (SELECT COUNT(*) FROM book_borrowings WHERE status = 'borrowed') as active_borrowings,
        (SELECT COUNT(*) FROM book_borrowings WHERE status = 'borrowed' AND due_date < CURRENT_DATE) as overdue_borrowings,
        (SELECT COALESCE(SUM(fine_amount), 0) FROM book_borrowings) as total_fines
    `;

    return {
      totalBooks: stats?.total_books || 0,
      totalBorrowings: stats?.total_borrowings || 0,
      activeBorrowings: stats?.active_borrowings || 0,
      overdueBorrowings: stats?.overdue_borrowings || 0,
      totalFines: parseFloat(stats?.total_fines || "0"),
    };
  }
);
