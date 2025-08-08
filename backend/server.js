const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// SQLite Database setup
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// Initialize database tables
const initializeDatabase = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Users table
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT UNIQUE NOT NULL,
          name TEXT,
          password TEXT,
          phone TEXT,
          college TEXT,
          role TEXT DEFAULT 'student',
          otp TEXT,
          otp_expiry DATETIME,
          profile_complete BOOLEAN DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Questions table
      db.run(`
        CREATE TABLE IF NOT EXISTS questions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          text TEXT NOT NULL,
          options TEXT NOT NULL,
          correct_answer INTEGER NOT NULL,
          difficulty TEXT NOT NULL,
          category TEXT NOT NULL,
          active BOOLEAN DEFAULT 1,
          created_by INTEGER,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Tests table
      db.run(`
        CREATE TABLE IF NOT EXISTS tests (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          start_time DATETIME DEFAULT CURRENT_TIMESTAMP,
          end_time DATETIME,
          status TEXT DEFAULT 'active',
          FOREIGN KEY (user_id) REFERENCES users (id)
        )
      `);

      // Test Questions table (many-to-many relationship)
      db.run(`
        CREATE TABLE IF NOT EXISTS test_questions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          test_id INTEGER NOT NULL,
          question_id INTEGER NOT NULL,
          FOREIGN KEY (test_id) REFERENCES tests (id),
          FOREIGN KEY (question_id) REFERENCES questions (id)
        )
      `);

      // Results table
      db.run(`
        CREATE TABLE IF NOT EXISTS results (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          test_id INTEGER NOT NULL,
          user_id INTEGER NOT NULL,
          score INTEGER NOT NULL,
          correct_answers INTEGER NOT NULL,
          total_questions INTEGER NOT NULL,
          passed BOOLEAN NOT NULL,
          time_taken TEXT,
          warnings INTEGER DEFAULT 0,
          answers TEXT,
          submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (test_id) REFERENCES tests (id),
          FOREIGN KEY (user_id) REFERENCES users (id)
        )
      `);

      // Insert default admin user if not exists
      db.get("SELECT id FROM users WHERE email = 'admin@onlyinternship.in'", (err, row) => {
        if (!row) {
          bcrypt.hash('admin123', 10, (err, hash) => {
            if (!err) {
              db.run(`
                INSERT INTO users (email, name, password, role) 
                VALUES ('admin@onlyinternship.in', 'Admin', ?, 'admin')
              `, [hash]);
            }
          });
        }
      });

      // Insert sample questions if not exists
      db.get("SELECT COUNT(*) as count FROM questions", (err, row) => {
        if (row && row.count === 0) {
          const sampleQuestions = [
            {
              text: "What is the primary purpose of version control systems like Git?",
              options: JSON.stringify([
                "To backup files automatically",
                "To track changes and collaborate on code",
                "To compile code faster",
                "To debug code automatically"
              ]),
              correct_answer: 1,
              difficulty: "easy",
              category: "Software Development"
            },
            {
              text: "Which of the following is NOT a JavaScript framework?",
              options: JSON.stringify([
                "React",
                "Angular",
                "Vue.js",
                "Django"
              ]),
              correct_answer: 3,
              difficulty: "easy",
              category: "Web Development"
            },
            {
              text: "What does API stand for?",
              options: JSON.stringify([
                "Application Programming Interface",
                "Advanced Programming Interface",
                "Automated Programming Interface",
                "Application Process Integration"
              ]),
              correct_answer: 0,
              difficulty: "easy",
              category: "Software Development"
            }
          ];

          sampleQuestions.forEach(q => {
            db.run(`
              INSERT INTO questions (text, options, correct_answer, difficulty, category)
              VALUES (?, ?, ?, ?, ?)
            `, [q.text, q.options, q.correct_answer, q.difficulty, q.category]);
          });
        }
      });

      resolve();
    });
  });
};

// Initialize database
initializeDatabase()
  .then(() => console.log('SQLite database initialized'))
  .catch(err => console.error('Database initialization error:', err));

// Email transporter
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

const authenticateAdmin = (req, res, next) => {
  authenticateToken(req, res, () => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  });
};

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Authentication routes
app.post('/api/auth/student-login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    db.get("SELECT * FROM users WHERE email = ? AND role = 'student'", [email], async (err, user) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { userId: user.id, email: user.email, role: 'student' },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: 'student',
          profileComplete: user.profile_complete || false
        }
      });
    });
  } catch (error) {
    console.error('Error in student login:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.post('/api/auth/admin-login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    db.get("SELECT * FROM users WHERE email = ? AND role = 'admin'", [username], async (err, user) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { userId: user.id, email: user.email, role: 'admin' },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: 'admin'
        }
      });
    });
  } catch (error) {
    console.error('Error in admin login:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// User profile routes
app.put('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const { name, phone, college } = req.body;
    const userId = req.user.userId;

    db.run(`
      UPDATE users 
      SET name = ?, phone = ?, college = ?, profile_complete = 1, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [name, phone, college, userId], function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to update profile' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({
        user: {
          id: userId,
          name,
          phone,
          college,
          profileComplete: true
        }
      });
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Question routes
app.get('/api/questions', authenticateToken, async (req, res) => {
  try {
    db.all("SELECT * FROM questions WHERE active = 1", (err, questions) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to fetch questions' });
      }

      res.json(questions.map(q => ({
        ...q,
        options: JSON.parse(q.options)
      })));
    });
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
});

