# ACADEMIC PROJECT REPORT

## PROJECT TITLE:
### **HomeServe: Design and Implementation of an Enterprise Multi-Role On-Demand Home Services Booking Platform**

**Degree:** Bachelor of Technology / Bachelor of Engineering in Computer Science and Engineering  
**Academic Year:** 2025 – 2026  
**Technology Stack:** React.js, Node.js, Express.js, MySQL 8.0, Vanilla CSS3, JWT, RESTful APIs

---

## 1. ABSTRACT

In contemporary urban environments, procuring reliable, verified, and timely home maintenance services (e.g., plumbing, electrical maintenance, appliance repair, deep cleaning) represents a fragmented and unorganized sector characterized by price ambiguity, lack of quality assurance, and scheduling inefficiency. This project presents **HomeServe**, a full-stack, enterprise-grade on-demand service commerce platform engineered to bridge the gap between residential consumers and certified local service professionals.

HomeServe is architected on a decoupled three-tier client-server paradigm utilizing a **React.js (Vite)** Single Page Application for high-responsiveness, an asynchronous **Node.js & Express.js** REST API engine, and an ACID-compliant **MySQL 8.0** relational database. Key technical accomplishments include:
1. Concurrency-safe atomic job dispatching eliminating race conditions during peak request surges.
2. A deterministic five-stage service state machine (`PENDING` → `ACCEPTED` → `ON_THE_WAY` → `IN_PROGRESS` → `COMPLETED`).
3. Cryptographically enforced Role-Based Access Control (RBAC) across three distinct actors (Customer, Service Provider, Administrator) using stateless JSON Web Tokens (JWT) and salted bcrypt hashing.
4. An automated rolling feedback and reputation engine ensuring transparent provider evaluation.

The system was verified through end-to-end integration test suites simulating complete booking lifecycles, demonstrating robust performance, zero-leakage security, and database referential integrity.

---

## 2. INTRODUCTION & PROBLEM STATEMENT

### 2.1 Background
The residential home services sector encompasses recurring maintenance tasks including sanitary plumbing, electrical wiring, HVAC servicing, carpentry, and housekeeping. Historically, this sector has operated via informal word-of-mouth recommendations, resulting in:
- **Information Asymmetry**: Customers lack visibility into standardized market pricing and verified technician credentials.
- **Provider Scheduling Inefficiencies**: Independent technicians face logistical friction in discovering nearby jobs matching their explicit skill sets.
- **Absence of Accountability**: Traditional transactions offer no dispute resolution mechanism, verified rating records, or digital audit trails.

### 2.2 Objectives
The primary objectives of the HomeServe project are:
- To design a modular relational database schema in Third Normal Form (3NF) enforcing strict foreign key constraints and transactional integrity.
- To implement non-blocking RESTful micro-controllers handling concurrent service reservations without double-booking anomalies.
- To engineer a responsive, accessible, zero-dependency Vanilla CSS3 user interface providing dedicated portals for consumers, technicians, and platform administrators.
- To incorporate rigorous authentication and input validation pipelines protecting against OWASP Top 10 vulnerabilities (including SQL Injection, Cross-Site Scripting, and Broken Access Control).

---

## 3. COMPARATIVE ANALYSIS: EXISTING VS. PROPOSED SYSTEM

| Parameter | Traditional Manual System | Generic Commercial Portals | HomeServe (Proposed System) |
| :--- | :--- | :--- | :--- |
| **Technician Discovery** | Manual phone directories, personal contacts | Cluttered listings, heavy advertisement bias | Filtered skill-based matching algorithms |
| **Pricing Model** | Arbitrary on-site quotation | Opaque surge pricing, hidden platform fees | Transparent category-defined base pricing |
| **Job Dispatching** | Uncoordinated phone calls | Centralized manual dispatcher | Atomic self-service provider claim engine |
| **Status Visibility** | Zero real-time updates | Basic SMS notifications | Visual 5-stage interactive status tracker |
| **Data Integrity** | Paper invoices, informal cash | Third-party black-box storage | Fully normalized MySQL 8.0 ACID schema |
| **Role Separation** | None | Generalized mobile app | Dedicated Customer, Worker, & Admin portals |

---

## 4. SYSTEM ARCHITECTURE & DESIGN

### 4.1 Three-Tier Architectural Pattern

