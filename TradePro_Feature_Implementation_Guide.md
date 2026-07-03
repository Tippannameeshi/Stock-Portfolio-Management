# TradePro Feature and Implementation Guide

## Purpose of this document
This is a revision guide for interview prep. It summarizes:
- what features were implemented in TradePro
- how each feature works technically
- where it is implemented (frontend, backend, database)
- what decisions and trade-offs were made

---

## 1. Project Summary
TradePro is a full-stack stock portfolio simulation platform with role-based access.

Core capabilities:
- authentication and authorization (client + admin)
- portfolio dashboard with holdings and allocation visualization
- market browsing with stock details and live-price refresh
- buy/sell execution with wallet and holdings updates
- watchlist management
- fund management (deposit/withdrawal + wallet transaction history)
- trade history tracking
- admin controls for user lifecycle and stock catalog

Tech stack:
- Frontend: React, Vite, Tailwind CSS, Recharts, Lucide icons
- Backend: Node.js, Express
- Database: PostgreSQL with stored procedures/functions and triggers
- Auth: JWT + middleware
- Password security: bcrypt
- External data: Finnhub API for live stock quotes

---

## 2. Architecture Overview

### 2.1 Frontend architecture
- Single-page React app with conditional page rendering in App state.
- Global auth and dashboard state handled in AuthContext.
- API layer centralized in apiService with automatic token header injection.
- Token parsing and session persistence handled in authService.

Key files:
- client/src/App.jsx
- client/src/contexts/AuthContext.jsx
- client/src/services/apiService.js
- client/src/services/authService.js

### 2.2 Backend architecture
- Express server with route-level modularization by domain.
- Public auth routes, protected business routes behind JWT middleware.
- Controllers call PostgreSQL functions/procedures for domain operations.

