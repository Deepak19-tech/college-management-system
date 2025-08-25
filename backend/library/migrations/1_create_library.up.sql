CREATE TABLE books (
  id BIGSERIAL PRIMARY KEY,
  isbn VARCHAR(20) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255) NOT NULL,
  publisher VARCHAR(255),
  publication_year INTEGER,
  category VARCHAR(100),
  total_copies INTEGER NOT NULL DEFAULT 1,
  available_copies INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE book_borrowings (
  id BIGSERIAL PRIMARY KEY,
  book_id BIGINT NOT NULL,
  student_id BIGINT NOT NULL,
  borrowed_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  return_date DATE,
  fine_amount DECIMAL(10,2) DEFAULT 0.00,
  status VARCHAR(20) DEFAULT 'borrowed' CHECK (status IN ('borrowed', 'returned', 'overdue')),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_books_isbn ON books(isbn);
CREATE INDEX idx_books_title ON books(title);
CREATE INDEX idx_books_author ON books(author);
CREATE INDEX idx_books_category ON books(category);
CREATE INDEX idx_borrowings_book ON book_borrowings(book_id);
CREATE INDEX idx_borrowings_student ON book_borrowings(student_id);
CREATE INDEX idx_borrowings_status ON book_borrowings(status);
CREATE INDEX idx_borrowings_due_date ON book_borrowings(due_date);