app.post('/api/questions', authenticateAdmin, async (req, res) => {
  try {
    const { text, options, correctAnswer, difficulty, category } = req.body;

    db.run(`
      INSERT INTO questions (text, options, correct_answer, difficulty, category, created_by)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [text, JSON.stringify(options), correctAnswer, difficulty, category, req.user.userId], function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to create question' });
      }

      res.status(201).json({
        id: this.lastID,
        text,
        options,
        correctAnswer,
        difficulty,
        category
      });
    });
  } catch (error) {
    console.error('Error creating question:', error);
    res.status(500).json({ error: 'Failed to create question' });
  }
});

// Test routes - Modified to skip payment requirement
app.post('/api/tests/start', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Skip payment check for testing purposes
    // const payment = await Payment.findOne({ 
    //   userId, 
    //   status: 'completed',
    //   testEnabled: true 
    // });

    // if (!payment) {
    //   return res.status(402).json({ error: 'Payment required to start test' });
    // }

    // Check attempt limit
    db.get("SELECT COUNT(*) as count FROM tests WHERE user_id = ?", [userId], (err, result) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      if (result.count >= 3) {
        return res.status(400).json({ error: 'Maximum attempts reached' });
      }

      // Generate test questions
      generateTestQuestions().then(questions => {
        // Create test
        db.run(`
          INSERT INTO tests (user_id, start_time, status)
          VALUES (?, CURRENT_TIMESTAMP, 'active')
        `, [userId], function(err) {
          if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Failed to create test' });
          }

          const testId = this.lastID;

          // Insert test questions
          const placeholders = questions.map(() => '(?, ?)').join(',');
          const values = questions.flatMap(q => [testId, q.id]);

          db.run(`
            INSERT INTO test_questions (test_id, question_id)
            VALUES ${placeholders}
          `, values, function(err) {
            if (err) {
              console.error('Database error:', err);
              return res.status(500).json({ error: 'Failed to assign questions' });
            }

            res.json({
              testId,
              questions: questions.map(q => ({
                id: q.id,
                text: q.text,
                options: JSON.parse(q.options),
                difficulty: q.difficulty,
                category: q.category
              }))
            });
          });
        });
      });
    });
  } catch (error) {
    console.error('Error starting test:', error);
    res.status(500).json({ error: 'Failed to start test' });
  }
});

app.post('/api/tests/:id/submit', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { answers, timeTaken, warnings } = req.body;
    const userId = req.user.userId;

    db.get("SELECT * FROM tests WHERE id = ? AND user_id = ?", [id, userId], (err, test) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      if (!test) {
        return res.status(404).json({ error: 'Test not found' });
      }

      // Get test questions and calculate results
      db.all(`
        SELECT q.* FROM questions q
        JOIN test_questions tq ON q.id = tq.question_id
        WHERE tq.test_id = ?
      `, [id], (err, questions) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Failed to fetch questions' });
        }

        let correctAnswers = 0;
        questions.forEach(question => {
          const parsedOptions = JSON.parse(question.options);
          if (answers[question.id] === parsedOptions[question.correct_answer]) {
            correctAnswers++;
          }
        });

        const score = Math.round((correctAnswers / questions.length) * 100);
        const passed = score >= 60;

        // Save result
        db.run(`
          INSERT INTO results (test_id, user_id, score, correct_answers, total_questions, passed, time_taken, warnings, answers)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [id, userId, score, correctAnswers, questions.length, passed, timeTaken, warnings, JSON.stringify(answers)], function(err) {
          if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Failed to save result' });
          }

          // Update test status
          db.run("UPDATE tests SET status = 'completed', end_time = CURRENT_TIMESTAMP WHERE id = ?", [id]);

          res.json({
            result: {
              score,
              correctAnswers,
              totalQuestions: questions.length,
              passed,
              timeTaken,
              warnings
            }
          });
        });
      });
    });
  } catch (error) {
    console.error('Error submitting test:', error);
    res.status(500).json({ error: 'Failed to submit test' });
  }
});

