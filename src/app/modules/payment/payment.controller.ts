import { Request, Response } from "express";
import httpStatus from "http-status-codes";
import { PaymentService } from "./payment.service";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { JwtPayload } from "jsonwebtoken";
import { IInitiatePaymentRequest } from "./payment.interface";

/**
 * @controller PaymentController
 * @description Controller layer for payment operations
 * Handles HTTP requests and responses for payment functionality
 */

/**
 * Initiate a new payment transaction
 * POST /api/v1/payment/initiate
 *
 * @route POST /initiate
 * @access Private - Requires authentication
 * @body {IInitiatePaymentRequest} Payment initiation data
 * @returns {Object} Payment gateway URL and transaction ID
 *
 * @example
 * POST /api/v1/payment/initiate
 * {
 *   "userId": "507f1f77bcf86cd799439011",
 *   "amount": 5000,
 *   "currency": "BDT",
 *   "customerEmail": "user@example.com",
 *   "customerPhone": "01700000000",
 *   "customerName": "John Doe",
 *   "description": "Ride payment"
 * }
 */
const initiatePayment = catchAsync(async (req: Request, res: Response) => {
  // Extract authenticated user information from JWT token
  const user = req.user as JwtPayload;

  // Prepare payment request payload
  const payload: IInitiatePaymentRequest = {
    userId: user.id,
    rideId: req.body.rideId,
    amount: req.body.amount,
    currency: req.body.currency || "BDT",
    customerEmail: req.body.customerEmail || user.email,
    customerPhone: req.body.customerPhone,
    customerName: req.body.customerName || user.name,
    description: req.body.description,
  };

  // Call payment service to initiate payment
  const result = await PaymentService.initiatePayment(payload);

  // Send success response with payment URL
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Payment initiated successfully",
    data: result,
  });
});

/**
 * Handle SSL Commerz success callback
 * GET /api/v1/payment/success
 *
 * @route GET /success
 * @access Public - Called by SSL Commerz gateway
 * @query {string} tran_id - SSL Commerz transaction ID
 * @query {string} val_id - Validation ID
 * @query {string} status - Payment status
 * @returns {Object} Redirects to success page
 *
 * Called by SSL Commerz after successful payment
 * User is redirected to this endpoint
 */
const handleSuccessCallback = catchAsync(
  async (req: Request, res: Response) => {
    // Update payment transaction to COMPLETED status
    const result = await PaymentService.handleSuccessCallback(req.query);

    // Send success response
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Payment completed successfully",
      data: {
        transactionId: result.transactionId,
        status: result.status,
        amount: result.amount,
      },
    });
  }
);

/**
 * Handle SSL Commerz failure callback
 * GET /api/v1/payment/fail
 *
 * @route GET /fail
 * @access Public - Called by SSL Commerz gateway
 * @query {string} tran_id - SSL Commerz transaction ID
 * @query {string} status - Failure status
 * @query {string} error_message - Error message
 * @returns {Object} Redirects to failure page
 *
 * Called by SSL Commerz after failed payment
 * User is redirected to this endpoint
 */
const handleFailureCallback = catchAsync(
  async (req: Request, res: Response) => {
    // Update payment transaction to FAILED status
    const result = await PaymentService.handleFailureCallback(req.query);

    // Send failure response
    sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: "Payment failed",
      data: {
        transactionId: result.transactionId,
        status: result.status,
        errorMessage: result.errorMessage,
      },
    });
  }
);

/**
 * Handle SSL Commerz cancellation callback
 * GET /api/v1/payment/cancel
 *
 * @route GET /cancel
 * @access Public - Called by SSL Commerz gateway
 * @query {string} tran_id - SSL Commerz transaction ID
 * @returns {Object} Redirects to cancellation page
 *
 * Called by SSL Commerz when user cancels payment
 */
const handleCancellationCallback = catchAsync(
  async (req: Request, res: Response) => {
    // Update payment transaction to CANCELLED status
    const result = await PaymentService.handleCancellationCallback(req.query);

    // Send cancellation response
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: false,
      message: "Payment cancelled by user",
      data: {
        transactionId: result.transactionId,
        status: result.status,
      },
    });
  }
);

/**
 * Handle SSL Commerz IPN (Instant Payment Notification) webhook
 * POST /api/v1/payment/ipn
 *
 * @route POST /ipn
 * @access Public - Called by SSL Commerz servers
 * @body {Record<string, any>} IPN webhook data from SSL Commerz
 * @returns {string} "VERIFIED" for SSL Commerz
 *
 * Called by SSL Commerz servers asynchronously after payment processing
 * This is the most reliable way to confirm payment status
 * Response must be exactly "VERIFIED" string
 */
