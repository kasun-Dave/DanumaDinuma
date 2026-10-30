# Danuma Dinuma — Implementation Plan

## Goal

Build a complete, production-ready full-stack medical education MCQ platform for MBBS students. The platform supports practice mode, timed quizzes, analytics, gamification, social features, admin management, and PDF-based question import.

## Tech Stack Summary

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui |
| State | Zustand + TanStack Query |
| Backend | Node.js 20 + Express + TypeScript + Mongoose |
| Database | MongoDB Atlas |
| Auth | JWT + Passport.js + Google OAuth |
| Deploy | Vercel (frontend) + Railway/Render (backend) |

---

## Project Structure

```
DanumaDinuma/
├── client/                    # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   │   ├── ui/            # shadcn/ui components
│   │   │   ├── layout/        # Layout components (Navbar, Sidebar, Footer)
│   │   │   ├── quiz/          # Quiz-related components
│   │   │   ├── dashboard/     # Dashboard widgets
│   │   │   └── admin/         # Admin-specific components
│   │   ├── pages/             # Route pages
│   │   ├── hooks/             # Custom React hooks
│   │   ├── lib/               # Utilities, axios instance, helpers
│   │   ├── stores/            # Zustand stores
│   │   ├── types/             # TypeScript types/interfaces
│   │   ├── styles/            # Global CSS
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── components.json        # shadcn config
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── vercel.json
│   └── package.json
├── server/                    # Express backend
│   ├── src/
│   │   ├── config/            # DB, passport, env config
│   │   ├── controllers/       # Route controllers
│   │   ├── middleware/         # Auth, RBAC, validation, rate-limit
│   │   ├── models/            # Mongoose models
│   │   ├── routes/            # Express routes
│   │   ├── services/          # Business logic services
│   │   ├── utils/             # Helpers, PDF parser, email
│   │   ├── validators/        # Zod schemas
│   │   ├── types/             # TypeScript types
│   │   ├── app.ts             # Express app setup
│   │   └── server.ts          # Entry point
│   ├── tsconfig.json
│   ├── Dockerfile
│   └── package.json
├── database/
│   └── seed/                  # Seed data JSON files
├── scripts/                   # Utility scripts
├── docs/                      # Documentation
├── docker-compose.yml
└── README.md
```

---

## Phased Execution Plan

### Phase 1: Project Scaffolding & Configuration
- Initialize Vite React TypeScript project in `client/`
- Initialize Express TypeScript project in `server/`
- Configure Tailwind CSS + shadcn/ui
- Set up path aliases, ESLint, environment files
- Configure MongoDB connection with Mongoose
- Set up project structure directories

### Phase 2: Database Models & Backend Core
- Implement all 10 Mongoose models (User, Question, Quiz, Attempt, Bookmark, Friendship, Leaderboard, Badge, AdminLog, AnalyticsSnapshot)
- Set up validation with Zod
- Configure middleware stack (helmet, cors, rate-limit, cookie-parser)
- Build error handling utilities

### Phase 3: Authentication System
- Email/password registration & login with bcrypt
- JWT access + refresh token strategy
- Google OAuth via Passport.js
- Role-based access control middleware
- Forgot/reset password with nodemailer
- Auth API endpoints

### Phase 4: Core API Endpoints
- Questions CRUD + filtering/search
- Quiz creation, submission, grading engine
- Bookmark CRUD
- Analytics computation
- Leaderboard queries
- Friend system APIs
- Admin endpoints (PDF upload, JSON import, review/publish)

### Phase 5: PDF Parser Engine
- PDF text extraction via pdf-parse
- Question segmentation algorithm
- Option extraction & answer mapping
- JSON transformation pipeline
- Duplicate detection
- Admin review workflow

### Phase 6: Frontend — Auth & Layout
- Design system: theme tokens, dark mode, typography
- Layout components: Navbar, Sidebar, MobileNav, Footer
- Auth pages: Login, Register, Forgot Password, Reset Password
- Protected route wrappers
- Zustand auth store
- Axios interceptors with refresh token logic

### Phase 7: Frontend — Feature Pages
- Dashboard with stat cards, charts, recent activity
- Practice Mode with instant feedback
- Timed Quiz Mode with timer, palette, auto-submit
- Custom Quiz Builder
- Results page with score breakdown
- Analytics page with Recharts visualizations
- Bookmarks page
- Profile page
- Leaderboard page
- Friends page

### Phase 8: Frontend — Admin & Polish
- Admin dashboard with stats
- Question management (CRUD, bulk import)
- PDF upload & review interface
- Loading skeletons, error boundaries, empty states
- Toast notifications
- Framer Motion animations
- Responsive polish
- Seed data generation
- Deployment configs (Vercel, Railway, Docker)
- README documentation