```
┌─────────────────────────────────────────────────────────────────┐
│                     PRESENTATION TIER                           │
│  React.js (Vite) Single Page Application (Port 5173)            │
│  - Vanilla CSS3 Design System & Responsive Tokens               │
│  - React Router DOM v6 Client-Side Navigation                   │
│  - Context API Centralized State Management (AuthContext)       │
│  - Axios HTTP Client with JWT Request/Response Interceptors     │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 ▼ HTTPS / JSON REST APIs
┌─────────────────────────────────────────────────────────────────┐
│                     APPLICATION LOGIC TIER                      │
│  Node.js + Express.js Asynchronous Engine (Port 5000)           │
│  - Security Pipeline: CORS, Input Sanitization, Helmet Tokens   │
│  - Middleware Layer: authMiddleware (JWT), roleMiddleware       │
│  - Validation Layer: express-validator schemas                  │
│  - Controllers: Auth, Services, Bookings, Worker, Admin         │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 ▼ mysql2 Connection Pooling (TLS)
┌─────────────────────────────────────────────────────────────────┐
│                        DATA PERSISTENCE TIER                    │
│  MySQL 8.0 Relational Database Server (Port 3306)               │
│  - Engine: InnoDB (Row-Level Locking, Multi-Version Concurrency)│
│  - Strict Referential Integrity (ON DELETE CASCADE / RESTRICT)  │
│  - B-Tree Composite Indexing on Foreign Keys & Status Columns   │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 State Machine Transition Model (Booking Lifecycle)

The lifecycle of every service booking follows a deterministic finite state machine:

```
[ PENDING ] ──────────► (Cancelled by Customer/Admin) ──────────► [ CANCELLED ]
     │
     ▼ (Claimed by Verified Service Provider)
[ ACCEPTED ]
     │
     ▼ (Technician En Route)
[ ON_THE_WAY ]
     │
     ▼ (Service Underway at Customer Premise)
[ IN_PROGRESS ]
     │
     ▼ (Work Finished & Verified)