const handleIPNWebhook = catchAsync(async (req: Request, res: Response) => {
  // Determine payment status from SSL Commerz response
  const { status } = req.body;

  if (status === "VALID" || status === "VALIDATED") {
    // Payment successful
    await PaymentService.handleSuccessCallback(req.body);
  } else if (status === "FAILED") {
    // Payment failed
    await PaymentService.handleFailureCallback(req.body);
  } else if (status === "CANCELLED") {
    // Payment cancelled
    await PaymentService.handleCancellationCallback(req.body);
  }

  // SSL Commerz requires exact "VERIFIED" response string
  // Respond with "VERIFIED" to acknowledge receipt of IPN
  res.status(httpStatus.OK).send("VERIFIED");
});

/**
 * Validate a completed payment transaction
 * POST /api/v1/payment/validate
 *
 * @route POST /validate
 * @access Private - Requires authentication
 * @body {IPaymentValidationRequest} Validation request data
 * @returns {Object} Validation result from SSL Commerz
 *
 * Explicitly validates a payment with SSL Commerz
 * Usually called after success callback
 */
const validatePayment = catchAsync(async (req: Request, res: Response) => {
  // Validate payment with SSL Commerz
  const result = await PaymentService.validatePayment(req.body);

  // Send validation result
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Payment validated successfully",
    data: result,
  });
});

/**
 * Get payment transaction details
 * GET /api/v1/payment/:transactionId
 *
 * @route GET /:transactionId
 * @access Private - Requires authentication
 * @param {string} transactionId - Transaction ID
 * @returns {Object} Payment transaction details
 *
 * @example
 * GET /api/v1/payment/TXN_1702345600000_ABC123
 */
const getPaymentDetails = catchAsync(async (req: Request, res: Response) => {
  // Get payment transaction details
  const result = await PaymentService.getPaymentDetails(
    req.params.transactionId
  );

  // Send response with payment details
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Payment details retrieved successfully",
    data: result,
  });
});

/**
 * Get user's payment history
 * GET /api/v1/payment/history/list
 *
 * @route GET /history/list
 * @access Private - Requires authentication
 * @query {number} limit - Number of records per page (default: 10)
 * @query {number} skip - Number of records to skip (default: 0)
 * @returns {Object} Array of payment transactions and total count
 *
 * @example
 * GET /api/v1/payment/history/list?limit=10&skip=0
 */
const getUserPaymentHistory = catchAsync(
  async (req: Request, res: Response) => {
    // Extract authenticated user information
    const user = req.user as JwtPayload;

    // Extract pagination parameters
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = parseInt(req.query.skip as string) || 0;

    // Get user's payment history
    const result = await PaymentService.getUserPaymentHistory(
      user.id,
      limit,
      skip
    );

    // Send response with payment history
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Payment history retrieved successfully",
      data: result,
    });
  }
);

/**
 * Get user's payment statistics
 * GET /api/v1/payment/stats
 *
 * @route GET /stats
 * @access Private - Requires authentication
 * @returns {Object} Payment statistics including total amount and transaction counts
 *
 * Shows summary of user's payment transactions
 */
const getUserPaymentStats = catchAsync(async (req: Request, res: Response) => {
  // Extract authenticated user information
  const user = req.user as JwtPayload;

  // Get payment statistics
  const result = await PaymentService.getUserPaymentStats(user.id);

  // Send response with statistics
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Payment statistics retrieved successfully",
    data: result,
  });
});

/**
 * Refund a payment transaction
 * POST /api/v1/payment/:transactionId/refund
 *
 * @route POST /:transactionId/refund
 * @access Private - Requires authentication
 * @param {string} transactionId - Transaction ID to refund
 * @body {string} reason - Refund reason
 * @returns {Object} Refunded payment transaction details
 *
 * @example
 * POST /api/v1/payment/TXN_1702345600000_ABC123/refund
 * {
 *   "reason": "User requested cancellation"
 * }
 */
const refundPayment = catchAsync(async (req: Request, res: Response) => {
  // Refund the payment
  const result = await PaymentService.refundPayment(
    req.params.transactionId,
    req.body.reason || "Refund requested"
  );

  // Send refund response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Payment refunded successfully",
    data: result,
  });
});

export const PaymentController = {
  initiatePayment,
  handleSuccessCallback,
  handleFailureCallback,
  handleCancellationCallback,
  handleIPNWebhook,
  validatePayment,
  getPaymentDetails,
  getUserPaymentHistory,
  getUserPaymentStats,
  refundPayment,
};
