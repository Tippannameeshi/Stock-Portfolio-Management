# Stock Portfolio

A full-stack stock portfolio simulator built with React, Vite, Tailwind CSS, Node.js, Express, and PostgreSQL. The app lets users register, track funds, browse stocks, execute buy/sell trades, manage a watchlist, review portfolio performance, and handle admin actions such as user moderation and stock management.

## Features

- User registration and login with JWT-based authentication
- Portfolio dashboard with holdings, allocation, and unrealized P/L
- Market page for browsing listed stocks
- Stock detail view with live market-price refresh
- Buy and sell trading flow backed by PostgreSQL stored procedures
- Fund deposit and withdrawal management
- Watchlist management
- Trade history and wallet transaction history
- Admin panel for:
  - viewing users
  - reactivating/suspending accounts
  - adding stocks
  - updating stock prices
  - deleting stocks without trade history

## Tech Stack

**Frontend**

- React 19
- Vite
- Tailwind CSS 4
- Recharts
- Lucide React

**Backend**

- Node.js
- Express
- PostgreSQL
- `pg`
- JWT (`jsonwebtoken`)
- `bcryptjs`
- `axios`

## Project Structure

```text
Stock_portfolio/
├── client/          # React frontend
├── server/          # Express API
└── schema.sql       # PostgreSQL dump for database setup
```

## Prerequisites

- Node.js 18+
- npm
- PostgreSQL
- A Finnhub API key for live stock quotes

## Environment Variables

Create a `.env` file inside the `server` folder:

```env
PORT=4000
PG_USER=your_postgres_user
PG_HOST=localhost
PG_DATABASE=stock_market_db
PG_PASSWORD=your_postgres_password
PG_PORT=5432
JWT_SECRET=your_jwt_secret
FINNHUB_API_KEY=your_finnhub_api_key
```

## Installation

Install frontend dependencies:

```bash
cd client
npm install
```

Install backend dependencies:

```bash
cd server
npm install
```

## Database Setup

This repository includes `schema.sql`, but it is a PostgreSQL dump file rather than plain SQL text. Restore it with `pg_restore` instead of running it directly in a SQL editor.

1. Create the database:

```bash
createdb stock_market_db
```

2. Restore the dump:

```bash
pg_restore -d stock_market_db schema.sql
```

If `createdb` is not available in your shell, create the database with pgAdmin or `psql`, then run the restore command.

## Running the App

Start the backend:

```bash
cd server
npm run dev
```

Start the frontend:

```bash
cd client
npm run dev
```

The frontend expects the API at:

```text
http://localhost:4000/api
```

The Vite dev server will usually run at:

```text
http://localhost:5173
```

## Main API Areas

All protected routes require a Bearer token.

### Public routes

- `POST /api/auth/register`
- `POST /api/auth/login`

### Protected routes

- `GET /api/dashboard`
- `GET /api/market/stocks`
- `GET /api/market/stocks/:stockId`
- `POST /api/trade`
- `GET /api/funds`
- `POST /api/funds`
- `GET /api/funds/history`
- `GET /api/watchlist`
- `POST /api/watchlist/:ticker`
- `GET /api/history`
- `GET /api/admin/users`
- `GET /api/admin/users/pending`
- `PUT /api/admin/users/:userId/status`
- `POST /api/admin/stocks`
- `PUT /api/admin/stocks/:stockId/price`
- `DELETE /api/admin/stocks/:stockId`

## Notes

- The backend relies heavily on PostgreSQL functions and procedures defined in the dump.
- Live stock prices are fetched from Finnhub in the backend.
- The frontend uses a simple internal page state instead of React Router.

## Scripts

### Client

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

### Server

```bash
npm run dev
npm start
```

## Future Improvements

- Add automated tests for frontend and backend
- Add role-based route guards on the backend for admin-only endpoints
- Add Docker support for easier local setup
- Add `.env.example` files for faster onboarding
