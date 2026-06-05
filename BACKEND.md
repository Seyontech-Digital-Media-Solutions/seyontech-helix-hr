# StartSmart Backend

This project now includes a Node.js + Express.js API backed by PostgreSQL through Prisma and protected with Supabase Authentication.

## Setup

1. Copy `.env.example` to `.env` and fill in your PostgreSQL and Supabase values.
2. Install dependencies:

```bash
npm install
```

3. Generate Prisma Client and create the database tables:

```bash
npm run prisma:generate
npm run prisma:migrate -- --name init
```

4. Start the API:

```bash
npm run api:dev
```

The API runs at `http://localhost:4000` by default.

## Authentication

Every protected endpoint expects a Supabase access token:

```http
Authorization: Bearer <supabase-access-token>
```

The server verifies that token using `SUPABASE_SERVICE_ROLE_KEY`. Users are mirrored into the local `UserProfile` table on first request. A user is treated as an admin when either:

- their Supabase `app_metadata.role` or `user_metadata.role` is `admin`
- their email is listed in `ADMIN_EMAILS`

## Endpoints

- `GET /api/health` - health check
- `GET /api/me` - current authenticated user profile
- `GET /api/auth/me` - current authenticated user profile
- `POST /api/auth/verify` - verify a Supabase JWT
- `POST /api/auth/password-reset` - request a password reset email
- `POST /api/submissions/pre-joining` - create a pre-joining submission
- `POST /api/submissions/post-joining` - create a post-joining submission
- `GET /api/submissions` - list own submissions, or all submissions for admins
- `GET /api/submissions/:id` - read one submission
- `PATCH /api/submissions/:id/status` - update status, admin only

Optional list filters:

- `status=PENDING|APPROVED|JOINED|REJECTED`
- `type=PRE_JOINING|POST_JOINING`
- `q=<search text>`
