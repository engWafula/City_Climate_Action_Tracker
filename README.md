# City Climate Action Tracker

Small Next.js application for the OEF AI-Native Software Engineer exercise. It gives a city admin a simple place to manage baseline emissions and climate actions, and gives the public a dashboard for progress toward net zero.

## Stack

- Next.js 16, React 19, TypeScript
- Tailwind CSS 4 with local Shadcn-style UI primitives
- Prisma 7 with PostgreSQL
- Docker Compose for the full stack: Next.js app and Postgres
- OpenAI Responses API for free-text import, with a deterministic fallback when `OPENAI_API_KEY` is not set
- Vitest unit tests for domain calculations and import fallback behavior

## Environment Variables

Create a local `.env` file before running the app:

```bash
cp .env.example .env
```

Common variables:

```bash
DATABASE_URL="postgresql://oef:oef@localhost:5433/oef_climate?schema=public"
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="admin"
AUTH_SECRET="replace-with-a-long-random-secret"
OPENAI_API_KEY=""
```

- `ADMIN_USERNAME` and `ADMIN_PASSWORD` are used by the seed script to create the demo admin account.
- `AUTH_SECRET` is used by NextAuth to sign and encrypt authentication data. It is required in production.
- `OPENAI_API_KEY` is optional. When it is not set, the free-text import feature uses the local fallback parser.
- Docker Compose supplies its own internal `DATABASE_URL` for the app container.

## Run with Docker Compose

The included `docker-compose.yml` is configured for development with hot reload.

Build and start the full stack:

```bash
docker compose up --build
```

The app will be available at `http://localhost:3000`.

Postgres is exposed on host port `5433` to avoid clashing with a common local Postgres install on `5432`. Inside Docker, the app connects to `postgres:5432`.

On startup, the app container runs:

```bash
npm run db:generate
npm run db:push:accept-data-loss
npm run db:seed
npm run dev -- --hostname 0.0.0.0
```

The project folder is bind-mounted into the app container for hot reload. Container dependencies live in a named `node-modules` volume, so host and container installs do not fight each other.

The seeded admin login comes from `ADMIN_USERNAME` and `ADMIN_PASSWORD`.

With the default `.env.example` values, the seeded login is:

```bash
username: admin
password: admin
```

Override the demo admin credentials in `.env` before seeding:

```bash
ADMIN_USERNAME="city-admin"
ADMIN_PASSWORD="change-me"
```

Stop the stack with:

```bash
docker compose down
```

To also remove the Postgres data volume:

```bash
docker compose down -v
```

## Run Locally Without Docker

Install dependencies:

```bash
npm install
```

Start only Postgres with Docker:

```bash
docker compose up -d postgres
```

Prepare the database:

```bash
npm run db:generate
npm run db:push
npm run db:seed
```

Start the Next.js development server:

```bash
npm run dev
```

Open `http://localhost:3000` for the public dashboard and `http://localhost:3000/admin` for the admin role. Both pages support `?cityId=<city-id>` for city-specific views.

## Build for Production

Generate Prisma Client and build the Next.js app:

```bash
npm run build
```

Start the production server after a successful build:

```bash
npm run start
```

For production deployments, set a production `DATABASE_URL`, a strong `AUTH_SECRET`, a strong seeded admin username/password, and optionally `OPENAI_API_KEY`.

## Quality checks

```bash
npm run lint
npm run test
npx tsc --noEmit
npm run build
```

## Useful Scripts

- `npm run dev` starts Next.js in development mode.
- `npm run build` generates Prisma Client and creates a production build.
- `npm run start` starts the production server.
- `npm run db:generate` generates Prisma Client.
- `npm run db:push` syncs the Prisma schema to the database.
- `npm run db:push:accept-data-loss` syncs the Prisma schema and accepts destructive changes for disposable development databases.
- `npm run db:seed` inserts the demo admin user, sample Greenville city, and climate actions.
- `npm run lint` runs ESLint.
- `npm run test` runs Vitest.

## Notes

- The app supports multiple cities. Admins can add, select, and edit cities from `/admin`; the public dashboard can switch between configured cities.
- The projected emissions chart and on-track indicator use all entered actions from their start year. The public metrics show estimated commitments, total climate actions, and the required annual reduction pace to reach the selected city's net-zero target.
- The import feature calls OpenAI if `OPENAI_API_KEY` exists. If that request fails, or no key is configured, it still parses sample-style policy text with the local fallback parser.
