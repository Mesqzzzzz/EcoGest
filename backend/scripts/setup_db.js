const mysql = require('mysql2/promise');
require('dotenv').config();

async function setup() {
  // Use values from .env if they exist, else defaults
  const config = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    port: process.env.DB_PORT || 3306,
  };

  try {
    const connection = await mysql.createConnection(config);
    console.log('Connected to MySQL server.');

    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'ecogest'}\`;`);
    console.log(`Database "${process.env.DB_NAME || 'ecogest'}" created or already exists.`);

    await connection.end();
    console.log('Setup finished successfully.');
  } catch (error) {
    console.error('Error during database setup:');
    console.error(error.message);
    console.log('\nTip: Make sure MySQL is running and the credentials in .env are correct.');
    process.exit(1);
  }
}

setup();
