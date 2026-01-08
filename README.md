# Harmony

A modern web application built with [Next.js](https://nextjs.org), utilizing [Drizzle ORM](https://orm.drizzle.team) with [Turso](https://turso.tech) (libSQL) for the database layer, and styled with [Tailwind CSS](https://tailwindcss.com).

## Tech Stack

- **Framework:** [Next.js 15](https://nextjs.org) (App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com) & [Radix UI](https://www.radix-ui.com/)
- **Database:** [Turso](https://turso.tech) (libSQL)
- **ORM:** [Drizzle ORM](https://orm.drizzle.team)
- **State Management:** [Zustand](https://zustand-demo.pmnd.rs/)
- **Icons:** [Lucide React](https://lucide.dev)

## Getting Started

### Prerequisites

Ensure you have the following installed on your machine:

- **Node.js** (v18 or later recommended)
- **npm**, **yarn**, **pnpm**, or **bun**

### Environment Setup

1. Copy the example environment file (or create a new one):

   ```bash
   cp .env.local.example .env.local
   ```

   _(Note: If `.env.local.example` does not exist, create a `.env.local` file in the root directory.)_

2. Configure the following environment variables in `.env.local`:

   ```env
   TURSO_DATABASE_URL="libsql://your-database-url.turso.io"
   TURSO_AUTH_TOKEN="your-turso-auth-token"
   ```

### Installation

Install the project dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

### Database Setup

This project uses Drizzle Kit for database migrations and management.

- **Generate Migrations:**

  ```bash
  npm run db:generate
  ```

- **Run Migrations:**

  ```bash
  npm run db:migrate
  ```

- **Push Schema Changes Directy (Prototyping):**

  ```bash
  npm run db:push
  ```

- **Open Drizzle Studio:**
  ```bash
  npm run db:studio
  ```

### Running the Development Server

Start the local development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

- `/app`: Next.js App Router pages and layouts.
- `/components`: Reusable UI components.
- `/db`: Database schema and connection configuration.
- `/services`: Business logic and data access layers.
- `/stores`: Zustand state management stores.
- `/public`: Static assets.

## Scripts

- `dev`: Runs the development server.
- `build`: Builds the application for production.
- `start`: Starts the production server.
- `lint`: Runs ESLint.
- `db:generate`: Generates SQL migrations based on schema changes.
- `db:migrate`: Applies migrations to the database.
- `db:studio`: Opens Drizzle Studio to view and edit data.
