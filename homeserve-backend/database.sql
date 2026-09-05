-- =======================================================
-- HomeServe – On-Demand Home Services Booking Platform
-- Complete Relational Database Schema & Realistic Seed Data
-- =======================================================

CREATE DATABASE IF NOT EXISTS homeserve
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE homeserve;

-- Disable foreign key checks for clean recreation if script is re-run
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS worker_skills;
DROP TABLE IF EXISTS worker_profiles;
DROP TABLE IF EXISTS service_categories;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

-- -------------------------------------------------------
-- 1. USERS TABLE
-- Roles: CUSTOMER, SERVICE_PROVIDER, ADMIN
-- -------------------------------------------------------
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  role ENUM('CUSTOMER', 'SERVICE_PROVIDER', 'ADMIN') NOT NULL DEFAULT 'CUSTOMER',
  status ENUM('ACTIVE', 'PENDING', 'SUSPENDED') NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_role (role),
  INDEX idx_users_email (email)
) ENGINE=InnoDB;

-- -------------------------------------------------------
-- 2. SERVICE CATEGORIES TABLE
-- -------------------------------------------------------
CREATE TABLE service_categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT NOT NULL,
  icon VARCHAR(50) NOT NULL DEFAULT 'wrench',
  base_price DECIMAL(10, 2) NOT NULL DEFAULT 50.00,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- -------------------------------------------------------
-- 3. WORKER PROFILES TABLE
-- Linked 1-to-1 with users where role = 'SERVICE_PROVIDER'
-- -------------------------------------------------------
CREATE TABLE worker_profiles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  experience_years INT NOT NULL DEFAULT 1,
  service_area VARCHAR(150) NOT NULL DEFAULT 'Metro City Center',
  bio TEXT,
  rating DECIMAL(3, 2) NOT NULL DEFAULT 5.00,
  total_reviews INT NOT NULL DEFAULT 0,
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  is_approved BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_worker_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- -------------------------------------------------------
-- 4. WORKER SKILLS TABLE (Many-to-Many Bridge)
-- -------------------------------------------------------
CREATE TABLE worker_skills (
  id INT AUTO_INCREMENT PRIMARY KEY,
  worker_profile_id INT NOT NULL,
  category_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_skills_worker FOREIGN KEY (worker_profile_id) REFERENCES worker_profiles(id) ON DELETE CASCADE,
  CONSTRAINT fk_skills_category FOREIGN KEY (category_id) REFERENCES service_categories(id) ON DELETE CASCADE,
  UNIQUE KEY uk_worker_category (worker_profile_id, category_id)
) ENGINE=InnoDB;

