# Payment Module - SSL Commerz Integration

## Overview

This payment module implements SSL Commerz payment gateway integration for the Ride Booking System backend. It follows a professional modular architecture with separation of concerns, comprehensive error handling, and full documentation.

## Features

- ✅ **SSL Commerz Integration**: Full integration with SSL Commerz payment gateway
- ✅ **Modular Architecture**: Clean separation of concerns (controller, service, model, routes)
- ✅ **Type Safety**: Full TypeScript support with comprehensive interfaces
- ✅ **Validation**: Zod schema validation for all requests
- ✅ **Error Handling**: Professional error handling with custom AppError
- ✅ **Transaction Management**: Complete transaction lifecycle management
- ✅ **IPN Webhook**: Instant Payment Notification webhook support
- ✅ **Payment History**: Track user payment history and statistics
- ✅ **Refund Support**: Refund completed payments with reasons
- ✅ **Professional Comments**: Extensively documented with JSDoc comments

## Module Structure

```
src/app/modules/payment/
├── payment.interface.ts      # TypeScript interfaces and types
├── payment.model.ts          # MongoDB schema and model
├── payment.service.ts        # Business logic and SSL Commerz API calls
├── payment.controller.ts     # Request handlers and HTTP responses
├── payment.route.ts          # API endpoint definitions
└── payment.validation.ts     # Zod schema validation
```

## Configuration Files

- `src/app/config/ssl-commerz.config.ts` - SSL Commerz configuration and constants
- `src/app/config/env.ts` - Environment variables (updated with payment variables)

## API Endpoints

### 1. Initiate Payment

**POST** `/api/v1/payment/initiate`

Initiates a new payment transaction and returns SSL Commerz payment gateway URL.

**Authentication**: Required (JWT)

**Request Body**:

```json
{
  "userId": "507f1f77bcf86cd799439011",
  "rideId": "507f1f77bcf86cd799439012",
  "amount": 5000,
  "currency": "BDT",
  "customerEmail": "user@example.com",
  "customerPhone": "01700000000",
  "customerName": "John Doe",
  "description": "Ride Payment"
}
```

**Response**:

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Payment initiated successfully",
  "data": {
    "paymentUrl": "https://sandbox.sslcommerz.com/gwprocess/v4/gw.php?Q...",
    "transactionId": "TXN_1702345600000_ABC123",
    "redirectUrl": "https://sandbox.sslcommerz.com/gwprocess/v4/gw.php?Q..."
  }
}
```

### 2. Success Callback

**GET** `/api/v1/payment/success`

Called by SSL Commerz after successful payment. User is redirected here.

**Query Parameters**:

- `tran_id`: SSL Commerz transaction ID
- `val_id`: Validation ID
- `status`: Payment status
- (and other SSL Commerz callback parameters)

**Response**: Payment confirmation with status

### 3. Failure Callback

**GET** `/api/v1/payment/fail`

Called by SSL Commerz if payment fails. User is redirected here.

**Query Parameters**:

- `tran_id`: SSL Commerz transaction ID
- `error_message`: Error message from gateway

### 4. Cancellation Callback

**GET** `/api/v1/payment/cancel`

Called by SSL Commerz when user cancels payment.

**Query Parameters**:

- `tran_id`: SSL Commerz transaction ID

### 5. IPN Webhook

**POST** `/api/v1/payment/ipn`

Instant Payment Notification webhook from SSL Commerz. This is the most reliable way to confirm payment status as it's server-to-server communication.

**Request Body**: SSL Commerz IPN data with transaction details

**Response**: Must return `"VERIFIED"` string for SSL Commerz acknowledgment

### 6. Validate Payment

**POST** `/api/v1/payment/validate`

Explicitly validate a payment with SSL Commerz (optional, usually not needed if IPN works).

**Authentication**: Required (JWT)

**Request Body**:

```json
{
  "val_id": "2009030195423",
  "amount": 5000
}
```

### 7. Get Payment Details

**GET** `/api/v1/payment/:transactionId`

Retrieve details of a specific payment transaction.

**Authentication**: Required (JWT)

**Response**:

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Payment details retrieved successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "507f1f77bcf86cd799439012",
    "transactionId": "TXN_1702345600000_ABC123",
    "amount": 5000,
    "currency": "BDT",
    "status": "COMPLETED",
    "sslTransactionId": "2009030195423",
    "paymentMethod": "CARD",
    "customerEmail": "user@example.com",
    "customerPhone": "01700000000",
    "customerName": "John Doe",
    "createdAt": "2024-01-13T10:30:00Z",
    "updatedAt": "2024-01-13T10:31:00Z"
  }
}
```

