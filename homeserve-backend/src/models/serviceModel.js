const { pool } = require('../config/db');

/**
 * Data Access Layer for Service Categories
 */

// Fetch all service categories with optional search and active status filter
const getAllServices = async ({ search = '', activeOnly = false } = {}) => {
  let query = 'SELECT * FROM service_categories WHERE 1=1';
  const params = [];

  if (activeOnly) {
    query += ' AND is_active = TRUE';
  }

  if (search && search.trim() !== '') {
    query += ' AND (name LIKE ? OR description LIKE ?)';
    const searchTerm = `%${search.trim()}%`;
    params.push(searchTerm, searchTerm);
  }

  query += ' ORDER BY name ASC';

  const [rows] = await pool.query(query, params);
  return rows;
};

// Fetch a single service category by ID
const getServiceById = async (id) => {
  const [rows] = await pool.query(
    'SELECT * FROM service_categories WHERE id = ? LIMIT 1',
    [id]
  );
  return rows[0] || null;
};

// Find service category by name (for duplicate name check)
const getServiceByName = async (name) => {
  const [rows] = await pool.query(
    'SELECT * FROM service_categories WHERE LOWER(name) = LOWER(?) LIMIT 1',
    [name.trim()]
  );
  return rows[0] || null;
};

// Create a new service category
const createService = async ({ name, description, icon = 'wrench', base_price, is_active = true }) => {
  const [result] = await pool.query(
    'INSERT INTO service_categories (name, description, icon, base_price, is_active) VALUES (?, ?, ?, ?, ?)',
    [name.trim(), description.trim(), icon.trim(), base_price, is_active]
  );
  return result.insertId;
};

// Update an existing service category
const updateService = async (id, { name, description, icon, base_price, is_active }) => {
  const fields = [];
  const params = [];

  if (name !== undefined) {
    fields.push('name = ?');
    params.push(name.trim());
  }
  if (description !== undefined) {
    fields.push('description = ?');
    params.push(description.trim());
  }
  if (icon !== undefined) {
    fields.push('icon = ?');
    params.push(icon.trim());
  }
  if (base_price !== undefined) {
    fields.push('base_price = ?');
    params.push(base_price);
  }
  if (is_active !== undefined) {
    fields.push('is_active = ?');
    params.push(is_active);
  }

  if (fields.length === 0) return false;

  params.push(id);
  const [result] = await pool.query(
    `UPDATE service_categories SET ${fields.join(', ')} WHERE id = ?`,
    params
  );
  return result.affectedRows > 0;
};

// Delete a service category
const deleteService = async (id) => {
  const [result] = await pool.query(
    'DELETE FROM service_categories WHERE id = ?',
    [id]
  );
  return result.affectedRows > 0;
};

module.exports = {
  getAllServices,
  getServiceById,
  getServiceByName,
  createService,
  updateService,
  deleteService
};
