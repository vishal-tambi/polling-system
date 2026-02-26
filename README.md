# ✦ Intervue Poll — Live Classroom Polling System

> A real-time polling platform built for classrooms. Teachers create questions, students answer instantly, and results appear live — no accounts, no installs, zero friction.

![Tech Stack](https://img.shields.io/badge/Frontend-React%20%2B%20TypeScript-blue)
![Tech Stack](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-green)
![Tech Stack](https://img.shields.io/badge/Database-MongoDB%20%2B%20Mongoose-brightgreen)
![Tech Stack](https://img.shields.io/badge/Realtime-Socket.io-orange)
![Tech Stack](https://img.shields.io/badge/Deployment-Vercel%20%2B%20Railway-purple)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Database Models](#-database-models)
- [REST API Endpoints](#-rest-api-endpoints)
- [WebSocket Events](#-websocket-events)
- [Frontend Pages & Routes](#-frontend-pages--routes)
- [Frontend Components](#-frontend-components)
- [User Flows](#-user-flows)
- [Environment Variables](#-environment-variables)
- [Getting Started (Local Development)](#-getting-started-local-development)
- [Deployment](#-deployment)
- [Architecture Diagram](#-architecture-diagram)

---

## 🧭 Overview

**Intervue Poll** is a full-stack, real-time polling application intended for interactive classroom use. A **Teacher** creates timed multiple-choice polls; **Students** join with just their name and answer live. Results are broadcast to everyone in real-time via WebSockets. All polls are auto-saved and reviewable in a history view.

Key design principles:
- **Zero friction** — No sign-up, no login, no downloads required for students
- **Real-time first** — All poll state changes are pushed via Socket.io, never polled
- **Resilient** — Page refreshes are handled gracefully; active polls are re-fetched from the REST API

---

## ✨ Features

### 👩‍🏫 Teacher Features
| Feature | Description |
|---|---|
| Create Poll | Write a question, add up to N options, mark the correct answer, set a timer (30–120s) |
| Live Results | Watch vote counts update in real-time via animated bar charts |
| Auto-close | Poll closes automatically when the timer runs out |
| Kick Student | Remove a misbehaving student from the session |
| Poll History | View all previously closed polls with final vote breakdowns |
| Built-in Chat | Send messages to students in a floating chat panel |

### 🎓 Student Features
| Feature | Description |
|---|---|
| Name Entry | Students join with just a display name — no account needed |
| Live Poll | Instantly receive new polls as the teacher creates them |
| One Vote | Each student can only vote once per poll (enforced DB-side) |
| Correct Answer Reveal | See the correct answer highlighted after the poll closes |
| Waiting Screen | Friendly holding screen when no poll is active |
| Built-in Chat | Ask questions to the teacher without disrupting class |

### 🌐 General
- Smooth scroll via **Lenis**
- Toast notifications via **Sonner**
- Fully responsive design
- SPA routing with **React Router v6** (Vercel redirect rules included)
- Health check endpoint for uptime monitoring (UptimeRobot)

---

## 🛠 Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | ^18 | UI framework |
| TypeScript | ^5 | Type safety |
| Vite | ^6 | Dev server & bundler |
| React Router DOM | ^7 | Client-side routing |
| Socket.io Client | ^4 | Real-time WebSocket connection |
| Tailwind CSS | ^3 | Utility-first CSS base/reset |
| Lenis | latest | Smooth scrolling |
| Sonner | latest | Toast notifications |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Node.js | ≥18 | Runtime |
| Express | ^5 | HTTP server & REST API |
| TypeScript | ^5 | Type safety |
| Socket.io | ^4 | WebSocket server |
| Mongoose | ^9 | MongoDB ODM |
| dotenv | ^17 | Environment variable loading |
| cors | ^2 | Cross-origin request handling |
| ts-node-dev | ^2 | Development with hot reload |

### Database
| Technology | Purpose |
|---|---|
| MongoDB Atlas | Hosted cloud database |
| Mongoose ODM | Schema enforcement, query helpers |

---

## 📁 Project Structure

```
intervue/
├── backend/                    # Node.js + Express server
│   ├── src/
│   │   ├── config/
│   │   │   └── db.ts           # MongoDB connection setup
│   │   ├── controllers/
│   │   │   └── PollController.ts  # HTTP request handlers
│   │   ├── models/
│   │   │   ├── Poll.ts         # Poll schema & model
│   │   │   ├── Vote.ts         # Vote schema & model (with unique index)
│   │   │   └── ChatMessage.ts  # Chat message schema & model
│   │   ├── routes/
│   │   │   └── pollRoutes.ts   # Express route definitions
│   │   ├── services/
│   │   │   └── PollService.ts  # All poll business logic
│   │   ├── sockets/
│   │   │   └── PollSocketHandler.ts  # Socket.io event wiring
│   │   └── index.ts            # App entry point (Express + Socket.io setup)
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                   # React + Vite app
│   ├── src/
│   │   ├── components/
│   │   │   ├── BrandPill.tsx   # Reusable brand badge
│   │   │   ├── ChatFAB.tsx     # Floating action button for chat
│   │   │   ├── ChatPanel.tsx   # Slide-in chat panel (teacher + student)
│   │   │   └── PollCard.tsx    # Reusable poll result card
│   │   ├── context/
│   │   │   └── PollContext.tsx # Global state & Socket.io connection
│   │   ├── hooks/              # Custom React hooks
│   │   ├── lib/                # Utility helpers
│   │   ├── pages/
│   │   │   ├── LandingPage.tsx      # Public marketing / home page
│   │   │   ├── RoleSelect.tsx       # Choose Teacher or Student
│   │   │   ├── StudentName.tsx      # Student enters their name
│   │   │   ├── StudentWaiting.tsx   # Waiting for next poll
│   │   │   ├── StudentPoll.tsx      # Active poll answering view
│   │   │   ├── KickedOut.tsx        # Shown when teacher kicks a student
│   │   │   ├── TeacherDashboard.tsx # Teacher create + live results view
│   │   │   └── PollHistory.tsx      # All closed polls + results
│   │   ├── types/              # Shared TypeScript interfaces
│   │   ├── App.tsx             # Root component + React Router setup
│   │   ├── main.tsx            # Entry point (Lenis, PollProvider, Toaster)
│   │   └── index.css           # Global styles + landing page CSS
│   ├── vercel.json             # SPA routing redirect rule
│   ├── package.json
│   └── vite.config.ts
│
└── README.md
```

---

## 🗄 Database Models

### `Poll`
The core document representing a single question.

| Field | Type | Description |
|---|---|---|
| `_id` | ObjectId | MongoDB auto-generated ID |
| `question` | String | The poll question text |
| `options` | IOption[] | Array of answer choices |
| `options[].text` | String | Option label |
| `options[].votes` | Number | Running vote count |
| `options[].isCorrect` | Boolean | Whether this is the correct answer |
| `durationSeconds` | Number | Timer length in seconds (30–120) |
| `startedAt` | Date \| null | When the poll was activated |
| `status` | `"waiting"` \| `"active"` \| `"closed"` | Lifecycle state |
| `createdAt` | Date | Mongoose timestamp |

**Poll Lifecycle:**
```
waiting  →  active  →  closed
 (created)  (started)  (timer expired or manual)
```

---

### `Vote`
Records a single student's answer. A **unique compound index** on `(pollId, studentIdentifier)` prevents double voting at the database level.

| Field | Type | Description |
|---|---|---|
| `_id` | ObjectId | Auto-generated |
| `pollId` | ObjectId (ref: Poll) | Which poll this vote belongs to |
| `studentIdentifier` | String | Unique browser session ID for the student |
| `optionIndex` | Number | Index into the poll's `options` array |
| `createdAt` | Date | Mongoose timestamp |

> **Key design note:** Vote counting uses MongoDB's atomic `$inc` operator on the `Poll` document to avoid race conditions. Relying on Mongoose's in-memory mutation + `save()` would silently miss concurrent votes.

---

### `ChatMessage`
A single chat message sent during a session.

| Field | Type | Description |
|---|---|---|
| `_id` | ObjectId | Auto-generated |
| `senderName` | String | Display name of the sender |
| `role` | `"teacher"` \| `"student"` | Role of the sender |
| `text` | String | Message content |
| `createdAt` | Date | Mongoose timestamp |

---

## 📡 REST API Endpoints

**Base URL:** `https://<your-backend-domain>`

All endpoints return JSON.

| Method | Endpoint | Description | Response |
|---|---|---|---|
| `GET` | `/health` | Health check for uptime monitoring | `{ status: "ok", timestamp: "..." }` |
| `GET` | `/api/polls/active` | Get the current `waiting` or `active` poll | `{ poll: IPoll \| null }` |
| `GET` | `/api/polls/history` | Get all `closed` polls, newest first | `{ polls: IPoll[] }` |

> **Note:** The REST API is only used for **initial page load / refresh resilience**. All live updates flow through WebSockets.

---

## ⚡ WebSocket Events

The Socket.io server runs on the same port as Express (HTTP server upgrade). Clients pass their `role` as a query param on connection:

```js
// Example connection
const socket = io(BACKEND_URL, { query: { role: 'student' } });
```

---

### Client → Server (Emitted by client)

| Event | Payload | Who emits | Description |
|---|---|---|---|
| `poll:create` | `{ question, options[{ text, isCorrect }], durationSeconds }` | Teacher | Creates and immediately starts a new poll |
| `poll:vote` | `{ pollId, optionIndex, studentIdentifier }` | Student | Casts a vote for an option |
| `student:kick` | `{ socketId }` | Teacher | Kicks a specific student by their socket ID |
| `chat:send` | `{ senderName, role, text }` | Teacher / Student | Sends a chat message to all connected clients |

---

### Server → Client (Emitted by server)

| Event | Payload | Who receives | Description |
|---|---|---|---|
| `poll:started` | `{ poll: IPoll, serverTime: string }` | Everyone | Broadcast when a new poll goes live |
| `poll:vote_updated` | `{ poll: IPoll }` | Everyone | Broadcast after every successful vote with updated counts |
| `poll:closed` | `{ poll: IPoll }` | Everyone | Broadcast when the poll timer expires or is manually closed |
| `poll:error` | `{ message: string }` | Sender only | Error response for `poll:create` (e.g. poll already active) |
| `poll:vote_error` | `{ message: string }` | Sender only | Error response for `poll:vote` (e.g. already voted) |
| `student:kicked` | _(none)_ | Kicked student | Tells the student they've been removed |
| `chat:message` | `IChatMessage` | Everyone | Broadcasts a persisted chat message |

---

## 🗺 Frontend Pages & Routes

| Route | Page | Access | Description |
|---|---|---|---|
| `/` | `LandingPage` | Public | Hero, Features, How it works, Stats, Footer |
| `/select` | `RoleSelect` | Public | Choose between Teacher or Student |
| `/student/name` | `StudentName` | Public | Student enters their display name |
| `/student/waiting` | `StudentWaiting` | Student | Idle screen — waits for a poll to go live |
| `/student/poll` | `StudentPoll` | Student | Active poll UI — choose an answer, see results |
| `/student/kicked` | `KickedOut` | Student | Shown when the teacher removes the student |
| `/teacher` | `TeacherDashboard` | Teacher only | Create polls, see live results, manage students |
| `/teacher/history` | `PollHistory` | Teacher only | Browse all past closed polls |

> Teacher-only routes redirect to `/` if `role !== 'teacher'`.
> Student pages guard against the kicked state, redirecting to `KickedOut` as needed.

---

## 🧩 Frontend Components

| Component | Description |
|---|---|
| `BrandPill` | Reusable `✦ Intervue Poll` brand badge used across pages |
| `ChatFAB` | Floating action button (💬) that toggles the chat panel open/close |
| `ChatPanel` | Full slide-in chat UI — displays history, lets users type & send messages |
| `PollCard` | Reusable card that renders a closed poll's question and final vote breakdown |

---

## 🔄 User Flows

### Teacher Flow
```
/ (Landing)  →  /select  →  /teacher (Dashboard)
                                  │
                         ┌────────┴────────┐
                    Create Poll       /teacher/history
                    (Socket)          (Poll History page)
                         │
                    Poll goes live → Students answer
                         │
                    Timer ends → poll:closed broadcast
                         │
                    Create next poll
```

### Student Flow
```
/ (Landing)  →  /select  →  /student/name
                                  │
                            Enter display name
                                  │
                            /student/waiting  ←──────┐
                                  │                   │
                             Poll starts              │ (poll closes)
                            (poll:started)            │
                                  │                   │
                            /student/poll  ───────────┘
                                  │
                            Cast vote (poll:vote)
                                  │
                            See live results
                                  │
                            Teacher kicks? → /student/kicked
```

---

## 🔐 Environment Variables

### Backend (`backend/.env`)

```env
# MongoDB connection string (get from MongoDB Atlas)
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/intervue

# Port the Express server listens on
PORT=5000

# URL of the deployed frontend (for CORS)
FRONTEND_URL=https://your-frontend.vercel.app
```

### Frontend (`frontend/.env`)

```env
# URL of the deployed backend (for REST + Socket.io)
VITE_BACKEND_URL=https://your-backend.railway.app
```

---

## 🚀 Getting Started (Local Development)

### Prerequisites
- **Node.js** ≥ 18
- **npm** ≥ 9
- A **MongoDB Atlas** cluster (free tier works fine) or local MongoDB

---

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/intervue.git
cd intervue
```

---

### 2. Set up the Backend

```bash
cd backend

# Install dependencies
npm install

# Create your environment file
cp .env.example .env
# → Fill in MONGODB_URI, PORT, FRONTEND_URL

# Start the dev server (hot reload enabled)
npm run dev
```

The backend will be available at `http://localhost:5000`.

---

### 3. Set up the Frontend

```bash
cd frontend

# Install dependencies
npm install

# Create your environment file
echo "VITE_BACKEND_URL=http://localhost:5000" > .env

# Start the Vite dev server
npm run dev
```

The frontend will be available at `http://localhost:5173`.

---

### 4. Open in browser

- **Landing page:** `http://localhost:5173`
- **Teacher dashboard:** `http://localhost:5173/teacher` _(select Teacher role first)_
- **Student flow:** `http://localhost:5173/select` → Student

To test the full flow, open two browser tabs — one as Teacher, one as Student.

---

### Backend Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server with hot reload (`ts-node-dev`) |
| `npm run build` | Compile TypeScript → `dist/` |
| `npm start` | Run the compiled production build |

### Frontend Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Preview the production build locally |