import { api, APIError } from "encore.dev/api";
import { libraryDB } from "./db";
import { CreateBookRequest, Book } from "./types";

// Creates a new book in the library.
export const createBook = api<CreateBookRequest, Book>(
  { expose: true, method: "POST", path: "/library/books" },
  async (req) => {
    try {
      const totalCopies = req.totalCopies || 1;
      const row = await libraryDB.queryRow<Book>`
        INSERT INTO books (isbn, title, author, publisher, publication_year, category, total_copies, available_copies)
        VALUES (${req.isbn}, ${req.title}, ${req.author}, ${req.publisher || null}, 
                ${req.publicationYear || null}, ${req.category || null}, ${totalCopies}, ${totalCopies})
        RETURNING id, isbn, title, author, publisher, publication_year as "publicationYear", 
                  category, total_copies as "totalCopies", available_copies as "availableCopies",
                  created_at as "createdAt", updated_at as "updatedAt"
      `;
      
      if (!row) {
        throw APIError.internal("Failed to create book");
      }
      
      return row;
    } catch (error: any) {
      if (error.code === "23505") {
        throw APIError.alreadyExists("Book with this ISBN already exists");
      }
      throw APIError.internal("Failed to create book", error);
    }
  }
);
