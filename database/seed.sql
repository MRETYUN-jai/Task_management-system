-- =============================================================================
-- database/seed.sql
-- Sample Data for Task Management Application
-- Run AFTER schema.sql
-- Password for all users: "password123" (already bcrypt-hashed below)
-- =============================================================================

USE task_manager_db;

-- ── Insert Sample Users ─────────────────────────────────────────────────────
-- Password hash below corresponds to "password123" with bcrypt (10 rounds)
INSERT INTO users (name, email, password, role) VALUES
('Alice Admin',   'alice@example.com',   '$2a$10$JqmmNZJI4/fmHAFlMi5N..ImSQ3DvXnIgGNwrhejxe2n5drkdZS2q', 'admin'),
('Bob Member',    'bob@example.com',     '$2a$10$JqmmNZJI4/fmHAFlMi5N..ImSQ3DvXnIgGNwrhejxe2n5drkdZS2q', 'member'),
('Carol Member',  'carol@example.com',   '$2a$10$JqmmNZJI4/fmHAFlMi5N..ImSQ3DvXnIgGNwrhejxe2n5drkdZS2q', 'member');

-- ── Insert Sample Tasks ─────────────────────────────────────────────────────
-- created_by = 1 (Alice Admin)
INSERT INTO tasks (title, description, priority, deadline, created_by) VALUES
('Design Database Schema',   'Create ER diagram and SQL schema for the project',    'High',   '2026-03-20', 1),
('Implement REST API',        'Build all backend endpoints with Node.js & Express',  'High',   '2026-03-25', 1),
('Build React Frontend',      'Create all React pages and connect to backend API',   'Medium', '2026-04-01', 1),
('Write Project Report',      'Document all DBMS concepts used in the project',      'Low',    '2026-04-10', 1),
('Testing & Deployment',      'Test all features and deploy the application',        'Medium', '2026-04-15', 1);

-- ── Insert Sample Assignments ────────────────────────────────────────────────
-- Assign tasks to members (Many-to-Many via assignments table)
INSERT INTO assignments (task_id, user_id) VALUES
(1, 1),  -- Alice assigned to Task 1 (Schema)
(1, 2),  -- Bob assigned to Task 1 (Schema)
(2, 1),  -- Alice assigned to Task 2 (API)
(3, 3),  -- Carol assigned to Task 3 (Frontend)
(4, 2),  -- Bob assigned to Task 4 (Report)
(5, 3);  -- Carol assigned to Task 5 (Testing)

-- ── Insert Sample Task Statuses ──────────────────────────────────────────────
INSERT INTO task_status (task_id, user_id, status) VALUES
(1, 1, 'Completed'),   -- Alice completed Schema design
(1, 2, 'In Progress'), -- Bob is working on Schema
(2, 1, 'In Progress'), -- Alice is working on API
(3, 3, 'Pending'),     -- Carol hasn't started Frontend
(4, 2, 'Pending'),     -- Bob hasn't started Report
(5, 3, 'Pending');     -- Carol hasn't started Testing

-- ── Insert Sample Notifications ──────────────────────────────────────────────
INSERT INTO notifications (user_id, message, is_read) VALUES
(1, 'Welcome to Task Manager! You are registered as Admin.', TRUE),
(2, 'You have been assigned to task: "Design Database Schema"', FALSE),
(2, 'You have been assigned to task: "Write Project Report"', FALSE),
(3, 'You have been assigned to task: "Build React Frontend"', FALSE),
(3, 'You have been assigned to task: "Testing & Deployment"', FALSE),
(1, 'Task "Design Database Schema" status updated to "Completed" by Alice Admin.', FALSE);