### 8. Get Payment History

**GET** `/api/v1/payment/history/list`

Retrieve user's payment transaction history with pagination.

**Authentication**: Required (JWT)

**Query Parameters**:

- `limit`: Number of records per page (default: 10)
- `skip`: Number of records to skip (default: 0)

**Response**:

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Payment history retrieved successfully",
  "data": {
    "data": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "transactionId": "TXN_1702345600000_ABC123",
        "amount": 5000,
        "status": "COMPLETED",
        "createdAt": "2024-01-13T10:30:00Z"
      }
    ],
    "total": 15
  }
}
```

### 9. Get Payment Statistics

**GET** `/api/v1/payment/stats`

Get aggregated payment statistics for the user.

**Authentication**: Required (JWT)

**Response**:

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Payment statistics retrieved successfully",
  "data": {
    "totalAmount": 50000,
    "completedTransactions": 10,
    "failedTransactions": 2,
    "totalTransactions": 12
  }
}
```

### 10. Refund Payment

**POST** `/api/v1/payment/:transactionId/refund`

Refund a completed payment transaction.

**Authentication**: Required (JWT)

**Request Body**:

```json
{
  "reason": "User requested cancellation"
}
```

**Response**:

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Payment refunded successfully",
  "data": {
    "transactionId": "TXN_1702345600000_ABC123",
    "status": "REFUNDED",
    "errorMessage": "User requested cancellation"
  }
}
```

## Environment Variables

Add these to your `.env` file:

```env
# SSL Commerz Configuration
SSL_COMMERZ_STORE_ID=your_store_id
SSL_COMMERZ_STORE_PASSWORD=your_store_password
SSL_COMMERZ_API_BASE_URL=https://sandbox.sslcommerz.com  # or production URL
APP_BASE_URL=http://localhost:3000
```

## Database Schema

The payment module uses MongoDB with the following schema:

**Collection**: `paymenttransactions`

```typescript
{
  userId: ObjectId (required)           // Reference to User
  rideId: ObjectId (optional)           // Reference to Ride
  transactionId: String (required)      // Unique transaction ID
  amount: Number (required)             // Payment amount
  currency: String (default: "BDT")     // Currency code
  status: String (enum)                 // INITIATED, PENDING, COMPLETED, FAILED, CANCELLED, REFUNDED
  sslTransactionId: String              // Transaction ID from SSL Commerz
  paymentMethod: String                 // CARD, BKASH, NAGAD, ROCKET, etc.
  description: String                   // Payment purpose
  customerEmail: String (required)      // Customer email
  customerPhone: String (required)      // Customer phone
  customerName: String (required)       // Customer name
  errorMessage: String                  // Error details if failed
  sslResponse: Object                   // Complete SSL Commerz response
  gatewayResponse: Object               // Gateway validation response
  isDeleted: Boolean (default: false)   // Soft delete flag
  createdAt: Date                       // Creation timestamp
  updatedAt: Date                       // Last update timestamp
}
```

## Transaction Lifecycle

1. **INITIATED**: Payment record created when user initiates payment
2. **PENDING**: SSL Commerz returns payment gateway URL
3. **COMPLETED**: Payment successful (after success callback or IPN)
4. **FAILED**: Payment failed (after failure callback)
5. **CANCELLED**: User cancelled payment (after cancel callback)
6. **REFUNDED**: Payment refunded (after refund request)

## Payment Methods Supported

The following payment methods are supported through SSL Commerz:

- **CARD**: Credit/Debit Card (Visa, Mastercard, etc.)
- **BKASH**: bKash Mobile Payment
- **NAGAD**: Nagad Mobile Payment
- **ROCKET**: Rocket Mobile Payment
- **BANK_TRANSFER**: Direct Bank Transfer
- **INTERNET_BANKING**: Internet Banking

## Error Handling

The module uses custom `AppError` class for error handling:

```typescript
throw new AppError("Error message", httpStatus.BAD_REQUEST);
```

Common error responses:

- **400**: Invalid request data, payment not found, validation failed
- **404**: Transaction not found
- **500**: Server error, SSL Commerz service unavailable
- **503**: Payment gateway service temporarily unavailable

## Security Best Practices

1. **Environment Variables**: Store SSL Commerz credentials in `.env` file, never commit to version control
2. **HTTPS Only**: Always use HTTPS for production
3. **IPN Validation**: Always validate IPN webhooks from SSL Commerz
4. **User Verification**: Verify user ownership of payment transactions
5. **Secure Callbacks**: Use HTTPS URLs for all callbacks
6. **Rate Limiting**: Implement rate limiting on payment endpoints
7. **Audit Logging**: Log all payment operations for compliance

## Testing with SSL Commerz Sandbox

1. Register for SSL Commerz sandbox account at https://www.sslcommerz.com/
2. Get store ID and password from your merchant account
3. Use sandbox API endpoint: `https://sandbox.sslcommerz.com`
4. Test with sandbox card details:
   - Card Number: 4111111111111111
   - Expiry: Any future date
   - CVV: Any 3 digits

