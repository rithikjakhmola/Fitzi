// backend/database.js
const mysql = require('mysql2/promise'); // Using promise version for cleaner async code

const db = mysql.createPool({
  host: 'localhost',
  user: 'root',               // Your MySQL username (usually root locally)
  password: '8750dinesh', // CHANGE THIS TO YOUR ACTUAL MYSQL PASSWORD
  database: 'fitzi_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test the connection
db.getConnection()
  .then(connection => {
    console.log('✅ Connected to MySQL database successfully.');
    connection.release();
  })
  .catch(err => {
    console.error('❌ Error connecting to MySQL:', err.message);
  });

module.exports = db;