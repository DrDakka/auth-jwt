# auth-jwt

A production-ready JWT authentication REST API built from scratch with **Node.js** and **TypeScript** — no Express, no framework magic.

## Features

- **Access + Refresh token** rotation with HTTP-only cookies
- **Email verification** on registration
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
Email:        Nodemailer

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
`GET`     `/register/activate?token=`   —  Activate account via email link
`POST`    `/auth`                       — Login with email + password 
`POST`    `/auth/refresh`               — cookie Rotate refresh token
`PATCH`   `/auth/logout`                — cookie Logout and clear tokens
`GET`     `/profile`                    — cookie Get current user data
`PATCH`   `/profile`                    — cookie Update name or email
`PATCH`   `/profile/password`           — cookie Change password
`DELETE`  `/profile`                    — cookie Delete account
`POST`    `/password/reset-request`     — Send password reset email
`POST`    `/password/reset`             — Reset password with token

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL

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

See [.env.example](.env.example) for all required variables.

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 5700) |
| `POSTGRES_*` | PostgreSQL connection settings |
| `JWT_SECRET` | Secret key for signing JWTs |
| `BASE_URL` | Base URL used in email links |
| `CORS_ORIGIN` | Allowed CORS origin |
| `SMTP_*` | SMTP credentials for sending email |

## Security Notes

- Passwords are hashed with **bcrypt** (10 rounds)
- JWTs are stored in **HTTP-only, SameSite=Strict cookies** — not accessible via JavaScript
- Refresh tokens are stored in the database and invalidated on use (rotation)
- All sessions are invalidated on password change
