CREATE TABLE messages (
  id BIGSERIAL PRIMARY KEY,
  sender_id BIGINT NOT NULL,
  recipient_id BIGINT NOT NULL,
  subject VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE announcements (
  id BIGSERIAL PRIMARY KEY,
  author_id BIGINT NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  target_audience VARCHAR(20) NOT NULL CHECK (target_audience IN ('all', 'students', 'professors')),
  course_id BIGINT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE warnings (
  id BIGSERIAL PRIMARY KEY,
  student_id BIGINT NOT NULL,
  issued_by BIGINT NOT NULL,
  course_id BIGINT,
  warning_type VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  severity VARCHAR(20) DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high')),
  is_resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_recipient ON messages(recipient_id);
CREATE INDEX idx_messages_read ON messages(is_read);
CREATE INDEX idx_announcements_author ON announcements(author_id);
CREATE INDEX idx_announcements_course ON announcements(course_id);
CREATE INDEX idx_announcements_audience ON announcements(target_audience);
CREATE INDEX idx_warnings_student ON warnings(student_id);
CREATE INDEX idx_warnings_course ON warnings(course_id);
CREATE INDEX idx_warnings_type ON warnings(warning_type);