Key files:
- server/server.js
- server/middleware/auth.js
- server/controllers/*.js
- server/routes/*.js

### 2.3 Database architecture
- Heavy business logic is pushed into PostgreSQL functions/procedures.
- Strict domain entities for users, stocks, ledger, lots, watchlist, wallet.
- Enums for role, status, transaction type improve data integrity.

Key schema file:
- db/database_schema.sql

---

## 3. Implemented Features and How They Work

## 3.1 User Registration and Login
### What it does
- New users can create accounts.
- Existing users can log in and receive a JWT.
- Suspended or inactive users are blocked at login.

### How it is implemented
Frontend:
- Register form sends name/email/password to /auth/register.
- Login form sends credentials to /auth/login.
- JWT token is stored in localStorage after successful login.
- AuthContext triggers dashboard load after login.

Backend:
- registerUser hashes password using bcrypt and calls DB function register_user.
- loginUser fetches user row via login_user(email).
- status checks (SUSPENDED/INACTIVE) are enforced before password verification.
- JWT is generated with user_id, name, email, role and 1-hour expiry.

Database:
- register_user(...) inserts user record and returns success/failure JSON.
- login_user(...) returns user profile with hashed password for verification.

Important files:
- server/controllers/auth.js
- server/utils/hashing.js
- server/utils/jwt.js
- client/src/pages/Register.jsx
- client/src/pages/Login.jsx

---

## 3.2 JWT Authorization and Protected APIs
### What it does
- Restricts dashboard, market, trade, watchlist, history, funds, and admin APIs to authenticated users.

### How it is implemented
- Backend auth middleware checks Authorization header with Bearer token.
- Token is verified and normalized to req.user with a standard id field.
- Protected routes are mounted behind auth middleware in server.js.
- Frontend apiService attaches Authorization header from localStorage token.

Important files:
- server/middleware/auth.js
- server/server.js
- client/src/services/apiService.js
- client/src/services/authService.js

---

## 3.3 Dashboard (Portfolio Summary + Holdings + Allocation)
### What it does
- Shows total portfolio value, investment amount, cash balance, and unrealized P/L.
- Displays holdings list and allocation pie chart.

### How it is implemented
Frontend:
- Dashboard page reads dashboardData from AuthContext.
- Recharts PieChart renders allocation distribution.

Backend:
- /api/dashboard route calls getDashboardData controller.
- Controller executes get_dashboard_data(userId) and returns JSON payload.

Database:
- get_dashboard_data(user_id) aggregates holdings, valuation, and allocation.

Important files:
- client/src/pages/Dashboard.jsx
- server/controllers/dashboard.js
- db/database_schema.sql (get_dashboard_data)

---

## 3.4 Market Overview and Search
### What it does
- Lists available stocks.
- Supports local search by ticker/company.
- Auto-refreshes data every 20 seconds in market page.

### How it is implemented
Frontend:
- Market page loads stocks + watchlist using Promise.all.
- Search term filters stock cards on client side.

Backend:
- getAllStocks returns stocks sorted by ticker symbol.

Database:
- stocks table is source of market listing.

Important files:
- client/src/pages/Market.jsx
- client/src/components/StockCard.jsx
- server/controllers/market.js

---

## 3.5 Stock Detail with Live Price Refresh
### What it does
- Shows detailed stock view with current price and change.
- Displays current user holding and unrealized P/L for that stock.
- Updates stale prices from Finnhub if cached value is older than 60 seconds.

### How it is implemented
Backend:
- getStockById checks stock existence and cache age.
- If stale, fetches live quote via getLivePrice and updates Stocks table.
- Returns get_stock_details(stockId, userId) result.

Frontend:
- Stock detail page polls every 10 seconds.
- Includes trade controls and watchlist toggle action.

Database:
- get_stock_details(stockId, userId) joins stock + user position metrics.

Important files:
- server/controllers/market.js
- server/utils/stockUtils.js
- client/src/pages/StockDetail.jsx
- db/database_schema.sql (get_stock_details)

---

## 3.6 Trade Execution (Buy/Sell)
### What it does
- Executes BUY and SELL orders.
- BUY decreases wallet balance and opens asset lot.
- SELL increases wallet balance and consumes open lots FIFO.
- Inserts transaction ledger entries and sell-lot journal records.

### How it is implemented
Frontend:
- User selects buy/sell and quantity.
- Validation checks:
  - buy requires enough cash
  - sell requires enough current holdings
- Calls /api/trade with userId, ticker, quantity, tradeType.

Backend:
- executeTrade controller fetches live price and calls execute_trade(...).
- After execution, stocks table is refreshed with latest market price.

Database:
- execute_trade(...) enforces:
  - positive quantity
  - existing stock
  - active user status
  - sufficient funds for BUY
  - sufficient shares for SELL
- SELL logic processes lots in acquisition-date order (FIFO behavior).

Important files:
- client/src/pages/StockDetail.jsx
- server/controllers/trade.js
- db/database_schema.sql (execute_trade)

---

## 3.7 Watchlist Management
### What it does
- Users can add/remove stocks to watchlist from market and detail views.
- Dedicated watchlist page displays tracked stocks.

### How it is implemented
Backend:
- getWatchListDetails returns user watchlist details.
- updateWatchlist toggles membership based on ticker.

Database:
- update_watchlist(user_id, ticker) handles insert/remove behavior.
- get_watchlist_details(user_id) returns enriched watchlist stock data.

Frontend:
- Market and Watchlist pages both call watchlist APIs.
- StockCard star icon drives toggle action.

Important files:
- server/controllers/watchlist.js
- server/routes/watchlist.js
- client/src/pages/Market.jsx
- client/src/pages/Watchlist.jsx

---

## 3.8 Funds (Deposit/Withdrawal + Wallet History)
### What it does
- Allows users to deposit or withdraw funds.
- Displays current balance and wallet transaction history.
- Includes quick amount shortcuts and validation.

### How it is implemented
Frontend:
- FundManagement page validates positive amount and withdrawal limits.
- After transaction, reloads balance, wallet history, and dashboard summary.

Backend:
- getFunds reads current user cash balance.
- updateFunds calls stored procedure update_cash_balance.
- getHistory returns wallet transaction list.

Database:
- update_cash_balance(...) applies deposit/withdrawal updates.
- get_wallet_transactions(user_id) returns wallet ledger.
- wallet transaction trigger logs changes.

Important files:
- client/src/pages/FundManagement.jsx
- server/controllers/funds.js
- db/database_schema.sql (get_wallet_transactions, log_wallet_transaction)

---

## 3.9 Trade History
### What it does
- Shows user trading history with timestamp, type, qty, total, and P/L.

### How it is implemented
Backend:
- getTradeHistory controller calls get_user_trade_history(user_id).

Database:
- get_user_trade_history computes trade rows including sell-side profit/loss.

Frontend:
- TradeHistory page renders a table and formats timestamps.

Important files:
- client/src/pages/TradeHistory.jsx
- server/controllers/history.js
- db/database_schema.sql (get_user_trade_history)

---

## 3.10 Admin Panel (Role-based)
### What it does
- Admin-only access to:
  - view pending inactive/suspended users
  - list users with status/role
  - update user status (activate/suspend/reactivate)
  - add stocks to market
  - update stock prices
  - delete stocks with no trade dependencies

### How it is implemented
Frontend:
- Sidebar shows Admin tab only if role is ADMIN.
- AdminPanel has three tabs: reactivations, users, stocks.

Backend:
- Admin routes expose user and stock management endpoints.
- Controllers validate status transitions and input constraints.

Database:
- get_all_users(...), add_stock(...), and status update procedure are used.

Important files:
- client/src/pages/AdminPanel.jsx
- client/src/components/Layout/Sidebar.jsx
- server/controllers/admin.js
- server/routes/admin.js
- db/database_schema.sql (get_all_users, add_stock)

---

## 3.11 Account Deactivation and Deletion
### What it does
- Non-admin users can deactivate or delete their own account.
- Deletion is only allowed when constraints are satisfied.

### How it is implemented
Backend:
- /auth/deactivate sets status to INACTIVE for non-admins.
- /auth/delete calls delete_user(userId).

Database:
- delete_user(...) enforces:
  - user exists
  - cash balance must be zero
  - all lots must be closed
- Performs ordered cleanup of related records.

Frontend:
- Topbar account menu opens modal with deactivate/delete actions.

Important files:
- client/src/components/Layout/Topbar.jsx
- server/controllers/auth.js
- db/database_schema.sql (delete_user)

---

## 3.12 Live Price Integration
### What it does
- Pulls real-time quote and day change percentage from Finnhub.
- Used for stock detail freshness and trade-time valuation.

### How it is implemented
- getLivePrice(symbol) calls Finnhub quote endpoint.
- Returns current price and percent change.
- Throws if token missing or API returns invalid price.

Important files:
- server/utils/stockUtils.js
- server/test-api.js
- server/worker.js (optional background updater, currently not auto-started)

---

## 4. Database Design Highlights
Primary entities:
- users
- stocks
- stockprices
- assetlots
- transactionsledger
- selllotjournal
- wallettransactions
- watchlistitems

Key business logic in SQL functions/procedures:
- register_user
- login_user
- get_dashboard_data
- get_stock_details
- execute_trade
- update_watchlist
- get_user_trade_history
- get_wallet_transactions
- delete_user
- get_all_users
- add_stock

Design choices:
- Enums for role/status/transaction types for stronger constraints.
- Lot-based holding model allows accurate realized/unrealized P/L.
- Stored procedures centralize business rules and reduce duplicated logic.

---

## 5. End-to-End Data Flow (Example)

## Example: Buy Trade
1. User opens stock detail page and enters quantity.
2. Frontend checks estimated amount vs available cash.
3. Frontend calls POST /api/trade with ticker, qty, trade type, user id.
4. Backend fetches live market price from Finnhub.
5. Backend executes SQL function execute_trade(...).
6. DB updates user cash, inserts/open lots, writes transaction ledger.
7. Backend returns response and updates stock cache price.
8. Frontend refreshes stock details and dashboard.

---

## 6. Interview Talking Points (Use on Resume Discussions)
- Implemented a role-based stock trading simulator with separate client/admin flows.
- Built a secure auth pipeline with JWT, route guards, and bcrypt password hashing.
- Designed a PostgreSQL lot-based trading model to support FIFO sell matching and P/L computation.
- Integrated external real-time market data (Finnhub) with cache-based refresh logic.
- Centralized critical business rules in SQL procedures/functions for consistency.
- Built modular full-stack architecture with reusable API client and context-driven state.

---

## 7. Important Notes (So you can explain confidently)
- This project uses app-level navigation state in React instead of react-router.
- The SQL layer contains substantial business logic, not just data persistence.
- Live prices are fetched on demand and optionally by a background worker.
- Several API responses are passed through raw query results (rows wrappers), and the frontend normalizes shapes.

---

## 8. Quick Revision Checklist (Before Interview)
- Can you explain JWT auth flow end to end?
- Can you explain how BUY and SELL affect users, lots, and ledger tables?
- Can you explain FIFO lot consumption for SELL?
- Can you explain how unrealized and realized P/L are obtained?
- Can you explain admin features and status transitions?
- Can you explain why business logic was moved into SQL functions?
- Can you explain how stale stock prices are refreshed?

---

## 9. Optional Improvements You Can Mention
- Add server-side request validation middleware (Joi/Zod).
- Add automated tests for controllers and SQL procedures.
- Normalize API response structure for all endpoints.
- Add pagination/filtering in history and watchlist endpoints.
- Add audit logging and stricter admin action trails.
- Use react-router for URL-based navigation and deep links.

---

If you want, this same guide can be converted into a polished PDF interview handout.
