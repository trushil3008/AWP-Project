# Online Banking System - Backend API

Production-level Node.js/Express backend for an Online Banking System with MongoDB.

## Features

- **Authentication**: JWT-based auth with HTTP-only cookies
- **Account Management**: Auto-create accounts, balance tracking
- **Transactions**: Atomic money transfers with MongoDB transactions
- **Beneficiaries**: Save and manage transfer recipients
- **Scheduled Transfers**: Schedule future transactions with cron jobs
- **Admin Panel**: User management, freeze/unfreeze accounts
- **Analytics**: Monthly stats, spending breakdown, trends
- **Email Notifications**: Transaction alerts (via Nodemailer)

## Tech Stack

- Node.js & Express.js
- MongoDB with Mongoose ODM
- JWT for authentication
- bcryptjs for password hashing
- node-cron for scheduled jobs
- Nodemailer for emails

## Project Structure

```
server/
├── config/
│   ├── db.js           # MongoDB connection
│   └── constants.js    # Application constants
├── controllers/        # Request handlers
│   ├── auth.controller.js
│   ├── account.controller.js
│   ├── transaction.controller.js
│   ├── beneficiary.controller.js
│   ├── scheduled.controller.js
│   ├── admin.controller.js
│   └── analytics.controller.js
├── services/           # Business logic
│   ├── auth.service.js
│   ├── account.service.js
│   ├── transaction.service.js
│   ├── beneficiary.service.js
│   ├── scheduled.service.js
│   ├── admin.service.js
│   └── analytics.service.js
├── models/             # Mongoose schemas
│   ├── User.js
│   ├── Account.js
│   ├── Transaction.js
│   ├── Beneficiary.js
│   └── ScheduledTransaction.js
├── routes/             # API routes
│   ├── auth.routes.js
│   ├── account.routes.js
│   ├── transaction.routes.js
│   ├── beneficiary.routes.js
│   ├── scheduled.routes.js
│   ├── admin.routes.js
│   └── analytics.routes.js
├── middlewares/        # Express middlewares
│   ├── auth.js         # JWT verification
│   ├── role.js         # Role-based access
│   ├── error.js        # Error handling
│   └── validation.js   # Request validation
├── utils/              # Helper utilities
│   ├── ApiError.js     # Custom error class
│   ├── ApiResponse.js  # Response formatter
│   ├── helpers.js      # Utility functions
│   └── email.js        # Email service
├── jobs/               # Cron jobs
│   └── scheduledTransactionJob.js
├── app.js              # Express app setup
├── server.js           # Entry point
└── seed.js             # Database seeder
```

## Installation

1. **Install dependencies:**
   ```bash
   cd server
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

3. **Start MongoDB:**
   ```bash
   # Make sure MongoDB is running locally
   # Default: mongodb://localhost:27017/online_banking
   ```

4. **Seed the database:**
   ```bash
   npm run seed
   # or
   node seed.js
   ```
   This creates:
   - Admin: admin@onlinebanking.com / Admin@123
   - Test User: test@example.com / Test@123
   - Test User 2: john@example.com / Test@123

5. **Start the server:**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login user |
| POST | /api/auth/logout | Logout user |
| GET | /api/auth/me | Get current user |
| PATCH | /api/auth/update-password | Update password |

### Account
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/account | Get account details |
| GET | /api/account/balance | Get balance |
| GET | /api/account/stats | Get account stats |
| GET | /api/account/verify/:accountNumber | Verify account exists |

### Transactions
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/transactions/transfer | Transfer money |
| GET | /api/transactions | Get transaction history |
| GET | /api/transactions/summary | Get transaction summary |
| GET | /api/transactions/:id | Get single transaction |

### Beneficiaries
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/beneficiaries | Add beneficiary |
| GET | /api/beneficiaries | Get all beneficiaries |
| GET | /api/beneficiaries/:id | Get single beneficiary |
| PATCH | /api/beneficiaries/:id | Update beneficiary |
| DELETE | /api/beneficiaries/:id | Delete beneficiary |
| PATCH | /api/beneficiaries/:id/favorite | Toggle favorite |

### Scheduled Transactions
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/scheduled | Create scheduled transfer |
| GET | /api/scheduled | Get scheduled transfers |
| GET | /api/scheduled/:id | Get single scheduled |
| DELETE | /api/scheduled/:id | Cancel scheduled |

### Admin (Admin only)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/admin/stats | Get dashboard stats |
| GET | /api/admin/users | Get all users |
| GET | /api/admin/users/:id | Get user by ID |
| PATCH | /api/admin/users/:id/freeze | Freeze account |
| PATCH | /api/admin/users/:id/unfreeze | Unfreeze account |
| GET | /api/admin/transactions | Get all transactions |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/analytics/summary | Get analytics summary |
| GET | /api/analytics/monthly | Get monthly stats |
| GET | /api/analytics/spending | Get spending breakdown |
| GET | /api/analytics/trend | Get daily trend |

## Response Format

All API responses follow this format:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

Error response:
```json
{
  "success": false,
  "message": "Error description",
  "errors": [ ... ]
}
```

## Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT in HTTP-only cookies**: Prevents XSS attacks
- **Rate Limiting**: 100 requests/15min, 10 login attempts/hour
- **Helmet**: Security headers
- **Input Validation**: express-validator
- **MongoDB Transactions**: Atomic operations
- **Role-based Access**: Admin/User separation

## Environment Variables

```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/online_banking
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
JWT_COOKIE_EXPIRES_IN=7
EMAIL_HOST=smtp.mailtrap.io
EMAIL_PORT=587
EMAIL_USER=your-email-user
EMAIL_PASS=your-email-password
EMAIL_FROM=noreply@onlinebanking.com
CLIENT_URL=http://localhost:4200
```

## Scripts

```bash
npm start        # Start production server
npm run dev      # Start with nodemon
npm run seed     # Seed database
```

## License

MIT