## Integration with Other Modules

The payment module is designed to integrate with:

- **User Module**: Get user details for payment
- **Ride Module**: Associate payment with ride bookings
- **Auth Module**: Verify user authentication for payment operations

## Future Enhancements

- [ ] Webhook retry mechanism
- [ ] Payment dispute handling
- [ ] Subscription/recurring payments
- [ ] Partial refunds
- [ ] Payment analytics and reporting
- [ ] Multi-currency support enhancements
- [ ] Webhook signature verification
- [ ] Rate limiting per user

## Troubleshooting

### Payment gateway returns error

- Verify store ID and password in environment variables
- Check if API base URL is correct for sandbox/production
- Ensure APP_BASE_URL is accessible

### IPN webhook not received

- Check firewall and network policies
- Verify webhook endpoint is publicly accessible
- Check SSL Commerz merchant account logs

### Transaction not updating

- Verify transaction ID format
- Check database connection
- Review error logs

## Dependencies

The payment module uses the following:

- **mongoose**: MongoDB ODM for schema and model
- **express**: Web framework
- **zod**: Schema validation
- **http-status-codes**: HTTP status code constants
- **jsonwebtoken**: JWT authentication
- **Built-in Node.js**: https, querystring modules for API calls

## Module Entry Points

The module is registered in the main routes file:

```typescript
// src/app/routes/index.ts
import { PaymentRoutes } from "../modules/payment/payment.route";

moduleRoutes.push({
  path: "/payment",
  route: PaymentRoutes,
});
```

## Performance Considerations

- Database indexes on `transactionId` and `userId` for faster queries
- Pagination implemented for payment history
- Aggregation pipeline used for statistics calculation
- Soft deletes prevent data loss while maintaining clean queries

## Support and Maintenance

For issues or questions:

1. Check SSL Commerz documentation: https://www.sslcommerz.com/
2. Review error messages and logs
3. Verify environment configuration
4. Check transaction status in payment history

---

**Last Updated**: January 13, 2025
**Version**: 1.0.0
**Author**: Your Development Team
