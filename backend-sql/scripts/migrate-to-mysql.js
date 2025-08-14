const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// MySQL Database Configuration using Hostinger credentials
const dbConfig = {
  host: 'localhost',
  user: 'u544973759_internship123',
  password: 'jZ-NjmfQ@C4',
  database: 'u544973759_YugaYatra@123',
  port: 3306,
  multipleStatements: true
};

// Sample data to migrate from old databases
const sampleData = {
  questions: [
    {
      question_text: 'What is the primary purpose of version control systems like Git?',
      option_a: 'To backup code files',
      option_b: 'To track changes and collaborate on code',
      option_c: 'To compile code',
      option_d: 'To debug code',
      correct_answer: 'B',
      difficulty: 'easy',
      category: 'software_engineering',
      explanation: 'Git is primarily used for tracking changes in source code and enabling collaboration among developers.'
    },
    {
      question_text: 'Which design pattern is used to ensure only one instance of a class exists?',
      option_a: 'Factory Pattern',
      option_b: 'Singleton Pattern',
      option_c: 'Observer Pattern',
      option_d: 'Strategy Pattern',
      correct_answer: 'B',
      difficulty: 'medium',
      category: 'software_engineering',
      explanation: 'The Singleton pattern ensures that a class has only one instance and provides a global point of access to it.'
    },
    {
      question_text: 'What does API stand for in software development?',
      option_a: 'Application Programming Interface',
      option_b: 'Advanced Programming Interface',
      option_c: 'Automated Programming Interface',
      option_d: 'Application Process Integration',
      correct_answer: 'A',
      difficulty: 'easy',
      category: 'software_engineering',
      explanation: 'API stands for Application Programming Interface, which defines how software components should interact.'
    },
    {
      question_text: 'Which of the following is NOT a valid HTTP method?',
      option_a: 'GET',
      option_b: 'POST',
      option_c: 'UPDATE',
      option_d: 'DELETE',
      correct_answer: 'C',
      difficulty: 'easy',
      category: 'software_engineering',
      explanation: 'UPDATE is not a standard HTTP method. The standard methods are GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS.'
    },
    {
      question_text: 'What is the purpose of unit testing?',
      option_a: 'To test the entire application',
      option_b: 'To test individual components in isolation',
      option_c: 'To test user interface',
      option_d: 'To test database connections',
      correct_answer: 'B',
      difficulty: 'medium',
      category: 'software_engineering',
      explanation: 'Unit testing focuses on testing individual components or functions in isolation to ensure they work correctly.'
    },
    {
      question_text: 'Which data structure operates on LIFO principle?',
      option_a: 'Queue',
      option_b: 'Stack',
      option_c: 'Tree',
      option_d: 'Graph',
      correct_answer: 'B',
      difficulty: 'easy',
      category: 'software_engineering',
      explanation: 'A Stack operates on LIFO (Last In, First Out) principle where the last element added is the first one removed.'
    },
    {
      question_text: 'What is the time complexity of binary search?',
      option_a: 'O(1)',
      option_b: 'O(log n)',
      option_c: 'O(n)',
      option_d: 'O(n²)',
      correct_answer: 'B',
      difficulty: 'medium',
      category: 'software_engineering',
      explanation: 'Binary search has a time complexity of O(log n) as it divides the search space in half with each iteration.'
    },
    {
      question_text: 'Which programming paradigm emphasizes data and functions that operate on that data?',
      option_a: 'Procedural',
      option_b: 'Object-Oriented',
      option_c: 'Functional',
      option_d: 'Event-Driven',
      correct_answer: 'B',
      difficulty: 'medium',
      category: 'software_engineering',
      explanation: 'Object-Oriented programming emphasizes organizing code into objects that contain both data and methods.'
    },
    {
      question_text: 'What is the purpose of a constructor in object-oriented programming?',
      option_a: 'To destroy objects',
      option_b: 'To initialize object state',
      option_c: 'To handle errors',
      option_d: 'To manage memory',
      correct_answer: 'B',
      difficulty: 'easy',
      category: 'software_engineering',
      explanation: 'A constructor is a special method used to initialize the state of an object when it is created.'
    },
    {
      question_text: 'Which of the following is a non-relational database?',
      option_a: 'MySQL',
      option_b: 'PostgreSQL',
      option_c: 'MongoDB',
      option_d: 'Oracle',
      correct_answer: 'C',
      difficulty: 'medium',
      category: 'software_engineering',
      explanation: 'MongoDB is a NoSQL (non-relational) database, while MySQL, PostgreSQL, and Oracle are relational databases.'
    },
    {
      question_text: 'What is the difference between == and === in JavaScript?',
      option_a: 'No difference',
      option_b: '== checks value and type, === checks only value',
      option_c: '== checks only value, === checks value and type',
      option_d: '== is deprecated, === is modern syntax',
      correct_answer: 'C',
      difficulty: 'medium',
      category: 'software_engineering',
      explanation: '== performs type coercion and checks value, while === checks both value and type without coercion.'
    },
    {
      question_text: 'What is the purpose of the "use strict" directive in JavaScript?',
      option_a: 'To enable strict mode for better performance',
      option_b: 'To enforce stricter parsing and error handling',
      option_c: 'To enable modern JavaScript features',
      option_d: 'To disable deprecated features',
      correct_answer: 'B',
      difficulty: 'medium',
      category: 'software_engineering',
      explanation: '"use strict" enables strict mode which catches common coding mistakes and prevents certain actions.'
    },
    {
      question_text: 'Which of the following is NOT a JavaScript framework?',
      option_a: 'React',
      option_b: 'Angular',
      option_c: 'Vue.js',
      option_d: 'Django',
      correct_answer: 'D',
      difficulty: 'easy',
      category: 'software_engineering',
      explanation: 'Django is a Python web framework, not a JavaScript framework. React, Angular, and Vue.js are JavaScript frameworks.'
    },
    {
      question_text: 'What is the purpose of CSS Grid?',
      option_a: 'To create responsive images',
      option_b: 'To create two-dimensional layouts',
      option_c: 'To style text elements',
      option_d: 'To create animations',
      correct_answer: 'B',
      difficulty: 'medium',
      category: 'software_engineering',
      explanation: 'CSS Grid is a layout system designed for creating two-dimensional layouts with rows and columns.'
    },
    {
      question_text: 'What is the purpose of a callback function?',
      option_a: 'To return multiple values',
      option_b: 'To execute code after an asynchronous operation completes',
      option_c: 'To create loops',
      option_d: 'To define classes',
      correct_answer: 'B',
      difficulty: 'medium',
      category: 'software_engineering',
      explanation: 'A callback function is executed after an asynchronous operation completes, allowing for non-blocking code execution.'
    }
  ]
};

