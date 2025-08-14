const mysql = require('mysql2/promise');

// MySQL Database Configuration using Hostinger credentials
const dbConfig = {
  host: 'localhost', // Hostinger typically uses localhost
  user: 'u544973759_internship123',
  password: 'jZ-NjmfQ@C4',
  database: 'u544973759_YugaYatra@123',
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test database connection
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Connected to MySQL database successfully');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ MySQL database connection failed:', error.message);
    return false;
  }
};

// Execute query with error handling
const executeQuery = async (query, params = []) => {
  try {
    const [rows] = await pool.execute(query, params);
    return { success: true, data: rows };
  } catch (error) {
    console.error('MySQL query error:', error);
    return { success: false, error: error.message };
  }
};

// Execute single row query
const executeQuerySingle = async (query, params = []) => {
  try {
    const [rows] = await pool.execute(query, params);
    return { success: true, data: rows[0] || null };
  } catch (error) {
    console.error('MySQL query error:', error);
    return { success: false, error: error.message };
  }
};

// Execute insert/update/delete query
const executeQueryRun = async (query, params = []) => {
  try {
    const [result] = await pool.execute(query, params);
    return { 
      success: true, 
      data: { 
        lastID: result.insertId, 
        changes: result.affectedRows 
      } 
    };
  } catch (error) {
    console.error('MySQL query error:', error);
    return { success: false, error: error.message };
  }
};

// Execute transaction
const executeTransaction = async (queries) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    const results = [];
    for (const queryObj of queries) {
      const query = queryObj.sql;
      const params = queryObj.params || [];
      
      const [result] = await connection.execute(query, params);
      results.push({
        lastID: result.insertId,
        changes: result.affectedRows
      });
    }
    
    await connection.commit();
    connection.release();
    
    return { success: true, data: results };
  } catch (error) {
    await connection.rollback();
    connection.release();
    console.error('Transaction error:', error);
    return { success: false, error: error.message };
  }
};

// Close database connection
const closeConnection = async () => {
  try {
    await pool.end();
    console.log('✅ MySQL database connection closed');
  } catch (error) {
    console.error('❌ Error closing MySQL connection:', error.message);
  }
};

module.exports = {
  pool,
  testConnection,
  executeQuery,
  executeQuerySingle,
  executeQueryRun,
  executeTransaction,
  closeConnection
};
