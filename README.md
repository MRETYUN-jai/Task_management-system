# 📋 Task Management Application
**Full-Stack DBMS College Project** — React + TailwindCSS | Node.js + Express | MySQL

---

## 📁 Project Structure

```
task-manager/
├── backend/                   ← Node.js + Express API
│   ├── config/db.js            ← MySQL connection pool
│   ├── controllers/            ← Business logic
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── taskController.js
│   │   ├── assignmentController.js
│   │   ├── statusController.js
│   │   ├── notificationController.js
│   │   └── reportController.js
│   ├── middleware/
│   │   ├── auth.js             ← JWT verification
│   │   └── roleCheck.js        ← Admin-only guard
│   ├── routes/                 ← Express Router files
│   │   ├── auth.js, users.js, tasks.js
│   │   ├── assignments.js, status.js
│   │   ├── notifications.js, reports.js
│   ├── .env                   ← DB + JWT config (edit this!)
│   ├── package.json
│   └── server.js              ← Entry point
│
├── frontend/                  ← React + TailwindCSS
│   ├── src/
│   │   ├── api/axios.js        ← Axios with JWT interceptor
│   │   ├── context/AuthContext.jsx ← Global auth state
│   │   ├── components/         ← Sidebar, Navbar, TaskCard, Badges
│   │   ├── pages/              ← 9 pages
│   │   └── App.jsx             ← Router + Protected routes
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
└── database/
    ├── schema.sql             ← 5 tables with all constraints
    └── seed.sql               ← Sample data
```

---

## 🚀 Setup Instructions

### Step 1: Install MySQL
Make sure MySQL is installed and running on your machine.

### Step 2: Set Up the Database
1. Open **MySQL Workbench** or MySQL command prompt
2. Run the schema file:
   ```sql
   source A:/PROJECTS/task-manager/database/schema.sql;
   ```
3. Run the seed file (optional, adds sample data):
   ```sql
   source A:/PROJECTS/task-manager/database/seed.sql;
   ```

### Step 3: Configure Backend
1. Open `backend/.env` and update your MySQL credentials:
   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=YOUR_MYSQL_ROOT_PASSWORD
   DB_NAME=task_manager_db
   JWT_SECRET=any_long_random_string
   ```

### Step 4: Install & Run Backend
Open a terminal in `A:\PROJECTS\task-manager\backend\`:
```bash
npm install
npm run dev
```
Backend runs at: **http://localhost:5000**

### Step 5: Install & Run Frontend
Open a **second terminal** in `A:\PROJECTS\task-manager\frontend\`:
```bash
npm install
npm run dev
```
Frontend runs at: **http://localhost:5173**

---

## 🔑 Login Credentials (after running seed.sql)

| Name         | Email                 | Password    | Role   |
|--------------|-----------------------|-------------|--------|
| Alice Admin  | alice@example.com     | password123 | Admin  |
| Bob Member   | bob@example.com       | password123 | Member |
| Carol Member | carol@example.com     | password123 | Member |

---

## 🌐 API Endpoints

### Authentication (Public)
| Method | Endpoint       | Description     |
|--------|----------------|-----------------|
| POST   | /api/register  | Register user   |
| POST   | /api/login     | Login, get JWT  |

### Users (Protected)
| Method | Endpoint         | Description         |
|--------|------------------|---------------------|
| GET    | /api/users       | All users (admin)   |
| GET    | /api/users/:id   | Single user         |
| PUT    | /api/users/:id   | Update profile      |

### Tasks (Protected)
| Method | Endpoint       | Description           |
|--------|----------------|-----------------------|
| GET    | /api/tasks     | All tasks (+ filters) |
| POST   | /api/tasks     | Create task (admin)   |
| GET    | /api/tasks/:id | Task details          |
| PUT    | /api/tasks/:id | Update task (admin)   |
| DELETE | /api/tasks/:id | Delete task (admin)   |

### Assignments, Status, Notifications, Reports
| Method | Endpoint                        | Description              |
|--------|---------------------------------|--------------------------|
| POST   | /api/assign                     | Assign task (admin)      |
| GET    | /api/assigned/:userId           | My assigned tasks        |
| PUT    | /api/status/update              | Update task status       |
| GET    | /api/notifications/:userId      | My notifications         |
| GET    | /api/reports/dashboard          | Dashboard stats          |
| GET    | /api/reports/completed          | Completed tasks report   |
| GET    | /api/reports/pending            | Pending tasks report     |
| GET    | /api/reports/user-performance   | User productivity report |

---

## 🗄️ Database Design (DBMS Concepts)

### Entity Relationship
```
USERS (1) ──────── (M) TASKS          [created_by FK]
TASKS (M) ──────── (M) USERS          [via ASSIGNMENTS — Many-to-Many]
TASKS (1) ──────── (M) TASK_STATUS    [task_id FK]
USERS (1) ──────── (M) TASK_STATUS    [user_id FK]
USERS (1) ──────── (M) NOTIFICATIONS  [user_id FK]
```

### SQL Concepts Demonstrated
- **Primary Keys**: Every table has AUTO_INCREMENT PK
- **Foreign Keys**: With CASCADE DELETE/UPDATE
- **UNIQUE**: email in users, (task_id, user_id) in assignments
- **NOT NULL**: Required fields are NOT NULL
- **CHECK**: Implemented via MySQL ENUM for role, priority, status
- **Normalization**: Each table has a single purpose (3NF)
- **Many-to-Many**: Users ↔ Tasks via ASSIGNMENTS junction table
- **Indexes**: Automatically created by UNIQUE constraints

---

## 📝 Example SQL Queries

```sql
-- 1. Get all tasks with creator name and current status
SELECT t.title, t.priority, u.name AS creator, ts.status
FROM tasks t
JOIN users u ON t.created_by = u.user_id
LEFT JOIN task_status ts ON t.task_id = ts.task_id;

-- 2. Find all overdue tasks
SELECT title, deadline FROM tasks
WHERE deadline < CURDATE();

-- 3. Get tasks assigned to a specific user
SELECT t.title, a.assigned_date
FROM assignments a
JOIN tasks t ON a.task_id = t.task_id
WHERE a.user_id = 2;

-- 4. User performance report
SELECT u.name, COUNT(a.task_id) AS total,
       SUM(ts.status = 'Completed') AS completed
FROM users u
LEFT JOIN assignments a ON u.user_id = a.user_id
LEFT JOIN task_status ts ON a.task_id = ts.task_id AND a.user_id = ts.user_id
GROUP BY u.user_id;
```

---

## 🎯 Features Implemented
- ✅ JWT Authentication (login/register)
- ✅ Role-based access (Admin/Member)
- ✅ Task CRUD (Create, Read, Update, Delete)
- ✅ Many-to-Many task assignment
- ✅ Task status tracking (Pending/In Progress/Completed)
- ✅ Notification system (auto-created on assignment/status change)
- ✅ Search & filter tasks by status/priority
- ✅ Overdue task detection
- ✅ Reports: Completed, Pending, User Performance
- ✅ Dashboard with stats
- ✅ Responsive sidebar navigation
- ✅ Task card UI with priority color coding
- ✅ User profile edit

---

*Built with ❤️ as a college DBMS project demonstrating core database concepts.*
