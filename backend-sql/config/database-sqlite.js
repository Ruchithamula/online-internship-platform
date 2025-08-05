const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database file path
const dbPath = path.join(__dirname, '..', 'database.sqlite');

// Create database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error opening database:', err.message);
  } else {
    console.log('✅ Connected to SQLite database');
  }
});

// Test database connection
const testConnection = async () => {
  return new Promise((resolve) => {
    db.get('SELECT 1', (err) => {
      if (err) {
        console.error('❌ Database connection failed:', err.message);
        resolve(false);
      } else {
        console.log('✅ Database connected successfully');
        resolve(true);
      }
    });
  });
};

// Execute query with error handling
const executeQuery = async (query, params = []) => {
  return new Promise((resolve) => {
    db.all(query, params, (err, rows) => {
      if (err) {
        console.error('Database query error:', err);
        resolve({ success: false, error: err.message });
      } else {
        resolve({ success: true, data: rows });
      }
    });
  });
};

// Execute single row query
const executeQuerySingle = async (query, params = []) => {
  return new Promise((resolve) => {
    db.get(query, params, (err, row) => {
      if (err) {
        console.error('Database query error:', err);
        resolve({ success: false, error: err.message });
      } else {
        resolve({ success: true, data: row });
      }
    });
  });
};

// Execute insert/update/delete query
const executeQueryRun = async (query, params = []) => {
  return new Promise((resolve) => {
    db.run(query, params, function(err) {
      if (err) {
        console.error('Database query error:', err);
        resolve({ success: false, error: err.message });
      } else {
        resolve({ 
          success: true, 
          data: { 
            lastID: this.lastID, 
            changes: this.changes 
          } 
        });
      }
    });
  });
};

// Execute transaction
const executeTransaction = async (queries) => {
  return new Promise((resolve) => {
    db.serialize(() => {
      db.run('BEGIN TRANSACTION');
      
      const results = [];
      let hasError = false;
      
      queries.forEach((queryObj, index) => {
        const query = queryObj.sql;
        const params = queryObj.params || [];
        
        db.run(query, params, function(err) {
          if (err && !hasError) {
            hasError = true;
            db.run('ROLLBACK');
            resolve({ success: false, error: err.message });
          } else if (!hasError) {
            results.push({
              lastID: this.lastID,
              changes: this.changes
            });
            
            if (index === queries.length - 1) {
              db.run('COMMIT');
              resolve({ success: true, data: results });
            }
          }
        });
      });
    });
  });
};

// Close database connection
const closeDatabase = () => {
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err.message);
    } else {
      console.log('Database connection closed');
    }
  });
};

module.exports = {
  db,
  testConnection,
  executeQuery,
  executeQuerySingle,
  executeQueryRun,
  executeTransaction,
  closeDatabase
}; 