async function migrateToMySQL() {
  let connection;
  
  try {
    console.log('🔌 Connecting to MySQL database...');
    
    // First connect without database to create it if it doesn't exist
    const tempConnection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password,
      port: dbConfig.port
    });

    // Create database if it doesn't exist
    await tempConnection.execute(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\``);
    console.log(`✅ Database '${dbConfig.database}' created/verified`);
    
    await tempConnection.end();

    // Now connect to the specific database
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to MySQL database successfully');

    // Create all required tables
    console.log('📝 Creating database tables...');
    
    const createTablesSQL = `
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
          time_taken INT DEFAULT 0,
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
          time_taken INT DEFAULT 0,
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
    `;

    await connection.execute(createTablesSQL);
    console.log('✅ All tables created successfully');

    // Create indexes for better performance
    console.log('📊 Creating database indexes...');
    const createIndexesSQL = `
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_user_type ON users(user_type);
      CREATE INDEX IF NOT EXISTS idx_payments_student_id ON payments(student_id);
      CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
      CREATE INDEX IF NOT EXISTS idx_test_attempts_student_id ON test_attempts(student_id);
      CREATE INDEX IF NOT EXISTS idx_test_attempts_status ON test_attempts(status);
      CREATE INDEX IF NOT EXISTS idx_student_answers_test_attempt_id ON student_answers(test_attempt_id);
      CREATE INDEX IF NOT EXISTS idx_questions_category ON questions(category);
      CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON questions(difficulty);
    `;

    await connection.execute(createIndexesSQL);
    console.log('✅ All indexes created successfully');

    // Insert default admin user
    console.log('👤 Setting up default admin account...');
    const adminPassword = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'; // "Admin"
    const insertAdminSQL = `
      INSERT INTO users (name, email, password, user_type, profile_completed, terms_accepted, test_enabled) 
      VALUES ('Admin', 'admin@onlyinternship.in', ?, 'admin', TRUE, TRUE, TRUE)
      ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP
    `;
    
    await connection.execute(insertAdminSQL, [adminPassword]);
    console.log('✅ Default admin account created');

    // Insert sample questions
    console.log('📝 Inserting sample questions...');
    for (const question of sampleData.questions) {
      const insertQuestionSQL = `
        INSERT INTO questions (question_text, option_a, option_b, option_c, option_d, correct_answer, difficulty, category, explanation)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP
      `;
      
      await connection.execute(insertQuestionSQL, [
        question.question_text,
        question.option_a,
        question.option_b,
        question.option_c,
        question.option_d,
        question.correct_answer,
        question.difficulty,
        question.category,
        question.explanation
      ]);
    }
    console.log(`✅ ${sampleData.questions.length} sample questions inserted`);

    console.log('\n🎉 Migration to MySQL completed successfully!');
    console.log('\n📊 Database Summary:');
    console.log('   - Database: ' + dbConfig.database);
    console.log('   - Tables: 6 (users, payments, test_attempts, questions, student_answers, terms_agreements)');
    console.log('   - Sample Questions: ' + sampleData.questions.length);
    console.log('   - Default Admin: Username: Admin, Password: Admin');
    
    console.log('\n🚀 Next Steps:');
    console.log('   1. Start the backend server: npm start');
    console.log('   2. The frontend will connect to: http://localhost:5000');
    console.log('   3. Admin login: /admin/login (Admin/Admin)');
    console.log('   4. Student registration: /student/register');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n💡 Possible solutions:');
      console.error('   1. Check if the database user exists in Hostinger');
      console.error('   2. Verify the password is correct');
      console.error('   3. Ensure the user has CREATE privileges');
    }
    
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed');
    }
  }
}

// Run the migration
migrateToMySQL();