---

## Database Models Detail

### User
```
_id, email, password, name, username, avatar, role (student|admin),
college, year, xp, streak, currentStreakStart, longestStreak,
badges[], googleId, refreshToken, theme,
resetPasswordToken, resetPasswordExpires,
createdAt, updatedAt
```

### Question
```
_id, subject, topic, subtopic, difficulty (easy|medium|hard),
questionText, options[], correctOptionIndex, explanation,
conceptSummary, wrongOptionExplanations[], source, tags[],
isPublished, createdBy, createdAt, updatedAt
```

### Quiz
```
_id, userId, type (practice|timed|custom), subject, topics[],
difficulty, questionIds[], questionCount, timeLimit,
negativeMarking, status (active|completed|abandoned),
startedAt, completedAt, createdAt
```

### Attempt
```
_id, userId, quizId, questionId, selectedOptionIndex,
isCorrect, timeTaken, xpEarned, createdAt
```

### Bookmark
```
_id, userId, questionId, note, createdAt
```

### Friendship
```
_id, requesterId, recipientId, status (pending|accepted|rejected),
createdAt, updatedAt
```

### Badge
```
_id, name, description, icon, criteria (type + threshold),
createdAt
```

### AdminLog
```
_id, adminId, action, details, createdAt
```

### AnalyticsSnapshot
```
_id, userId, date, topicAccuracy (Map), totalAttempts,
correctAnswers, averageScore, subjectBreakdown,
createdAt
```

---

## Key API Endpoints

All endpoints listed in the requirements will be implemented. Key design decisions:

| Endpoint | Notes |
|----------|-------|
| `POST /api/auth/register` | Zod validation, bcrypt hash, JWT pair issued |
| `POST /api/auth/google` | Passport Google OAuth, auto-create user |
| `POST /api/auth/refresh` | Secure httpOnly cookie, token rotation |
| `POST /api/quiz/submit` | Grading engine, XP award, badge check, analytics update |
| `POST /api/admin/pdf-upload` | Multer + pdf-parse, returns parsed questions for review |
| `GET /api/analytics/weak-topics` | Aggregation pipeline on Attempt collection |
| `GET /api/leaderboard/global` | XP-sorted, paginated |

---

## UI Design System

- **Color Palette**: Medical-themed — deep indigo primary (#4F46E5), emerald accents (#10B981), warm amber for warnings
- **Dark Mode**: CSS variables with `next-themes` pattern, toggled via Zustand
- **Typography**: Inter (Google Fonts) — clean, modern, medical-professional feel
- **Components**: shadcn/ui base with custom medical theme overlay
- **Animations**: Framer Motion for page transitions, card reveals, score counters
- **Charts**: Recharts for analytics (area charts, bar charts, radar charts, heatmaps)

---

## Security Implementation

| Feature | Implementation |
|---------|---------------|
| Helmet | Default + custom CSP headers |
| Rate Limiting | 100 req/15min general, 5 req/15min auth |
| Input Validation | Zod schemas on all endpoints |
| JWT | 15min access token, 7d refresh in httpOnly cookie |
| CORS | Whitelist frontend origin only |
| Password | bcrypt with 12 salt rounds |
| RBAC | Middleware checking `user.role` |

---

## Seed Data

Will generate 50+ physiology MCQs covering:
- Cell Physiology
- Blood & Hematology  
- Cardiovascular Physiology
- Respiratory Physiology
- Renal Physiology
- GI Physiology
- Neurophysiology
- Endocrinology

Each with full explanations, concept summaries, and wrong-option explanations.

---

## Deployment Configuration

| Target | Config |
|--------|--------|
| Vercel | `vercel.json` with SPA rewrites |
| Railway | `Dockerfile` + `railway.toml` |
| Docker | `docker-compose.yml` with client + server + mongo services |

---

## Verification Plan

### Automated Tests
- Backend: Build compilation check (`tsc --noEmit`)
- Frontend: Build compilation check (`npm run build`)
- Start dev servers and verify no crash

### Manual Verification
- Navigate all routes in browser
- Test auth flow (register → login → dashboard)
- Create and take a quiz
- Verify dark mode toggle
- Check responsive layout on mobile viewport

---

> [!IMPORTANT]
> **This is a very large project (~150+ source files).** I will build it systematically phase by phase, generating complete working code for every file. No placeholders or pseudo-code. The build will take multiple execution cycles.

> [!NOTE]
> **MongoDB Atlas**: You'll need to create a free cluster and provide the connection string in `.env`. The seed script will populate initial data.
> **Google OAuth**: Requires Google Cloud Console project with OAuth credentials.
> **Email (SMTP)**: Requires an SMTP provider (Gmail App Password, SendGrid, etc.) for password reset emails.
