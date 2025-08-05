const { executeQuery, executeQueryRun } = require('../config/database-sqlite');

const createTables = async () => {
  console.log('🚀 Starting SQLite database migration...');

  // Create students table
  const createStudentsTable = `
    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      phone TEXT,
      college TEXT,
      roll_number TEXT,
      branch TEXT,
      year_of_study INTEGER,
      profile_complete INTEGER DEFAULT 0,
      email_verified INTEGER DEFAULT 0,
      active INTEGER DEFAULT 1,
      login_attempts INTEGER DEFAULT 0,
      lock_until TEXT,
      reset_password_token TEXT,
      reset_password_expires TEXT,
      verification_token TEXT,
      verification_token_expiry TEXT,
      otp TEXT,
      otp_expiry TEXT,
      last_otp_sent TEXT,
      last_login TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `;

  // Create terms_acceptance table
  const createTermsAcceptanceTable = `
    CREATE TABLE IF NOT EXISTS terms_acceptance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      terms_version TEXT NOT NULL,
      accepted_at TEXT DEFAULT CURRENT_TIMESTAMP,
      ip_address TEXT,
      user_agent TEXT,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
    )
  `;

  // Create payments table
  const createPaymentsTable = `
    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      razorpay_order_id TEXT UNIQUE NOT NULL,
      razorpay_payment_id TEXT UNIQUE,
      amount REAL NOT NULL,
      currency TEXT DEFAULT 'INR',
      status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
      payment_method TEXT,
      description TEXT,
      receipt_url TEXT,
      refund_amount REAL,
      refund_date TEXT,
      refund_reason TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
    )
  `;

  // Create student_status table
  const createStudentStatusTable = `
    CREATE TABLE IF NOT EXISTS student_status (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL UNIQUE,
      terms_accepted INTEGER DEFAULT 0,
      payment_completed INTEGER DEFAULT 0,
      profile_complete INTEGER DEFAULT 0,
      can_access_tests INTEGER DEFAULT 0,
      status_updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
    )
  `;

  // Create terms_versions table
  const createTermsVersionsTable = `
    CREATE TABLE IF NOT EXISTS terms_versions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      version TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      is_active INTEGER DEFAULT 1,
      effective_date TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `;

  // Create sessions table
  const createSessionsTable = `
    CREATE TABLE IF NOT EXISTS sessions (
      session_id TEXT PRIMARY KEY,
      expires INTEGER NOT NULL,
      data TEXT
    )
  `;

  // Create test_attempts table
  const createTestAttemptsTable = `
    CREATE TABLE IF NOT EXISTS test_attempts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      attempt_number INTEGER NOT NULL,
      start_time TEXT DEFAULT CURRENT_TIMESTAMP,
      end_time TEXT,
      duration_seconds INTEGER,
      score REAL,
      total_questions INTEGER,
      correct_answers INTEGER,
      wrong_answers INTEGER,
      unanswered_questions INTEGER,
      warnings_count INTEGER DEFAULT 0,
      status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned', 'disqualified')),
      answers_json TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
      UNIQUE(student_id, attempt_number)
    )
  `;

  try {
    // Execute all table creation queries
    const tables = [
      { name: 'students', query: createStudentsTable },
      { name: 'terms_versions', query: createTermsVersionsTable },
      { name: 'terms_acceptance', query: createTermsAcceptanceTable },
      { name: 'payments', query: createPaymentsTable },
      { name: 'student_status', query: createStudentStatusTable },
      { name: 'sessions', query: createSessionsTable },
      { name: 'test_attempts', query: createTestAttemptsTable }
    ];

    for (const table of tables) {
      const result = await executeQueryRun(table.query);
      if (result.success) {
        console.log(`✅ Table '${table.name}' created successfully`);
      } else {
        console.error(`❌ Failed to create table '${table.name}':`, result.error);
        return false;
      }
    }

    // Insert default terms and conditions
    const insertDefaultTerms = `
      INSERT OR IGNORE INTO terms_versions (version, title, content, effective_date) VALUES 
      ('1.0', 'Terms and Conditions', 
      'By accepting these terms and conditions, you agree to:

1. Use the platform responsibly and ethically
2. Not share your login credentials with others
3. Complete tests independently without external assistance
4. Respect intellectual property rights
5. Pay the required fees for test access
6. Follow all platform rules and guidelines
7. Accept that test results are final and binding
8. Understand that the platform reserves the right to modify terms

Your acceptance of these terms is required to proceed with payment and test access.', 
      date('now'))
    `;

    const termsResult = await executeQueryRun(insertDefaultTerms);
    if (termsResult.success) {
      console.log('✅ Default terms and conditions inserted');
    } else {
      console.error('❌ Failed to insert default terms:', termsResult.error);
    }

    // Create indexes for better performance
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_students_email ON students(email)',
      'CREATE INDEX IF NOT EXISTS idx_students_active ON students(active)',
      'CREATE INDEX IF NOT EXISTS idx_students_otp ON students(otp)',
      'CREATE INDEX IF NOT EXISTS idx_terms_acceptance_student_id ON terms_acceptance(student_id)',
      'CREATE INDEX IF NOT EXISTS idx_payments_student_id ON payments(student_id)',
      'CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status)',
      'CREATE INDEX IF NOT EXISTS idx_test_attempts_student_id ON test_attempts(student_id)',
      'CREATE INDEX IF NOT EXISTS idx_test_attempts_status ON test_attempts(status)',
      'CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires)'
    ];

    for (const indexQuery of indexes) {
      await executeQueryRun(indexQuery);
    }

    console.log('🎉 SQLite database migration completed successfully!');
    return true;

  } catch (error) {
    console.error('❌ Migration failed:', error);
    return false;
  }
};

// Run migration if this file is executed directly
if (require.main === module) {
  createTables()
    .then((success) => {
      if (success) {
        console.log('✅ Migration completed successfully');
        process.exit(0);
      } else {
        console.log('❌ Migration failed');
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error('❌ Migration error:', error);
      process.exit(1);
    });
}

module.exports = { createTables }; 