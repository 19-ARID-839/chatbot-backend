
# Synchro Chat Backend (Node + Express + MongoDB)

A secure, production-ready backend for your AI-powered chatbot app with user auth, chat storage, admin metrics, and a simple knowledge base uploader.

## Quick Start

```bash
cp .env.example .env
# fill in MONGODB_URI and OPENAI_API_KEY

npm install
npm run seed    # optional: creates admin and demo user
npm run dev     # starts server on http://localhost:8080
```

### Default API (base: `/api`)

**Auth**
- `POST /auth/register` { name, email, password }
- `POST /auth/login` { email, password }
- `GET /auth/me` (Bearer token)

**Chat**
- `GET /chat/conversations`
- `GET /chat/conversations/:id`
- `POST /chat/message` { content, conversationId? } → returns `{ conversationId, reply }`

**Admin** (requires admin token)
- `GET /admin/overview`
- `GET /admin/users`
- `GET /admin/chats`

**Knowledge Base** (admin)
- `GET /knowledge`
- `POST /knowledge/upload` (form-data `file`)
- `DELETE /knowledge/:id`

## Connect Frontend
- Set `ALLOWED_ORIGINS` in `.env` to your frontend URL(s).
- Frontend should save `token` from login/register and send `Authorization: Bearer <token>` for protected routes.
- For chat, post user message to `/api/chat/message` and render `reply`.

## Notes
- Chat uses OpenAI via `src/utils/ai.js`. Model defaults to `gpt-4o-mini`. Change as needed.
- Swap MongoDB with PostgreSQL later if preferred.
- Add streaming & embeddings later.
