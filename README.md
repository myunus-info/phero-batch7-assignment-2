# Assignment 2 - DevPulse API

## Live URL

(https://devpulse-eight-kappa.vercel.app/)

## Features

- User authentication and authorization with JWT
- Issue creation for authenticated contributors and maintainers
- Public issue listing and issue detail retrieval
- Issue update rules:
  - maintainers can update any issue
  - contributors can update only their own open issues
- Issue deletion restricted to maintainers
- Filtering and sorting support for issue lists
- PostgreSQL database with secure environment configuration

## Tech Stack

- Node.js
- TypeScript
- Express
- PostgreSQL
- `pg`
- `jsonwebtoken`
- `bcryptjs`
- `dotenv`
- `tsup`

## Setup

1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd assignment-2
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file at the project root with the required variables:
   ```env
   DATABASE_CONNECTION_STRING=postgresql://user:password@host:port/database?sslmode=verify-full
   PORT=5000
   BCRYPT_SALT_ROUNDS=10
   JWT_SECRET=your_jwt_secret
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Build for production:
   ```bash
   npm run build
   ```
6. Run the production build:
   ```bash
   npm start
   ```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and receive a JWT

### Issues

- `POST /api/issues` - Create a new issue (authenticated contributor or maintainer)
- `GET /api/issues` - Get all issues with optional query filters:
  - `sort=newest|oldest`
  - `type=bug|feature_request`
  - `status=open|in_progress|resolved`
- `GET /api/issues/:id` - Get a single issue by ID
- `PATCH /api/issues/:id` - Update an issue (maintainer or issue owner when open)
- `DELETE /api/issues/:id` - Delete an issue (maintainer only)

## Database Schema Summary

### `auth`

- `id` - serial primary key
- `name` - user name
- `email` - unique email address
- `password` - hashed password
- `role` - user role (`contributor` or `maintainer`)
- `created_at` - creation timestamp
- `updated_at` - update timestamp

### `issues`

- `id` - serial primary key
- `reporter_id` - foreign key to `auth.id`
- `title` - issue title
- `description` - issue description
- `type` - `bug` or `feature_request`
- `status` - `open`, `in_progress`, or `resolved`
- `created_at` - creation timestamp
- `updated_at` - update timestamp

## Notes

- The `reporter_id` for new issues is taken from the decoded JWT, not the request body.
- The project is configured to load environment variables from `.env`.
