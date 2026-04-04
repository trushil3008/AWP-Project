# Online Banking System - Angular Frontend

A modern, professional banking application frontend built with Angular 19, Angular Material, and Chart.js.

## Features

- **Authentication**: Secure login/register with HTTP-only cookie-based JWT authentication
- **Dashboard**: Account overview with balance, recent transactions, and quick actions
- **Transactions**: Send money, view transaction history with filters, schedule transfers
- **Beneficiaries**: Manage saved beneficiaries for quick transfers
- **Analytics**: Visual charts showing spending patterns and account analytics
- **Admin Panel**: User management and transaction monitoring (admin users only)

## Tech Stack

- Angular 19 (Standalone Components)
- Angular Material UI
- ng2-charts (Chart.js wrapper)
- RxJS for reactive programming
- TypeScript (JS-style approach)

## Prerequisites

- Node.js 18+ 
- npm 9+
- Angular CLI 19+

## Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   
   Update `src/environments/environment.ts` with your backend API URL:
   ```typescript
   export const environment = {
     production: false,
     apiUrl: 'http://localhost:3000/api'
   };
   ```

3. **Run development server:**
   ```bash
   ng serve
   ```
   
   Navigate to `http://localhost:4200`

4. **Build for production:**
   ```bash
   ng build --configuration=production
   ```

## Project Structure

```
src/
├── app/
│   ├── core/                    # Core module (services, guards, interceptors)
│   │   ├── services/
│   │   │   ├── auth.service.ts
│   │   │   ├── notification.service.ts
│   │   │   └── user.service.ts
│   │   ├── guards/
│   │   │   ├── auth.guard.ts
│   │   │   ├── admin.guard.ts
│   │   │   └── guest.guard.ts
│   │   └── interceptors/
│   │       ├── auth.interceptor.ts
│   │       └── error.interceptor.ts
│   │
│   ├── shared/                  # Shared components and pipes
│   │   ├── components/
│   │   │   ├── sidebar/
│   │   │   ├── header/
│   │   │   ├── loading-spinner/
│   │   │   └── confirm-dialog/
│   │   └── pipes/
│   │       ├── currency-format.pipe.ts
│   │       ├── date-format.pipe.ts
│   │       └── account-number.pipe.ts
│   │
│   ├── layout/                  # Main layout component
│   │   └── main-layout/
│   │
│   ├── auth/                    # Authentication module
│   │   ├── login/
│   │   └── register/
│   │
│   ├── dashboard/               # Dashboard module
│   │   ├── services/
│   │   └── components/
│   │       ├── dashboard/
│   │       ├── account-summary/
│   │       ├── recent-transactions/
│   │       └── quick-actions/
│   │
│   ├── account/                 # Account module
│   │   ├── services/
│   │   └── components/
│   │       └── account-details/
│   │
│   ├── transactions/            # Transactions module
│   │   ├── services/
│   │   └── components/
│   │       ├── send-money/
│   │       ├── transaction-history/
│   │       └── schedule-transfer/
│   │
│   ├── beneficiaries/           # Beneficiaries module
│   │   ├── services/
│   │   └── components/
│   │       └── beneficiary-list/
│   │
│   ├── analytics/               # Analytics module
│   │   ├── services/
│   │   └── components/
│   │       └── analytics-dashboard/
│   │
│   └── admin/                   # Admin module
│       ├── services/
│       └── components/
│           ├── admin-dashboard/
│           ├── user-management/
│           └── transaction-monitoring/
│
├── environments/
│   ├── environment.ts           # Development config
│   └── environment.prod.ts      # Production config
│
└── styles.css                   # Global styles with CSS variables
```

## Authentication

This app uses HTTP-only cookies for JWT authentication:

- Backend sets JWT token in HTTP-only cookie on login
- Frontend sends `withCredentials: true` with all API requests
- Auth interceptor handles token refresh and logout on 401

## API Endpoints Expected

The frontend expects the following API endpoints from your backend:

### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Account
- `GET /api/account` - Get account details
- `GET /api/account/balance` - Get account balance

### Transactions
- `GET /api/transactions` - Get transaction history
- `POST /api/transactions/transfer` - Send money
- `POST /api/transactions/schedule` - Schedule transfer

### Beneficiaries
- `GET /api/beneficiaries` - Get all beneficiaries
- `POST /api/beneficiaries` - Add beneficiary
- `DELETE /api/beneficiaries/:id` - Delete beneficiary

### Analytics
- `GET /api/analytics/summary` - Get analytics summary
- `GET /api/analytics/monthly` - Get monthly data

### Admin
- `GET /api/admin/stats` - Get dashboard stats
- `GET /api/admin/users` - Get all users
- `PATCH /api/admin/users/:id/freeze` - Freeze account
- `PATCH /api/admin/users/:id/unfreeze` - Unfreeze account
- `GET /api/admin/transactions` - Get all transactions

## Color Theme

The app uses a professional blue banking theme defined via CSS custom properties in `styles.css`:

- Primary: `#1a237e` (Indigo)
- Accent: `#00bcd4` (Cyan)
- Success: `#4caf50` (Green)
- Warning: `#ff9800` (Orange)
- Error: `#f44336` (Red)

## Development Notes

- All components use Angular's standalone component architecture
- Mock data is provided in components for development without a backend
- Forms use Angular Reactive Forms with validation
- Charts use ng2-charts (Chart.js wrapper)
- Responsive design with mobile-first approach

## Scripts

```bash
# Start development server
npm start

# Build for production
npm run build

# Run unit tests
npm test

# Run linting
npm run lint
```

## License

MIT
