export interface Book {
  id: number;
  isbn: string;
  title: string;
  author: string;
  publisher?: string;
  publicationYear?: number;
  category?: string;
  totalCopies: number;
  availableCopies: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBookRequest {
  isbn: string;
  title: string;
  author: string;
  publisher?: string;
  publicationYear?: number;
  category?: string;
  totalCopies?: number;
}

export interface UpdateBookRequest {
  id: number;
  isbn?: string;
  title?: string;
  author?: string;
  publisher?: string;
  publicationYear?: number;
  category?: string;
  totalCopies?: number;
}

export type BorrowingStatus = "borrowed" | "returned" | "overdue";

export interface BookBorrowing {
  id: number;
  bookId: number;
  studentId: number;
  borrowedDate: Date;
  dueDate: Date;
  returnDate?: Date;
  fineAmount: number;
  status: BorrowingStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BorrowBookRequest {
  bookId: number;
  studentId: number;
  dueDate: Date;
  notes?: string;
}

export interface ReturnBookRequest {
  borrowingId: number;
  returnDate?: Date;
  notes?: string;
}

export interface ListBooksResponse {
  books: Book[];
}

export interface ListBorrowingsResponse {
  borrowings: BookBorrowing[];
}

export interface StudentFinesSummary {
  studentId: number;
  totalFines: number;
  activeBorrowings: number;
  overdueBorrowings: number;
}

export interface LibraryStatsResponse {
  totalBooks: number;
  totalBorrowings: number;
  activeBorrowings: number;
  overdueBorrowings: number;
  totalFines: number;
}