<<<<<<< HEAD
// Payment routes
app.post('/api/payments/create-order', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const testFee = 750;
    const gst = Math.round(testFee * 0.18); // 18% GST
    const totalAmount = testFee + gst;
    const amount = totalAmount * 100; // Convert to paise

    const order = await razorpay.orders.create({
      amount,
      currency: 'INR',
      receipt: `test_${userId}_${Date.now()}`,
      notes: {
        userId: userId.toString(),
        testType: 'internship_assessment',
        testFee: testFee,
        gst: gst,
        totalAmount: totalAmount
      }
    });

    const payment = new Payment({
      userId,
      orderId: order.id,
      amount: totalAmount,
      testFee: testFee,
      gst: gst,
      status: 'pending'
    });

    await payment.save();

    res.json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt
    });
  } catch (error) {
    console.error('Error creating payment order:', error);
    res.status(500).json({ error: 'Failed to create payment order' });
  }
});

app.post('/api/payments/verify', authenticateToken, async (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      // Payment verified
      const payment = await Payment.findOne({ orderId: razorpay_order_id });
      if (payment) {
        payment.status = 'completed';
        payment.paymentId = razorpay_payment_id;
        payment.testEnabled = true;
        await payment.save();
      }

      res.json({ verified: true });
    } else {
      res.status(400).json({ verified: false });
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ error: 'Payment verification failed' });
  }
});

=======
>>>>>>> 8468b6e3039846a76e07d3c4658db92eb67314de
// Admin routes
app.get('/api/admin/candidates', authenticateAdmin, async (req, res) => {
  try {
    db.all(`
      SELECT 
        u.id,
        u.name,
        u.email,
        u.role,
        u.created_at,
        COUNT(t.id) as attempts,
        MAX(r.score) as best_score,
        MAX(t.start_time) as last_attempt,
        CASE 
          WHEN MAX(r.passed) = 1 THEN 'passed'
          WHEN COUNT(t.id) > 0 THEN 'failed'
          ELSE 'pending'
        END as status
      FROM users u
      LEFT JOIN tests t ON u.id = t.user_id
      LEFT JOIN results r ON t.id = r.test_id
      WHERE u.role != 'admin'
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `, (err, candidates) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to fetch candidates' });
      }

      res.json(candidates);
    });
  } catch (error) {
    console.error('Error fetching candidates:', error);
    res.status(500).json({ error: 'Failed to fetch candidates' });
  }
});

// Utility functions
async function generateTestQuestions() {
  return new Promise((resolve, reject) => {
    db.all(`
      SELECT * FROM questions 
      WHERE active = 1 
      ORDER BY RANDOM() 
      LIMIT 35
    `, (err, questions) => {
      if (err) {
        reject(err);
      } else {
        resolve(questions);
      }
    });
  });
}

// Error handling middleware
app.use((error, req, res, next) => {
  console.error(error.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app; 