### Project Name:Ride Booking System Backend

# Ride Booking API

### Deploy link: ride-booking-system-backend-dusky.vercel.app

## Project Overview

This project implements a secure, scalable backend API for a ride booking system using Express.js and Mongoose. The system supports three user roles: **admin**, **rider**, and **driver**, each with specific capabilities:

# Covered topic

- 🔐 Authentication
- 🎭 Role-based Authorization
- 🧍 Rider & Driver Logic
- 🚗 Ride Management Logic
- 📦 Modular Code Architecture
- 🔁 Proper API Endpoints

📌 Minimum Functional Implemented

- ✅ JWT-based login system with three roles: admin, rider, driver
- ✅ Secure password hashing (using bcrypt or other appropriate way)
- ✅ Riders should be able to:
  Request a ride with pickup & destination location
  Cancel a ride (within allowed window)
  View ride history
- ✅ Drivers should be able to:
  Accept/reject ride requests
  Update ride status (Picked Up → In Transit → Completed)
  View earnings history
  Set availability status (Online/Offline)
- ✅ Admins should be able to:
  View all users, drivers, and rides
  Approve/suspend drivers
  Block/unblock user accounts
  Generate reports (optional)
- ✅ All rides must be stored with complete history
- ✅ Role-based route protection and Transaction and Rollback implemented into ride model

- 🧍 **Riders** can request rides, cancel rides, and view ride history
- 🚗 **Drivers** can accept/reject rides, update ride status, view earnings, and set availability
- 👑 **Admins** can manage users/drivers, approve drivers, block users, and view system data

The API features JWT-based authentication, role-based authorization, and comprehensive ride lifecycle management.

## Setup & Environment

### Prerequisites

- Node.js v18+
- MongoDB v6+
- npm v9+

### Installation

1. Clone the repository:

```bash
git clone https://github.com/AkibKST/Ride-Booking-System-Backend.git
cd ride-booking-api
```

2. Install dependencies:

```bash
npm install
```

3. Create `.env` file:

```env
PORT=5000
DB_URL=mongodb-uri
NODE_ENV=development

# JWT
JWT_ACCESS_SECRET=access_secret
JWT_ACCESS_EXPIRES=1d

JWT_REFRESH_SECRET=refresh_secret
JWT_REFRESH_EXPIRES=30d

# BCRYPT
BCRYPT_SALT_ROUND=10

# SUPER ADMIN
SUPER_ADMIN_EMAIL=super@gmail.com
SUPER_ADMIN_PASSWORD=123456789

# GOOGLE
GOOGLE_CLIENT_SECRET=googleClientSecret
GOOGLE_CLIENT_ID=googleClientId
GOOGLE_CALLBACK_URL=http://localhost:5000/api/v1/auth/google/callback

# Express Session
EXPRESS_SESSION_SECRET=express-session

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

4. Start the server:

```bash
npm run dev
```

## API Endpoints

### Authentication Routes

# Ride-Sharing API Documentation

## Table of Contents

- [Authentication Routes](#authentication-routes)
- [User Routes](#user-routes)
- [Driver Routes](#driver-routes)
- [Ride Routes](#ride-routes)
- [Role Definitions](#role-definitions)
- [Notes](#notes)

---

## Authentication Routes

**Base URL:** `/api/v1/auth`

| Endpoint           | Method | Access Role             | Description                              |
| ------------------ | ------ | ----------------------- | ---------------------------------------- |
| `/login`           | POST   | Public                  | User login with credentials              |
| `/refresh-token`   | POST   | Public                  | Get new access token using refresh token |
| `/logout`          | POST   | All authenticated roles | Invalidate user session                  |
| `/reset-password`  | POST   | All authenticated roles | Reset user password                      |
| `/google`          | GET    | Public                  | Initiate Google OAuth login              |
| `/google/callback` | GET    | Public                  | Google OAuth callback handler            |

---

## User Routes

**Base URL:** `/api/v1/user`

| Endpoint                 | Method | Access Role             | Description              |
| ------------------------ | ------ | ----------------------- | ------------------------ |
| `/register`              | POST   | Public                  | Register a new user      |
| `/:id`                   | PATCH  | All authenticated roles | Update user details      |
| `/all-users`             | GET    | ADMIN, SUPER_ADMIN      | Fetch all users          |
| `/user-block-toggle/:id` | PATCH  | ADMIN, SUPER_ADMIN      | Toggle user block status |
| `/make-admin/:id`        | PATCH  | SUPER_ADMIN             | Promote user to admin    |

---

## Driver Routes

**Base URL:** `/api/v1/driver`

| Endpoint                  | Method | Access Role                | Description                 |
| ------------------------- | ------ | -------------------------- | --------------------------- |
| `/createDriverProfile`    | POST   | USER                       | Create a driver profile     |
| `/`                       | GET    | ADMIN, SUPER_ADMIN         | Get all drivers             |
| `/ride/:id/accept`        | PATCH  | DRIVER                     | Accept a ride request       |
| `/availability/:id`       | PATCH  | DRIVER                     | Update driver availability  |
| `/admin-approve/:id`      | PATCH  | ADMIN, SUPER_ADMIN         | Approve driver by admin     |
| `/update-ride-status/:id` | PATCH  | DRIVER                     | Update ride status          |
| `/view-complete-ride/:id` | GET    | DRIVER, ADMIN, SUPER_ADMIN | View completed ride details |

---

## Ride Routes

**Base URL:** `/api/v1/ride`

| Endpoint         | Method | Access Role                       | Description                             |
| ---------------- | ------ | --------------------------------- | --------------------------------------- |
| `/request`       | POST   | USER, RIDER                       | Request a new ride                      |
| `/cancelled/:id` | PATCH  | RIDER                             | Cancel a ride before accepting driver   |
| `/`              | GET    | ADMIN, SUPER_ADMIN, DRIVER, RIDER | all rides driver(req), rider(completed) |

---

## Role Definitions

| Role          | Description                       |
| ------------- | --------------------------------- |
| `PUBLIC`      | No authentication required        |
| `USER`        | Basic authenticated user          |
| `RIDER`       | User requesting rides             |
| `DRIVER`      | Driver managing rides             |
| `ADMIN`       | Administrative privileges         |
| `SUPER_ADMIN` | Highest administrative privileges |

---

## Notes

1. **Authentication**:

   - All non-public routes require a valid JWT token
   - Include token in `Authorization` header as `Bearer <token>`

2. **Authorization**:

   - Role-based access enforced using `checkAuth()` middleware
   - Requests without proper permissions receive `403 Forbidden`

3. **Dynamic Redirects**:
   ```http
   GET /api/v1/auth/google?redirect=/booking
   Post-login redirects use the value passed in the state parameter
   ```

Validation:

Endpoints with validateRequest() enforce Zod schema validation

Invalid requests receive 400 Bad Request with error details.

## Role-Based Access

| Role   | Accessible Resources                             |
| ------ | ------------------------------------------------ |
| Rider  | Ride requests, history, cancellation             |
| Driver | Ride acceptance, status updates, earnings        |
| Admin  | User management, driver approval, system metrics |

## Testing

2. Set environment variables in Postman:
   - `base_url`: `http://ride-booking-system-backend-dusky.vercel.app`
   - `admin_token`: JWT from admin login
   - `rider_token`: JWT from rider login
   - `driver_token`: JWT from driver login
3. Execute test scenarios in this order:
   - Admin creates test users
   - Rider requests ride
   - Driver accepts ride
   - Driver updates ride status
   - Rider rates completed ride
   - Admin views system metrics

## Video Demo

[Watch 5-minute system walkthrough](https://example.com/video-demo) covering:

# video link: https://screenrec.com/share/9dUQZlgFMm

- Authentication flow
- Rider features
- Driver operations
- Admin capabilities
- Postman test demonstration
