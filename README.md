# auth-jwt

A production-ready JWT authentication REST API built from scratch with **Node.js** and **TypeScript** — no Express, no framework magic.

**Live demo:** [fe-auth-app-1b7z.vercel.app](https://fe-auth-app-1b7z.vercel.app)
**API:** [auth-jwt-eghx.onrender.com](https://auth-jwt-eghx.onrender.com)
**Frontend repo:** [github.com/DrDakka/fe-auth-app](https://github.com/DrDakka/fe-auth-app)

## Features

- **Access + Refresh token** rotation with HTTP-only cookies
- **Email verification** on registration via [Resend](https://resend.com)
- **Password reset** via email link
- **Account management** — update profile, change password, delete account
- **Zod validation** on all request bodies with descriptive error messages
- **Layered architecture** — router → middleware → controller → service → repository
- **Custom error classes** with centralized error handling
- **CORS** and preflight OPTIONS support

## Tech Stack

Runtime:      Node.js 20, TypeScript 5
HTTP:         Built-in `node:http` (no framework)
DB:           PostgreSQL + Sequelize ORM
Auth:         JWT (`jsonwebtoken`) + bcrypt
Validation:   Zod
Email:        Resend HTTP API

## Architecture

```
src/
├── controllers/      # Request handlers (auth, registration, account, password reset)
│   └── helpers/      # Shared logic: token creation, cookie building, password hashing
├── services/         # Business logic (user, token, email)
├── middleware/       # Body parser, token auth, error handler
├── validation/       # Zod schemas + request/body validators
├── router/           # Route → controller mapping with auth & schema config
├── model/            # Sequelize models (User, Token)
├── db/               # Database setup
├── dto/              # Data transfer objects (strip sensitive fields)
├── utils/            # JWT, cookie parser, CORS headers
├── errors/           # Custom error classes (RequestError, DBError)
└── static/           # Constants: endpoints, HTTP status codes, token types, schemas
```

## API Endpoints

`POST`    `/register`                   — Register a new user, sends activation email
`GET`     `/register/activate?token=`   — Activate account via email link
`POST`    `/auth`                       — Login with email + password
`POST`    `/auth/refresh`               — Rotate refresh token (cookie)
`PATCH`   `/auth/logout`                — Logout and clear tokens (cookie)
`GET`     `/profile`                    — Get current user data (cookie)
`PATCH`   `/profile`                    — Update name or email (cookie)
`PATCH`   `/profile/password`           — Change password (cookie)
`DELETE`  `/profile`                    — Delete account (cookie)
`POST`    `/password/reset-request`     — Send password reset email
`POST`    `/password/reset`             — Reset password with token
`POST`    `/demo`                       — Login as demo user (no registration required)

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL
- [Resend](https://resend.com) account + verified domain

### Setup

```bash
git clone https://github.com/drdakka/auth-jwt.git
cd auth-jwt
npm install
```

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

Start the server:

```bash
npm start
```

The server will sync database tables automatically on startup.

### Development (watch mode)

```bash
npm run dev
```

## Environment Variables

`PORT` Server port (default: 5700)
`POSTGRES_*` PostgreSQL connection settings
`JWT_SECRET` Secret key for signing JWTs
`BASE_URL` Frontend base URL used in email links
`CORS_ORIGIN` Allowed CORS origin (frontend URL)
`RESEND_API_KEY` Resend API key for sending emails
`RESEND_FROM` Sender address (e.g. `noreply@yourdomain.com`)

## Security Notes

- Passwords are hashed with **bcrypt** (10 rounds)
- JWTs are stored in **HTTP-only, SameSite=None; Secure cookies** — not accessible via JavaScript
- Refresh tokens are stored in the database and invalidated on use (rotation)
- All sessions are invalidated on password change
