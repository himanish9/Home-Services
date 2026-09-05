const { pool } = require('../config/db');

/**
 * Data Access Layer for User & Worker Profile Operations
 */

// Find a user by their unique email
const findByEmail = async (email) => {
  const [rows] = await pool.query(
    'SELECT * FROM users WHERE email = ? LIMIT 1',
    [email]
  );
  return rows[0] || null;
};

// Find a user by their primary key ID (excluding sensitive password)
const findById = async (id) => {
  const [rows] = await pool.query(
    'SELECT id, name, email, phone, role, status, created_at, updated_at FROM users WHERE id = ? LIMIT 1',
    [id]
  );
  return rows[0] || null;
};

// Insert a new user into the users table
const createUser = async ({ name, email, password, phone, role = 'CUSTOMER', status = 'ACTIVE' }) => {
  const [result] = await pool.query(
    'INSERT INTO users (name, email, password, phone, role, status) VALUES (?, ?, ?, ?, ?, ?)',
    [name, email, password, phone, role, status]
  );
  return result.insertId;
};

// Create a worker profile for a service provider
const createWorkerProfile = async ({
  userId,
  experienceYears = 1,
  serviceArea = 'City Center',
  bio = '',
  isApproved = false
}) => {
  const [result] = await pool.query(
    'INSERT INTO worker_profiles (user_id, experience_years, service_area, bio, is_approved) VALUES (?, ?, ?, ?, ?)',
    [userId, experienceYears, serviceArea, bio, isApproved]
  );
  return result.insertId;
};

// Link multiple categories/skills to a worker profile
const addWorkerSkills = async (workerProfileId, categoryIds) => {
  if (!categoryIds || !Array.isArray(categoryIds) || categoryIds.length === 0) {
    return;
  }
  const values = categoryIds.map((catId) => [workerProfileId, catId]);
  await pool.query(
    'INSERT INTO worker_skills (worker_profile_id, category_id) VALUES ?',
    [values]
  );
};

// Get complete worker profile with categories
const getWorkerProfileByUserId = async (userId) => {
  const [profileRows] = await pool.query(
    `SELECT wp.*, u.name, u.email, u.phone 
     FROM worker_profiles wp 
     JOIN users u ON wp.user_id = u.id 
     WHERE wp.user_id = ? LIMIT 1`,
    [userId]
  );

  if (profileRows.length === 0) return null;

  const profile = profileRows[0];
  const [skillRows] = await pool.query(
    `SELECT sc.id, sc.name, sc.icon 
     FROM worker_skills ws 
     JOIN service_categories sc ON ws.category_id = sc.id 
     WHERE ws.worker_profile_id = ?`,
    [profile.id]
  );

  profile.skills = skillRows;
  return profile;
};

module.exports = {
  findByEmail,
  findById,
  createUser,
  createWorkerProfile,
  addWorkerSkills,
  getWorkerProfileByUserId
};
