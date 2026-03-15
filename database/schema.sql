-- =============================================================================
-- database/schema.sql
-- Task Management Application - Database Schema
-- =============================================================================
-- INSTRUCTIONS:
--   1. Open MySQL Workbench or any MySQL client
--   2. Run this entire script to create the database and all tables
--   3. Then run seed.sql to insert sample data
-- =============================================================================

-- 1. Create database (if it doesn't already exist)
CREATE DATABASE IF NOT EXISTS task_manager_db;
USE task_manager_db;

-- =============================================================================
-- TABLE 1: USERS
-- Stores all registered users.
-- Primary Key: user_id
-- Constraints: email UNIQUE, role is 'admin' or 'member' only (CHECK)
-- =============================================================================
CREATE TABLE IF NOT EXISTS users (
    user_id    INT AUTO_INCREMENT PRIMARY KEY,   -- PK: auto-increment integer
    name       VARCHAR(100)  NOT NULL,           -- NOT NULL: name is mandatory
    email      VARCHAR(150)  NOT NULL UNIQUE,    -- UNIQUE: no two users with same email
    password   VARCHAR(255)  NOT NULL,           -- hashed password stored
    role       ENUM('admin', 'member') NOT NULL DEFAULT 'member',  -- CHECK-like via ENUM
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- TABLE 2: TASKS
-- Stores task records created by users.
-- Primary Key: task_id
-- Foreign Key: created_by → users.user_id (with CASCADE DELETE)
-- Constraints: title NOT NULL, priority limited via ENUM (CHECK equivalent)
-- =============================================================================
CREATE TABLE IF NOT EXISTS tasks (
    task_id     INT AUTO_INCREMENT PRIMARY KEY,
    title       VARCHAR(200)  NOT NULL,            -- title is mandatory
    description TEXT,                              -- optional long text description
    priority    ENUM('Low', 'Medium', 'High') NOT NULL DEFAULT 'Low',
    deadline    DATE,                              -- optional deadline date
    created_by  INT NOT NULL,                      -- FK to users table
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Foreign Key: if a user is deleted, their tasks are also deleted
    CONSTRAINT fk_tasks_created_by
        FOREIGN KEY (created_by) REFERENCES users(user_id)
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- =============================================================================
-- TABLE 3: ASSIGNMENTS
-- Implements Many-to-Many relationship between USERS and TASKS.
-- A user can be assigned many tasks, and a task can have many assignees.
-- Primary Key: assignment_id
-- Foreign Keys: task_id → tasks, user_id → users
-- Constraint: UNIQUE(task_id, user_id) prevents duplicate assignments
-- =============================================================================
CREATE TABLE IF NOT EXISTS assignments (
    assignment_id INT AUTO_INCREMENT PRIMARY KEY,
    task_id       INT NOT NULL,
    user_id       INT NOT NULL,
    assigned_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Prevent the same user from being assigned the same task twice
    CONSTRAINT uq_assignment UNIQUE (task_id, user_id),

    -- FK: If task is deleted, remove assignment too
    CONSTRAINT fk_assign_task
        FOREIGN KEY (task_id) REFERENCES tasks(task_id)
        ON DELETE CASCADE ON UPDATE CASCADE,

    -- FK: If user is deleted, remove their assignments
    CONSTRAINT fk_assign_user
        FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- =============================================================================
-- TABLE 4: TASK_STATUS
-- Tracks the current status of each task per user.
-- Primary Key: status_id
-- Foreign Keys: task_id → tasks, user_id → users
-- Constraint: UNIQUE(task_id, user_id) – one status entry per user per task
-- The status column uses ENUM for CHECK-like constraint
-- =============================================================================
CREATE TABLE IF NOT EXISTS task_status (
    status_id  INT AUTO_INCREMENT PRIMARY KEY,
    task_id    INT NOT NULL,
    user_id    INT NOT NULL,
    status     ENUM('Pending', 'In Progress', 'Completed') NOT NULL DEFAULT 'Pending',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- One status row per (task, user) pair
    CONSTRAINT uq_task_status UNIQUE (task_id, user_id),

    CONSTRAINT fk_status_task
        FOREIGN KEY (task_id) REFERENCES tasks(task_id)
        ON DELETE CASCADE ON UPDATE CASCADE,

    CONSTRAINT fk_status_user
        FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- =============================================================================
-- TABLE 5: NOTIFICATIONS
-- Stores system notifications sent to users (assignment alerts, reminders, etc.)
-- Primary Key: notification_id
-- Foreign Key: user_id → users
-- =============================================================================
CREATE TABLE IF NOT EXISTS notifications (
    notification_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id         INT NOT NULL,
    message         VARCHAR(500) NOT NULL,         -- the notification text
    is_read         BOOLEAN NOT NULL DEFAULT FALSE,-- unread by default
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_notification_user
        FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- =============================================================================
-- ENTITY RELATIONSHIP SUMMARY
-- =============================================================================
-- users (1) ─────── (M) tasks          [created_by FK]
-- tasks (M) ─────── (M) users          [via assignments table]
-- tasks (1) ─────── (M) task_status    [task_id FK]
-- users (1) ─────── (M) task_status    [user_id FK]
-- users (1) ─────── (M) notifications  [user_id FK]
-- =============================================================================
