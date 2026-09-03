# TokTickIT - IT Service Desk

TokTickIT is a full-stack web application built for managing IT service requests. This repository contains the initial vertical slice (Lab 1) demonstrating the foundational architecture, database integration, and API health checks.

## Tech Stack
*   **Frontend:** React, TypeScript, Vite, Bootstrap
*   **Backend:** Node.js, Express, TypeScript
*   **Database:** PostgreSQL, Prisma ORM
*   **Testing:** Vitest (Frontend/UI), Supertest (Backend API)

## Prerequisites
Before running this application, ensure you have the following installed on your machine:
*   [Node.js](https://nodejs.org/)
*   [PostgreSQL](https://www.postgresql.org/)

## Project Setup & Installation

### 1. Install Dependencies
You need to install the Node modules for both the frontend and the backend.
Open your terminal and run:
```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 2. Environment Variables
Copy `.env.example` to `.env` in the `server` directory and configure your PostgreSQL database credentials:
```bash
cp server/.env.example server/.env
```

### 3. Database Setup
Initialize the database and run the Prisma seeds:
```bash
cd server
npx prisma migrate dev
npx prisma db seed
```

### 4. Running the App
Start both the frontend and backend development servers:
```bash
# In the server directory:
npm run dev

# In a new terminal, in the client directory:
npm run dev
```