-- -------------------------------------------------------
-- 5. BOOKINGS TABLE
-- -------------------------------------------------------
CREATE TABLE bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_code VARCHAR(30) NOT NULL UNIQUE,
  customer_id INT NOT NULL,
  worker_id INT NULL,
  category_id INT NOT NULL,
  service_date DATE NOT NULL,
  service_time VARCHAR(20) NOT NULL,
  address TEXT NOT NULL,
  problem_description TEXT NOT NULL,
  status ENUM('PENDING', 'ACCEPTED', 'ON_THE_WAY', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
  total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  payment_method ENUM('CASH_ON_DELIVERY', 'ONLINE') NOT NULL DEFAULT 'CASH_ON_DELIVERY',
  payment_status ENUM('PENDING', 'PAID', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
  cancellation_reason TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_booking_customer FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_booking_worker FOREIGN KEY (worker_id) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_booking_category FOREIGN KEY (category_id) REFERENCES service_categories(id) ON DELETE RESTRICT,
  INDEX idx_bookings_status (status),
  INDEX idx_bookings_customer (customer_id),
  INDEX idx_bookings_worker (worker_id)
) ENGINE=InnoDB;

-- -------------------------------------------------------
-- 6. REVIEWS TABLE
-- -------------------------------------------------------
CREATE TABLE reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT NOT NULL UNIQUE,
  customer_id INT NOT NULL,
  worker_id INT NOT NULL,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_reviews_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  CONSTRAINT fk_reviews_customer FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_reviews_worker FOREIGN KEY (worker_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- -------------------------------------------------------
-- 7. PAYMENTS TABLE
-- -------------------------------------------------------
CREATE TABLE payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT NOT NULL UNIQUE,
  transaction_id VARCHAR(100) NOT NULL UNIQUE,
  amount DECIMAL(10, 2) NOT NULL,
  payment_method ENUM('CASH_ON_DELIVERY', 'ONLINE') NOT NULL DEFAULT 'CASH_ON_DELIVERY',
  payment_status ENUM('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_payments_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =======================================================
-- REALISTIC SEED DATA
-- =======================================================

-- 1. Insert 8 Service Categories
INSERT INTO service_categories (name, description, icon, base_price, is_active) VALUES
('Bathroom Cleaning', 'Deep cleaning, stain removal, disinfection and tile scrubbing for hygienic bathrooms.', 'sparkles', 49.00, TRUE),
('House Cleaning', 'Full house cleaning, vacuuming, dusting, mopping, and comprehensive surface sanitization.', 'home', 89.00, TRUE),
('Plumbing', 'Fixing leaking pipes, tap repairs, drainage blockages, sink installation, and water pump checks.', 'wrench', 59.00, TRUE),
('Electrician', 'Wiring inspection, switchboard repairs, lighting installation, circuit breaker fixes, and fans.', 'bolt', 65.00, TRUE),
('Washing Machine Repair', 'Front load, top load, and semi-automatic washing machine motor and drainage diagnostics.', 'cog', 75.00, TRUE),
('AC Repair', 'Split and window AC deep filter servicing, gas recharging, cooling coil cleaning, and leak checks.', 'wind', 85.00, TRUE),
('Carpenter', 'Furniture assembly, hinge and latch repairs, wooden door fittings, and custom shelf installation.', 'hammer', 70.00, TRUE),
('Laundry', 'Wash and fold, steam ironing, stain treatment, and premium dry-cleaning with door pickup.', 'shirt', 35.00, TRUE);

-- 2. Insert Sample Users (Password for all three accounts: Password123!)
-- Bcrypt Hash for Password123!: $2a$10$tw4OEBEoLwzvufXsCuQjWeGC/vqI7H3u7048KazyAOkg2J74NoI5K
INSERT INTO users (id, name, email, password, phone, role, status) VALUES
(1, 'Alex Johnson', 'customer@homeserve.com', '$2a$10$tw4OEBEoLwzvufXsCuQjWeGC/vqI7H3u7048KazyAOkg2J74NoI5K', '+1-555-0101', 'CUSTOMER', 'ACTIVE'),
(2, 'David Miller', 'worker@homeserve.com', '$2a$10$tw4OEBEoLwzvufXsCuQjWeGC/vqI7H3u7048KazyAOkg2J74NoI5K', '+1-555-0202', 'SERVICE_PROVIDER', 'ACTIVE'),
(3, 'Admin Officer', 'admin@homeserve.com', '$2a$10$tw4OEBEoLwzvufXsCuQjWeGC/vqI7H3u7048KazyAOkg2J74NoI5K', '+1-555-0303', 'ADMIN', 'ACTIVE');

-- 3. Insert Worker Profile for David Miller (user_id = 2)
INSERT INTO worker_profiles (id, user_id, experience_years, service_area, bio, rating, total_reviews, is_available, is_approved) VALUES
(1, 2, 6, 'Downtown & Suburban Metro Area', 'Certified master technician with 6+ years of experience in domestic plumbing and HVAC/AC maintenance.', 4.90, 15, TRUE, TRUE);

-- 4. Associate Worker Skills (Plumbing=3, AC Repair=6, Washing Machine Repair=5)
INSERT INTO worker_skills (worker_profile_id, category_id) VALUES
(1, 3),
(1, 5),
(1, 6);
