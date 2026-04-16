# Verso

Verso is a collaborative document editor built as a monorepo with a decoupled frontend and backend.

## Project Structure

- **`frontend/`**: A [Next.js](https://nextjs.org) application providing the document editing interface, built with Tiptap and Tailwind CSS.
- **`backend/`**: A TypeScript Express server that handles the [Socket.io](https://socket.io) collaboration logic and [Prisma](https://www.prisma.io) database interactions.

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm

### Installation

Run the following command at the root to install dependencies for both the frontend and backend:

```bash
npm install
```

### Development

Start both the backend and frontend development servers concurrently from the root:

```bash
npm run dev
```

The frontend will be available at [http://localhost:3000](http://localhost:3000) and the backend at [http://localhost:3001](http://localhost:3001).

## Deployment

The frontend can be deployed on platforms like Vercel, and the backend on services that support Node.js and WebSockets (like Heroku, Railway, or a VPS).
