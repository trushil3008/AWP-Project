# Connection and Other Notes

Generated on: 2026-04-02

## 1) How Client and Server Connect

- Client base API URL (dev): `http://localhost:3000/api`
- Client base API URL (prod): `https://api.securebank.com/api`
- Backend default port: `3000`
- Backend API prefix: `/api`
- Backend CORS allows credentials and supports `http://localhost:4200` (or `CLIENT_URL`)

### Core request flow

1. Angular services call `${environment.apiUrl}/...`.
2. `auth.interceptor` sets `withCredentials: true` on requests.
3. Express receives requests under `/api/*`.
4. Route middlewares validate auth/roles and call controllers/services.
5. Auth uses `jwt` cookie (`httpOnly`) and supports Bearer token fallback.

## 2) Main Integration Files

### Client

- `client/src/environments/environment.ts`
- `client/src/environments/environment.prod.ts`
- `client/src/app/app.config.ts`
- `client/src/app/core/interceptors/auth.interceptor.ts`
- `client/src/app/core/interceptors/error.interceptor.ts`
- `client/src/app/**/services/*.service.ts`

### Server

- `server/app.js`
- `server/server.js`
- `server/routes/index.js`
- `server/routes/*.routes.js`
- `server/middlewares/auth.js`
- `server/services/auth.service.js`
- `server/.env.example`

## 3) Client to Server Endpoint Mapping

### Auth

- Client: `/auth/register`, `/auth/login`, `/auth/logout`, `/auth/me`
- Server mounted: `/api/auth/*`
- Status: Matched

### Account

- Client: `/account`
- Server: `/api/account`
- Status: Matched

- Client: `/account/statement`, `/account/statement/download`
- Server routes currently expose: `/api/account`, `/api/account/balance`, `/api/account/stats`, `/api/account/verify/:accountNumber`
- Status: Not matched in current route file

### Transactions and Scheduled Transfers

- Client: `/transactions`, `/transactions/:id`
- Server: `/api/transactions`, `/api/transactions/:transactionId`
- Status: Matched

- Client: `/transfer`, `/transfer/schedule`, `/transfer/scheduled`, `/transfer/scheduled/:id`
- Server routes currently expose transfer under `/api/transactions/transfer` and scheduled routes under `/api/scheduled` and `/api/scheduled/:id`
- Status: Path mismatch

### Beneficiaries

- Client: `/beneficiaries`, `/beneficiaries/:id`
- Server: `/api/beneficiaries`, `/api/beneficiaries/:id`
- Status: Matched

- Client: `/beneficiaries/verify` (POST)
- Server beneficiary routes do not currently expose `/verify`
- Related server route exists at `/api/account/verify/:accountNumber` (GET)
- Status: Path and method mismatch

### Admin

- Client: `/admin/stats`, `/admin/users`, `/admin/users/:userId`, `/admin/users/:userId/freeze`, `/admin/users/:userId/unfreeze`, `/admin/transactions`
- Server: `/api/admin/stats`, `/api/admin/users`, `/api/admin/users/:userId`, `/api/admin/users/:accountId/freeze`, `/api/admin/users/:accountId/unfreeze`, `/api/admin/transactions`
- Status: Mostly matched; freeze/unfreeze parameter naming differs (`userId` vs `accountId`)

### Analytics

- Client: `/analytics/monthly`, `/analytics/summary`
- Server: `/api/analytics/monthly`, `/api/analytics/summary`
- Status: Matched

- Client: `/analytics/categories`
- Server routes expose `/api/analytics/spending` and `/api/analytics/trend`
- Status: Path mismatch

## 4) Security and Session Notes

- Cookies are used for session token (`jwt`) with `httpOnly: true`.
- `sameSite` is `lax` in development and `strict` in production.
- `secure` cookie flag is enabled in production.
- API rate limiting is enabled globally under `/api` with stricter login throttling.

## 5) Other Helpful Notes

- Ensure `CLIENT_URL` in server environment matches frontend origin.
- Ensure frontend `environment.apiUrl` includes `/api` prefix.
- Resolve endpoint mismatches listed above to avoid 404/405 errors.
