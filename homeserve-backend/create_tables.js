const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '.env') });

const createTables = async () => {
  console.log('\n==================================================');
  console.log('  🛠️  Creating HomeServe Database & Tables');
  console.log('==================================================\n');

  let connection;
  try {
    // Connect to MySQL server (without specifying DB first, in case DB needs to be created)
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'root',
      port: parseInt(process.env.DB_PORT || '3306', 10),
      multipleStatements: true
    });

    console.log('✓ Connected to MySQL server successfully.');

    // Read database.sql
    const sqlPath = path.join(__dirname, 'database.sql');
    const sqlScript = fs.readFileSync(sqlPath, 'utf8');

    console.log('✓ Executing database.sql schema and seed data...');
    await connection.query(sqlScript);

    console.log('✓ Database `homeserve` and all 7 tables created successfully:');
    console.log('   1. users');
    console.log('   2. service_categories');
    console.log('   3. worker_profiles');
    console.log('   4. worker_skills');
    console.log('   5. bookings');
    console.log('   6. reviews');
    console.log('   7. payments');

    // Query tables to confirm
    const [tables] = await connection.query('SHOW TABLES FROM homeserve;');
    console.log('\nVerified tables in `homeserve`:');
    tables.forEach((t) => console.log(`   - ${Object.values(t)[0]}`));

    // Query categories to confirm seed data
    const [categories] = await connection.query('SELECT id, name, base_price FROM homeserve.service_categories;');
    console.log(`\nVerified ${categories.length} service categories seeded:`);
    categories.forEach((c) => console.log(`   - [ID ${c.id}] ${c.name} ($${c.base_price})`));

    // Query demo accounts
    const [users] = await connection.query('SELECT id, name, email, role FROM homeserve.users;');
    console.log(`\nVerified ${users.length} demo accounts ready:`);
    users.forEach((u) => console.log(`   - [${u.role}] ${u.name} (${u.email})`));

    console.log('\n==================================================');
    console.log('  🎉 Database and tables are 100% READY!');
    console.log('==================================================\n');
  } catch (error) {
    console.error('\n❌ Error creating database tables:', error.message);
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('💡 Hint: Please verify your DB_USER and DB_PASSWORD in homeserve-backend/.env');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('💡 Hint: Please ensure MySQL server service (MySQL80) is started on port 3306.');
    }
  } finally {
    if (connection) await connection.end();
  }
};

createTables();
