### Project Name:Ride Booking System Backend

# Ride Booking API

## Project Overview

This project implements a secure, scalable backend API for a ride booking system using Express.js and Mongoose. The system supports three user roles: **admin**, **rider**, and **driver**, each with specific capabilities:

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
git clone https://github.com/yourusername/ride-booking-api.git
cd ride-booking-api
```

2. Install dependencies:

```bash
npm install
```

3. Create `.env` file:

```env
MONGODB_URI=mongodb://localhost:27017/ride_booking
JWT_SECRET=your_secure_jwt_secret
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRY=7d
PORT=3000
```

4. Start the server:

```bash
npm start
```

## API Endpoints

### Authentication

| Endpoint         | Method | Description          | Access  |
| ---------------- | ------ | -------------------- | ------- |
| `/auth/register` | POST   | Register new user    | Public  |
| `/auth/login`    | POST   | User login           | Public  |
| `/auth/refresh`  | POST   | Refresh access token | Private |
| `/auth/logout`   | POST   | Invalidate token     | Private |

### Rider Endpoints

| Endpoint            | Method | Description         |
| ------------------- | ------ | ------------------- |
| `/rides`            | POST   | Request new ride    |
| `/rides/active`     | GET    | Get active ride     |
| `/rides/history`    | GET    | Get ride history    |
| `/rides/:id/cancel` | PATCH  | Cancel a ride       |
| `/rides/:id/rate`   | POST   | Rate completed ride |

### Driver Endpoints

| Endpoint                | Method | Description                 |
| ----------------------- | ------ | --------------------------- |
| `/drivers/availability` | PATCH  | Set availability status     |
| `/rides/available`      | GET    | Get available ride requests |
| `/rides/:id/accept`     | PATCH  | Accept ride request         |
| `/rides/:id/status`     | PATCH  | Update ride status          |
| `/drivers/earnings`     | GET    | Get earnings history        |
| `/drivers/location`     | POST   | Update driver location      |

### Admin Endpoints

| Endpoint                     | Method | Description            |
| ---------------------------- | ------ | ---------------------- |
| `/admin/users`               | GET    | Get all users          |
| `/admin/drivers`             | GET    | Get all drivers        |
| `/admin/rides`               | GET    | Get all rides          |
| `/admin/drivers/:id/approve` | PATCH  | Approve/suspend driver |
| `/admin/users/:id/block`     | PATCH  | Block/unblock user     |
| `/admin/metrics`             | GET    | Get system metrics     |
| `/admin/reports`             | GET    | Generate reports       |

## Request Examples

### User Registration

```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "phone": "1234567890",
  "role": "rider"
}
```

### Request a Ride

```http
POST /rides
Authorization: Bearer <RIDER_JWT>
Content-Type: application/json

{
  "pickup": {
    "address": "Central Park",
    "coordinates": [-73.9654, 40.7829]
  },
  "destination": {
    "address": "Empire State Building",
    "coordinates": [-73.9857, 40.7484]
  }
}
```

### Update Ride Status

```http
PATCH /rides/65a1b2c3d4e5f6a7b8c9d0e1/status
Authorization: Bearer <DRIVER_JWT>
Content-Type: application/json

{
  "status": "in_progress"
}
```

### Approve Driver (Admin)

```http
PATCH /admin/drivers/65a1b2c3d4e5f6a7b8c9d0e1/approve
Authorization: Bearer <ADMIN_JWT>
Content-Type: application/json

{
  "isApproved": true
}
```

## Role-Based Access

| Role   | Accessible Resources                             |
| ------ | ------------------------------------------------ |
| Rider  | Ride requests, history, cancellation             |
| Driver | Ride acceptance, status updates, earnings        |
| Admin  | User management, driver approval, system metrics |

## Testing

2. Set environment variables in Postman:
   - `base_url`: `http://localhost:3000`
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

- Authentication flow
- Rider features
- Driver operations
- Admin capabilities
- Postman test demonstration