[ COMPLETED ] ────────► (Triggers Automated Settlement & Review Unlocking)
```

**State Transition Integrity Invariants:**
1. A booking in `PENDING` status may only be claimed by an approved technician whose registered skills match the service category.
2. Status transitions must occur sequentially (`ACCEPTED` → `ON_THE_WAY` → `IN_PROGRESS` → `COMPLETED`).
3. Transitioning to `COMPLETED` automatically executes a database transaction setting `payment_status = 'PAID'`.
4. Reviews can only be submitted once for bookings possessing a verified `COMPLETED` status.

---

## 5. DATABASE DESIGN & DATA DICTIONARY

The database is normalized to **Third Normal Form (3NF)** to eliminate data redundancy and insertion/deletion anomalies.

### 5.1 Entity Relationship Model

- `users (1) ───< (1) worker_profiles` (One-to-One Extension)
- `users (1) ───< (M) bookings` (Customer to Bookings)
- `users (1) ───< (M) bookings` (Technician to Assigned Bookings)
- `service_categories (1) ───< (M) bookings` (Category Classification)
- `worker_profiles (M) ───< (M) service_categories` via `worker_skills` (Bridge Entity)
- `bookings (1) ───< (1) reviews` (One-to-One Review Authorization)
- `bookings (1) ───< (1) payments` (Financial Audit Log)

### 5.2 Schema Specification

#### 1. Table: `users`
| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | INT | PRIMARY KEY, AUTO_INCREMENT | Unique user identifier |
| `name` | VARCHAR(100) | NOT NULL | Full user name |
| `email` | VARCHAR(150) | NOT NULL, UNIQUE, INDEX | Login and communication email |
| `password` | VARCHAR(255) | NOT NULL | bcrypt salted hash (cost factor 10) |
| `phone` | VARCHAR(20) | NOT NULL | Contact telephone number |
| `role` | ENUM | NOT NULL, DEFAULT 'CUSTOMER' | Options: `CUSTOMER`, `SERVICE_PROVIDER`, `ADMIN` |
| `status` | ENUM | NOT NULL, DEFAULT 'ACTIVE' | Options: `ACTIVE`, `PENDING`, `SUSPENDED` |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Account creation timestamp |

#### 2. Table: `service_categories`
| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | INT | PRIMARY KEY, AUTO_INCREMENT | Unique category identifier |
| `name` | VARCHAR(100) | NOT NULL, UNIQUE | Category title (e.g., Plumbing) |
| `description`| TEXT | NOT NULL | Detailed scope of service |
| `icon` | VARCHAR(50) | NOT NULL | UI display icon identifier |
| `base_price` | DECIMAL(10,2)| NOT NULL | Standardized starting cost |
| `is_active` | BOOLEAN | DEFAULT TRUE | Visibility flag for public listings |

#### 3. Table: `worker_profiles`
| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | INT | PRIMARY KEY, AUTO_INCREMENT | Unique worker profile identifier |
| `user_id` | INT | NOT NULL, UNIQUE, FK (`users.id`) | Foreign key to base user record |
| `experience_years`| INT | DEFAULT 0 | Verified professional experience |
| `service_area`| VARCHAR(150)| NOT NULL | Geographical coverage zone |
| `bio` | TEXT | NULL | Professional background narrative |
| `rating` | DECIMAL(3,2)| DEFAULT 5.00 | Rolling cumulative average rating |
| `total_reviews`| INT | DEFAULT 0 | Count of received customer reviews |
| `is_available`| BOOLEAN | DEFAULT TRUE | On-duty availability toggle |
| `is_approved` | BOOLEAN | DEFAULT FALSE | Administrator verification toggle |

#### 4. Table: `worker_skills`
| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | INT | PRIMARY KEY, AUTO_INCREMENT | Primary key |
| `worker_profile_id`| INT | NOT NULL, FK (`worker_profiles.id`)| Worker profile reference |
| `category_id` | INT | NOT NULL, FK (`service_categories.id`)| Category reference |
| *Composite* | UNIQUE KEY | (`worker_profile_id`, `category_id`) | Prevents duplicate skill mappings |

#### 5. Table: `bookings`
| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | INT | PRIMARY KEY, AUTO_INCREMENT | Unique booking ID |
| `booking_code`| VARCHAR(30) | NOT NULL, UNIQUE, INDEX | Formatted tracking code (`HS-2026-XXXXX`) |
| `customer_id` | INT | NOT NULL, FK (`users.id`) | Customer who initiated booking |
| `worker_id` | INT | NULL, FK (`users.id`) | Assigned technician |
| `category_id` | INT | NOT NULL, FK (`service_categories.id`)| Service category |
| `service_date`| DATE | NOT NULL | Scheduled appointment date |
| `service_time`| VARCHAR(20) | NOT NULL | Scheduled appointment time window |
| `address` | TEXT | NOT NULL | Customer premise address |
| `problem_description`| TEXT| NOT NULL | Diagnostic explanation of issue |
| `status` | ENUM | DEFAULT 'PENDING' | `PENDING`, `ACCEPTED`, `ON_THE_WAY`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED` |
| `total_amount`| DECIMAL(10,2)| NOT NULL | Calculated service invoice total |
| `payment_method`| ENUM | DEFAULT 'CASH_ON_DELIVERY' | `CASH_ON_DELIVERY`, `ONLINE` |
| `payment_status`| ENUM | DEFAULT 'PENDING' | `PENDING`, `PAID`, `REFUNDED` |

#### 6. Table: `reviews`
| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | INT | PRIMARY KEY, AUTO_INCREMENT | Unique review ID |
| `booking_id` | INT | NOT NULL, UNIQUE, FK (`bookings.id`)| Restricts to one review per booking |
| `customer_id`| INT | NOT NULL, FK (`users.id`) | Review author |
| `worker_id` | INT | NOT NULL, FK (`users.id`) | Review recipient |
| `rating` | INT | NOT NULL, CHECK (`rating BETWEEN 1 AND 5`)| Integer rating score |
| `comment` | TEXT | NULL | Qualitative customer feedback |

---

## 6. KEY ALGORITHMS & IMPLEMENTATION DETAILS

### 6.1 Concurrency-Safe Atomic Job Acceptance
To prevent double-booking when multiple service providers attempt to accept the same booking simultaneously, HomeServe employs an atomic SQL conditional update:

```sql
UPDATE bookings 
SET worker_id = ?, status = 'ACCEPTED' 
WHERE id = ? AND status = 'PENDING' AND worker_id IS NULL;
```
If two workers execute this request concurrently, the database engine grants an exclusive row-level lock to the first transaction. The second transaction observes that `status = 'PENDING'` is no longer satisfied, returning an `affectedRows` count of `0`. The API detects this condition and gracefully returns an HTTP `409 Conflict` error to the second provider.

