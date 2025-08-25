import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import { libraryDB } from "./db";
import { ListBooksResponse, Book } from "./types";

interface ListBooksRequest {
  category?: Query<string>;
  author?: Query<string>;
  search?: Query<string>;
}

// Retrieves all books, optionally filtered by category, author, or search term.
export const listBooks = api<ListBooksRequest, ListBooksResponse>(
  { expose: true, method: "GET", path: "/library/books" },
  async (req) => {
    let query = `
      SELECT id, isbn, title, author, publisher, publication_year as "publicationYear", 
             category, total_copies as "totalCopies", available_copies as "availableCopies",
             created_at as "createdAt", updated_at as "updatedAt"
      FROM books
    `;
    const params: any[] = [];
    const conditions: string[] = [];

    if (req.category) {
      conditions.push(`category = $${params.length + 1}`);
      params.push(req.category);
    }

    if (req.author) {
      conditions.push(`author ILIKE $${params.length + 1}`);
      params.push(`%${req.author}%`);
    }

    if (req.search) {
      conditions.push(`(title ILIKE $${params.length + 1} OR author ILIKE $${params.length + 1} OR isbn ILIKE $${params.length + 1})`);
      params.push(`%${req.search}%`);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(" AND ")}`;
    }

    query += ` ORDER BY title`;

    const books = await libraryDB.rawQueryAll<Book>(query, ...params);
    return { books };
  }
);
