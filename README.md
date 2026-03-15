# Kanban Board

A full-stack Kanban board application with drag-and-drop, user authentication, and real-time board management.

**Live Demo:** [(https://kanban-board-git-main-justinm11s-projects.vercel.app/login)]

## Features

- User authentication (signup/login) with hashed passwords
- Create, edit, and delete boards
- Drag-and-drop cards between columns
- Add, edit, and delete cards with priority levels
- Add custom columns to boards
- Responsive dark-mode UI
- Optimistic updates for instant UI feedback

## Tech Stack

- **Frontend:** Next.js 16, React, Tailwind CSS
- **Backend:** Next.js API Routes
- **Database:** PostgreSQL (Neon)
- **ORM:** Prisma
- **Auth:** NextAuth.js with JWT
- **Drag & Drop:** dnd-kit
- **Deployment:** Vercel

## Getting Started

1. Clone the repo:

```bash
   git clone https://github.com/JustinM11/kanban-board.git
   cd kanban-board
```

2. Install dependencies:

```bash
   npm install
```

3. Set up environment variables:

DATABASE_URL="your-postgresql-url"
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"

4. Push the database schema:

```bash
   npx prisma db push
```

5. Run the development server:

```bash
   npm run dev
```

## What I Learned

- Building REST APIs with proper authentication and authorization
- Database design with relational models (one-to-many relationships)
- Implementing drag-and-drop with optimistic UI updates
- Server vs. client components in Next.js App Router
- Deploying a full-stack app with environment variables
