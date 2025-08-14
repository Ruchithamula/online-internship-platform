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
  multipleStatements: true // Allow multiple SQL statements
};

async function setupDatabase() {
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

    // Read and execute the SQL setup script
    const sqlScriptPath = path.join(__dirname, 'setup-mysql-database.sql');
    const sqlScript = fs.readFileSync(sqlScriptPath, 'utf8');
    
    console.log('📝 Executing database setup script...');
    await connection.execute(sqlScript);
    
    console.log('✅ Database setup completed successfully!');
    console.log('\n📊 Database Tables Created:');
    console.log('   - users (students and admins)');
    console.log('   - payments (Razorpay integration)');
    console.log('   - test_attempts (test results)');
    console.log('   - questions (software engineering questions)');
    console.log('   - student_answers (individual answers)');
    console.log('   - terms_agreements (terms acceptance)');
    
    console.log('\n👤 Default Admin Account:');
    console.log('   - Username: Admin');
    console.log('   - Password: Admin');
    console.log('   - Email: admin@onlyinternship.in');
    
    console.log('\n🚀 You can now start the backend server with:');
    console.log('   cd backend-sql');
    console.log('   npm install');
    console.log('   npm start');

  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n💡 Possible solutions:');
      console.error('   1. Check if the database user exists in Hostinger');
      console.error('   2. Verify the password is correct');
      console.error('   3. Ensure the user has CREATE privileges');
      console.error('   4. Check if the database name is correct');
    }
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Possible solutions:');
      console.error('   1. Check if MySQL service is running');
      console.error('   2. Verify the host and port settings');
      console.error('   3. Check firewall settings');
    }
    
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed');
    }
  }
}

// Run the setup
setupDatabase();
