# Chat Service

Standalone customer support chat backend (Express + Socket.IO + MongoDB) for the
MERN e-commerce project. It deploys independently (e.g. on Render) and shares
only two things with the main e-commerce backend:

1. **The MongoDB database** — it reads the existing `users` collection
   (read-only) and owns two new collections: `chat_conversations` and
   `chat_messages`.
2. **The `JWT_SECRET`** — so it can verify the short-lived chat tokens issued
   by the main backend's `GET /api/chat/token` endpoint.

Nothing in the e-commerce backend imports from this service, and vice versa.

## How authentication works

The e-commerce app keeps its JWTs in httpOnly cookies scoped to its own domain,
so this service can never see them. Instead:

```
Browser ──(cookie)──> E-commerce backend  GET /api/chat/token
        <──────────── { chatToken }            (1h, { id, scope: "chat" })

Browser ──(Authorization: Bearer chatToken)──> Chat service REST API
Browser ──(socket.handshake.auth.token)──────> Chat service Socket.IO
```

On every request/handshake the chat service verifies the token signature and
re-reads the user (including `is_admin`) from the shared database. The client
never gets to claim a userId or role.

## Run locally

```bash
npm install
cp .env.example .env   # fill in values (JWT_SECRET must match the main backend)
npm run dev            # http://localhost:5001
```

## Environment variables

| Variable     | Description                                                            |
| ------------ | ---------------------------------------------------------------------- |
| `MONGO_URI`  | Same MongoDB connection string the e-commerce backend uses.            |
| `JWT_SECRET` | MUST equal the e-commerce backend's `JWT_SECRET`.                      |
| `CLIENT_URL` | Allowed browser origin(s), comma-separated. No trailing slashes.       |
| `PORT`       | Optional locally (default 5001). Render injects its own `PORT`.        |

## REST API

All endpoints require `Authorization: Bearer <chatToken>`.

| Method | Path                                              | Who          | Purpose                                  |
| ------ | ------------------------------------------------- | ------------ | ---------------------------------------- |
| GET    | `/health`                                         | public       | Render health check                      |
| GET    | `/api/chat/me/conversation`                       | customer     | Find-or-create own conversation + unread |
| GET    | `/api/chat/conversations`                         | admin        | Sidebar list with unread counts/presence |
| GET    | `/api/chat/conversations/:id`                     | admin/owner  | One conversation + unread count          |
| GET    | `/api/chat/conversations/:id/messages`            | admin/owner  | History (`?limit=30&before=<messageId>`) |
| POST   | `/api/chat/conversations/:id/messages`            | admin/owner  | REST send fallback (`{ message }`)       |
| PATCH  | `/api/chat/conversations/:id/read`                | admin/owner  | Mark the other party's messages read     |

## Socket.IO events

Client → server: `conversation:join` (admin), `conversation:leave` (admin),
`message:send` (ack), `messages:read` (ack).

Server → client: `conversation:ready`, `message:new`, `messages:read`,
`conversation:updated` (admins room), `presence:update` (admins room).

Rooms are named `conversation-<conversationId>` — conversation identity is the
MongoDB id, never `socket.id`.

## Deploy on Render

1. Push the repo (or just this folder) to GitHub.
2. Render → **New → Web Service**, pick the repo.
3. Settings:
   - **Root Directory**: `chat-service`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Health Check Path**: `/health`
4. Environment variables: `MONGO_URI`, `JWT_SECRET` (same as main backend),
   `CLIENT_URL=https://your-frontend-domain.com`. Do **not** set `PORT` —
   Render provides it.
5. If using MongoDB Atlas, allow Render's outbound IPs (or `0.0.0.0/0`) in the
   Atlas network access list.
6. Deploy, then set `VITE_CHAT_SERVER_URL=https://<your-service>.onrender.com`
   in the frontend's production environment and redeploy the frontend.

Render web services support WebSockets out of the box; Socket.IO falls back to
polling automatically if a proxy interferes.

> Note: on Render's free tier the service spins down when idle — the first
> chat request after idling takes ~30–60s while it cold-starts. Use a paid
> instance for production support chat.
