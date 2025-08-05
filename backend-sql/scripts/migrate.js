const { executeQuery } = require('../config/database');

const createTables = async () => {
  console.log('🚀 Starting database migration...');

  // Create students table
  const createStudentsTable = `
    IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='students' AND xtype='U')
    CREATE TABLE students (
      id INT IDENTITY(1,1) PRIMARY KEY,
      email NVARCHAR(255) UNIQUE NOT NULL,
      password NVARCHAR(255) NOT NULL,
      name NVARCHAR(255) NOT NULL,
      phone NVARCHAR(20),
      college NVARCHAR(255),
      roll_number NVARCHAR(100),
      branch NVARCHAR(100),
      year_of_study INT,
      profile_complete BIT DEFAULT 0,
      email_verified BIT DEFAULT 0,
      active BIT DEFAULT 1,
      login_attempts INT DEFAULT 0,
      lock_until DATETIME2 NULL,
      reset_password_token NVARCHAR(255),
      reset_password_expires DATETIME2,
      verification_token NVARCHAR(255),
      verification_token_expiry DATETIME2,
      otp NVARCHAR(6),
      otp_expiry DATETIME2,
      last_otp_sent DATETIME2,
      last_login DATETIME2,
      created_at DATETIME2 DEFAULT GETDATE(),
      updated_at DATETIME2 DEFAULT GETDATE()
    );
    
    -- Create indexes
    IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_email' AND object_id = OBJECT_ID('students'))
    CREATE INDEX idx_email ON students(email);
    
    IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_active' AND object_id = OBJECT_ID('students'))
    CREATE INDEX idx_active ON students(active);
    
    IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_created_at' AND object_id = OBJECT_ID('students'))
    CREATE INDEX idx_created_at ON students(created_at);
    
    IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_otp' AND object_id = OBJECT_ID('students'))
    CREATE INDEX idx_otp ON students(otp);
    
    IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_otp_expiry' AND object_id = OBJECT_ID('students'))
    CREATE INDEX idx_otp_expiry ON students(otp_expiry);
    
    IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_verification_token' AND object_id = OBJECT_ID('students'))
    CREATE INDEX idx_verification_token ON students(verification_token);
    
    IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_reset_password_token' AND object_id = OBJECT_ID('students'))
    CREATE INDEX idx_reset_password_token ON students(reset_password_token);
  `;

  // Create terms_acceptance table
  const createTermsAcceptanceTable = `
    IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='terms_acceptance' AND xtype='U')
    CREATE TABLE terms_acceptance (
      id INT IDENTITY(1,1) PRIMARY KEY,
      student_id INT NOT NULL,
      terms_version NVARCHAR(50) NOT NULL,
      accepted_at DATETIME2 DEFAULT GETDATE(),
      ip_address NVARCHAR(45),
      user_agent NTEXT,
      CONSTRAINT FK_terms_acceptance_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
    );
    
    -- Create indexes
    IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_terms_student_id' AND object_id = OBJECT_ID('terms_acceptance'))
    CREATE INDEX idx_terms_student_id ON terms_acceptance(student_id);
    
    IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_terms_accepted_at' AND object_id = OBJECT_ID('terms_acceptance'))
    CREATE INDEX idx_terms_accepted_at ON terms_acceptance(accepted_at);
  `;

  // Create payments table
  const createPaymentsTable = `
    IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='payments' AND xtype='U')
    CREATE TABLE payments (
      id INT IDENTITY(1,1) PRIMARY KEY,
      student_id INT NOT NULL,
      razorpay_order_id NVARCHAR(255) UNIQUE NOT NULL,
      razorpay_payment_id NVARCHAR(255) UNIQUE,
      amount DECIMAL(10,2) NOT NULL,
      currency NVARCHAR(3) DEFAULT 'INR',
      status NVARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
      payment_method NVARCHAR(50),
      description NTEXT,
      receipt_url NVARCHAR(500),
      refund_amount DECIMAL(10,2),
      refund_date DATETIME2,
      refund_reason NTEXT,
      created_at DATETIME2 DEFAULT GETDATE(),
      updated_at DATETIME2 DEFAULT GETDATE(),
      CONSTRAINT FK_payments_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
    );
    
    -- Create indexes
    IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_payments_student_id' AND object_id = OBJECT_ID('payments'))
    CREATE INDEX idx_payments_student_id ON payments(student_id);
    
    IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_payments_status' AND object_id = OBJECT_ID('payments'))
    CREATE INDEX idx_payments_status ON payments(status);
    
    IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_payments_created_at' AND object_id = OBJECT_ID('payments'))
    CREATE INDEX idx_payments_created_at ON payments(created_at);
    
    IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_payments_razorpay_order_id' AND object_id = OBJECT_ID('payments'))
    CREATE INDEX idx_payments_razorpay_order_id ON payments(razorpay_order_id);
  `;

  // Create student_status table
  const createStudentStatusTable = `
    IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='student_status' AND xtype='U')
    CREATE TABLE student_status (
      id INT IDENTITY(1,1) PRIMARY KEY,
      student_id INT NOT NULL,
      terms_accepted BIT DEFAULT 0,
      payment_completed BIT DEFAULT 0,
      profile_complete BIT DEFAULT 0,
      can_access_tests BIT DEFAULT 0,
      status_updated_at DATETIME2 DEFAULT GETDATE(),
      CONSTRAINT FK_student_status_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
      CONSTRAINT UQ_student_status_student UNIQUE (student_id)
    );
    
    -- Create indexes
    IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_student_status_can_access_tests' AND object_id = OBJECT_ID('student_status'))
    CREATE INDEX idx_student_status_can_access_tests ON student_status(can_access_tests);
  `;

  // Create terms_versions table
  const createTermsVersionsTable = `
    IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='terms_versions' AND xtype='U')
    CREATE TABLE terms_versions (
      id INT IDENTITY(1,1) PRIMARY KEY,
      version NVARCHAR(50) UNIQUE NOT NULL,
      title NVARCHAR(255) NOT NULL,
      content NTEXT NOT NULL,
      is_active BIT DEFAULT 1,
      effective_date DATE NOT NULL,
      created_at DATETIME2 DEFAULT GETDATE()
    );
    
    -- Create indexes
    IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_terms_versions_version' AND object_id = OBJECT_ID('terms_versions'))
    CREATE INDEX idx_terms_versions_version ON terms_versions(version);
    
    IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_terms_versions_is_active' AND object_id = OBJECT_ID('terms_versions'))
    CREATE INDEX idx_terms_versions_is_active ON terms_versions(is_active);
  `;

  // Create sessions table
  const createSessionsTable = `
    IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='sessions' AND xtype='U')
    CREATE TABLE sessions (
      session_id NVARCHAR(128) PRIMARY KEY,
      expires INT NOT NULL,
      data NTEXT
    );
    
    -- Create indexes
    IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_sessions_expires' AND object_id = OBJECT_ID('sessions'))
    CREATE INDEX idx_sessions_expires ON sessions(expires);
  `;

  // Create test_attempts table
  const createTestAttemptsTable = `
    IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='test_attempts' AND xtype='U')
    CREATE TABLE test_attempts (
      id INT IDENTITY(1,1) PRIMARY KEY,
      student_id INT NOT NULL,
      attempt_number INT NOT NULL,
      start_time DATETIME2 DEFAULT GETDATE(),
      end_time DATETIME2,
      duration_seconds INT,
      score DECIMAL(5,2),
      total_questions INT,
      correct_answers INT,
      wrong_answers INT,
      unanswered_questions INT,
      warnings_count INT DEFAULT 0,
      status NVARCHAR(20) DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned', 'disqualified')),
      answers_json NTEXT,
      created_at DATETIME2 DEFAULT GETDATE(),
      updated_at DATETIME2 DEFAULT GETDATE(),
      CONSTRAINT FK_test_attempts_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
      CONSTRAINT UQ_student_attempt UNIQUE (student_id, attempt_number)
    );
    
    -- Create indexes
    IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_test_attempts_student_id' AND object_id = OBJECT_ID('test_attempts'))
    CREATE INDEX idx_test_attempts_student_id ON test_attempts(student_id);
    
    IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_test_attempts_status' AND object_id = OBJECT_ID('test_attempts'))
    CREATE INDEX idx_test_attempts_status ON test_attempts(status);
    
    IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_test_attempts_start_time' AND object_id = OBJECT_ID('test_attempts'))
    CREATE INDEX idx_test_attempts_start_time ON test_attempts(start_time);
    
    IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_test_attempts_score' AND object_id = OBJECT_ID('test_attempts'))
    CREATE INDEX idx_test_attempts_score ON test_attempts(score);
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
      const result = await executeQuery(table.query);
      if (result.success) {
        console.log(`✅ Table '${table.name}' created successfully`);
      } else {
        console.error(`❌ Failed to create table '${table.name}':`, result.error);
        return false;
      }
    }

    // Insert default terms and conditions
    const insertDefaultTerms = `
      IF NOT EXISTS (SELECT * FROM terms_versions WHERE version = '1.0')
      INSERT INTO terms_versions (version, title, content, effective_date) VALUES 
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
      GETDATE())
    `;

    const termsResult = await executeQuery(insertDefaultTerms);
    if (termsResult.success) {
      console.log('✅ Default terms and conditions inserted');
    } else {
      console.error('❌ Failed to insert default terms:', termsResult.error);
    }

    console.log('🎉 Database migration completed successfully!');
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