### 6.2 Rolling Average Rating Recalculation
Upon each verified review submission, the technician's aggregate metrics are dynamically recalculated in an atomic transaction:

$$\text{New Average Rating} = \frac{\sum_{i=1}^{N} \text{Rating}_i}{N}$$

```sql
UPDATE worker_profiles wp
JOIN (
  SELECT worker_id, AVG(rating) AS avg_rating, COUNT(id) AS review_count
  FROM reviews
  WHERE worker_id = ?
  GROUP BY worker_id
) r ON wp.user_id = r.worker_id
SET wp.rating = ROUND(r.avg_rating, 2), wp.total_reviews = r.review_count;
```

---

## 7. SYSTEM TESTING & VERIFICATION RESULTS

### 7.1 Automated End-to-End Test Suite Execution
A comprehensive end-to-end simulation test (`test_e2e.js`) was executed to evaluate system reliability across the entire business lifecycle:

| Stage # | Test Case Description | Target REST Endpoint | Expected HTTP Status | Result |
| :--- | :--- | :--- | :--- | :--- |
| **TC-01** | API Health & Server Availability | `GET /api/health` | `200 OK` | **PASSED** |
| **TC-02** | Customer Authentication & JWT Generation | `POST /api/auth/login` | `200 OK` | **PASSED** |
| **TC-03** | Service Booking Creation with Code Generation | `POST /api/bookings` | `201 Created` | **PASSED** |
| **TC-04** | Provider Skill-Based Job Discovery | `GET /api/worker/jobs` | `200 OK` | **PASSED** |
| **TC-05** | Atomic Job Claiming & Lifecycle Progression | `PUT /api/worker/jobs/:id/status` | `200 OK` | **PASSED** |
| **TC-06** | Customer Rating Submission & Aggregation | `POST /api/reviews` | `201 Created` | **PASSED** |
| **TC-07** | Admin Telemetry & Financial Metric Audit | `GET /api/admin/dashboard` | `200 OK` | **PASSED** |

### 7.2 Security Verification
- **SQL Injection**: Parameterized SQL queries via `mysql2/promise` prevented all unauthorized statement manipulations.
- **Cross-Site Scripting (XSS)**: React JSX syntax prevents DOM-based injection by automatically escaping unsafe inputs.
- **Unauthorized Role Escalation**: Attempting to access `/api/admin/dashboard` using a Customer JWT token returns an immediate HTTP `403 Forbidden`.

---

## 8. CONCLUSION & FUTURE ENHANCEMENTS

### 8.1 Conclusion
The **HomeServe** platform successfully addresses the operational hurdles of the on-demand residential maintenance industry. By combining a modern React SPA frontend with an asynchronous Node.js backend and a normalized MySQL 8.0 relational core, the system achieves:
- Transparent and reliable booking workflows.
- Concurrency-safe job dispatching for service technicians.
- Comprehensive administrative control and real-time revenue auditing.

### 8.2 Future Scope
1. **Real-Time Geolocation Tracking**: Integrating HTML5 Geolocation and Socket.io for live turn-by-turn tracking of technicians en route.
2. **Integrated Payment Gateways**: Integrating Stripe or Razorpay for automated escrow releases upon customer service sign-off.
3. **Automated Scheduling Optimization**: Utilizing Dijkstra's shortest path or travelling salesperson algorithms to optimize multi-stop itineraries for technicians.
4. **Push Notification Service**: Implementing Web Push API and SMS notifications (via Twilio) for real-time status alerts.

---

## 9. REFERENCES

1. Elmasri, R., & Navathe, S. B. (2015). *Fundamentals of Database Systems* (7th ed.). Pearson.
2. Chodorow, K. (2013). *High Performance MySQL: Optimization, Backups, and Replication*. O'Reilly Media.
3. Banks, A., & Porcello, E. (2020). *Learning React: Modern Patterns for Developing React Apps* (2nd ed.). O'Reilly Media.
4. OWASP Foundation. (2021). *OWASP Top 10 Security Vulnerabilities*. Open Web Application Security Project.
5. Node.js Foundation. (2024). *Node.js v18 LTS Documentation and Best Practices*. https://nodejs.org/docs/
