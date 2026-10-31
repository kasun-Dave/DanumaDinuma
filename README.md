# 🌍 Danuma Dinuma

A production-ready full-stack medical education MCQ practice platform for MBBS students.

## ✨ Features

### Student Features
- **Practice Mode** — Untimed practice with instant answer explanations
- **Timed Quizzes** — Exam simulation with auto-submit, progress bar, question palette
- **Custom Quiz Builder** — Select subject, topic, difficulty, question count
- **Analytics Dashboard** — Topic accuracy, score history, attempt trends, weak topics
- **Bookmarks** — Save questions for later review
- **Gamification** — XP system, streaks, 9 badges to earn
- **Leaderboards** — Global, college-wise, and friends rankings
- **Social System** — Friend requests, user search, friends leaderboard
- **Dark Mode** — Full dark/light theme support
- **Mobile Responsive** — Works on all devices

### Admin Features
- **Question Management** — Full CRUD with inline editor
- **PDF Upload** — Parse MCQ PDFs with automatic question extraction
- **JSON Import** — Bulk import questions from JSON
- **Review Queue** — Review and publish unpublished questions
- **Admin Dashboard** — User stats, attempt analytics, activity logs

## 👤 Guest mode (no account, no database)

"Start Learning Free" on the landing page, or "Continue as guest" on the login and register pages, opens the app without an account.
Guest mode runs entirely in the browser and keeps quizzes, XP, streaks, bookmarks and analytics in `localStorage`, so it works even
when the API and MongoDB are not set up. Leaderboards, friends and the admin tools need a real account (see Deployment).

## 🇱🇰 Sinhala content and interface

- **Question bank:** 303 Sinhala current-affairs MCQs (foreign news, May-August 2026) in `client/src/data/sinhalaQuestions.ts`,
  each with the correct answer from the source quiz PDF plus three written wrong options, tagged with 1 of 11 categories.
  The 20 English Physiology MCQs (`guestQuestions.ts`) are kept as a separate subject.
- **Papers:** `client/src/data/guestTests.ts` defines 31 ready-made papers of exactly 10 questions, grouped by category
  (left-over questions form "Mixed" papers). They are listed on the **Papers** page; Practice still builds random quizzes by subject/category.
- **Language:** the whole interface is available in Sinhala (default) and English. Switch with the language button in the header.
  Translations live in `client/src/i18n/*.ts` (flat `en`/`si` key maps, merged automatically by `client/src/lib/i18n.ts`).
- **Font:** Noto Sans Sinhala (Google Fonts) with Iskoola Pota / Nirmala UI fallbacks; see `client/index.html` and `client/src/index.css`.

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS v4 |
| UI | shadcn/ui pattern (Radix UI + CVA), Framer Motion, Recharts, Lucide |
| State | Zustand, TanStack React Query |
| Backend | Node.js 20, Express.js, TypeScript |
| Database | MongoDB (Atlas Free Tier M0) |
| Auth | JWT (access + refresh tokens), bcrypt, Google OAuth ready |
| Deploy | Vercel (client + serverless API), MongoDB Atlas |

**All tools and services use FREE tiers — no paid subscriptions required.**

## 📁 Project Structure

```
DanumaDinuma/
├── client/                  # React frontend
│   ├── src/
│   │   ├── components/      # UI components (ui/, layout/)
│   │   ├── pages/           # Route pages (15 pages)
│   │   ├── stores/          # Zustand stores (auth, theme)
│   │   ├── lib/             # API client, utilities
│   │   ├── App.tsx          # Router + providers
│   │   └── main.tsx         # Entry point
│   ├── vercel.json          # Vercel SPA config
│   └── vite.config.ts       # Vite + Tailwind + path aliases
├── server/                  # Express backend
│   ├── src/
│   │   ├── config/          # DB + env config
│   │   ├── controllers/     # 6 controller files
│   │   ├── middleware/       # Auth, validation, error handling
│   │   ├── models/          # 9 Mongoose models
│   │   ├── routes/          # 8 route files
│   │   ├── services/        # Gamification engine
│   │   ├── utils/           # JWT, email, PDF parser, seed
│   │   ├── validators/      # Zod schemas
│   │   └── app.ts + server.ts
│   ├── Dockerfile
│   └── railway.toml
├── api/index.ts             # Vercel serverless entry for the Express API
├── vercel.json              # Vercel build + routing config
├── docker-compose.yml
└── README.md
```

## 🚀 Local Setup

### Prerequisites
- Node.js 20+
- MongoDB (local or Atlas free tier)

### 1. Clone and Install

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Configure MongoDB

**Option A: MongoDB Atlas (Free M0 cluster)**
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free M0 cluster
3. Create a database user
4. Whitelist your IP (or 0.0.0.0/0 for development)
5. Get your connection string

**Option B: Local MongoDB**
```bash
# Make sure MongoDB is running locally on port 27017
```

### 3. Environment Setup

```bash
# Server
cd server
cp .env.example .env
# Edit .env with your MongoDB URI and secrets
```

