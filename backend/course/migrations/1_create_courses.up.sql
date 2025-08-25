CREATE TABLE courses (
  id BIGSERIAL PRIMARY KEY,
  code VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  credits INTEGER NOT NULL DEFAULT 3,
  department VARCHAR(100) NOT NULL,
  professor_id BIGINT,
  semester VARCHAR(20) NOT NULL,
  year INTEGER NOT NULL,
  max_students INTEGER DEFAULT 50,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE enrollments (
  id BIGSERIAL PRIMARY KEY,
  student_id BIGINT NOT NULL,
  course_id BIGINT NOT NULL,
  enrollment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'dropped', 'completed')),
  grade VARCHAR(5),
  UNIQUE(student_id, course_id)
);

CREATE TABLE attendance (
  id BIGSERIAL PRIMARY KEY,
  student_id BIGINT NOT NULL,
  course_id BIGINT NOT NULL,
  date DATE NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('present', 'absent', 'late')),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(student_id, course_id, date)
);

CREATE INDEX idx_courses_code ON courses(code);
CREATE INDEX idx_courses_department ON courses(department);
CREATE INDEX idx_courses_professor ON courses(professor_id);
CREATE INDEX idx_enrollments_student ON enrollments(student_id);
CREATE INDEX idx_enrollments_course ON enrollments(course_id);
CREATE INDEX idx_attendance_student_course ON attendance(student_id, course_id);
CREATE INDEX idx_attendance_date ON attendance(date);
