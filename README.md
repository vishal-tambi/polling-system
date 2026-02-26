# ✦ Intervue Poll — Live Classroom Polling System

> Real-time polling for classrooms. Teachers create questions, students answer live, results appear instantly — no accounts, no installs.

![Frontend](https://img.shields.io/badge/Frontend-React%20%2B%20TypeScript-blue)
![Backend](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-green)
![Database](https://img.shields.io/badge/Database-MongoDB-brightgreen)
![Realtime](https://img.shields.io/badge/Realtime-Socket.io-orange)
![Deploy](https://img.shields.io/badge/Deploy-Vercel%20%2B%20Railway-purple)

---

## 🛠 Tech Stack

| Layer | Stack |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS v3, React Router v7, Socket.io Client, Lenis, Sonner |
| Backend | Node.js, Express 5, TypeScript, Socket.io, Mongoose |
| Database | MongoDB Atlas |
| Deploy | Frontend → Vercel, Backend → Railway |

---

## ✨ Key Features

- **Teacher** — Create timed polls, watch live results, kick students, view history, chat
- **Student** — Join with just a name, vote once, see correct answer on close, chat
- Zero friction (no sign-up), real-time via Socket.io, page-refresh resilient

---

## 📡 REST API

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Uptime health check |
| `GET` | `/api/polls/active` | Current active/waiting poll |
| `GET` | `/api/polls/history` | All closed polls (newest first) |

> REST is only used for initial load. All live updates go through WebSockets.

---

## ⚡ WebSocket Events

**Client → Server**

| Event | Who | Description |
|---|---|---|
| `poll:create` | Teacher | Create & start a new poll |
| `poll:vote` | Student | Cast a vote |
| `student:kick` | Teacher | Kick a student by socket ID |
| `chat:send` | Anyone | Send a chat message |

**Server → Client**

| Event | Description |
|---|---|
| `poll:started` | New poll broadcast to everyone |
| `poll:vote_updated` | Updated vote counts after each vote |
| `poll:closed` | Poll ended (timer or manual) |
| `poll:error` / `poll:vote_error` | Error responses (to sender only) |
| `student:kicked` | Notifies the kicked student |
| `chat:message` | Broadcast chat message |

---

## 🔐 Environment Variables

**`backend/.env`**
```env
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/intervue
PORT=5000
FRONTEND_URL=https://your-frontend.vercel.app
```

**`frontend/.env`**
```env
VITE_BACKEND_URL=https://your-backend.railway.app
```

---

## 🚀 Local Development

**Prerequisites:** Node.js ≥ 18, npm ≥ 9, MongoDB Atlas (free tier works)

```bash
# Clone
git clone https://github.com/<your-username>/intervue.git

# Backend
cd backend && npm install
cp .env.example .env   # fill in MONGODB_URI, PORT, FRONTEND_URL
npm run dev            # http://localhost:5000

# Frontend (new terminal)
cd frontend && npm install
echo "VITE_BACKEND_URL=http://localhost:5000" > .env
npm run dev            # http://localhost:5173
```

Open two tabs — one as **Teacher** (`/teacher`), one as **Student** (`/select` → Student) — to test the full flow.

---

## 📁 Project Structure

```
intervue/
├── backend/src/
│   ├── config/db.ts
│   ├── controllers/PollController.ts
│   ├── models/          # Poll.ts, Vote.ts, ChatMessage.ts
│   ├── routes/pollRoutes.ts
│   ├── services/PollService.ts
│   ├── sockets/PollSocketHandler.ts
│   └── index.ts
└── frontend/src/
    ├── components/      # BrandPill, ChatFAB, ChatPanel, PollCard
    ├── context/PollContext.tsx
    ├── pages/           # LandingPage, RoleSelect, StudentName, StudentWaiting,
    │                    # StudentPoll, KickedOut, TeacherDashboard, PollHistory
    ├── App.tsx
    └── main.tsx
```