### 4. Seed the Database

```bash
cd server
npm run seed
```

This creates:
- **Admin user**: `admin@danumadinuma.com` / `Admin@123`
- **Student user**: `student@danumadinuma.com` / `Student@123`
- 20 Physiology MCQs with full explanations
- 9 achievement badges

### 5. Start Development

```bash
# Terminal 1: Start backend
cd server
npm run dev

# Terminal 2: Start frontend
cd client
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- Health check: http://localhost:5000/api/health

## 📡 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | - | Register new user |
| POST | `/api/auth/login` | - | Login with email/password |
| POST | `/api/auth/google` | - | Google OAuth login |
| POST | `/api/auth/refresh` | Cookie | Refresh access token |
| POST | `/api/auth/logout` | - | Logout (clear cookie) |
| POST | `/api/auth/forgot-password` | - | Send reset email |
| POST | `/api/auth/reset-password` | - | Reset password with token |
| GET | `/api/auth/me` | JWT | Get current user |
| PUT | `/api/auth/profile` | JWT | Update profile |
| GET | `/api/questions` | JWT | List questions (filtered) |
| GET | `/api/questions/subjects` | JWT | Get subjects and topics |
| POST | `/api/questions` | Admin | Create question |
| PUT | `/api/questions/:id` | Admin | Update question |
| DELETE | `/api/questions/:id` | Admin | Delete question |
| POST | `/api/quiz/create` | JWT | Create new quiz |
| POST | `/api/quiz/submit` | JWT | Submit quiz answers |
| GET | `/api/quiz/:id` | JWT | Get quiz details |
| GET | `/api/quiz/history` | JWT | Get user's quiz history |
| GET | `/api/bookmarks` | JWT | List bookmarks |
| POST | `/api/bookmarks` | JWT | Create bookmark |
| POST | `/api/bookmarks/toggle` | JWT | Toggle bookmark |
| DELETE | `/api/bookmarks/:id` | JWT | Remove bookmark |
| GET | `/api/analytics/dashboard` | JWT | Dashboard stats |
| GET | `/api/analytics/detailed` | JWT | Full analytics |
| GET | `/api/analytics/weak-topics` | JWT | Weak topics |
| GET | `/api/friends` | JWT | Get friends list |
| GET | `/api/friends/search` | JWT | Search users |
| POST | `/api/friends/request` | JWT | Send friend request |
| POST | `/api/friends/accept` | JWT | Accept request |
| POST | `/api/friends/reject` | JWT | Reject request |
| GET | `/api/leaderboard/global` | JWT | Global leaderboard |
| GET | `/api/leaderboard/college` | JWT | College leaderboard |
| GET | `/api/leaderboard/friends` | JWT | Friends leaderboard |
| GET | `/api/admin/stats` | Admin | Admin dashboard stats |
| POST | `/api/admin/pdf-upload` | Admin | Upload and parse PDF |
| POST | `/api/admin/import-json` | Admin | Bulk import JSON |
| GET | `/api/admin/review` | Admin | Get unpublished questions |
| POST | `/api/admin/publish` | Admin | Publish questions |

## 🚢 Deployment

### Vercel (client + API in one project, free)

The repo root is the Vercel project. `vercel.json` builds the React client (`client/dist`) and
serves the Express API (`server/src`) as a single serverless function (`api/index.ts`) on the
same domain under `/api`, so there are no CORS or cross-site cookie issues.

1. Push to GitHub and import the repo in [Vercel](https://vercel.com) (root directory `./`, preset *Other*).
2. Create a free [MongoDB Atlas](https://www.mongodb.com/atlas) M0 cluster and allow access from anywhere (`0.0.0.0/0`), since Vercel IPs are dynamic.
3. Add these Environment Variables in Vercel, then redeploy:

| Variable | Value |
|----------|-------|
| `MONGO_URI` | Atlas connection string (database name `danumadinuma`) |
| `JWT_SECRET` | random string: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` |
| `JWT_REFRESH_SECRET` | a different random string |
| `FRONTEND_URL` | your Vercel URL, e.g. `https://danuma-dinuma.vercel.app` |

4. Seed demo data once from your machine: `cd server && MONGO_URI=<atlas uri> npm run seed`.

Check `https://<your-domain>/api/health` after deploying. Admin PDF uploads are limited by Vercel's 4.5 MB request size.

### Docker
```bash
docker-compose up -d
```

> The PDF import scripts (`server/src/utils/importPhysiology*.ts`, `checkPdfFormat.ts`) read a
> `full physiology.pdf` from the repo root. The file is not included in this repository.

## 🔒 Security

- Helmet.js security headers
- Rate limiting (200 req/15min general, 10 req/15min auth)
- Zod input validation on all endpoints
- bcrypt password hashing (12 salt rounds)
- JWT with short-lived access tokens (15min)
- Secure httpOnly refresh token cookies
- CORS whitelist
- Role-based access control (student/admin)

## 📄 License

MIT License
