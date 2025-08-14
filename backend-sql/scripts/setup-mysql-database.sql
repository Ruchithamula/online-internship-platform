-- MySQL Database Setup for Online Internship Platform
-- Database: u544973759_YugaYatra@123
-- User: u544973759_internship123

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password VARCHAR(255) NOT NULL,
    user_type ENUM('student', 'admin') DEFAULT 'student',
    profile_completed BOOLEAN DEFAULT FALSE,
    terms_accepted BOOLEAN DEFAULT FALSE,
    test_enabled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    razorpay_order_id VARCHAR(255) UNIQUE NOT NULL,
    razorpay_payment_id VARCHAR(255),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    description TEXT,
    status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
    payment_method VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create test_attempts table
CREATE TABLE IF NOT EXISTS test_attempts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP NULL,
    score INT DEFAULT 0,
    total_questions INT DEFAULT 35,
    correct_answers INT DEFAULT 0,
    time_taken INT DEFAULT 0, -- in seconds
    warnings_count INT DEFAULT 0,
    status ENUM('in_progress', 'completed', 'abandoned') DEFAULT 'in_progress',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create questions table
CREATE TABLE IF NOT EXISTS questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    question_text TEXT NOT NULL,
    option_a TEXT NOT NULL,
    option_b TEXT NOT NULL,
    option_c TEXT NOT NULL,
    option_d TEXT NOT NULL,
    correct_answer CHAR(1) NOT NULL,
    explanation TEXT,
    difficulty ENUM('easy', 'medium', 'hard') DEFAULT 'medium',
    category VARCHAR(100) DEFAULT 'software_engineering',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create student_answers table
CREATE TABLE IF NOT EXISTS student_answers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    test_attempt_id INT NOT NULL,
    question_id INT NOT NULL,
    selected_answer CHAR(1),
    is_correct BOOLEAN DEFAULT FALSE,
    time_taken INT DEFAULT 0, -- in seconds
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (test_attempt_id) REFERENCES test_attempts(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);

-- Create terms_agreements table
CREATE TABLE IF NOT EXISTS terms_agreements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    terms_version VARCHAR(20) DEFAULT '1.0',
    accepted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert default admin user
INSERT INTO users (name, email, password, user_type, profile_completed, terms_accepted, test_enabled) 
VALUES ('Admin', 'admin@onlyinternship.in', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', TRUE, TRUE, TRUE)
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;

-- Insert sample software engineering questions
INSERT INTO questions (question_text, option_a, option_b, option_c, option_d, correct_answer, difficulty, category) VALUES
('What is the primary purpose of version control systems like Git?', 'To backup code files', 'To track changes and collaborate on code', 'To compile code', 'To debug code', 'B', 'easy', 'software_engineering'),
('Which design pattern is used to ensure only one instance of a class exists?', 'Factory Pattern', 'Singleton Pattern', 'Observer Pattern', 'Strategy Pattern', 'B', 'medium', 'software_engineering'),
('What does API stand for in software development?', 'Application Programming Interface', 'Advanced Programming Interface', 'Automated Programming Interface', 'Application Process Integration', 'A', 'easy', 'software_engineering'),
('Which of the following is NOT a valid HTTP method?', 'GET', 'POST', 'UPDATE', 'DELETE', 'C', 'easy', 'software_engineering'),
('What is the purpose of unit testing?', 'To test the entire application', 'To test individual components in isolation', 'To test user interface', 'To test database connections', 'B', 'medium', 'software_engineering'),
('Which data structure operates on LIFO principle?', 'Queue', 'Stack', 'Tree', 'Graph', 'B', 'easy', 'software_engineering'),
('What is the time complexity of binary search?', 'O(1)', 'O(log n)', 'O(n)', 'O(n²)', 'B', 'medium', 'software_engineering'),
('Which programming paradigm emphasizes data and functions that operate on that data?', 'Procedural', 'Object-Oriented', 'Functional', 'Event-Driven', 'B', 'medium', 'software_engineering'),
('What is the purpose of a constructor in object-oriented programming?', 'To destroy objects', 'To initialize object state', 'To handle errors', 'To manage memory', 'B', 'easy', 'software_engineering'),
('Which of the following is a non-relational database?', 'MySQL', 'PostgreSQL', 'MongoDB', 'Oracle', 'C', 'medium', 'software_engineering');

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_user_type ON users(user_type);
CREATE INDEX idx_payments_student_id ON payments(student_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_test_attempts_student_id ON test_attempts(student_id);
CREATE INDEX idx_test_attempts_status ON test_attempts(status);
CREATE INDEX idx_student_answers_test_attempt_id ON student_answers(test_attempt_id);
CREATE INDEX idx_questions_category ON questions(category);
CREATE INDEX idx_questions_difficulty ON questions(difficulty);

-- Show table creation status
SELECT 'Database setup completed successfully!' as status;
