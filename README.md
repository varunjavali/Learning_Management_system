# 🎓 LSM - Learning Management System

A secure, full-stack Learning Management System designed for institutions 
and coaching centers to manage students, trainers, courses, and video content.

## 🚀 Features

### 👨‍💼 Admin
- Dashboard with stats (students, courses, enrollments, videos)
- Create, assign, and manage courses
- User management (create, edit, disable/enable users)
- Session management with force logout
- Student progress tracking
- Change password

### 🧑‍🏫 Trainer
- View and manage all courses
- Add/delete videos (YouTube links)
- Create new courses

### 👨‍🎓 Student
- View assigned courses
- Watch protected video content
- Track personal progress per course
- Session auto-logout when disabled by admin

## 🔒 Security
- JWT Authentication with session tracking
- Dynamic watermark on videos (username + timestamp)
- Right-click disabled on video content
- Print screen detection
- Force logout by admin
- Disabled users blocked from login

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js + Vite + TailwindCSS |
| Backend | Node.js + Express.js |
| Database | PostgreSQL + Prisma ORM |
| Auth | JWT + Session Management |
| Video | YouTube Embed API |

## ⚙️ Installation

### Prerequisites
- Node.js v18+
- PostgreSQL
- npm

### Backend Setup
```bash
cd backend
npm install
```

Create `.env` file:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/lms"
JWT_SECRET="your_secret_key"
PORT=5000
```

Run migrations:
```bash
npx prisma migrate deploy
npx prisma generate
```

Start server:
```bash
node ./src/server.js
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## 🌐 Deployment
- Frontend → Vercel
- Backend → Render
- Database → Neon (PostgreSQL)

## 📄 License
This project is private and confidential.